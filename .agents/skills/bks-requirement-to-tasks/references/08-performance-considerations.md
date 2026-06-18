# Performance Considerations in Task Design

Ensure performance is designed into tasks from the start, not retrofitted later.

---

## Task-Level Performance Checklist

Every implementation task MUST consider these performance aspects:

### Database Layer

| Check | Task Should Address | Skill Reference |
|-------|---------------------|---------------|
| **Indexes Required?** | Document needed indexes in migration task | bks-be-database-standard |
| **N+1 Prevention?** | Specify eager loading in service task | bks-be-api-standard |
| **Query Optimization?** | Use `select()` for specific columns | bks-be-api-standard |
| **Bulk Operations?** | Use `chunk()` or `insert()` for batch | bks-be-api-standard |

### API Layer

| Check | Task Should Address | Skill Reference |
|-------|---------------------|---------------|
| **Pagination?** | Mandatory for list endpoints | bks-be-api-standard |
| **Response Size?** | Limit fields returned | bks-be-api-standard |
| **Caching Strategy?** | Define cache keys and TTL | bks-be-api-standard |
| **Rate Limiting?** | Document protection requirements | bks-be-api-standard |

### Background Processing

| Check | Task Should Address | Skill Reference |
|-------|---------------------|---------------|
| **Async Required?** | Identify what goes to queue | bks-be-job-standard |
| **Queue Priority?** | Define job priority level | bks-be-job-standard |
| **Progress Tracking?** | For long-running operations | bks-be-job-standard |
| **Retry Strategy?** | Document failure handling | bks-be-job-standard |

---

## Performance Task Types

### Type A: Performance-Critical Feature

Features requiring explicit performance tasks:

```markdown
## Task 15: Implement Order List with Performance Optimization

**Performance Requirements**:
- Support 1000 orders/second read throughput
- p95 response time < 200ms for 100-item page
- N+1 query prevention mandatory

**Technical Requirements**:
- Use `with(['user', 'status'])` eager loading
- Add composite index: `[user_id, status, created_at]`
- Implement cursor pagination for large datasets
- Cache user permission check for 5 minutes
```

### Type B: Data-Intensive Feature

Features handling large data volumes:

```markdown
## Task 22: Implement Bulk User Import

**Performance Requirements**:
- Support importing 100,000 users
- Process in background queue
- Memory usage < 256MB
- Progress reporting every 1000 records

**Technical Requirements**:
- Chunk processing: 1000 records per batch
- Use `DB::table()` bypassing Eloquent for speed
- Queue job with timeout: 30 minutes
- Implement checkpoint/resume capability
```

### Type C: Real-Time Feature

Features with timing constraints:

```markdown
## Task 30: Implement Real-Time Dashboard

**Performance Requirements**:
- Update interval: 30 seconds
- p99 latency < 100ms for cached data
- Handle 500 concurrent connections

**Technical Requirements**:
- Pre-aggregate statistics every 5 minutes
- Use Redis for fast lookups
- Implement Server-Sent Events (SSE)
- Fallback to polling with 60s interval
```

---

## Performance Task Templates

### Template: Database Optimization Task

```markdown
## Task {NN}: Optimize {Entity} Queries

### Performance Context
Current {entity} queries are slow due to:
- [Missing indexes on frequently filtered columns]
- [N+1 queries in list endpoints]
- [Full table scans on date ranges]

### Expected Impact
| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| List query time | 800ms | 200ms | 75% faster |
| Memory usage | 128MB | 32MB | 75% reduction |

### Requirements

#### 1. Migration: Add Indexes ({Action: MODIFY})

**File**: `database/migrations/xxxx_xx_xx_add_indexes_to_{table}.php`

**Indexes Required**:
| Index | Columns | Query Pattern | Cardinality |
|-------|---------|---------------|-------------|
| idx_status_created | status, created_at | List filtering | Medium |
| idx_user_status | user_id, status | User-scoped queries | High |

**Migration Code**:
```php
Schema::table('{table}', function (Blueprint $table) {
    $table->index(['status', 'created_at'], 'idx_status_created');
    $table->index(['user_id', 'status'], 'idx_user_status');
});
```

#### 2. Service: Optimize Query Loading ({Action: MODIFY})

**File**: `app/Services/Api/{Module}/{Entity}Service.php`

**Method**: `getPaginatedList()`

**Optimization Required**:
```php
// ✅ CORRECT: Explicit column selection + eager loading
return $this->repository
    ->select(['id', 'user_id', 'status', 'created_at']) // Only needed columns
    ->with(['user:id,name,email']) // Select specific relation columns
    ->where('status', $status)
    ->orderBy('created_at', 'desc')
    ->cursorPaginate($perPage); // Cursor for large datasets

// ❌ FORBIDDEN: Select * with all relations
return $this->repository
    ->with(['user', 'items', 'history', 'auditLogs']) // Too much data
    ->paginate($perPage);
```

### Acceptance Criteria
1. Query time reduced by > 50% as measured by `DB::enableQueryLog()`
2. No N+1 queries detected in Laravel Debugbar
3. Memory usage < 50MB for 100-record page
4. Rollback works: `php artisan migrate:rollback` succeeds
```

### Template: Background Job Task

