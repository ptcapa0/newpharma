# README.md

## New Pharma — Simple Investor Pitch Site (No Backend)

**Stack:** Static HTML + Tailwind CDN + Chart.js.  
**Data:** `data/site.json` (edit this file to update the whole site).  
**Deploy:** GitHub Pages (Settings → Pages → Deploy from `main` → `/ (root)`).

### Quick start
1) Create a new GitHub repo and copy these files.  
2) Push to GitHub.  
3) Enable **GitHub Pages** in your repo settings.  
4) Open your Pages URL — done.

### Editing content
- Update company info, problem, GTM, financials, incentives, timeline, contacts in `data/site.json`.
- PDF for dataroom lives in `public/dataroom/investor-handout.pdf` (replace with your real file).

### Dataroom “gate”
- Simple email form unlocks links in the browser (stored in `localStorage`).  
- (Optional) Replace `FORM_ENDPOINT` in `assets/app.js` with a service like Formspree if you want submissions emailed to you.

### Printing an Investor Brief
- Use the browser’s **Print to PDF** on any page. Nav hides automatically; footer adds date + URL.

### Accessibility
- Keyboard-friendly nav, visible focus rings, alt text on images, aria-labels on icons.
