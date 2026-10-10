# API, Database, UI, and Cross-Platform Testing Matrix

## 1. Scope

This matrix covers the application requirements in the supplied API/backend, database/data integrity, feature/navigation, UI/UX, browser/device, and test-level specifications.

The repository currently contains:

- Unit tests under `tests/unit`.
- Integration tests under `tests/integration`.
- Playwright E2E tests under `tests/e2e`.
- A production Express server in `server.ts`.
- Supabase migrations under `migrations`.
- A production build and a successful authenticated member-create smoke test.

## 2. Current Evidence

- Production health endpoint returned HTTP 200.
- Authenticated POST `/api/admin/members` returned HTTP 200 and persisted a member with a valid UUID tenant ID.
- Temporary member, profile, and auth-user records were removed and verified absent.
- Targeted UUID regression: 3/3 tests passed.
- Production build completed successfully.
- Full Vitest run reported 27 passing tests and 2 worker-start timeouts in unrelated test files.
- No executable API contract suite currently covers all server routes, authentication failures, malformed JSON, unsupported methods, pagination, filtering, sorting, rate limiting, or multi-tenant isolation.

## 3. Required Test Matrix

### 3.1 API & Backend Testing

| ID | Method / URL | Authentication / Authorization | Request / Headers | Expected Result |
| --- | --- | --- | --- | --- |
| API-01 | GET `/api/health` | None | Empty body | HTTP 200, status `ok`, timestamp |
| API-02 | GET `/api/admin/institutions` | Missing token | None | HTTP 401, no sensitive data |
| API-03 | GET `/api/admin/institutions` | Invalid token | Bearer invalid token | HTTP 401 |
| API-04 | GET `/api/admin/institutions` | Expired token | Bearer expired token | HTTP 401 |
| API-05 | POST `/api/admin/institutions` | Missing admin key/token | JSON body | HTTP 401 |
| API-06 | POST `/api/admin/institutions` | Non-superadmin token | Valid institution payload | HTTP 403 |
| API-07 | POST `/api/admin/institutions` | Valid admin key | Missing required fields | HTTP 400 with safe validation message |
| API-08 | POST `/api/admin/institutions` | Valid admin key | Malformed JSON | HTTP 400, no stack trace or secret |
| API-09 | GET `/api/admin/institutions?limit=10&offset=0` | Valid admin key | Query parameters | HTTP 200, bounded `data`, total count if supported |
| API-10 | GET `/api/admin/institutions?limit=abc` | Valid admin key | Invalid numeric query | HTTP 400 or normalized safe default |
| API-11 | POST `/api/admin/announcements` | Valid admin key | Valid announcement payload | HTTP 200 and persisted row |
| API-12 | POST `/api/admin/transactions` | Valid admin key | Valid transaction payload | HTTP 200 and persisted row |
| API-13 | POST `/api/admin/create-user` | Valid admin key | Missing email/password | HTTP 400 |
| API-14 | POST `/api/admin/create-user` | Valid admin key | Invalid tenant and duplicate email | HTTP 400/409 with safe message |
| API-15 | POST `/api/admin/members` | Missing token | Valid body | HTTP 401 |
| API-16 | POST `/api/admin/members` | Invalid token | Valid body | HTTP 401 |
| API-17 | POST `/api/admin/members` | Tenant-admin for wrong tenant | Valid body | HTTP 403 |
| API-18 | POST `/api/admin/members` | Valid tenant-admin | Valid UUID body | HTTP 200 and database row |
| API-19 | POST `/api/admin/members` | Valid tenant-admin | Non-UUID tenant/member ID | HTTP 400 |
| API-20 | POST `/api/admin/members` | Valid tenant-admin | Missing full name/tenant ID | HTTP 400 |
| API-21 | POST `/api/admin/members` | Valid tenant-admin | Duplicate member ID | HTTP 200 upsert or documented conflict response; no duplicate rows |
| API-22 | PUT/PATCH/DELETE `/api/admin/members` | Any | Unsupported method | HTTP 405 |
| API-23 | POST `/api/admin/members/credentials` | Valid tenant-admin | Valid member credential payload | HTTP 200; no password in response |
| API-24 | POST `/api/admin/members/credentials/batch` | Valid tenant-admin | Valid batch | HTTP 200; duplicate-safe response |
| API-25 | POST `/api/scan-receipt` | None | Missing image | HTTP 400 or documented validation response |
| API-26 | POST `/api/scan-receipt` | None | Malformed base64 | HTTP 400 or safe rejection |
| API-27 | POST `/api/scan-receipt` | None | Unsupported content type | HTTP 415 or 400 |
| API-28 | All mutating endpoints | Any | Repeated identical request | Same effect, no duplicate records where idempotent |

### 3.2 Response and Security Validation

For every endpoint, verify:

- Status code is declared and documented.
- JSON content type is correct.
- Success responses never include secrets, service-role keys, bearer tokens, stack traces, SQL, internal paths, or database errors.
- Error responses include a safe message and a stable error code.
- Malformed input returns a validation error without triggering a database write.
- Unsupported methods return HTTP 405 and do not route to a write handler.
- Request bodies are bounded by the configured payload limit.
- Rate-limit headers or rejection responses are present for public endpoints.

