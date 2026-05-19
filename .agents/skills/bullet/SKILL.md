C:/Users/Basel/.claude/skills/bullet.md
---
name: bullet
description: Generate a polished GitHub Pull Request description from the current branch's changes. Use when the user says "bullet", "pr description", "write PR", or "summarize branch".
---

# Branch Summary — GitHub PR Description

Generate a polished GitHub Pull Request description from the current branch's changes.

## Steps

1. `git branch --show-current` — get branch name
2. `git log main..HEAD --oneline` — list commits (fallback to `master` if `main` missing)
3. `git diff main...HEAD --stat` — see changed files
4. `git diff main...HEAD -- src/` — read actual diffs (skip lock files, dist/, generated)
5. Group changes by domain, write the PR description

## Output format

Produce a markdown PR description ready to paste into GitHub:

```markdown
## Summary

One short phrase, max 10 words, no period.

## Changes

- **Area**: what changed — new things, fixes, removals

## Notes

Only if there is a breaking change or required migration step. Omit otherwise.
```

## Rules

- Branch name → infer PR title hint (e.g. `feat/gantt-layout` → "Gantt: full calendar layout")
- Summary: one phrase only, no full sentence, no period
- Group by logical domain (Core, Auth, Sprints, Gantt, etc.) — NOT by file or commit
- Each bullet: **Bold area prefix**, then terse noun phrases comma-separated
- Max ~120 chars per bullet; split into two bullets if needed
- Verbs: "added", "fixed", "removed", "refactored", "normalized"
- Skip: lock files, dist/, whitespace-only, trivial comment changes
- Notes: only for breaking changes or required migration steps — omit for everything else
- Keep total description under ~30 lines — concise wins
- Output raw markdown only, no extra explanation
