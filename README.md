# VedTracker
What is Ved doing

A personal status site: it shows what Ved is doing, based on location and Sleep Focus.

- **Location:** OwnTracks on iPhone posts to `/api/location`.
- **Sleep:** iPhone Sleep Focus automations post to `/api/sleep`. Sleeping overrides location.
- **Places:** the private `/admin` page certifies your current coordinates as
  lab, library, gym, class, home, etc. Certified places are checked first;
  being inside a place's radius sets the status automatically.
- **Public page:** `/api/status` returns only the derived status text,
  never raw coordinates.

## Free stack

- GitHub for code (this repo)
- Vercel Hobby for hosting + API routes
- Upstash Redis (free tier) for current status, sleep state, and places

## Setup

### 1. Vercel + Upstash

1. Import this repo in Vercel.
2. Create a free Upstash Redis database.
3. In Vercel -> Settings -> Environment Variables, set:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `INGEST_SECRET` — a long random secret. This is the OwnTracks password
     and the Sleep Shortcut secret.
   - `ADMIN_PASSWORD` — a different secret, for the `/admin` login.
4. Redeploy.

### 2. OwnTracks (iPhone)

1. Install OwnTracks.
2. Settings -> Connection -> Mode: **HTTP**.
3. URL: `https://<your-site>/api/location`
4. Set the HTTP Basic auth password to your `INGEST_SECRET`.
   (Username is not checked; the password is.)
5. Use Significant-change mode to save battery. Move mode is more precise
   but drains battery faster.

### 3. Sleep Focus (iPhone Shortcuts)

Make two Personal Automations in Shortcuts:

- **When Sleep Focus turns on:** Get Contents of URL
  - URL: `https://<your-site>/api/sleep`
  - Method: POST, Header: `x-vedtracker-secret: <INGEST_SECRET>`
  - Request Body: JSON `{"sleeping": true}`
- **When Sleep Focus turns off:** same, with `{"sleeping": false}`

Sleep Focus syncs between Apple Watch and iPhone, so starting Sleep on
either device sets the site to "sleeping".

### 4. Certify places

1. Open `https://<your-site>/admin` and log in with `ADMIN_PASSWORD`.
2. Stand at the place, tap "Use my current (browser) location"
   (or use the last OwnTracks report if you are indoors).
3. Pick a label (lab, library, gym, class, home, other), an optional name,
   and a radius — 100 m is a good default on campus.
4. Save. Future visits inside that radius will set the status automatically.
   You can delete or re-certify a place from the same page.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Note: without Upstash configured, data is kept in memory only and will not
persist across serverless invocations. Upstash is required in production.
