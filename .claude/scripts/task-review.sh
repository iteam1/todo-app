#!/bin/bash
#
# task-review.sh — Stop hook for Claude Code
#
# After Claude finishes a response, if there are uncommitted changes:
#   - Show a diff summary
#   - Prompt the user to review
#   - "ok"      → git commit and allow Claude to stop
#   - "stop"    → end the session entirely
#   - anything else → feed back to Claude as feedback (exit 2)

INPUT=$(cat)

# Allow disabling the hook via environment variable
if [ "${SPECKIT_REVIEW_HOOK:-on}" = "off" ]; then
  exit 0
fi

# Prevent infinite loop: if this hook already triggered a continuation, exit
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi

# Skip if nothing changed
if git diff --quiet && git diff --cached --quiet; then
  exit 0
fi

echo ""
echo "┌─────────────────────────────────────────┐"
echo "│         Task Review — Changes Made       │"
echo "└─────────────────────────────────────────┘"
echo ""
git diff --stat
git diff --cached --stat
echo ""
echo "Options:"
echo "  ok       → commit changes and continue to next task"
echo "  stop     → end session"
echo "  [other]  → send as feedback to Claude"
echo ""
printf "Your review: "
read -r response

case "$response" in
  ok)
    git add -A
    # Try to extract task ID from Claude's last todo if available
    TASK_MSG="task: implement changes"
    git commit -m "$TASK_MSG"
    echo "✓ Committed. Moving to next task."
    exit 0
    ;;
  stop)
    echo '{"decision": "block", "reason": "User ended session after review."}' 
    exit 0
    ;;
  "")
    # Empty input — treat as "not reviewed yet", block and ask again
    echo "No input received. Please review the changes." >&2
    exit 2
    ;;
  *)
    # Send feedback back to Claude
    echo "$response" >&2
    exit 2
    ;;
esac
