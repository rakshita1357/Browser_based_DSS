# Advertisement Decision Support System (Ad DSS)

A browser-based system that automatically decides which advertisement to
show, based on schedules stored in a MySQL database. Ads can be images,
GIFs, or videos. When two or more ads are scheduled for the same time
window, the system rotates between them every few minutes instead of
picking just one.

## What it does

- Reads advertisement schedules (name, media file, start time, end time)
  from a MySQL database — nothing is hard-coded into the webpage.
- Figures out which ad should be playing right now, based on the current
  time.
- If two or more ads overlap, it rotates between them in fixed time slots
  (5 minutes by default).
- Starts loading upcoming ads' media in the background before they're due
  to play, so there's no delay when it's their turn — without playing them
  early.
- Has a simple admin page to add, view, and delete ads.
- Shows a visual timeline of the day's ad schedule.

## What you need installed

- Node.js and npm
- MySQL Server (with MySQL Workbench, or any way to run SQL scripts)
- Any modern web browser

## How to run it

### 1. Set up the database

Open MySQL Workbench (or your SQL tool of choice) and run the two files
in the `database/` folder, in order:

1. `database/schema.sql` — creates the `ad_dss` database and the `ads` table
2. `database/seed.sql` — adds a few sample ads to test with

### 2. Configure your database password

In the project's root folder, open the `.env` file and set your MySQL
password:

```
DB_PASSWORD=your_mysql_password_here
```

### 3. Install dependencies

Open a terminal in the project folder and run:

```
npm install
```

### 4. Start the server

```
npm run dev
```

You should see:

```
Server running on http://localhost:3000
```

Leave this terminal running — it needs to stay open while you use the app.

### 5. Open the app

- **Ad player (public display):** open `frontend/index.html` in your browser
- **Admin dashboard (add/manage ads):** open `frontend/admin.html` in your browser

You can just double-click these files, or right-click → "Open in Browser"
if you're using an IDE like PyCharm.

## Adding your own ads

1. Open `admin.html`
2. Fill in the ad's name, choose an image/GIF/video file, set a start and
   end time, and submit.
3. It'll appear in the table below and automatically show up in the player
   once its scheduled time arrives.

## Deploying on Render with AWS RDS

This repository includes a `Dockerfile` and `render.yaml` for deploying the
Node.js/Express app as a Render web service. In Render, create a Blueprint
from this repository, or create a Docker web service using the repository
root as its Docker build context.

Set these environment variables in the Render service:

```
DB_HOST=myapp-db.chks4qwiiptd.ap-south-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=ad_dss
DB_USER=your_rds_username
DB_PASSWORD=your_rds_password
```

`DB_USER` and `DB_PASSWORD` must be added as Render secrets; do not commit
them to Git. The RDS security group must allow inbound MySQL traffic on port
3306 from Render. Run `database/schema.sql` against the RDS instance before
using the application, and run `database/seed.sql` only if sample data is
needed.

Render's local filesystem is ephemeral. Uploaded media can be lost after a
redeploy or restart, so use a Render persistent disk for the `media` path or
move uploads to object storage before relying on the service in production.

## Testing it quickly without waiting for real scheduled times

Click the **"Generate Demo Ads"** button on the admin page — it creates two
overlapping test ads that start within the next few minutes, so you can
watch the whole system (preloading, activation, rotation, expiry) happen
live in about 10–15 minutes instead of waiting for real clock times.

## Project structure

```
backend/     → Node.js/Express server, API routes, scheduling logic
frontend/    → HTML/CSS/JS for the player and admin pages
media/       → Uploaded ad files (images, gifs, videos)
database/    → SQL scripts to set up the database
.env         → Configuration (database password, ports, settings)
```