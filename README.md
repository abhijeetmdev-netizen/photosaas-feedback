# PhotoSaaS customer feedback

- `docs/index.html` customer feedback form (this folder is what GitHub Pages publishes)
- `admin.html` private dashboard (NOT published; open it from your computer)
- `Code.gs` Google Apps Script backend; data is stored in your Google Sheet
- `DEPLOY-GITHUB.md` publish on GitHub Pages; `DEPLOY-VPS.md` + `feedback.conf` for nginx

Backend setup: create a Google Sheet > Extensions > Apps Script > paste Code.gs > Project Settings > Script properties > ADMIN_KEY = long random text > Deploy as Web app (Execute as: Me, Access: Anyone). Put the Web app URL in `API_URL` in docs/index.html and admin.html.
