# Speckit Units & Hierarchical Documentation

A reference guide to all specification and planning units used in this codebase, their definitions, and their hierarchical relationships.

---

## Unit Categories & Hierarchy

### 1. Strategic Level (Business & Product)

| Unit | Full Name | Purpose | Format | Location |
|------|-----------|---------|--------|----------|
| **Constitution** | Project Constitution | Non-negotiable project principles; gates every plan | Principles doc | `.specify/memory/constitution.md` |
| **PRD** | Product Requirements Document | Business case, market analysis, user value | Narrative document | `spec.md` (implicit, feature-scoped) |
| **Feature** | Feature Specification | Complete user-facing capability | Named branch + dir | `specs/001-todo-core-features/` |

**Relationship**: Constitution → PRD/Feature (constitution gates every feature plan)

---

### 2. Specification Level (User-Focused Requirements)

| Unit | Full Name | Purpose | Format | Example |
|------|-----------|---------|--------|---------|
| **US** | User Story | Specific user journey with value proposition | `US1`, `US2`… | `US1: Create and Manage Tasks` |
| **P1, P2, P3** | Priority Levels | Implementation order and importance | `P1` (highest), `P2`, `P3` | `US1 (P1)`, `US3 (P2)` |
| **Acceptance Scenario** | Acceptance Scenario | Given/When/Then test for a user story | Numbered list under each US | `Given empty list, When user submits, Then task appears` |
| **Edge Case** | Edge Case | Boundary/error condition the system must handle | Q&A pairs in spec | `What happens when storage is full?` |
| **SC** | Success Criterion | Measurable, technology-agnostic outcomes | `SC-001`, `SC-002`… | `SC-001: Users can create task in <3s` |

**Relationship**: Feature → US (with priority) → Acceptance Scenarios + Edge Cases; Feature → SC

---

### 3. Functional Level (System Requirements)

| Unit | Full Name | Purpose | Format | Example |
|------|-----------|---------|--------|---------|
| **FR** | Functional Requirement | Specific, testable system capability (`System MUST…`) | `FR-001`, `FR-002`… | `FR-001: System MUST allow task creation` |
| **NFR** | Non-Functional Requirement | Quality attributes (performance, security, accessibility) | `NFR-001`, `NFR-002`… | `NFR-001: Response time <100ms` |

**Relationship**: US → FR/NFR (each US decomposes into multiple requirements)

> **FR vs PRD**: FRs are the technical-facing decomposition of product intent. A PRD includes broader business context (market, personas, strategy) — `spec.md` in Speckit acts as a feature-scoped PRD containing both narrative (US, SC) and technical requirements (FR, NFR).

---

### 4. Implementation Level (Technical Design)

| Unit | Full Name | Purpose | Format | Location |
|------|-----------|---------|--------|----------|
| **Plan** | Implementation Plan | HOW to build — stack, architecture, constitution gate | `plan.md` | `specs/###/plan.md` |
| **Research** | Research / ADR | Resolved technical unknowns; Decision → Rationale → Alternatives | `research.md` | `specs/###/research.md` |
| **Entity** | Data Model Entity | Core business object with fields, types, state transitions | Named entity | `data-model.md` |
| **Contract** | Interface Contract | Component props, storage schema, API shapes | `contracts/*.md` | `specs/###/contracts/` |
| **Phase** | Development Phase | Sequential implementation stage | `Phase 0`, `Phase 1`… | `tasks.md` sections |

**Relationship**: FR → Entity → Contract (requirements drive entity design, which defines contracts)

---

### 5. Task Level (Implementation Units)

| Unit | Full Name | Purpose | Format | Example |
|------|-----------|---------|--------|---------|
| **T** | Implementation Task | Atomic unit of development work | `T001`, `T002`… | `T001: Initialise Next.js project` |
| **[P]** | Parallel Marker | Task can run simultaneously with others (no shared file deps) | `[P]` tag | `T002 [P] Configure Jest` |
| **[Story]** | Story Mapping | Maps task to its user story | `[US1]`, `[US2]`… | `T020 [P] [US1] Implement TodoInput` |

**Relationship**: Phase → Tasks → [USN] (tasks organised by phase and mapped to user stories)

---

### 6. Quality Level (Validation & Testing)

| Unit | Full Name | Purpose | Format | Example |
|------|-----------|---------|--------|---------|
| **CHK** | Checklist Item | Requirements quality validation ("unit tests for English") | `CHK001`, `CHK002`… | `CHK001: Requirements are testable` |
| **[Gap]** | Gap Marker | Missing requirement identified | `[Gap]` tag | `[Gap] Error handling requirements not defined` |
| **[Ambiguity]** | Ambiguity Marker | Unclear or unmeasurable requirement | `[Ambiguity]` tag | `[Ambiguity] "fast loading" undefined` |
| **[Conflict]** | Conflict Marker | Conflicting requirements detected | `[Conflict]` tag | `[Conflict] FR-003 contradicts FR-008` |

**Relationship**: CHK items validate FR/US quality *before* planning begins; [Gap]/[Ambiguity]/[Conflict] tags are raised during `/speckit.analyze`

---

## Hierarchical Structure

