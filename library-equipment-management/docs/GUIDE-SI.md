# සිංහලෙන් පටන්ගන්න guide එක

Version 2 update එක install කරනවා නම් මුලින් `START-HERE-UPDATE-SI.md` කියවන්න. දැන් login/register සහ admin permissions තියෙන නිසා equipment වෙනස් කරන්න admin account එකක් ඕන.

## පියවර 1 — tools සූදානම් කරන්න

Node.js LTS, VS Code සහ MongoDB Community Server install කරන්න. Compass කියන්නේ database බලන්න තියෙන tool එකක්; database server එක වෙනම run වෙන්න ඕන. Local MongoDB වෙනුවට ඔයාගේ Atlas database එකත් use කරන්න පුළුවන්.

## පියවර 2 — project එක open කරන්න

ZIP extract කරලා ඇතුළේ `library-equipment-management` folder එක VS Code එකෙන් open කරන්න. Terminal > New Terminal යන්න. Terminal එකේ `package.json` තියෙන folder එකේ ඉඳලා මේ command එක run කරන්න:

```sh
npm install
```

## පියවර 3 — .env files හදන්න

`server/.env.example` copy කරලා එම folder එකේම `.env` නමින් save කරන්න. `client/.env.example` එකත් copy කරලා client folder එකේ `.env` නමින් save කරන්න.

Local MongoDB නම් server/.env එකේ තියෙන URI එක එහෙමම තියන්න:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/library_equipment
```

Atlas නම් ඔයාගේ database connection string එක දාන්න. Password එක chat එකට දාන්න එපා. `.env` GitHub එකට upload කරන්න එපා.

## පියවර 4 — backend run කරන්න

MongoDB service එක start කරලා project root terminal එකේ:

```sh
npm run server
```

`API ready` message එක එනකම් බලන්න. Browser එකෙන් `http://localhost:5000/api/health` open කරලා database connected කියලා පෙන්වනවද බලන්න.

## පියවර 5 — frontend run කරන්න

අලුත් terminal එකක් project root එකේ open කරලා:

```sh
npm run client
```

`http://localhost:5173` open කරන්න. Frontend සහ backend terminals දෙකම running තියන්න.

## පියවර 6 — CRUD තේරුම් ගන්න

1. **Create:** Add equipment > form fill කරන්න > Save. POST request එකෙන් MongoDB document එකක් හදනවා.
2. **Read:** table එකේ records බලන්න. Equipment name click කළාම details එනවා. Search/filter/sort try කරන්න.
3. **Update:** Edit > location හෝ condition වෙනස් කරන්න > Save. PUT request එකෙන් document එක update කරනවා.
4. **Delete:** issue කරලා නැති item එකකට Delete > Confirm. DELETE request එකෙන් document එක අයින් කරනවා.
5. Browser refresh කළාට පස්සෙත් changes තියෙනවද බලන්න. මේක persistence check එක.

## පියවර 7 — issue / return

Available item එකේ Issue click කරලා registered borrower කෙනෙක් dropdown එකෙන් තෝරලා ඉදිරි due date/time එකක් දෙන්න. Return click කරලා confirm කළාම current borrower details clear වෙනවා. මේ version එක loan history තියාගන්නේ නැහැ.

එක record එක = එක physical equipment item එක. Laptop 3ක් තියෙනවා නම් unique asset tags 3ක් සහිත records 3ක් දාන්න.

## පියවර 8 — code ඉගෙනගන්න අනුපිළිවෙළ

1. `Equipment.js`: database fields සහ data types බලන්න.
2. `validation.js`: user input validate කරන විදිහ බලන්න.
3. `app.js`: POST, GET, PUT, DELETE routes follow කරන්න.
4. `main.jsx`: form data request එකකට යන විදිහ සහ response එකෙන් list refresh වෙන විදිහ බලන්න.
5. `style.css`: mobile media queries සහ theme colors වෙනස් කරලා බලන්න.

ඔයාට explain කරන්න පුළුවන් වෙන්න ඕන: React state මොකක්ද, API එකක් මොකක්ද, async/await ඇයි, assetTag unique ඇයි, validation frontend එකේත් backend එකේත් ඇයි, revision එකෙන් stale edits නවත්තන්නේ කොහොමද කියලා.

## Errors ආවොත්

- `Cannot reach API`: backend terminal එක බලන්න; server සහ MongoDB run වෙනවද check කරන්න.
- `Startup failed`: MongoDB service, URI, Atlas password සහ IP access check කරන්න.
- `Asset tag already exists`: වෙන unique tag එකක් දෙන්න.
- `Item changed`: වෙන update එකක් වෙලා ඇති; dialog close කරලා Refresh කරලා නැවත try කරන්න.
- `EADDRINUSE`: වෙන server එකක් port 5000 use කරනවා. ඒ process එක stop කරන්න හෝ .env ports දෙකම ගැළපෙන්න වෙනස් කරන්න.
- Browser CORS error: address එක localhost:5173 ද බලන්න; CLIENT_ORIGIN value එක browser origin එකට match වෙන්න ඕන.

## Submit කරන්න කලින්

`TEST-CHECKLIST.md` එකේ checks ඔක්කොම කරන්න. ඔයාගේම screenshots ගන්න. උපරිම පිටු 10ක report එකක් සහ camera on කරලා උපරිම මිනිත්තු 5ක demo එකක් rubric එකට අනුව හදන්න. Code එක තේරුම්ගෙන customize කරන්න; institutional AI policy එක අනුව assistance acknowledge කරන්න.
