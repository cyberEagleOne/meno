---
name: meno-workflow
description: Engineering workflow for the Meno mobile Bible-reading app, including PRD-first planning, incremental implementation, acceptance criteria, testing, Git commits, and university assignment evidence.
---

# Meno Engineering Workflow

## Project context
Meno is a mobile Bible-reading app inspired by Duolingo's habit-building
mechanics, with an original visual identity and Scripture-first experience.
This is a university assignment completed over 12 meetings.

## Required workflow
For every feature, follow:
Brief -> Plan -> Build -> Verify -> Commit.

1. Restate the feature and its acceptance criteria.
2. Inspect relevant files and dependencies before changing anything.
3. Present a concise implementation plan.
4. Implement only the agreed feature and necessary supporting changes.
5. Run relevant tests, type checks, and build checks.
6. Inspect the diff and summarize important decisions.
7. Commit only after verification and explicit user approval.

## Planning and documentation
- Create and maintain docs/PRD.md and docs/ARCHITECTURE.md.
- Record user stories and measurable acceptance criteria.
- Keep docs/TESTING.md and README.md accurate.
- Do not invent completed work, test results, or screenshots.

## Code quality
- Use TypeScript and clear separation between UI, domain logic,
  repositories, and persistence.
- Keep business rules deterministic and independently testable.
- Avoid unnecessary dependencies and abstractions.
- Never put secrets in source control.
- Never silently overwrite user changes.
- Do not use fabricated Bible text or assume translation licensing.

## Testing
- Add meaningful unit tests for business rules.
- Test duplicate reading completion, XP awarding, streak boundaries,
  reading-plan validation, and persistence behavior as applicable.
- Run tests and report the actual command and result.
- Never claim tests pass unless they were executed successfully.
- Fix regressions before declaring a feature complete.

## Git
- Inspect git status before modifying or committing files.
- Never commit secrets, generated build artifacts, or unrelated changes.
- Use focused, descriptive commit messages.
- Do not create a commit without explicit user approval.

## Student understanding
Explain architecture, data flow, important code decisions, and test results
in language the student can explain to a lecturer.
Distinguish AI-generated changes from changes reviewed or made by the student.
Do not fabricate student contributions or evidence.

## Scope control
- Follow the agreed MVP and 12-meeting schedule.
- Do not implement the entire application in one step.
- Ask before introducing a backend, authentication, paid service, or major
  dependency that was not approved in the architecture.
- Keep the app runnable at each milestone.
