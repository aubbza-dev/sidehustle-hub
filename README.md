# sidehustle hub

A landing page that lists side-income platforms (AI training, research, surveys), with a sign up button on each card. Every click is counted in Supabase, then the visitor is sent to the referral link.

Everything you need to change is in two places:
- `lib/platforms.js` : your platform names, descriptions, payouts and referral links
- `.env.local` / Vercel environment variables : your Supabase keys

---

## Part 1: Run it on your computer (optional but recommended)

1. Install Node.js 18 or newer from https://nodejs.org (pick the LTS version).
2. Open a terminal inside this `sidehustle-hub` folder.
3. Run:
   ```
   npm install
   npm run dev
   ```
4. Open http://localhost:3000 in your browser. Done.

Note: if you have not set up Supabase yet, the site still works. Clicks just redirect without being counted.

---

## Part 2: Set up Supabase (click tracking)

1. Go to https://supabase.com and sign up (free).
2. Click **New project**. Pick any name (for example `sidehustle-hub`), set a database password (save it somewhere), pick the region closest to you, and click **Create**. Wait about 1 to 2 minutes.
3. In the left sidebar, click the **SQL Editor** icon, then **New query**.
4. Open the file `supabase/schema.sql` from this project, copy everything, paste it into the SQL editor and click **Run**. You should see "Success". This creates the click counter table.
5. Get your keys: click the **gear icon (Project Settings)** in the sidebar, then **API** (sometimes called "Data API" / "API Keys").
   - Copy the **Project URL** (looks like `https://abcdxyz.supabase.co`). This is your `SUPABASE_URL`.
   - Copy the **anon / public** key (a long string starting with `eyJ...` or `sb_publishable_...`). This is your `SUPABASE_ANON_KEY`.
   - Never share your **service_role** key. Do not put it in this project.
6. Put them in the project:
   - Make a copy of `.env.example`, rename the copy to `.env.local`, and paste your values in:
     ```
     SUPABASE_URL=https://abcdxyz.supabase.co
     SUPABASE_ANON_KEY=your-anon-key-here
     ```
7. To check the counter: in Supabase, open **Table Editor**, then `platform_clicks`. Each row is a platform with its click count. It fills up as people click.

---

## Part 3: Add your real referral links

1. Open `lib/platforms.js`.
2. Find each platform and replace the placeholder link:
   ```js
   link: "https://example.com/ref/YOUR_MERCOR_LINK",
   ```
   becomes
   ```js
   link: "https://mercor.com/your-real-referral-link",
   ```
3. Change `payout` and `description` to what is true for you. Do not promise amounts you cannot back up. Payouts vary a lot.
4. To remove a platform, delete its whole `{ ... },` block. To add one, copy a block, give it a new lowercase `id` with no spaces, and fill in its details.

Tip: the page has a disclosure in the footer that says some links are referral links. Keep it. It is required by the FTC in the US and it builds trust.

---

## Part 4: Put it on the internet with Vercel (free)

1. Put this project on GitHub:
   - Make a free account at https://github.com.
   - Click **New repository**, name it `sidehustle-hub`, keep it **Private**, click **Create**.
   - Upload the project files (drag the folder contents into the page), or ask someone to help with git. Do NOT upload your `.env.local` file. The `.gitignore` already hides it, but check.
2. Make a free account at https://vercel.com (sign in with GitHub is easiest).
3. Click **Add New... -> Project**, pick your `sidehustle-hub` repository, and click **Import**.
4. Before clicking Deploy, open **Environment Variables** and add:
   - Name: `SUPABASE_URL`, Value: your Project URL
   - Name: `SUPABASE_ANON_KEY`, Value: your anon key
5. Click **Deploy**. Wait about a minute. Vercel gives you a link like `https://sidehustle-hub.vercel.app`.
6. Open the link, click a sign up button, then check the `platform_clicks` table in Supabase. The count should go up.

Every time you change the code on GitHub, Vercel redeploys automatically.

---

## How the click tracking works

1. Visitor clicks **sign up** on a card. The button goes to `/api/click?id=mercor`.
2. The file `app/api/click/route.js` looks up that platform, calls the Supabase function `increment_click` (adds 1 to the count), then redirects the visitor to the referral link.
3. If Supabase is missing or slow, the redirect still happens after at most 1.5 seconds, so the site never breaks.

---

## Tips for staying legit

- Only promote platforms you have actually signed up for and understand.
- Do not spam links in groups or comments. Many platforms ban accounts that do this.
- Read each platform's referral terms. Some do not allow certain ways of sharing.
- Be honest about payouts and how long approval takes.

## Folder map

```
sidehustle-hub/
  app/
    page.js            homepage (hero, cards, how it works)
    layout.js          page wrapper and title
    globals.css        all the styling (dark theme, mobile first)
    api/click/route.js click counter + redirect
  components/
    PlatformCard.js    one card (add a real logo here)
  lib/
    platforms.js       YOUR platforms and referral links
  supabase/
    schema.sql         run this once in Supabase
  .env.example         template for your Supabase keys
```

---

## Add a job listing

Each platform has its own page at `/platform/<platform-id>` (for example `/platform/micro1`). Individual jobs live in `lib/jobs.js`, grouped by platform id.

1. Open `lib/jobs.js`.
2. Find the platform's id (the same lowercase id as in `lib/platforms.js`, for example `micro1`) and its list. Platforms with no jobs yet have an empty list `[]`.
3. Add a job object inside that list, filling in all five fields:
   ```js
   micro1: [
     {
       id: "micro1-hr-people-ops-expert",
       title: "HR & People Operations Expert",
       pay: "$45-90/hr",
       description: "Short description of the work, requirements and time per task.",
       url: "https://jobs.micro1.ai/post/....",
     },
     // add more jobs here, each one in its own { ... }, separated by commas
   ],
   ```
   - `id`: unique, lowercase, no spaces. Use a new one for each job.
   - `title`: the job title as the platform shows it.
   - `pay`: the estimated pay, or `"varies"` if unknown. Only write what the job post says.
   - `description`: one or two short sentences.
   - `url`: the full job link, copied exactly (keep the referral and utm parts if the link has them).
4. Save the file. The Apply button goes through `/api/click`, which counts the click under that platform, then sends the visitor to the job's `url`.
5. If you add a platform in `lib/platforms.js`, also add a matching `<id>: [],` line in `lib/jobs.js` so its page shows the "jobs coming soon" state until you add jobs.
