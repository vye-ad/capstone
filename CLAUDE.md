# CLAUDE.md

Context for Claude Code working in this repository.

## What this project is

**expeditor** — a travel-planning web app. Capstone project, solo developer, 4-week timeline.

**`DEVELOPMENT.md` in the repo root is the authoritative specification.** Read the relevant section before implementing anything. If this file and `DEVELOPMENT.md` disagree, `DEVELOPMENT.md` wins.

## Working rules

1. **One task at a time.** Work through the §15 build-order checklist in `DEVELOPMENT.md` in sequence. Do not jump ahead to later weeks or to `[OPTIONAL]` features.
2. **Read the spec section first.** Before writing code for a feature, read the section of `DEVELOPMENT.md` that describes it. Quote the relevant rule back so it's clear which spec you're implementing.
3. **Stop and ask when genuinely ambiguous.** Do not guess and do not invent features that aren't in the spec.
4. **Explain as you go.** After implementing something, briefly explain what the code does and why. The developer must be able to defend every line under academic questioning — unexplained code is worthless here even if it works.
5. **Small commits.** Propose a commit after each working unit of functionality. Never batch a day's work into one commit.
6. **Never modify `DEVELOPMENT.md` without being asked.** If the spec turns out to be wrong, say so and propose the change.

## Verification and accuracy

These rules exist because plausible-sounding wrong answers are more expensive here than admitted uncertainty.

### Look, don't recall

- **Read a file before editing it.** Do not work from what you remember it containing.
- **Check the installed version before using a library's API.** Package syntax changes between major versions. Read `node_modules` type definitions or the installed package's docs rather than recalling the API.
- **Verify package versions before installing:** `npm view <package> versions --json`. Never write a version number from memory into `package.json`.
- **Before writing the REST Countries seed script**, fetch one country and print the raw JSON. Map fields from that output. The mapping table in `DEVELOPMENT.md` §12.1 came from documentation, not a live response — treat it as a hypothesis to verify, not a fact.

### Evidence, not assertion

- **Never report that something works without running it.** "This should work" is not acceptable. Run the command, run the test, hit the endpoint, and paste the actual output.
- **Never claim tests pass without executing them.**
- **When stating a fact about this codebase, cite the file and line.** If you can't point at one, say you're inferring.

### Uncertainty is allowed and expected

- If you are not certain something exists — a method, a config option, a field — **say "I need to check" and then check.** Guessing plausibly is worse than admitting the gap.
- If a question presupposes something that may not exist in this codebase, **verify the premise before answering it.** Do not describe how a helper works until you've confirmed the helper exists.
- If `DEVELOPMENT.md` turns out to be wrong about an external API or library, say so directly rather than writing code that matches the spec but not reality.

### Session hygiene

Prefer short, focused sessions over long ones. Long accumulated context increases the chance of confusing what is actually in this codebase with something seen earlier in the session.

## Deviations from the mockups

The wireframe mockups contain known errors. `DEVELOPMENT.md` marks these `[DEVIATION]`. Follow the spec, not the images. The main ones:

- Expanded trip rows are **read-only text**, not input fields
- Flags are **`<img>` with SVG URLs**, never emoji (emoji flags don't render on Windows)
- Profile has **five** stats, not four (`ongoing trips` was missing)
- `notifications` on Profile is **cut** — do not build it
- Trip status `cancelled` **does not exist** — only `upcoming`, `ongoing`, `completed`

## Commands

```bash
# Backend (from server/)
npm run dev              # start Express with nodemon
npx prisma migrate dev   # create + apply a migration
npx prisma db seed       # run the seed script
npx prisma studio        # inspect the database

# Frontend (from client/)
npm run dev              # start Vite
npm run build            # production build
```

## Code conventions

### Non-negotiable

- **No hardcoded user-facing strings.** Every visible string comes from `client/src/locales/{en,fr,es}.json` via `react-i18next`. This applies from the very first component — retrofitting i18n is painful.
- **All interface text is lowercase**, written lowercase in the locale files. Do not use CSS `text-transform`.
- **Colours come from Tailwind theme tokens only** (`ink`, `muted`, `hairline`, `paper`, `status.*`, `danger`). No arbitrary hex values in components.
- **Trip status is resolved in exactly one place** — `server/src/services/tripStatus.js`. Never compute status inline in a controller, and never on the client.
- **Validation runs server-side always**, even when the client already validated. Shared Zod schemas.
- **API keys never reach the browser.** All third-party calls proxied through Express.

### Design constraints

The visual identity is monochrome, pill-shaped borders, hairline rules, generous whitespace, all lowercase.

**Do not introduce:** gradients, drop shadows, card elevation, coloured accent backgrounds, cream or terracotta palettes, `border-radius: 8px` rounded rectangles, or icon libraries beyond a chevron and an avatar placeholder.

Colour appears in exactly two places: status dots and error states.

### Branding

- `xpdtr` — top-left, alone, on Landing / Sign In / Sign Up / Home
- `expeditor | [page]` — top-centre, on Explore / My Trips / Create Trip / Profile / Admin

This inconsistency is deliberate. Do not "fix" it.

## Stack

React 18 + Vite + Tailwind · Express · PostgreSQL + Prisma · JWT in httpOnly cookie · bcrypt · react-i18next · Cloudinary · Zod

Do not substitute any of these.

## Known traps

- **CORS + cookies:** dev runs Vite on `:5173` and Express on `:3000`. Requires `credentials: 'include'` client-side, `cors({ origin, credentials: true })` server-side, and `sameSite: 'lax'`. Symptom if wrong: login succeeds, then every request 401s. Postman will not reproduce this — it doesn't enforce CORS.
- **REST Countries field names:** fetch one country and print the raw object before writing the seed script. The v3.1 response shape has changed before; the mapping table in `DEVELOPMENT.md` §12.1 is from documentation, not a live response.
- **Login errors must be identical** for unknown email and wrong password, or accounts can be enumerated.
- **Other users' resources return 404, not 403.** A 403 confirms the resource exists.
- **Admins cannot demote or delete themselves** — otherwise every admin can be locked out.

## Academic constraints

This is graded coursework with a strict plagiarism policy.

- Every external library, API, dataset, and borrowed code pattern must be credited in `README.md`.
- Commits must show incremental progress. Large late commits are treated as a plagiarism signal.
- The developer must understand and be able to explain all code. Prioritise clarity over cleverness.
