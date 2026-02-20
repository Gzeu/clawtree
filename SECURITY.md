# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.x.x | ✅ Yes |

## Reporting a Vulnerability

Do **not** open a public GitHub issue for security vulnerabilities.

Please report security issues directly to the maintainer via GitHub private message or by emailing the address listed in the GitHub profile.

You can expect a response within 72 hours. If the issue is confirmed, a patch release will be made as quickly as possible.

## Skill Safety

ClawTree includes built-in safety mechanisms:
- **Prompt injection heuristics** (`src/safety/injectionHeuristics.ts`)
- **Permissions gate** (`src/safety/permissionsGate.ts`) — only declared permissions in `SKILL.md` can be used at runtime
- Skills with `shell + filesystem + network` require explicit user confirmation before install
