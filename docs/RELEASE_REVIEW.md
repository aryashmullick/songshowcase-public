# Public release review

Reviewed on 26 October 2026. This is a code review and local validation record, not a security certification.

## History and provenance

The private source used `dev` as its default branch, with a divergent `newDev` branch and no tags. Ten development commits were inspected across those branches. The public `main` lineage retains the nine commits reachable from the local `dev` tip, including three local commits beyond its remote tip. The divergent experimental branch is not published. Author names, author/committer dates, and benign commit subjects are preserved. Private email addresses are replaced by the owner's GitHub noreply address. Hashes necessarily changed.

All 184 available source Git objects were inspected, including 104 blobs, reflog-reachable objects, and a local snapshot tree outside commit history. Historical path inventory and commit messages were reviewed for configuration, previous filenames, dumps, logs, personal data, and credentials. Gitleaks found no leaks in the ten commit histories; a separate scan of all objects detected an anonymous Supabase JWT in the snapshot `.env`. A key-by-key configuration review also identified Spotify client configuration and a MongoDB connection URI there. The JWT's role was `anon`, not `service_role`. No environment file was present in the selected commit lineage. The private working `.env` was never copied to the public working tree.

The public copy removes environment files, IDE configuration, and the Blanka font from every selected revision, and replaces known local configuration values wherever present. The removed paths and all available environment values were checked against every object in the sanitized repository. A separate Gitleaks scan covers the final public history. Only `main` is approved for publication; there are no release tags. The private source, its existing remote, and its uncommitted README are retained.

## Changes confirmed by implementation review

- OAuth state is generated from 32 random bytes, compared against an HttpOnly cookie, and cleared on callback. The browser expires this cookie after ten minutes. Callback validation happens before Spotify or MongoDB access.
- A seven-day HttpOnly, SameSite=Lax session cookie is Secure on HTTPS. MongoDB stores its SHA-256 digest. Protected routes and server-rendered dashboard layouts reject absent, unknown, and expired sessions; authorization no longer trusts a browser-supplied Spotify ID.
- Token expiry uses Spotify's `expires_in`. Refresh preserves the existing refresh token when no replacement is provided, persists rotated tokens, and coalesces refreshes within one Node process. A Spotify resource 401 triggers one retry after refresh.
- The callback URL comes from validated server configuration. Requests and responses carrying private data are not cached. Application logs no longer print token responses, profiles, or raw upstream/database exceptions.
- Errors return bounded messages. Spotify 204 player responses become JSON null, 429 responses carry a validated Retry-After, and unavailable audio features do not discard the top-track response. Genre percentages and audio averages use actual returned data.
- Logout deletes the current database session and checks the request Origin. The UI handles expired sessions and failed requests. The unused Supabase authentication stub and dependencies were removed.
- Next.js was upgraded to 15.5.28; compatible dependency updates and explicit patched PostCSS/parser overrides address the audited lockfile. No application license is inferred from the earlier absence of a license. Third-party notices are retained separately.

## Validation

Local release results: ESLint passed without warnings; TypeScript passed; 39 mocked route tests passed; the production build passed; 11 production HTTP smoke checks passed with dummy configuration. The updated lockfile reported zero npm audit findings on the review date. The sign-in screenshot was captured from the local production build with a fresh browser context and no account data.

`npm run check` runs ESLint, TypeScript, mocked route tests, and a production build without live secrets. Tests invoke the real route handlers and backend helpers, substituting only Spotify fetches and MongoDB operations. They cover successful and rejected OAuth callbacks, state, cookie flags, hashed sessions, unknown/expired sessions, token rotation, omitted refresh tokens, revoked refreshes, retry bounds, player 204, parameter validation, rate limits, partial audio-feature availability, error redaction, and logout. `npm audit` checks the locked dependency graph. CI repeats these commands and scans full fetched history; a local pass is not evidence that hosted CI has completed.

## Limits and operational follow-up

- The local MongoDB URI contains no embedded username or password; no database password was identified in that file. Spotify client-secret rotation and grant revocation remain provider-side actions if historical logs may have been exposed.
- Real Spotify consent, allowlisted accounts, endpoint eligibility, production cookies, and real MongoDB connectivity/index creation have not been exercised by mocks. Test these with a new development app/database before sharing a live deployment.
- This release changes session storage; old sessions are intentionally invalid. Use a fresh database for the public deployment. MongoDB TTL cleanup is asynchronous, so request-time expiry checks also run.
- Spotify tokens are stored in MongoDB without application-level encryption. Use a restricted database user, TLS, and provider encryption at rest. Refresh locks are process-local; multiple instances can race on refresh. There is no application-level rate limiter or distributed refresh lock.
- Profile records remain after logout; only the current session is deleted. No account-data deletion UI exists. Playlist responses load only the first 50 entries; the player polls every five seconds. Audio Features may be unavailable to the registered Spotify app. The UI and old historical revisions are not claims of production completeness.
- Past callback code printed token responses. No captured runtime log files or database dumps were found in the available Git objects. Any external logs, external backups, provider settings, or deleted remote branches are outside this audit. Rotation/revocation is a separate operational action and is not performed by rewriting Git.
- Hosting/proxy access logs must redact callback query strings, authorization headers, and cookies. Never enable body logging for Spotify token exchanges.

## Future publication

Work from a fresh clone of this public repository. Put credentials in ignored `.env.local` or hosting secrets, run `npm run check`, `npm audit`, and `gitleaks git --redact=100 --log-opts="--all --full-history" .`, then review `git diff --cached` and the exact outgoing commits. Regenerate third-party notices when dependencies change. Push the reviewed branch explicitly (`git push origin main`); review any new tag before pushing it. Never fetch/merge the private repository's unsanitized branches, use `--mirror`, or push all refs. Port future private changes as reviewed file patches or individual sanitized commits. If a credential enters public history, revoke it first, then rewrite the affected public refs and coordinate existing clones.
