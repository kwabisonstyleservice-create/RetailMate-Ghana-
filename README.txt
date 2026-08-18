RetailMate Ghana v0.3.4 — Store Accounts + Credit Fix + Offline

New:
- Customer Owes Me now opens a working credit management page.
- Credit can be added manually.
- Credit can still be created from a sale.
- Credit can be marked paid.
- Each local store has:
  - Store name
  - Username
  - Password
  - Store code such as RM-GH-7K9P2M
- Password is stored as a hash where Web Crypto is supported.
- Each store has a separate local database.
- Logout/login supported.
- Offline operation preserved.

Important limitation:
The store code is generated locally and is unique among stores on that device.
Global uniqueness across every RetailMate installation requires the future cloud backend.

Deploy:
Replace the repository root with:
index.html
manifest.json
sw.js
vercel.json
README.txt

Commit to main and let Vercel deploy.
