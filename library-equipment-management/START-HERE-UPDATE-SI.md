# Version 2 update — මුලින් මේක කියවන්න

## අලුතින් තියෙන දේ

User self-registration, Login, Logout, My Profile (name/email edit), My Borrowings සහ Admin/User permissions. අලුතින් register වෙන හැම account එකක්ම normal user account එකක්. Equipment add/edit/delete සහ issue/return කරන්නේ admin පමණයි.

## 1. Backup එක තියාගන්න

දැනට වැඩ කරන project folder එක copy කරලා backup එකක් තියාගන්න. ඒ copy එකට code සහ .env files ඇතුළත්; MongoDB data වෙනම තියෙනවා. Frontend/backend terminals දෙකේම Ctrl+C ඔබලා stop කරන්න.

## 2. ZIP එක වෙනම තැනකට extract කරන්න

අලුත් ZIP එක වෙනම temporary folder එකකට extract කරන්න. ඇතුළේ `library-equipment-management` folder එක open කරන්න. මෙහි client, server, docs, package.json තියෙනවා.

## 3. නිවැරදි project folder එකට files copy කරන්න

ඔයාගේ දැනට වැඩ කරන project root එක:

```text
C:\Users\ASUS\Documents\library-equipment-management\library-equipment-management
```

අලුත් ZIP එකේ project folder එක ඇතුළේ තියෙන **client**, **server**, **docs** folders සහ **package.json**, **package-lock.json**, **README.md**, **START-HERE-UPDATE-SI.md** files ඉහත project root එකට copy කරන්න. Windows එකෙන් අහනකොට matching files replace කරන්න. Folder එක ඇතුළට තවත් project folder එකක් දාන්න එපා.

**server/.env සහ client/.env files මකන්න එපා.** ZIP එකේ ඒවා නැහැ; .env.example files පමණක් තියෙනවා. .env files replace කරන්න අවශ්‍ය නැහැ.

MongoDB URI එක සහ database name එක වෙනස් කරන්න එපා. එවිට දැනට save කරපු equipment data ඒ database එකෙන්ම ලැබෙනවා. මේ update එක existing equipment මකන්නේ නැහැ.

## 4. Dependencies install කරන්න

VS Code terminal එකේ:

```powershell
cd C:\Users\ASUS\Documents\library-equipment-management\library-equipment-management
npm install
```

## 5. Backend සහ frontend run කරන්න

Terminal 1:

```powershell
npm run server
```

Terminal 2 (එකම project root එකේ):

```powershell
npm run client
```

Browser එකෙන් **http://localhost:5173** open කරන්න. Client/API දෙකටම localhost භාවිත කරන්න; 127.0.0.1 සමඟ mix කරන්න එපා. Cookies නිසා host එක වැදගත්.

## 6. ඔයාගේ account එක register කරන්න

Create an account click කරලා name, email, student/staff ID, password සහ confirm password දාන්න. Password එක අවම characters 12ක් විය යුතුයි. ID එකට letters/numbers/hyphens භාවිත කරන්න. Login වුණාම profile සහ inventory බලන්න පුළුවන්; තවම admin buttons නැහැ.

## 7. ඔයාගේ account එක admin කරන්න

අලුත් terminal එකක් project root එකේ open කරන්න. පහත example එකේ email එක වෙනුවට **ඔයා register කරපු email එක** දාලා run කරන්න:

```powershell
npm run make-admin --workspace server -- your-email@example.com
```

මෙය run කරන්නේ project owner/admin විතරයි. Browser එකෙන් admin role එක request කරන්න බැහැ. ඊට පස්සේ website එක refresh කරන්න. Add/Edit/Delete/Issue/Return buttons පෙන්වන්න ඕන.

## 8. Normal user account එක test කරන්න

Admin account එකෙන් Log out වෙලා වෙන fictional email සහ වෙන unique ID එකකින් user account එකක් register කරන්න. My Profile එකෙන් name/email edit කරලා refresh කරන්න. Normal userට admin buttons පෙන්වන්නේ නැහැ; API එකෙන්වත් equipment වෙනස් කරන්න බැහැ.

## 9. Userගේ borrowings test කරන්න

1. Admin ලෙස login වෙන්න.
2. Available equipment එකේ Issue click කරන්න.
3. Registered borrower dropdown එකෙන් user account එක තෝරන්න.
4. Future due date/time දීලා confirm කරන්න.
5. Log out වෙලා ඒ user ලෙස login වෙන්න.
6. My borrowings open කරන්න: තමන්ට issue කරපු equipment පෙන්වන්න ඕන.
7. Admin ලෙස return කළාට පස්සේ userගේ current borrowings list එකෙන් item එක ඉවත් වෙන්න ඕන.

පරණ version එකෙන් issue කරපු loans වල account userId එකක් නැති නිසා අලුත් user profile එකකට ස්වයංක්‍රීයව attach වෙන්නේ නැහැ. Adminට ඒවා return/reissue කරලා account එකට link කරන්න පුළුවන්.

## 10. Error ආවොත්

- API route not found on register: පරණ backend එක run වෙනවාද බලන්න; files copy කරලා backend restart කරන්න.
- Cannot connect/Failed to fetch: terminals දෙකම run වෙනවද බලන්න; localhost:5173 භාවිත කරන්න.
- 403 origin error: server/.env CLIENT_ORIGIN=http://localhost:5173 තියෙනවද බලන්න.
- Email/ID already registered: වෙන unique value එකක් දෙන්න හෝ existing account එකෙන් login වෙන්න.
- No admin buttons: registered email එකට make-admin command එක run කරලා browser refresh කරන්න.
- Session expired: නැවත login වෙන්න. Session එක දින 7කින් expire වෙනවා.
- Rate limit: බොහෝ login/registration attempts කළොත් message එකේ සඳහන් කාලයට පස්සේ නැවත උත්සාහ කරන්න.

මේ version එකේ email verification, forgot-password, password-change සහ borrowing history නැහැ. Demo එකට fictional data භාවිත කරන්න. Database data manually delete කරන්න අවශ්‍ය නැහැ.
