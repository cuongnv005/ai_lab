# Quality Standards

Implementation-ready checklist for requirement documents.

Before finalizing a document, verify each item. **Failure on any item means the document is NOT ready.**

## Content Completeness

- [ ] **Overview Quality**: No "Overview" is just a rewrite of the draft's intro; it must explain the *full* scope of the change.
- [ ] **Column-by-Column Verification**: Every column mentioned in the draft is present in DATA MODEL UPDATES. No column is silently omitted.
- [ ] **Enum Completeness**: Every Enum column has a full value list + state transition table.
- [ ] **Module & Role Verification**: The `CONTEXT` section correctly identifies the Module and Guard (User) based on the existing codebase.

## Logic Completeness

- [ ] **State Definitions**: All logical states are defined (tables are preferred for state transitions).
- [ ] **Internal Flags**: Internal flags (for state tracking) are proposed in the DATA MODEL UPDATES.
- [ ] **Business Rules**: Business Rules are individually numbered and testable.
- [ ] **3rd-party Integration**: 3rd-party integration details (Webhooks, Error codes) are explicitly defined.
- [ ] **Error Scenarios**: "What if" / error scenarios for every main flow are addressed in Error Cases tables.

## Flow Completeness

- [ ] **Exhaustive Processing Flows**: Every distinct action documented in the draft has a dedicated step-by-step flow.
- [ ] **Explicit State Changes**: Every step that modifies data includes `State Changes` sub-list.
- [ ] **Error Cases**: Every flow ends with an Error Cases table.

## Auxiliary Sections

- [ ] **Notifications**: If any notification is mentioned or implied, the NOTIFICATIONS table is present.
- [ ] **API Endpoints**: The API ENDPOINT INVENTORY is present if API changes are needed.

## Stand-alone Check

- [ ] **Independence Test**: Can a developer build this feature if the `docs/draft/` file is deleted? (The answer must be YES).

## Common Failure Patterns

### Missing State Transitions

**Bad**: Only happy path documented.
**Good**: All possible state transitions (including failures) mapped with triggers.

### Implicit Assumptions

**Bad**: "System sends notification" (what kind? to whom? when?).
**Good**: NOTIFICATIONS table with channel, template, variables, recipient.

### Silent Column Omissions

**Bad**: Draft mentions `show_warning` column but it's not in DATA MODEL.
**Good**: Every draft column appears in DATA MODEL; exclusions explicitly documented.

### Missing Error Handling

**Bad**: Flow only describes success scenario.
**Good**: Every flow has Error Cases table with network, duplicate, invalid state, auth, 3rd-party errors.

### Unverified Roles/Guards

**Bad**: Assuming "admin" can access without checking `routes/` and `Controllers/`.
**Good**: Verified guard and roles from existing codebase structure.
