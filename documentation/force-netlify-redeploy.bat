@echo off
cd "c:\Users\HP\Documents\nacos website\frontend"

echo.
echo ========================================
echo   Force Netlify Redeploy
echo ========================================
echo.

echo Adding timestamp comment to env.js...
echo. >> assets\js\env.js
echo // Force redeploy: %date% %time% >> assets\js\env.js

echo.
echo Committing changes...
git add assets\js\env.js events-archive.html
git commit -m "chore: force Netlify redeploy with updated Railway URL"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
echo Netlify should start deploying in ~10 seconds
echo Check: https://app.netlify.com
echo.
echo Wait 2 minutes, then:
echo 1. Go to https://nacos-tau-portal.netlify.app
echo 2. Hard refresh: Ctrl+Shift+R
echo 3. Check console for API_URL value
echo 4. Should see: naco-tau-backend-production.up.railway.app
echo.
pause
