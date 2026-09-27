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