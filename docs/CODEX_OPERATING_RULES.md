# Codex Operating Rules for PARK-GUARD

These rules are mandatory.

## 1. Before editing

Codex must:

1. read all documents under `docs/`;
2. inspect the complete repository;
3. inspect available source-data headers and representative rows;
4. report the current repository state;
5. propose the exact files it plans to create or modify;
6. identify missing credentials or contradictions;
7. wait for approval before the first architecture-changing edit.

The initial inspection stage must not modify files.

## 2. No assumptions

Codex must not invent:

- data fields;
- backend endpoints;
- database tables;
- authentication;
- live APIs;
- map SDK initialization signatures;
- product metrics;
- locality names;
- actual outcomes;
- real dispatch behaviour;
- unapproved branding.

When information is missing, it must state what is missing and why it matters.

## 3. Dependencies

Before adding a dependency, Codex must state:

- package name;
- purpose;
- why existing dependencies are insufficient;
- whether it affects bundle size or licensing.

It must ask for approval unless the dependency is already required by `MASTER_SPEC.md`.

Pre-approved categories:

- React/Vite
- React Router
- Tailwind CSS
- shadcn/ui dependencies
- Recharts
- Lucide React
- Mappls SDK integration required by official instructions

Do not add a state-management library, map alternative, CSV parser for runtime, animation library, date library, test framework, or backend package without approval.

## 4. Data safety

- Never edit source files under `input-data/`.
- Generated files go to `public/data/`.
- Never expose actual future outcome fields.
- Never hardcode credentials.
- Never commit `.env`.
- Never silently drop invalid records; report them.
- Never use the full recommendation CSV directly in the browser.
- Never use MapMyIndia traffic intelligence as model input.

## 5. Implementation approach

Work in small, reviewable stages.

After each stage:

1. summarize changes;
2. list files changed;
3. state any unresolved issue;
4. run the relevant checks;
5. stop for review when the staged prompt requests an approval gate.

Do not rewrite unrelated files.

## 6. Code quality

- Use JavaScript with clear JSDoc where types are non-obvious.
- Prefer small focused components.
- Keep provider-specific map code isolated.
- Avoid deeply nested conditionals.
- Centralize formatting and semantic labels.
- Centralize theme tokens.
- Do not duplicate data transformation logic across components.
- Use stable React keys.
- Clean up timers and Mappls event listeners.
- Avoid unnecessary effects.
- Never suppress lint errors without explaining the cause.

## 7. Visual quality

- Do not leave default shadcn styling untouched.
- Do not use lorem ipsum.
- Do not create fake charts or mock metrics.
- Do not use excessive gradients, neon glow, or glassmorphism.
- Do not use action colour as the only information channel.
- Do not add unapproved logos or branding.
- Preserve the dark navy control-room direction.

## 8. Product truth

Every interface must preserve:

- historical simulation labelling;
- non-causal scenario language;
- decision-support framing;
- verification-first handling;
- no automatic penalties;
- no learned-propagation claim.

## 9. Checks

At minimum, run:

```bash
npm run lint
npm run build
```

after each major implementation stage.

Before final completion, also:

- run `npm run dev`;
- inspect browser console;
- test missing Mappls credentials;
- test Peak Demo;
- test Quiet Hour;
- test zero-deployment hour;
- test tablet widths;
- test refresh persistence.

## 10. Git workflow

If Git is initialized and the user approves commits:

- create small commits after stable stages;
- use descriptive commit messages;
- do not rewrite history;
- do not push without explicit permission;
- do not commit generated secrets or `.env`.

## 11. Definition of honesty

If something cannot be completed because Mappls credentials, SDK instructions, or source data are unavailable, Codex must say so. It must implement a controlled placeholder boundary or map-unavailable state, not pretend the integration works.
