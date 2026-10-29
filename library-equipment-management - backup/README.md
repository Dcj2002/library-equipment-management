# Library Equipment Management

React + Node.js / Express + MongoDB / Mongoose academic mini project.

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

## 5. First record

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

## 6. Verify your project

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

This is a local academic demonstration without login or role authorization. The API binds to loopback. CORS is a browser-origin policy, not authentication. Add server-side authentication, authorization, HTTPS and deployment configuration before exposing the API to a network.

Borrower information is embedded because only the **current loan** is read with the asset. Returning clears that information. There is no historical loan ledger, registered member management, reservations, fines or email notifications. Use fictional borrower data for your demo.

Search loads the inventory into the browser and is suitable for a small mini project; add server pagination for a large inventory. Dashboard values update on refresh or a successful action. The app classifies Needs repair equipment with no loan as Maintenance; issued items remain Issued/Overdue until returned.

## Submission notes from the supplied rubric

Full persistent CRUD is the primary requirement. The rubric also assesses validation, database design, UI, code structure, documentation and demonstration. It requests a GitHub link, report up to 10 pages and camera-on demo video up to 5 minutes; stated deadline is 31 October 2026. Rename submitted report/video using your index number. The rubric explicitly mentions AI-generated content and similarity checks: understand, adapt and attribute assistance according to your institution's rules.

The included documentation is a starting point, not a finished submission report. Capture screenshots from your own running app and explain your own design decisions.
