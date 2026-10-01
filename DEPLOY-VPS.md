# Deploy on your VPS (nginx)

Assumes Ubuntu/Debian, a domain or subdomain (e.g. feedback.example.com), and Code.gs already deployed as a Google Apps Script Web App (see README.txt).

## 1. DNS
Add an A record: `feedback.example.com` -> your VPS IP. Wait a few minutes.

## 2. Put your Apps Script URL into both pages (on your computer)
```bash
cd Photography_Photo_Selection_Feedback_System
sed -i 's|PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE|https://script.google.com/macros/s/XXXXXXXX/exec|' docs/index.html admin.html
```
(macOS: use `sed -i ''`.) Or edit the `API_URL` line by hand.

## 3. Prepare the server
```bash
ssh user@YOUR_VPS_IP
sudo apt update && sudo apt install -y nginx apache2-utils certbot python3-certbot-nginx
sudo mkdir -p /var/www/feedback
sudo chown -R $USER:www-data /var/www/feedback
sudo ufw allow 'Nginx Full'      # only if you use ufw
```

## 4. Upload only the two pages (not Code.gs)
From your computer:
```bash
scp docs/index.html admin.html user@YOUR_VPS_IP:/var/www/feedback/
```

## 5. Dashboard password
```bash
sudo htpasswd -c /etc/nginx/.htpasswd-feedback admin
```

## 6. nginx site
```bash
sudo cp feedback.conf /etc/nginx/sites-available/feedback     # after editing server_name
sudo ln -s /etc/nginx/sites-available/feedback /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 7. HTTPS (free)
```bash
sudo certbot --nginx -d feedback.example.com
```
Choose "redirect HTTP to HTTPS". Renewal is automatic (`sudo certbot renew --dry-run` to test).

## Links
- Customers: https://feedback.example.com/
- You: https://feedback.example.com/admin.html (nginx password, then the ADMIN_KEY)

## Updating later
Edit, then `scp docs/index.html admin.html user@YOUR_VPS_IP:/var/www/feedback/`. No restart needed. Hard-refresh the browser if you don't see changes.

## Troubleshooting
- 403/404: check `ls -l /var/www/feedback` (files readable by www-data) and that `root` matches.
- Form says "Internet नसल्यामुळे ..." on a working connection: open browser DevTools > Console. A "Content Security Policy" error means the Apps Script domain is missing from `connect-src`; a failed fetch means the Web App isn't set to "Anyone" or the URL is wrong.
- Data never appears in the dashboard: Web App must be redeployed as a *new version* after editing Code.gs, and ADMIN_KEY must exist in Script properties.
