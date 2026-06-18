---
name: bks-be-command-standard
description: Use this skill when creating or modifying Artisan commands and scheduled tasks. Defines standards for command architecture, input/output, progress tracking, and registration in routes/console.php.
---

# Laravel Artisan Command & Scheduled Task Standards

This skill ensures Artisan commands and background schedules are interactive, reliable, and consistent with the project's service-oriented architecture.

---

## Quick Reference

| Pattern | Flow |
|---------|------|
| **Architecture** | `Artisan Call / Schedule` → `Command Stub` → `Background Service` → `Common Service / Models` |

---

## Reference Documentation

### Architecture & Structure
- [01-architecture.md](references/01-architecture.md) - Command naming, location, localization, and global coding rules
- [02-implementation.md](references/02-implementation.md) - `handle()` method patterns, DTO usage, console interaction

### Service Layer
- [03-background-services.md](references/03-background-services.md) - Background Service patterns, transactions, performance, checkpoint/resume

### Interaction & Scheduling
- [04-console-interaction.md](references/04-console-interaction.md) - Progress bars, output formatting, localization, confirmations
- [05-scheduling.md](references/05-scheduling.md) - Task registration in routes/console.php, overlap prevention

### Documentation & Workflow
- [06-logic-documentation.md](references/06-logic-documentation.md) - Business logic doc format for commands
- [07-implementation-workflow.md](references/07-implementation-workflow.md) - Step-by-step implementation guide with completion checklist

---

## Critical Constraints

| Rule | Constraint |
|------|------------|
| **No New Factories** | NEVER create new `XxxFactory.php` files. Add getters to existing `BackgroundFactory` only. |
| **No `env()`** | ALWAYS use `config()` instead of `env()`. |
| **No FQN** | NEVER use inline class paths. ALWAYS use `use` statements. |
| **Transaction Boundaries** | NEVER wrap long-running tasks (file uploads, API calls) in DB transactions. |
| **Overlap Prevention** | Scheduled commands MUST use `withoutOverlapping()` in routes/console.php. |
| **DTOs Required** | ALWAYS wrap command arguments in DTOs — never pass raw primitives to Services. |
| **Method Length** | Methods MUST be ≤ 30 lines; split into private methods with descriptive names if longer |
| **External Code** | When copying from docs/other projects: convert to Factory getters, use Enum constants, add proper imports, follow project naming conventions |

---

## Quick Start: Implementation Workflow

1. **Plan**: Define signature and Background Service architecture
2. **DTO**: Create `app/DTOs/Background/{Module}/{Action}Data.php`
3. **Service**: Implement `app/Services/Background/{Module}/{Feature}BackgroundService.php`
4. **Factory**: Register explicit getter in `BackgroundFactory.php`
5. **Command**: Write stub in `app/Console/Commands/{Module}/{Name}Command.php`
6. **Schedule**: Register in `routes/console.php` with overlap prevention
7. **Test**: Write Feature and Unit tests following `bks-be-testing-standard`. Feature tests in `tests/Feature/Console/`. Write test report to `docs/testing/{feature_name}.md`
8. **Document**: Create business logic doc in `docs/logic/{module}/`
9. **Audit**: Run `php artisan code:format` and verify checklist

See [07-implementation-workflow.md](references/07-implementation-workflow.md) for complete details.

---

## Code Example

```php
namespace App\Console\Commands\System;

use App\DTOs\Background\System\CleanupData;
use App\Factories\BackgroundFactory;
use Illuminate\Console\Command;

class CleanupCommand extends Command
{
    protected $signature = 'system:cleanup {--days=30 : Days to keep}';
    protected $description = 'Clean up old system records';

    public function handle(): void
    {
        $days = (int) $this->option('days');
        
        $this->info("Starting cleanup for records older than {$days} days...");
        
        $service = BackgroundFactory::getSystemCleanupBackgroundService();
        $service->run(new CleanupData(days: $days));
        
        $this->info('Cleanup completed successfully.');
    }
}
```

---

## Final Completion Checklist

Before ending any session implementing commands:

- [ ] `php artisan code:format` has been run
- [ ] All Feature and Unit tests are passing (`bks-be-testing-standard`)
- [ ] Test report written to `docs/testing/{feature_name}.md`
- [ ] **Audit Log** (BR-G002): Commands delegate to BackgroundService — verify the target Model has `LogsActivity` trait. If command does something non-CRUD (e.g., bulk purge), verify BackgroundService calls `activity()->log()` manually (Pattern B)
- [ ] Business logic docs in `docs/logic/` are created/updated
- [ ] `docs/system/br-registry.md` updated with any new BR-* rules
- [ ] Task file statuses updated to `completed` (if applicable)

---

## Validation Scripts

Run these scripts to verify command compliance:

```bash
# Validate all backend structures (API, Command, Database, Job, Test)
php .agents/scripts/validate-backend.php /path/to/project
```

See `.agents/scripts/validate-backend.php` for detailed validation rules.
