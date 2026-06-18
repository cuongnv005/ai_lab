# Quality Standards & Validation

This document defines the quality checklist and post-generation validation process.

---

## Quality Checklist

Before presenting tasks to the user, verify:

### Completeness

- [ ] **Every processing flow** from the requirement has at least one task covering it.
- [ ] **Every API endpoint** from the requirement's API ENDPOINT INVENTORY is assigned to a task.
- [ ] **Every database change** from DATA MODEL UPDATES is covered in a foundation task.
- [ ] **Every enum** is defined in the foundation task with:
  - Full integer value list (starting at 1)
  - `tinyInteger/smallInteger` migration type
  - Mandatory `label()` method implementation
- [ ] **API responses** for enum fields include both the raw integer value and the localized label.
- [ ] **Every notification** from the NOTIFICATIONS section has a task.
- [ ] **Every background job** has a task.
- [ ] **Master Data Registration**: If the requirement introduces new enums, lookup tables, or trees, a **separate task** exists (Phase 1, `bks-be-master-data-standard`).
- [ ] **Testing** and **Documentation** tasks exist.

### Task Quality

- [ ] Every task has **YAML frontmatter** with all required fields.
- [ ] Every task declares its **type** (IMPLEMENTATION / COORDINATION / DOCUMENTATION).
- [ ] **MANDATORY: Every IMPLEMENTATION task maps to exactly ONE workflow + ONE skill.** A task referencing both `/execute-api-task` AND `/execute-job-task` is invalid — split it.
- [ ] **MANDATORY: No task mixes API code and Job code.** If a feature requires both, two separate tasks exist (Job task in Phase 2a, API task in Phase 2b).
- [ ] **MANDATORY: Job tasks that a feature depends on MUST appear before the API task** in the dependency graph and execution order.
- [ ] Every task has **Acceptance Criteria** with testable conditions.
- [ ] Every task has **Error Scenarios** mapped from the requirement.
- [ ] Every task has **Dependencies** explicitly listed.
- [ ] **MANDATORY**: Every task references **Applicable Workflows** and **Applicable Skills** correctly.
- [ ] Every COORDINATION task has a **Delegation Map**.
- [ ] Every IMPLEMENTATION task with testable code has **Testing Hints**.
- [ ] No task spans more than one major functional boundary.
- [ ] No task exceeds the **size guideline** (>2000 words in Requirements).

### Traceability

- [ ] Every `BR-*` from the requirement is referenced by at least one task.
- [ ] Every `BR-*` in requirement/task files is resolvable in `docs/system/br-registry.md`.
- [ ] Every task has `rule_refs` in frontmatter and each entry is valid.
- [ ] No `PROPOSED_BR:{slug}` remains in finalized logic docs (`docs/logic/`).
- [ ] The Mermaid dependency graph has no circular dependencies.
- [ ] The execution order respects all dependencies.

### Index File

- [ ] Progress Summary section exists with correct counts.
- [ ] Task table includes Type and Effort columns.
- [ ] Mermaid dependency graph is present and valid.

---

## Post-Generation Validation

> [!IMPORTANT]
> **MANDATORY**: Run this validation before presenting tasks to the user.

### Validation Steps

1. **Coverage Verification**
   - Cross-check every section of the requirement (Flows, Data Model, API Endpoints, Notifications, Business Rules) against the generated tasks.
   - Every item must be assigned to at least one task.

2. **Dependency Integrity**
   - Verify no circular dependencies in the Mermaid graph.
   - Verify execution order respects all dependencies.

3. **Standalone Check**
   - Can a developer implement each IMPLEMENTATION task by reading ONLY the task file + the referenced requirement? (Answer must be YES.)

4. **Delegation Check**
   - For every COORDINATION task, verify that every delegated sub-requirement is actually covered by the target IMPLEMENTATION task.

5. **Workflow & Skill Alignment**
   - Verify each task references the correct project workflows and/or skills.
   - Implementation tasks MUST have at least one.

6. **BR Resolution Check**
   - Verify every `BR-*` in task bodies/frontmatter is registered in `docs/system/br-registry.md` (except temporary `PROPOSED_BR:{slug}` in requirement/task stage).

7. **Frontmatter Check**
   - Verify every task file has valid YAML frontmatter with all required fields, including `rule_refs`.

8. **Enum Standards Check**
   - Verify every enum has:
     - Integer backing starting at 1
     - `tinyInteger` or `smallInteger` migration type
     - `label()` method implementation
     - API response includes both value and label

9. **DTO Check**
   - Verify every service method accepting structured input uses a DTO.
   - Verify DTOs are defined in the correct location: `app/DTOs/{Layer}/{Module}/{Action}Data.php`

10. **Factory Check**
    - Verify no new factory files are proposed.
    - Verify service registration uses existing `ApiFactory`, `BackgroundFactory`, or `CommonFactory`.

### If Validation Fails

If any check fails:
1. Fix the issues before presenting to user.
2. Re-run the validation.
3. Only present when all checks pass.

---

## Common Validation Failures

| Failure | Fix |
|---|---|
| Task mixes API and Job code | Split into two tasks; Job task in Phase 2a, API task in Phase 2b |
| COORDINATION task missing Delegation Map | Add Delegation Map with all sub-requirements delegated |
| IMPLEMENTATION task missing workflow/skill | Add the applicable workflow and skill to Context block |
| `BR-*` not in registry | Register in `docs/system/br-registry.md` or use `PROPOSED_BR:{slug}` |
| Circular dependency in Mermaid | Reorganize task dependencies |
| Enum missing `label()` method | Add label method requirement to task |
| Service uses `array` instead of DTO | Update to use `final readonly` DTO |
| New factory file proposed | Change to register in existing factory |
