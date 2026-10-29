# Live MongoDB acceptance checklist

These are manual checks to run locally; they have not been marked as passed.

| Check | Expected result |
| --- | --- |
| Add valid equipment | Row appears; MongoDB document exists |
| Refresh browser and restart API | Saved record still appears |
| Submit missing name / invalid category via API | 400 and no write |
| Duplicate asset tag with different case | 409 and no duplicate |
| Search name, tag and location | Matching rows shown |
| Search regex punctuation e.g. `.*` | Treated as literal text |
| Combine category/status filters | Only matching equipment |
| Sort name and tag | Correct ascending order |
| Click equipment name | Full details and notes |
| Edit location/condition | Update persists after refresh |
| Issue future loan | Borrower and due date stored; status Issued |
| Issue past or invalid date | Validation rejects request |
| Issue Needs repair equipment via API | 409; no loan saved |
| Two issue requests using same revision | Only one succeeds |
| Old revision edit | 409; newer record retained |
| Delete issued record via API | 409; record retained |
| Return record | Loan becomes null; availability follows condition |
| Cancel deletion | Record retained |
| Confirm deletion | Record removed from database and UI |
| Malformed object ID | 400 rather than server crash |
| Stop backend and refresh | Connection error with retry |
| Narrow mobile viewport | Layout remains usable; table scrolls |
| Keyboard navigation / Escape | Controls and dialogs usable |

## Five-minute demo outline

- 0:00–0:30: name, purpose, technology stack.
- 0:30–2:30: create, list/search, edit, confirmed delete.
- 2:30–3:20: validation, duplicate tag, issue/return.
- 3:20–4:15: MongoDB Compass persistence and schema explanation.
- 4:15–5:00: responsive UI, code structure and limitations.

Use your own camera as required by the rubric. Prepare fictional example data before recording.

## Report outline (maximum 10 pages)

1. Title, index number and project summary.
2. Problem, objectives and scope.
3. Stack and application architecture.
4. Database diagram and field definitions.
5. API and CRUD design.
6–7. Your own UI screenshots with captions.
8. Validation and test results.
9. Limitations, improvements and conclusion.
10. References / assistance acknowledgement, if needed.

## GitHub preparation

Create your own empty GitHub repository, then from the project root:

```sh
git init
git add .
git commit -m "Build library equipment management mini project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace the URL placeholder with your actual repository URL. Check that `.env` and node_modules are excluded. Submit your own repository link through the method specified by your instructor.
