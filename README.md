# OYA Portraits — Setup Guide for Donna

Welcome, Donna. This is OYA Portraits — a free public educational web application
that brings IUCN Red List threatened plants to life through conservation storytelling
and OYA art. Conservation for the Next Generation.

## Current status (as of May 2026)

All three setup steps below are already complete:

- **portraits.oyatees.org** — live and accessible ✓
- **HTTPS** — Let's Encrypt certificate active, auto-renews August 2026 ✓
- **IUCN_TOKEN** — set in Netlify Environment Variables, scoped to all contexts ✓

This guide is kept here as a reference in case you ever need to redeploy or
set up a fresh site from this folder.

---

This guide walks you through three short tasks:

1. Upload the app to Netlify (free hosting)
2. Point your chosen subdomain at Netlify in GoDaddy
3. Add your IUCN token as a Netlify environment variable

You do not need to be technical for any of this. Take it one step at a time.

---

## What is in this folder

You should see these files:

- `index.html` — the entire web app (page, design, all species, maps, photo fetch)
- `manifest.json` — tells phones and tablets how to install the app to a home screen
- `sw.js` — the service worker that lets the app work offline
- `netlify/functions/iucn-proxy.js` — the secure server-side function that calls the IUCN API
- `netlify.toml` — Netlify configuration (tells Netlify where the functions folder is)
- `README.md` — this guide
- Logo files (PNG) — your OYA logo variants for use in the app

Keep all files and folders in the same structure when uploading to Netlify.

---

## Step 1 — Upload to Netlify

Netlify is a free hosting service. It hosts OYA Portraits for you at no cost.

1. Go to **https://app.netlify.com/signup**
2. Sign up with your email (or your Google/GitHub account if you have one)
3. Once you are signed in, you will see a dashboard. Look for the area that says
   **"Want to deploy a new site without connecting to Git? Drag and drop your
   site output folder here"**
4. Open the folder on your computer that contains all the OYA Portraits files
5. Select all files **and the netlify subfolder** (Ctrl-A on Windows, Cmd-A on Mac)
   and drag them into the Netlify drop area in your browser
6. Wait about 30 seconds. Netlify will give you a temporary address that looks
   something like `https://shiny-llama-12345.netlify.app` — open it. You should
   see the OYA Portraits home screen with the sample plants.
7. In the Netlify dashboard, click **"Site configuration"** then **"Change site
   name"** and rename it to something memorable like `oya-portraits`. Your
   temporary address becomes `https://oya-portraits.netlify.app`.

The app is now live on the internet. You can already share that Netlify address
with anyone. The next two steps are to add your custom domain and activate live
IUCN data.

---

## Step 2 — Add the subdomain in GoDaddy

This step tells `oyatees.org` to send visitors to your Netlify site.

**Note on the subdomain name:** Since the app is now called OYA Portraits,
`portraits.oyatees.org` is the natural choice. However, if you prefer a more
descriptive address, `plants.oyatees.org` also works well. Either is fine —
just use the same name consistently in Parts A and B below.

### Part A — Tell Netlify about the subdomain

1. In Netlify, go to **Site configuration → Domain management → Add a domain**
2. Type your chosen subdomain: e.g. `portraits.oyatees.org`
3. Click **Verify** then **Add**
4. Netlify will show you a CNAME target that looks like
   `oya-portraits.netlify.app` (or similar). **Copy this value** — you will
   paste it into GoDaddy in a moment.

### Part B — Add the CNAME record in GoDaddy

1. Sign in to **https://godaddy.com** and go to **My Products**
2. Find `oyatees.org` and click **DNS**
3. Click **Add New Record**
4. Fill in:
   - Type: **CNAME**
   - Name: **portraits** (or whichever word you chose above)
   - Value: *the Netlify target you copied above*
     (for example `oya-portraits.netlify.app`)
   - TTL: **1 hour** (or leave the default)
5. Save

It can take anywhere from 10 minutes to 24 hours for the change to spread across
the internet.

### Part C — Activate HTTPS (SSL certificate)

Once the DNS has propagated, Netlify needs to issue a free HTTPS certificate for
your custom domain. To do this:

1. In Netlify, go to **Site configuration → Domain management → HTTPS**
2. Click **"Verify DNS configuration"**
3. If your CNAME is correctly set in GoDaddy, Netlify will confirm it and issue
   the certificate automatically within a few minutes
4. Once done, visiting `https://portraits.oyatees.org` will load the app securely

