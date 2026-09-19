@echo off
echo ========================================
echo Deploying CSRF Fix to Production
echo ========================================
echo.

echo [1/4] Adding changed files...
git add frontend/admin-dashboard.html
git add documentation/
git add *.md

echo.
echo [2/4] Committing changes...
git commit -m "Fix: Add CSRF token to admin API requests (with debug logging)"

echo.
echo [3/4] Pushing to GitHub...
git push origin main

echo.
echo [4/4] Done!
echo.
echo ========================================
echo Deployment triggered!
echo ========================================
echo.
echo Netlify will auto-deploy in ~2 minutes.
echo.
echo Next steps:
echo 1. Wait 2 minutes
echo 2. Go to your admin dashboard
echo 3. Hard refresh: Ctrl + Shift + R
echo 4. Try deleting a timetable
echo.
echo Check console for these logs:
echo   [apiAdmin] CSRF token obtained: ✅ Yes
echo   [apiAdmin] Including CSRF token...
echo.
pause