```
CONSTITUTION                              ← Project-wide, non-negotiable principles
│
└── FEATURE (001-todo-core-features)      ← Discrete deliverable slice (git branch + specs/ dir)
    │
    ├── SPECIFICATION (spec.md)           ← Business language; technology-agnostic
    │   │
    │   ├── USER STORIES                  ← Independent journeys, ordered by priority
    │   │   ├── US1 (P1): Create Tasks    ← Acceptance Scenarios (Given/When/Then)
    │   │   ├── US2 (P1): Complete Tasks  ←   + Edge Cases (boundary conditions)
    │   │   ├── US3 (P2): Filter Tasks
    │   │   └── US4 (P2): Delete Tasks
    │   │
    │   ├── FUNCTIONAL REQUIREMENTS       ← FR-001…FR-016 (System MUST…)
    │   │   └── NFR-001…                  ← Non-functional: performance, a11y, security
    │   │       └── Key Entities          ← Domain objects named in requirements
    │   │
    │   └── SUCCESS CRITERIA              ← SC-001…SC-008 (measurable outcomes)
    │
    ├── CHECKLIST (checklists/)           ← "Unit tests for English" — validates spec quality
    │   └── CHK001, CHK002…               ← [Gap] [Ambiguity] [Conflict] markers
    │
    ├── IMPLEMENTATION PLAN (plan.md)     ← Technical layer — HOW to build
    │   ├── Technical Context             ← Stack, versions, constraints
    │   ├── Constitution Check            ← Gate: all 5 principles must pass
    │   ├── Research (research.md)        ← Resolved unknowns; ADRs
    │   ├── Data Model (data-model.md)    ← Entities, enums, state transitions, persistence
    │   └── Contracts (contracts/)        ← Component props, storage schema, API interfaces
    │
    └── TASKS (tasks.md)                 ← Atomic implementation work items
        ├── Phase 1: Setup               ← Tooling, project init
        ├── Phase 2: Foundation          ← Shared types, hooks, storage (blocking)
        ├── Phase 3: US1 Tasks           ← T014…T023 [US1]; tests FIRST, then impl
        ├── Phase 4: US2 Tasks           ← T024…T030 [US2]; [P] where parallelisable
        └── Phase N: USN Tasks           ← Tests (unit → integration → E2E) + impl
```

---

## Flow: From Idea to Code

```
User Idea
    │
    ▼
/speckit.constitution  →  Constitution          (once per project)
    │
    ▼
/speckit.specify  →  spec.md
                      ├── User Stories (US) with priorities (P1, P2…)
                      │     ├── Acceptance Scenarios
                      │     └── Edge Cases
                      ├── Functional Requirements (FR) + NFRs
                      └── Success Criteria (SC)
    │
    ▼
/speckit.checklist  →  checklists/requirements.md   (CHK items; [Gap]/[Ambiguity] markers)
    │
    ▼
/speckit.clarify   →  Resolves ambiguities in spec.md          (optional)
    │
    ▼
/speckit.plan  →  plan.md + research.md + data-model.md + contracts/
    │
    ▼
/speckit.analyze  →  Cross-artifact consistency report          (optional)
    │
    ▼
/speckit.tasks  →  tasks.md  (T items in phases, mapped to [USN], marked [P])
    │
    ▼
/speckit.implement  →  Source code satisfying all FR, SC, contracts
```

---

## Traceability Matrix

| Level | Unit | Maps To | Example Mapping |
|-------|------|---------|-----------------|
| Strategic | Constitution | Feature Plan | Gates `001-todo-core-features` plan via constitution check |
| Strategic | PRD / spec.md | Feature | `spec.md` justifies and scopes the feature |
| Specification | US1 | FR-001, FR-002, FR-005 | User story decomposes into functional requirements |
| Specification | SC-001 | FR-001, T005 | Success criterion maps to requirement and task |
| Functional | FR-003 | US2, T027 | Requirement maps to user story and implementation task |
| Technical | TodoItem Entity | FR-001, FR-003, FR-009 | Data model entity serves multiple requirements |
| Implementation | T020 [US1] | FR-001, CHK001 | Task satisfies requirement; checklist validates it |
| Quality | CHK001 | FR-001, US1 | Checklist item validates requirement and user story |

---

## Key Relationships

| From | To | Relationship |
|------|----|--------------|
| Constitution | Feature Plan | Gates every plan; violations must be justified in Complexity Tracking |
| User Story | Functional Requirements | 1 US → many FRs (story decomposed into capabilities) |
| User Story | Tasks | 1 US → many Tasks (story decomposed into work items) |
| Functional Requirement | Acceptance Scenario | FRs made concrete and testable by acceptance scenarios |
| Functional Requirement | Task | Each FR must be covered by ≥1 Task |
| Success Criterion | Task | SC defines the measurable target Tasks must achieve |
| Data Model | Contract | Entities in data-model.md shape component and storage contracts |
| Contract | Task | Contracts are the implementation target Tasks must satisfy |
| Checklist | Specification | CHK items validate spec quality before planning begins |

---

## Quality Gates

- All US must have at least one FR
- All FR must have at least one Task (T)
- All Tasks must map to a US via `[USN]` marker
- All CHK items must validate an FR or US
- Constitution Check must pass (`✅ PASS`) before implementation begins
- No `[NEEDS CLARIFICATION]` markers may remain in spec before `/speckit.plan`

---

## File Location Mapping

| Unit Type | File Pattern | Example Path |
|-----------|--------------|--------------|
| Constitution | `.specify/memory/constitution.md` | `.specify/memory/constitution.md` |
| Feature | `specs/[###-feature-name]/` | `specs/001-todo-core-features/` |
| Specification | `spec.md` | `specs/001-todo-core-features/spec.md` |
| Plan | `plan.md` | `specs/001-todo-core-features/plan.md` |
| Research | `research.md` | `specs/001-todo-core-features/research.md` |
| Data Model | `data-model.md` | `specs/001-todo-core-features/data-model.md` |
| Contracts | `contracts/*.md` | `specs/001-todo-core-features/contracts/` |
| Tasks | `tasks.md` | `specs/001-todo-core-features/tasks.md` |
| Checklists | `checklists/*.md` | `specs/001-todo-core-features/checklists/` |
