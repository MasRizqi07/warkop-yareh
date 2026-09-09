## Scope

- Requested change:
- Explicit non-goals:
- Imported branch or commit (write `none` when not applicable):
- Scope disclosure file (required for imported history):

## Product behavior

- User-visible behavior added or changed:
- Product approval or decision record:

## Evidence

- [ ] `pnpm audit:scope`
- [ ] Node 24 lint, typecheck, tests, and build
- [ ] Persistence mutation -> reload proof where data is changed
- [ ] Exact-commit CI link
- [ ] Staging/provider/production evidence is reported separately from local evidence

## Release boundary

- [ ] No production database migration is triggered by this PR
- [ ] Any production migration has a separate protected-environment approval