### 3.3 Filtering, Sorting, Pagination, and Idempotency

For each list endpoint:

1. Request an empty tenant/scoped collection.
2. Request a known page with `limit` and `offset`.
3. Request `limit=1`, `limit=100`, and an invalid limit.
4. Sort ascending and descending on supported fields.
5. Filter by tenant ID, role, status, and date range.
6. Repeated identical mutation requests produce one logical result.
7. Concurrent duplicate creates do not create duplicate primary keys or unique rows.

### 3.4 Database & Data Integrity

| ID | Check | Expected |
| --- | --- | --- |
| DB-01 | Primary key exists on every table | Unique IDs, no null primary keys |
| DB-02 | Foreign keys are enforced | Invalid tenant/user references are rejected |
| DB-03 | Unique constraints | Duplicate email/member identifiers are rejected |
| DB-04 | Indexes | Required filtering and tenant queries use indexes |
| DB-05 | Data types | UUID columns accept UUIDs only; numeric values are numeric |
| DB-06 | Null handling | Required fields are validated before insert |
| DB-07 | Tenant isolation | User A cannot read or modify user B's tenant |
| DB-08 | Cross-tenant mutation | Wrong tenant returns 403 or no result |
| DB-09 | Seed data | Seed records are valid and unique |
| DB-10 | Migration | Migration runs from clean database and is idempotent |
| DB-11 | Rollback | Rollback leaves data consistent and does not leave partial writes |
| DB-12 | Backup/restore | Restored database matches expected schema and records |

## 4. Feature, Navigation, and UI Testing

| ID | Area | Test |
| --- | --- | --- |
| UI-01 | Role navigation | Public, member, tenant-admin, and superadmin paths open correct views |
| UI-02 | Unauthorized access | Restricted module is hidden or returns 403 |
| UI-03 | Direct URL | Deep links work after login and after session expiry |
| UI-04 | Browser history | Back/forward refresh does not lose state or create duplicates |
| UI-05 | Loading and empty states | Loading, empty, success, and error states are visible and understandable |
| UI-06 | Form validation | Invalid values are rejected by server even when client validation exists |
| UI-07 | Read-only controls | Roles cannot submit forbidden actions |
| UI-08 | Notifications | Errors are actionable and do not expose secrets |
| UI-09 | Search/filter | Search returns correct records and no cross-tenant data |
| UI-10 | Theme | Light and dark modes remain usable and consistent |

## 5. Device, Browser, and Responsive Testing

Execute the following matrix:

- Android Chrome: mobile portrait and landscape.
- iPhone Safari: mobile portrait and landscape.
- iPad Mini: tablet portrait and landscape.
- Windows Chrome/Edge: desktop 1024px, 1440px, and 1920px widths.
- macOS Safari: desktop browser.
- Linux Firefox: desktop browser.
- Slow network: simulated throttling and offline recovery.
- Low-memory and constrained CPU: device emulation or browser profile.

Record layout overflow, unreadable text, clipped controls, touch targets, keyboard focus, horizontal scrolling, and broken images.

## 6. Test Level Matrix

| Level | Scope | Current Repository Status |
| --- | --- | --- |
| Unit | Pure functions, validation, business rules | Covered in several unit tests |
| Method | Individual valid/invalid/boundary inputs | Partial; UUID test added |
| Logic | Permissions, calculations, workflows | Partial |
| Functional | Feature operations | Partial |
| Integration | Frontend/backend/database | Partial; member management test exists |
| System | Full login-to-business workflow | Not implemented as a complete suite |
| E2E | Real browser workflows | Minimal Playwright smoke tests |
| Regression | Previous scenarios after changes | Not automated as a complete suite |
| Smoke | Deployed build health and critical flow | Health and member-create smoke test performed |
| Sanity | Specific fix validation | Targeted UUID test performed |
| Acceptance / UAT | Business requirements | Pending |
| Manual | Human review | Pending |
| Automated | Repeatable API/browser/deployment checks | Partial |

## 7. Execution Priority

1. Fix the full Vitest worker timeout and make the suite deterministic.
2. Add a real HTTP API contract test suite using a local Express app or a dedicated non-production Supabase test project.
3. Add deterministic endpoint tests for missing/invalid/expired tokens, malformed JSON, unsupported methods, and error masking.
4. Add database integration tests for constraints, tenant isolation, migration idempotency, and cleanup.
5. Expand Playwright to cover role switches, direct URLs, unauthorized access, empty/error states, and member creation.
6. Run responsive browser matrix checks on desktop, tablet, and mobile devices.
7. Run deployment smoke tests after every production release.

## 8. Recommended Commands

```bash
npx vitest run --maxWorkers=1
npm run lint
npm run build
npx playwright test tests/e2e --project=chromium
npx playwright test tests/e2e --project=mobile-chrome
npx playwright test tests/e2e --project=tablet-safari
```

The root package exposes `npm test`, but it does not define `test:unit`, `test:integration`, `test:e2e`, or `test:e2e:ui`. For API contract tests, run against a disposable Supabase project and never expose service-role credentials in test output.
