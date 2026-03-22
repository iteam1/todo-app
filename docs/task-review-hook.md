# Task Review Hook

A Claude Code `Stop` hook that enforces a human-in-the-loop review cycle after every code change. Claude pauses after each response, waits for user approval, then commits before proceeding to the next task.

---

## Problem It Solves

When an AI agent works through a `tasks.md` file, it tends to complete all tasks in one long uninterrupted run — generating large diffs that are hard to review, with no commit history granularity. Mistakes compound silently across tasks.

This hook breaks that pattern by inserting a mandatory review gate after every response that produces code changes.

---

## How It Works

```
Claude finishes a response
        │
        ▼
Stop hook fires (.claude/scripts/task-review.sh)
        │
        ├── SPECKIT_REVIEW_HOOK=off?  → exit 0 (hook disabled)
        │
        ├── stop_hook_active=true?    → exit 0 (prevent infinite loop)
        │
        ├── No git changes?           → exit 0 (nothing to review)
        │
        └── Changes detected
                │
                ▼
        Show git diff --stat
        Prompt user for input
                │
                ├── "ok"      → git add -A && git commit → Claude stops cleanly
                ├── "stop"    → session ends entirely
                └── [other]   → text sent to Claude as feedback (exit 2)
                                Claude reads feedback, edits, loops back
```

---

## Files

| File | Purpose |
|------|---------|
| `.claude/scripts/task-review.sh` | The hook shell script |
| `.claude/settings.json` | Registers the hook on the `Stop` event |
| `.env.example` | Documents the `SPECKIT_REVIEW_HOOK` toggle |
| `.env` | Your local override (gitignored) |

---

## Setup

```bash
# Copy the env example
cp .env.example .env
```

The hook is **enabled by default** — no `.env` file required.

---

## Usage

When Claude finishes a response that modified files, the terminal will show:

```
┌─────────────────────────────────────────┐
│         Task Review — Changes Made       │
└─────────────────────────────────────────┘

 src/components/TodoItem.tsx | 45 ++++++++++++
 1 file changed, 45 insertions(+)

Options:
  ok       → commit changes and continue to next task
  stop     → end session
  [other]  → send as feedback to Claude

Your review:
```

### Responses

- **`ok`** — Commits all staged changes with `git add -A && git commit` and lets Claude stop cleanly. Claude will then be ready for the next task on your next message.
- **`stop`** — Ends the Claude Code session entirely.
- **Any other text** — Sent back to Claude as feedback via `exit 2`. Claude receives it, applies edits, and the hook fires again on the next response. Repeat until satisfied, then type `ok`.

---

## Toggling On/Off

Set `SPECKIT_REVIEW_HOOK` in your `.env` file:

```bash
# Disable — Claude runs freely without pausing
SPECKIT_REVIEW_HOOK=off

# Enable (default — same as not setting it at all)
SPECKIT_REVIEW_HOOK=on
```

Or inline for a single session:

```bash
SPECKIT_REVIEW_HOOK=off claude
```

---

## Integration with Task Workflow

This hook complements the task workflow defined in `AGENTS.md`:

```
/speckit.tasks generates tasks.md
        │
        ▼
Claude loads tasks into TodoWrite
        │
        ▼
Claude works on Task T001
        │
        ▼
Stop hook fires → user reviews → "ok" → git commit: "task(T001): ..."
        │
        ▼
Claude works on Task T002
        │
        ▼
Stop hook fires → user reviews → feedback → Claude edits → hook fires again
        │                                                          │
        └──────────── loop until "ok" ─────────────────────────────┘
        │
        ▼
git commit: "task(T002): ..."  →  next task
```

Each task ends up as an independent, reviewed commit — giving a clean, granular git history that mirrors the `tasks.md` structure.

---

## Limitations

- Requires **interactive mode** — the `read` command does not work with Claude Code's `-p` (non-interactive) flag.
- The commit message is currently generic (`task: implement changes`). For a precise `task(T###): ...` message, type it as part of your `ok` response or update the script to parse the active todo title.
- `jq` must be installed for the `stop_hook_active` guard to work (`apt install jq` / `brew install jq`).
