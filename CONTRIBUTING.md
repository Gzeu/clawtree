# Contributing to ClawTree 🌳

Thank you for helping ClawTree grow! Here's how to contribute.

## Types of Contributions

### 1. New Talent Tree Branch
Open an issue using the **"New Branch Idea"** template and specify:
- Branch name + proposed skills (min 2, max 6 nodes)
- Prerequisites and `chainsWith` relative to existing skills
- A real use-case (not theoretical)

### 2. Bug Fix
- Fork → branch `fix/<description>` → PR with test included

### 3. Knowledge Graph Enrichment
- Add new synergies in `skills/clawtree/src/graph/graphEnricher.ts`
- Add entries to `CROSS_SYNERGIES` with format `[from, to, label]`

### 4. README Translation
- Add `README.<lang>.md` in the root folder

---

## Local Setup

```bash
git clone https://github.com/Gzeu/clawtree
cd clawtree/skills/clawtree
npm install
npm test
```

## Conventions

- Branch names: `feat/`, `fix/`, `docs/`, `test/`
- Commit messages: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- All new functions must have a test in `tests/`
- Don't add dependencies without opening a discussion issue first
- Keep skills composable — new nodes must declare `chainsWith` and `prerequisites`

## Pull Request Checklist

- [ ] Tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] New skill nodes have `description`, `chainsWith`, and `evolveAt`
- [ ] CHANGELOG.md updated

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
