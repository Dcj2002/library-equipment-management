# Database and REST API

## Data model

Three collections: `equipments`, `users` and `sessions`. MongoDB `_id` is the primary identifier; `assetTag` has a unique index. Core fields: name String(100), assetTag String(40), category enum, location String(100), condition enum, notes String(500), revision Number, createdAt Date, updatedAt Date.

`loan` is null or one embedded object: borrower String(100), borrowerId String(50), issuedAt Date, dueDate Date. This is a bounded one-to-zero-or-one relationship. Current loan additionally stores `userId`, an ObjectId reference to `users`. Borrower name and member ID are snapshots taken at issue time; profile edits do not rewrite snapshots. MongoDB does not enforce foreign keys.

```mermaid
erDiagram
  EQUIPMENT ||--o| CURRENT_LOAN : embeds
  EQUIPMENT {
    ObjectId _id PK
    string assetTag UK
    string name
    string category
    string location
    string condition
    string notes
    number revision
    date createdAt
    date updatedAt
  }
  CURRENT_LOAN {
    string borrower
    string borrowerId
    date issuedAt
    date dueDate
  }
```

Mongoose validators enforce enum, required and length constraints for application writes; MongoDB's unique index enforces tag uniqueness. A separate MongoDB collection-level JSON Schema validator is not configured. Direct database writes bypass Mongoose validation.

## API base: http://localhost:5000/api

| Method | Route | Purpose |
| --- | --- | --- |
| GET | /health | API and database status |
| GET | /equipment | List / search / filter / sort |
| GET | /equipment/:id | One equipment record |
| POST | /equipment | Create equipment |
| PUT | /equipment/:id | Update editable fields |
| DELETE | /equipment/:id | Delete unissued equipment |
| POST | /equipment/:id/issue | Issue available equipment |
| POST | /equipment/:id/return | Return issued equipment |

List query parameters: q, category, status (available/issued/overdue/maintenance), sort (newest/name/assetTag). Issued filter includes overdue loans. Search input is escaped before creating MongoDB regular-expression queries.

Create body:

```json
{"name":"Epson Projector","assetTag":"LIB-PROJ-001","category":"Projector","location":"Media Room","condition":"Good","notes":"HDMI cable included"}
```

Update sends the same editable fields plus the current revision. Issue sends registered userId, future ISO dueDate and revision. The server loads borrower name/memberId from that user; browser-supplied borrower identity is ignored. Return and delete send `{ "revision": 0 }` where 0 is replaced with the current record revision.

Never assume the revision is always zero: each successful update/issue/return increments it. Mutation queries include `_id` and revision atomically so stale requests fail with HTTP 409. Issue also atomically requires no loan and a condition other than Needs repair. Delete atomically requires no loan.

Responses: 201 create, 200 successful reads/other writes, 400 validation/invalid ID, 404 missing record/route, 409 duplicate tag/conflict/action unavailable, 500 unexpected server error. Delete returns 409 for missing or changed records as well as issued records. Errors are JSON `{ "message": "..." }`.

## Account API

All inventory reads require login. All equipment mutations require an administrator. Cookies are sent with fetch credentials: include. Supply Origin: http://localhost:5173 on mutations when testing through a non-browser client.

| Method | Route | Body / purpose |
| --- | --- | --- |
| POST | /auth/register | name, email, memberId, password; creates user and session |
| POST | /auth/login | email, password; rotates session |
| POST | /auth/logout | revokes current session |
| GET | /auth/me | current public profile |
| PUT | /auth/me | name and email only |
| GET | /auth/my-borrowings | loans belonging to current account ObjectId |
| GET | /auth/members | admin-only borrower selection list |

Passwords are 12–128 characters. Name/email and member ID are validated on registration; email is normalized to lowercase, memberId to uppercase. Registration cannot set a role. Email and memberId have unique indexes. Session token hashes have a unique index and expiresAt has a TTL index.

```mermaid
erDiagram
  USER ||--o{ SESSION : authenticates
  USER ||--o{ EQUIPMENT : current_borrower
  USER {
    ObjectId _id PK
    string email UK
    string memberId UK
    string name
    string passwordHash
    string role
  }
  SESSION {
    string tokenHash UK
    ObjectId userId FK
    date expiresAt
  }
  EQUIPMENT {
    ObjectId _id PK
    string assetTag UK
    ObjectId loan_userId FK
  }
```

The equipment loan reference is optional. Legacy loan records without userId stay admin-managed until returned/reissued. Profiles expose no password hash; non-admin inventory responses redact another user's borrower details. Extra auth response statuses are 401 for no valid session, 403 for insufficient permission or wrong Origin, and 429 for rate limits.