```markdown
## Task {NN}: Queue {Operation} for Async Processing

### Performance Context
Current {operation} runs synchronously, blocking user requests for > 5 seconds.

### Requirements

#### 1. Job Class ({Action: NEW})

**File**: `app/Jobs/{Module}/{Operation}Job.php`

**Design**:
```php
final class {Operation}Job implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;
    
    public int $tries = 3;
    public array $backoff = [60, 300, 600]; // Progressive backoff
    public int $timeout = 300; // 5 minutes
    public string $queue = 'processing'; // Dedicated queue
    
    public function handle({Operation}BackgroundService $service): void
    {
        $service->execute($this->dto);
    }
}
```

#### 2. Background Service ({Action: NEW})

**File**: `app/Services/Background/{Module}/{Operation}BackgroundService.php`

**Performance Requirements**:
- Process in chunks of 1000 records
- Report progress every 100 records
- Checkpoint every 1000 for resume capability
- Memory usage < 256MB

#### 3. Factory Registration ({Action: MODIFY})

**File**: `app/Factories/BackgroundFactory.php`

```php
public function get{Operation}Service(): {Operation}BackgroundService
{
    return app({Operation}BackgroundService::class);
}
```

#### 4. API Endpoint Update ({Action: MODIFY})

**File**: `app/Http/Controllers/Api/{Module}/{Entity}Controller.php`

**Change**: Convert synchronous to async response

```php
// Before (synchronous)
$result = $service->execute($dto);
return response()->json($result);

// After (asynchronous)
{Operation}Job::dispatch($dto);
return response()->json([
    'message' => 'Processing started',
    'job_id' => $jobId,
    'status_url' => "/api/jobs/{$jobId}/status"
]);
```

### Testing Hints
- Mock queue driver for unit tests
- Test with 10,000 records to verify chunking
- Verify job retries on simulated failure
- Test progress tracking accuracy

### Acceptance Criteria
1. API response time < 500ms (vs > 5s before)
2. Job completes successfully with 100K records
3. Progress updates every 100 records
4. Failed jobs retry with exponential backoff
```

---

## Performance Metrics to Track

### Task-Level Metrics

Include these in task acceptance criteria:

| Metric | How to Measure | Acceptance Threshold |
|--------|----------------|---------------------|
| Query Count | `DB::enableQueryLog()` | No N+1 detected |
| Query Time | `DB::getQueryLog()` timing | < 100ms per query |
| Memory Peak | `memory_get_peak_usage()` | < 128MB |
| Response Time | Feature test timing | As specified in requirements |
| Throughput | Load testing | Meets SLA |

### Integration Metrics

For cross-cutting features:

```markdown
## System Performance Impact

### Affected Endpoints
| Endpoint | Current Avg | Expected After Change |
|----------|-------------|----------------------|
| GET /api/orders | 200ms | 150ms (25% improvement) |
| POST /api/orders | 500ms | 500ms (no regression) |

### Database Impact
| Table | Current Rows | Growth Rate |
|-------|--------------|-------------|
| orders | 1M | +50K/month |
| order_items | 5M | +250K/month |

### Cache Invalidation
| Cache Key | TTL | Invalidation Trigger |
|-----------|-----|---------------------|
| user.orders.{id} | 5min | Order created/updated |
| order.stats | 1hour | Hourly recalculation |
```

---

## Performance Anti-Patterns in Tasks

Document what NOT to do in implementation:

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| Loading all records for in-memory processing | Use `chunk()` for batch processing |
| Multiple single inserts in loop | Use `insert()` batch for 100+ records |
| Counting large tables in real-time | Cache counts or use estimated values |
| Processing files synchronously | Queue file processing, return job ID |
| Loading full models for simple counts | Use `DB::table()->count()` |
| SELECT * with many joins | Explicit column selection |
| Processing without timeout limits | Always set job timeouts |
| No pagination on list endpoints | Mandatory pagination |

---

## Performance Testing Tasks

### Dedicated Testing Task Template

```markdown
## Task {NN}: Performance Test {Feature}

### Test Scenarios

#### Scenario 1: Normal Load
```
Duration: 10 minutes
Users: 100 concurrent
Requests: GET /api/{resource}
Expected: p95 < 200ms, error rate < 1%
```

#### Scenario 2: Peak Load
```
Duration: 5 minutes
Users: 500 concurrent
Requests: Mixed read/write
Expected: p95 < 500ms, no errors
```

#### Scenario 3: Stress Test
```
Duration: 2 minutes
Users: 1000 concurrent
Ramping: +100 users/sec
Expected: Graceful degradation, recovery
```

### Tools
- Use `php artisan db:seed --class=PerformanceSeeder` for test data
- Laravel Telescope for query analysis
- Apache Bench or JMeter for load testing

### Acceptance Criteria
1. All scenarios pass without memory leaks
2. No N+1 queries detected
3. Database connection pool < 80% utilization
4. Queue processing keeps up with dispatch rate
```

---

## Related

- [01-decomposition-phases.md](01-decomposition-phases.md) - Phase-based task breakdown
- [06-quality-validation.md](06-quality-validation.md) - Task quality standards
- [bks-requirement-analysis](../../bks-requirement-analysis/SKILL.md) - Performance requirements source
