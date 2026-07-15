# TODO - SevaSethu fixes

## Step 1: Backend multipart upload + guardian resident creation
- [x] Update `backend/src/routes/homeRoutes.js` to use `multer` for home images + guardian photo.

- [ ] Update `backend/src/controllers/homeController.js` `registerHome` to:


  - [ ] create `Home` with `images` fields populated from uploads
  - [ ] create `Resident` (guardian) linked to the created home with `photo`
  - [ ] increment `residentCount`
  - [ ] validate that required images exist

## Step 2: Frontend GuardianApplication form with required uploads
- [ ] Update `frontend/src/pages/GuardianApplicationPage.jsx` to collect:
  - [ ] home image file (required)
  - [ ] guardian photo file (required)
- [ ] Submit via `FormData` to `registerHome`.
- [ ] Update `frontend/src/services/api.js` `registerHome` to support multipart `FormData`.

## Step 3: Admin navigation stability
- [ ] Verify admin routes linked in `frontend/src/layouts/DashboardLayout.jsx`.
- [ ] If pages are missing, either create placeholder pages or remove/hide those links.

## Step 4: Testing
- [ ] Restart backend + frontend (or ensure nodemon/vite reload).
- [ ] Try submitting Guardian request with images.
- [ ] Login as manager/admin and verify pending approval and manager dashboard.
- [ ] Verify accepted homes show images on Home pages.

