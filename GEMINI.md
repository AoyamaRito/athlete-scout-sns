# Student Athlete Scout SNS — AI & Runtime Guidelines

This subdirectory instructions file defines the local development workflow, runtime operations, and engineering standards for the Student Athlete Scout SNS.

## Project Structure
- `BIBLE.js`: The executable domain specification (spec, rules, transition constraints, fee structures).
- `yume-core.js`: Minimalist, zero-dependency AI-Native core (EventStore with `REAL_state` convention).
- `logic.yume.js`: Reducer, state validators, and initial state (`schemaVersion: 2`, hashless).
- `auth.yume.js`: QR-based cryptographic key identities (Ed25519) utilizing `vendor/id-auth.js`.
- `ui.yume.js`: Student-facing Profile Editing, Best Friend Linking, Scout Funnel, and Recruiter simulators.
- `index.html`: Student-facing SPA mounting point.
- `corporate-lp.html`: Corporate Landing Page + Recruiters Portal (with Student Database, Scout Funnel, and Billing view).
- `demo.html`: Interactive demo combining Student and Recruiter flows.
- `unit.test.js`: Core domain unit tests.
- `e2e.test.js`: Comprehensive 100% Code Coverage E2E testing suite.

---

## Operating with the `yume` ver002 Runtime

All `.yume.js` files are configured with **schemaVersion: 2** (hashless sequence mode) pinned to **yume runtime v002**. This allows direct, lightweight version tracking and automated multi-file updates.

To manage versioning and apply updates, use `/Users/AoyamaRito/PJs/yume-develop/runYume.js`:

### 1. View Version History
```bash
node /Users/AoyamaRito/PJs/yume-develop/runYume.js logic.yume.js history
```

### 2. Output Head Content (Raw Code)
```bash
node /Users/AoyamaRito/PJs/yume-develop/runYume.js logic.yume.js show head --raw
```

### 3. Generate Unified Heavy View (Context Compression)
To read multiple files in the dependency graph simultaneously at depth 1:
```bash
node /Users/AoyamaRito/PJs/yume-develop/runYume.js logic.yume.js heavy sns:logic 1 ui.yume.js auth.yume.js > heavy.txt
```

### 4. Edit and Apply Changes (`heavy-apply` Edit Loop)
To update multiple blocks after editing the unified `heavy.txt` file:
```bash
node /Users/AoyamaRito/PJs/yume-develop/runYume.js logic.yume.js heavy-apply heavy.txt sns:logic 1 ui.yume.js auth.yume.js --note "Reason for change"
```

### 5. Manual Committing of Direct File Edits
If you make direct surgical replacements inside the `// === HEAD ===` and `// === /HEAD ===` region of a `.yume.js` file, you must append a new history record:
```bash
node /Users/AoyamaRito/PJs/yume-develop/runYume.js logic.yume.js commit --note "Surgical fix to reducer validation"
```

---

## Testing & Verification Standard (Axiom A14)

Always verify changes using the built-in test runners before any commit or wrap-up.

### Run Unit Tests
```bash
node unit.test.js
```

### Run End-to-End Tests
```bash
node e2e.test.js
```

All new features or bug fixes must be accompanied by new assertions inside `unit.test.js` or scenarios in `e2e.test.js`.
