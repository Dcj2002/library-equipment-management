# Library Equipment Management

React + Node.js / Express + MongoDB / Mongoose academic mini project.

## Version 2: self-registration and profiles

**Existing users: start with `START-HERE-UPDATE-SI.md`.** Keep the same MongoDB URI and database name to retain your equipment. Source replacement does not delete existing documents.

- Self-registration, login, logout and seven-day persistent sessions.
- Editable profile name/email; fixed unique student/staff ID.
- My Borrowings linked by account `_id`, not by matching a user-entered name.
- Admin-only equipment mutations enforced by the API.
- Registration always creates an ordinary user. Grant admin explicitly using the local command below after registering your own account:

```sh
npm run make-admin --workspace server -- your-email@example.com
```

Replace the email with the account you registered. Refresh the browser after the command. No default password or public admin registration exists.

## What is included

- Equipment create, list, detail view, edit and confirmed delete.
- Search name / asset tag / location; category and status filters; sorting.
- Dashboard totals calculated from database records.
- Issue equipment to a borrower and record return; overdue status calculated from due date.
- Browser and API validation, unique asset tags, loading / empty / error states.
- Responsive interface, keyboard accessible native dialogs, conflict protection using revisions.

Each equipment record represents **one physical asset** (one laptop, one projector, etc.). There is no quantity field. There is no sample inventory masquerading as database data.

## 1. Install prerequisites

Install Node.js 22 LTS or 24 LTS, VS Code, and MongoDB Community Server (or use your own MongoDB Atlas database). MongoDB Compass is an optional viewer; installing Compass alone does not start a database server.

## 2. Open the project

Extract the ZIP, open the `library-equipment-management` folder in VS Code, then open its terminal. All commands below start from this folder unless stated otherwise.

```sh
npm install
```

Copy `server/.env.example` to `server/.env`. In VS Code you can copy/paste and rename the file. Do the same for `client/.env.example` to `client/.env`.

Default backend configuration:

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/library_equipment
CLIENT_ORIGIN=http://localhost:5173
```

Default frontend configuration:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Start your local MongoDB service. Alternatively replace MONGODB_URI with your own Atlas connection string containing the database name `library_equipment`. Use a database user with access only to this database and allow your computer's current IP. Keep credentials private; never upload `.env` to GitHub.

## 3. Start backend (terminal 1)

```sh
npm run server
```

Wait for `API ready at http://localhost:5000`. The server starts only after MongoDB is connected and the unique index is ready.

Open `http://localhost:5000/api/health` in your browser. Expected:

```json
{"status":"ok","database":"connected"}
```

## 4. Start frontend (terminal 2)

```sh
npm run client
```

Open `http://localhost:5173`. Use this exact origin with the default CORS configuration. If Vite chooses a different port, close the other process or update CLIENT_ORIGIN in server/.env and restart the server. Restart Vite after editing client/.env.

## 5. Register and create an administrator

Open the website using `http://localhost:5173`, click Create an account, then register your name, email, student/staff ID and a password of 12–128 characters. Use your own password. Registration logs you in as a member. Use a third project terminal to run the make-admin command above for your email, then refresh the page. Admin equipment controls will appear.

## 6. First record

Click **Add equipment** and enter:

| Field | Example |
| --- | --- |
| Name | Epson EB-X49 Projector |
| Asset tag | LIB-PROJ-001 |
| Category | Projector |
| Location | Library - Media Room |
| Condition | Good |
| Notes | HDMI cable included |

Save, refresh the browser and check the record still exists. Check MongoDB Compass: database `library_equipment`, collection `equipments`.

## 7. Verify your project

```sh
npm test
npm run build
```

The tests cover normalization and input validation. They do not replace live database verification. Complete `docs/TEST-CHECKLIST.md` against your own running MongoDB before submission.

## How the application works

React form -> HTTP fetch request -> Express route -> server validation -> Mongoose model -> MongoDB. The JSON response updates the UI after a fresh database read. Database writes do not use browser localStorage.

- `client/src/main.jsx`: dashboard, filters, table, detail and form dialogs, HTTP helper.
- `client/src/style.css`: responsive green library workspace design.
- `server/src/index.js`: environment loading, shared connection, index initialization, server startup/shutdown.
- `server/src/app.js`: REST endpoints, safe field allowlists, atomic updates and error handling.
- `server/src/Equipment.js`: equipment and embedded current-loan schema.
- `server/src/validation.js`: reusable field and borrowing validation.
- `server/test/validation.test.js`: automated validation tests.
- `docs/`: Sinhala guide, API contract, database design and manual test checklist.

There is one shared Mongoose connection; driver pool defaults are retained for a small local application. When deploying or increasing traffic, monitor active connections, operation latency and errors before tuning pool limits.

## Scope and limitations

This is a local academic demonstration with account sessions and server-side user/admin authorization. The API binds to loopback. Use the localhost frontend and API origins in the example configuration. Sessions use HttpOnly, SameSite=Strict cookies; production mode also sets Secure and requires HTTPS. Mutation requests must include the configured frontend Origin. CORS permits credentials only from that origin. There is no email verification, password reset, password-change screen or member-ID verification; registration does not prove real-world membership. Assess these needs and deployment configuration before network exposure.

Borrower information and the registered user's ObjectId are embedded because only the **current loan** is read with the asset. Admins select a registered borrower and the API takes the borrower's identity from the account. Members cannot see other borrowers' names or IDs in inventory responses. Existing old-version loans have no linked userId: they remain visible to admins and can be returned, but are not automatically attached to a newly registered user. Return/reissue such equipment to link it explicitly. Returning clears that information. There is no historical loan ledger, full member administration, reservations, fines or email notifications. Use fictional borrower data for your demo.

Search loads the inventory into the browser and is suitable for a small mini project; add server pagination for a large inventory. Dashboard values update on refresh or a successful action. The app classifies Needs repair equipment with no loan as Maintenance; issued items remain Issued/Overdue until returned.

## Submission notes from the supplied rubric

Full persistent CRUD is the primary requirement. The rubric also assesses validation, database design, UI, code structure, documentation and demonstration. It requests a GitHub link, report up to 10 pages and camera-on demo video up to 5 minutes; stated deadline is 31 October 2026. Rename submitted report/video using your index number. The rubric explicitly mentions AI-generated content and similarity checks: understand, adapt and attribute assistance according to your institution's rules.

The included documentation is a starting point, not a finished submission report. Capture screenshots from your own running app and explain your own design decisions.

## Account implementation

`User.js` stores unique email/member ID and a hidden salted scrypt password hash. `Session.js` stores SHA-256 hashes of random session tokens, user references and expiration dates. The raw token is only in an HttpOnly cookie. Authentication checks expiration explicitly even if MongoDB TTL cleanup has not yet run. Login rotates the current token; logout deletes it. No JWT or login token is stored in localStorage.

`auth.js` implements authentication, profile and borrowing routes and basic single-process login/registration rate limits. `make-admin.js` grants admin only through local database access. `Account.jsx` renders register/login, profile and current borrowings screens. Profile edits only accept name/email; they cannot alter roles or member IDs. `api.js` sends cookies with fetch and handles expired sessions.
