# Publish on GitHub Pages (free, HTTPS included)

Only the `docs/` folder is published. `admin.html` and `Code.gs` stay in the repo root, so they are not on the website.

## 1. Add your Apps Script URL (before committing)
```bash
sed -i 's|PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE|https://script.google.com/macros/s/XXXXXXXX/exec|' docs/index.html admin.html
```
(macOS: `sed -i ''`.) Never put ADMIN_KEY in any file; it lives only in Apps Script > Script properties.

## 2. Create the repo and push
Create an empty repository on github.com (e.g. `photosaas-feedback`). Free Pages needs a **public** repo.
```bash
cd photosaas-feedback
git init -b main
git add .
git commit -m "PhotoSaaS feedback form"
git remote add origin https://github.com/YOUR_USERNAME/photosaas-feedback.git
git push -u origin main
```

## 3. Turn on Pages
Repo > Settings > Pages > Build and deployment > Source: **Deploy from a branch** > Branch: `main`, folder `/docs` > Save.
After about a minute your form is live at `https://YOUR_USERNAME.github.io/photosaas-feedback/`.

## 4. Use it
- Share the Pages link with customers.
- Dashboard: double-click `admin.html` on your computer, enter the ADMIN_KEY.

## Updating
Edit `docs/index.html`, then `git add . && git commit -m "update" && git push`. It redeploys automatically.

## Custom domain (optional)
Settings > Pages > Custom domain (e.g. feedback.yourstudio.com). Add a CNAME record at your DNS pointing to `YOUR_USERNAME.github.io`, then tick Enforce HTTPS.
