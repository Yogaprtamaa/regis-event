# HIMTI Event Registration System

This is a **Next.js** project bootstrapped with `create-next-app`.

The application is used to manage **event registration**, allowing users to register for campus events while providing an admin dashboard to monitor participants and event capacity.

---

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open **http://localhost:3000** with your browser to see the result.

You can start editing the page by modifying:

```
app/page.js
```

The page auto-updates as you edit the file.

---

## 🧱 Tech Stack

### Frontend

* Next.js (App Router)
* Tailwind CSS
* Heroicons

### Backend

* Next.js Route Handlers
* Prisma ORM
* Supabase PostgreSQL

---

## ⚙️ Backend Setup (Prisma + Supabase)

Install dependencies:

```bash
npm install prisma @prisma/client
```

Initialize Prisma:

```bash
npx prisma init
```

Configure `.env` (use the Supabase "Transaction pooler" connection string, with `?pgbouncer=true` appended so Prisma skips prepared statements over PgBouncer):

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Push schema and generate client:

```bash
npx prisma db push
npx prisma generate
```

---

## 🗄️ Database Models

### Event

Stores event information and capacity.

### Participant

Stores participant registration data and references an event.

---

## 📡 API Endpoints

### Events

**GET** `/api/events`
Retrieve all events.

**POST** `/api/events`
Create a new event.

---

### Participants

**GET** `/api/participants`
Retrieve all participants.

**POST** `/api/participants`
Register a participant.

Includes validation:

* Required field validation
* Duplicate registration prevention
* Event existence check
* Capacity limit enforcement

---

## 📊 Admin Dashboard

The admin dashboard provides:

* Total events
* Total participants
* Active events
* Recent registrations
* Event capacity monitoring

Data is fetched from:

```
/api/events
/api/participants
```

---

## 🎯 Features

* Event creation
* Event listing
* Participant registration
* Duplicate registration protection
* Capacity limitation
* Admin monitoring dashboard

---

## 📘 Learn More

To learn more about Next.js:

* https://nextjs.org/docs
* https://nextjs.org/learn

You can check out the Next.js GitHub repository:

https://github.com/vercel/next.js

---

## 🚀 Deploy on Vercel

The easiest way to deploy is using:

https://vercel.com/new

For deployment details:

https://nextjs.org/docs/app/building-your-application/deploying

---

## 🔮 Future Improvements

* Admin authentication
* Participant export (Excel)
* Email confirmation system

---