**If you see an error** ("We could not provision a Let's Encrypt certificate"):
this can mean the DNS has not yet propagated (wait an hour and try again), or
there is a stale certificate record from a previous attempt. If waiting does not
help: go to Domain management, remove portraits.oyatees.org, wait 30 seconds,
re-add it via "Add a domain you already own", then try provisioning again. Do
not remove the CNAME record in GoDaddy — that stays as-is throughout.

### Part D — Add the link on oyatees.org

On your existing GoDaddy-hosted `oyatees.org` site, find the
**"Communicating Plant Conservation"** section of the home page. Replace the
placeholder text with a short paragraph and a button linking to your new
subdomain address.

---

## Step 3 — Add your IUCN token as a Netlify environment variable

The IUCN Red List provides their data through a tokenised API. OYA Portraits
fetches this data securely — the token is held on Netlify's servers and never
exposed in the browser. This is done via the serverless function in
`netlify/functions/iucn-proxy.js`.

**Important:** Do not put the token anywhere inside `index.html`. It belongs
only in Netlify's Environment Variables dashboard, as described below.

### To add the token

1. In the Netlify dashboard, go to **Site configuration → Environment variables**
2. Click **"Add a variable"**
3. Fill in:
   - Key: `IUCN_TOKEN`
   - Value: *your IUCN API token* (the long string IUCN sent you by email)
4. Click **Save**
5. Go to **Deploys** and click **"Trigger deploy → Deploy site"** to restart
   the app with the new variable active

Once this is done, the app will automatically fetch live IUCN conservation data
(threat narratives, population trends, assessment years) for each species that
has a SIS ID in the species list.

### What to write on the IUCN token request form

When the form asks you to describe your project, you can paste or adapt the
following:

> **Project name:** OYA Portraits
>
> **Organisation:** Association OYA: Conservation for the Next Generation
> (Geneva, Switzerland — oyatees.org)
>
> **Purpose:** OYA Portraits is a free educational web application that tells
> the stories of IUCN Red List threatened plants (Vulnerable, Endangered, and
> Critically Endangered) through four-chapter conservation storytelling and
> commissioned artwork. The IUCN Red List API v4 will be used to retrieve
> species assessments, threat classifications, and population data for display
> within the app. The app is non-commercial, freely accessible to the public,
> and aligned with GSPC Target 14 — communicating plant diversity and its
> conservation.
>
> **API version requested:** v4 (api.iucnredlist.org)
>
> **Expected call volume:** Low — species data is fetched live per page load
> and cached in the browser session. Typically fewer than 50 unique species
> are loaded per day.

---

## Adding more plants later

Inside `index.html`, find the big `const SPECIES = [ ... ];` array. Each plant
is one object inside it. To add a new plant, copy one of the existing entries,
paste it after the last one (mind the comma), and edit the values. The key field
to add is `sisId` — the IUCN SIS ID number for the species, which you can find
in the URL of the species' IUCN Red List page
(e.g. `iucnredlist.org/species/**34055**/83787166` — the first number is the SIS ID).

Save and re-upload to Netlify exactly as in Step 1.

---

## Updating the app

Any time you change a file in this folder, drag all the files back into the
Netlify deploy area. Netlify keeps a history of every version and lets you
roll back if anything goes wrong.

---

## If something goes wrong

- **The site shows a blank page.** Hard-refresh with Ctrl-F5 (Windows) or
  Cmd-Shift-R (Mac). The service worker may be holding an old cached copy.
- **The plants show but maps and photos are blank.** That is usually an
  internet connection issue at the visitor's end — the iNaturalist and GBIF
  APIs are being contacted live. The app fails gracefully and still tells the
  portrait.
- **The IUCN data does not appear.** Check that `IUCN_TOKEN` is set in
  Site configuration → Environment variables, and that you triggered a fresh
  deploy after adding it.
- **The subdomain does not work after a day.** Double-check the CNAME spelling
  in GoDaddy. The Name must match exactly what you typed, and the Value must
  match what Netlify gave you.
- **HTTPS certificate error in Netlify.** This is a DNS timing issue — not an
  app error. Wait for DNS to propagate and click "Verify DNS configuration"
  again. See Step 2C above.

---

## What this app is and is not

OYA Portraits is a **free educational resource** aligned with
**GSPC Target 14** — communicating plant diversity and its conservation.

It is **not** a scientific database. It is editorial, warm, and art-forward,
showing each plant as a four-chapter portrait (Discovery, Threat, The Art,
Take Action). It complements `oyatees.org` and the OYA Teemill store, sending
visitors back to both at Chapter 4.

Data is sourced from the IUCN Red List (via secure server-side proxy),
iNaturalist (Creative Commons licence), and GBIF.

---

© Association OYA: Conservation for the Next Generation — Geneva, Switzerland
