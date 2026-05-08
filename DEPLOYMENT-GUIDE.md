# EventRevo — MERN Stack Go-Live Guide
## Google Cloud Deployment · MongoDB Atlas · Full Production Setup

---

## Project Structure

```
eventrevo/
├── client/                     # React frontend (CRA)
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── layout/         # Navbar, DashSidebar
│       │   └── ui/             # DJCard, StatusBadge, BookingRow, etc.
│       ├── context/            # AuthContext (global user state)
│       ├── pages/
│       │   ├── auth/           # Login, Register, ForgotPassword, ResetPassword
│       │   ├── public/         # HomePage, BrowsePage, DJProfilePage
│       │   ├── customer/       # Dashboard, Bookings, Profile, BookingForm, Checkout
│       │   ├── dj/             # Dashboard, Bookings, ProfileEdit, Media, Availability
│       │   └── admin/          # AdminDashboard
│       ├── styles/             # global.css (full design system)
│       └── utils/              # api.js (all Axios calls)
├── server/                     # Node/Express backend
│   ├── controllers/            # authController, djController, bookingController
│   ├── middleware/             # auth.js (protect, requireRole, optionalAuth)
│   ├── models/                 # User, DJProfile, Booking, Review
│   ├── routes/                 # auth, users, djs, bookings, uploads, stripe, calendar, admin, reviews
│   └── utils/                  # email.js, googleCalendar.js, seed.js
├── infra/
│   └── cloudbuild.yaml         # Google Cloud Build CI/CD config
├── Dockerfile                  # Multi-stage: React build + Node server
└── .dockerignore
```

---

## Phase 1 — Local Development (Day 1)

### Step 1 · Install Prerequisites

```bash
# Check you have these:
node --version    # Need v18+
npm --version     # Need v9+
git --version
docker --version  # Optional for local Docker testing
```

### Step 2 · Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/eventrevo.git
cd eventrevo
npm run install:all
# This installs root, server, and client dependencies
```

### Step 3 · MongoDB Atlas (Free Tier)

1. Go to **mongodb.com/atlas** → Create free account
2. Create a **free M0 cluster** (select Sydney/Singapore region)
3. **Database Access** → Add user → username + password → "Read and write to any database"
4. **Network Access** → Add IP → "Allow access from anywhere" (0.0.0.0/0)
5. **Clusters** → Connect → Drivers → Copy the connection string

```
mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/eventrevo?retryWrites=true&w=majority
```

### Step 4 · Set Up Environment Variables

```bash
cd server
cp .env.example .env
# Now edit server/.env with your values:
```

**Minimum required to run locally:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/eventrevo
JWT_SECRET=any_random_64_char_string_run_this: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
CLIENT_URL=http://localhost:3000
```

```bash
cd ../client
cp .env.example .env
# Edit client/.env:
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...  # from Stripe dashboard
```

### Step 5 · Seed the Database

```bash
cd server
node utils/seed.js
# Creates 5 DJs + admin account
```

### Step 6 · Run Locally

```bash
# From root directory:
npm run dev
# Opens: http://localhost:3000 (React)
#        http://localhost:5000 (Express API)
```

**Test accounts after seeding:**
| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@eventrevo.com.au | ChangeMe_Admin123! |
| DJ    | kastro@eventrevo.com.au | DJpass123! |

---

## Phase 2 — External Services Setup

### Stripe (Payments)

1. Go to **dashboard.stripe.com** → Create account
2. **Developers → API Keys** → copy both keys
3. For local webhook testing:
   ```bash
   npm install -g stripe
   stripe login
   stripe listen --forward-to localhost:5000/api/stripe/webhook
   # Copy the webhook signing secret → STRIPE_WEBHOOK_SECRET in .env
   ```
4. Add to `server/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. Add to `client/.env`:
   ```env
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### Google Cloud Storage (Image Uploads)

1. Go to **console.cloud.google.com**
2. Create a new project → name it "eventrevo"
3. **APIs & Services → Enable APIs** → enable "Cloud Storage API"
4. **Cloud Storage → Create Bucket**:
   - Name: `eventrevo-media`
   - Region: `australia-southeast1`
   - Access: Fine-grained
5. **IAM & Admin → Service Accounts → Create Service Account**:
   - Name: "eventrevo-storage"
   - Role: "Storage Object Admin"
   - Create key → JSON → Download as `gcs-key.json`
6. Place `gcs-key.json` in `server/config/gcs-key.json`
7. **Cloud Storage → Bucket → Permissions → Add member**:
   - Member: `allUsers`
   - Role: `Storage Object Viewer` (makes uploaded images publicly readable)
8. Add to `server/.env`:
   ```env
   GCS_BUCKET_NAME=eventrevo-media
   GCS_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=./config/gcs-key.json
   ```

### Email (Nodemailer)

**Option A — Gmail (easiest for MVP):**
1. Google Account → Security → 2-Step Verification → App Passwords
2. Generate for "Mail" → copy 16-char password
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   EMAIL_FROM=noreply@eventrevo.com.au
   ```

**Option B — Resend.com (recommended for production):**
1. resend.com → Free account → API Keys → Create key
   ```env
   EMAIL_HOST=smtp.resend.com
   EMAIL_PORT=465
   EMAIL_USER=resend
   EMAIL_PASS=re_xxxxxxxxxxxx
   EMAIL_FROM=noreply@eventrevo.com.au
   ```

### Google Calendar Integration (Optional for MVP)

1. **GCP Console → APIs & Services → Enable** "Google Calendar API"
2. **Credentials → Create OAuth 2.0 Client ID** → Web application
3. Authorised redirect URIs: `http://localhost:5000/api/calendar/callback`
4. Add to `server/.env`:
   ```env
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxx
   GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:5000/api/calendar/callback
   ```
5. DJs connect their calendar from their dashboard → Bookings auto-added when confirmed

---

## Phase 3 — Google Cloud Deployment

### Step 1 · Install Google Cloud CLI

```bash
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows: Download installer from cloud.google.com/sdk

# Authenticate:
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Step 2 · Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com
```

### Step 3 · Store Secrets in Secret Manager

```bash
# Create secrets (never put these in code or cloudbuild.yaml directly)
echo -n "mongodb+srv://..." | gcloud secrets create MONGODB_URI --data-file=-
echo -n "your_jwt_secret" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "sk_live_..." | gcloud secrets create STRIPE_SECRET_KEY --data-file=-
echo -n "whsec_..." | gcloud secrets create STRIPE_WEBHOOK_SECRET --data-file=-
echo -n "your_email_pass" | gcloud secrets create EMAIL_PASS --data-file=-
echo -n "pk_live_..." | gcloud secrets create STRIPE_PK --data-file=-

# Grant Cloud Build access to secrets
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding MONGODB_URI \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
# Repeat for each secret above
```

### Step 4 · Build & Test Docker Locally (Optional)

```bash
# Build image
docker build \
  --build-arg REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_... \
  -t eventrevo:local .

# Run locally
docker run -p 8080:8080 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="your_secret" \
  -e NODE_ENV=production \
  eventrevo:local

# Test: http://localhost:8080
```

### Step 5 · Manual First Deploy

```bash
# Build and push image to Google Container Registry
gcloud builds submit \
  --tag gcr.io/YOUR_PROJECT_ID/eventrevo:latest \
  .

# Deploy to Cloud Run
gcloud run deploy eventrevo \
  --image gcr.io/YOUR_PROJECT_ID/eventrevo:latest \
  --region australia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080 \
  --set-secrets="MONGODB_URI=MONGODB_URI:latest,JWT_SECRET=JWT_SECRET:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest,EMAIL_PASS=EMAIL_PASS:latest" \
  --set-env-vars="NODE_ENV=production,EMAIL_HOST=smtp.gmail.com,EMAIL_PORT=587,EMAIL_USER=your@gmail.com,EMAIL_FROM=noreply@eventrevo.com.au,CLIENT_URL=https://YOUR_CLOUD_RUN_URL,GCS_BUCKET_NAME=eventrevo-media,GCS_PROJECT_ID=YOUR_PROJECT_ID,DEPOSIT_PERCENTAGE=20"
```

**Cloud Run URL will be:** `https://eventrevo-xxxx-ue.a.run.app`

### Step 6 · Set Up CI/CD (Auto-deploy on git push)

```bash
# Connect GitHub repo to Cloud Build
# GCP Console → Cloud Build → Triggers → Connect Repository

# Create trigger:
gcloud beta builds triggers create github \
  --repo-name=eventrevo \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=infra/cloudbuild.yaml

# Now every push to main auto-deploys!
```

### Step 7 · Custom Domain

```bash
# Option A: Google Cloud Run Domain Mapping
gcloud run domain-mappings create \
  --service eventrevo \
  --domain eventrevo.com.au \
  --region australia-southeast1

# Get the DNS records to add to your registrar (Namecheap, GoDaddy, etc.)
gcloud run domain-mappings describe \
  --domain eventrevo.com.au \
  --region australia-southeast1

# Option B: Use Cloudflare (recommended)
# Add your domain to Cloudflare (free)
# Point DNS CNAME to Cloud Run URL
# Enable Cloudflare proxy for free SSL + CDN
```

### Step 8 · Production Stripe Webhook

```bash
# In Stripe Dashboard → Developers → Webhooks → Add Endpoint
# URL: https://eventrevo.com.au/api/stripe/webhook
# Events: payment_intent.succeeded

# Update STRIPE_WEBHOOK_SECRET secret with production whsec_
echo -n "whsec_live_..." | gcloud secrets versions add STRIPE_WEBHOOK_SECRET --data-file=-
```

---

## Phase 4 — Post-Launch Checklist

### Security
- [ ] Change all seed passwords immediately
- [ ] Set strong JWT_SECRET (64+ random chars)
- [ ] Switch Stripe from test keys to live keys
- [ ] Enable MongoDB Atlas IP allowlist (restrict to Cloud Run IPs)
- [ ] Set up Cloud Run min-instances=1 if you need zero cold starts

### MongoDB Atlas Monitoring
```bash
# Set up alerts in Atlas:
# Atlas → Alerts → Create Alert
# Alert on: Connections > 50, CPU > 80%, Storage > 80%
```

### Backups
```bash
# Atlas M0 (free) has daily snapshots built in
# For M10+: set up continuous backups
```

### Logs
```bash
# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eventrevo" \
  --limit 50 \
  --format "table(timestamp,textPayload)"

# Or: GCP Console → Cloud Run → eventrevo → Logs tab
```

### Performance
```bash
# Check Cloud Run metrics
gcloud monitoring metrics list --filter="resource.type=cloud_run_revision"

# Scale settings for production traffic
gcloud run services update eventrevo \
  --min-instances=1 \
  --max-instances=20 \
  --concurrency=80 \
  --region australia-southeast1
```

---

## Quick Reference — API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register (customer or DJ) |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | Bearer | Get current user |
| GET | /api/djs | — | List DJs with filters |
| GET | /api/djs/:id | — | Public DJ profile |
| GET | /api/djs/me | DJ | Own profile |
| PUT | /api/djs/me | DJ | Update profile |
| POST | /api/djs/me/media | DJ | Add media link |
| PUT | /api/djs/me/availability | DJ | Set weekly hours |
| POST | /api/djs/me/block-date | DJ | Block a date |
| POST | /api/bookings | Optional | Create booking (guest or user) |
| GET | /api/bookings | Bearer | List bookings (role-based) |
| PATCH | /api/bookings/:id | Bearer | confirm/decline/cancel/complete |
| POST | /api/uploads/profile | Bearer | Upload profile photo → GCS |
| POST | /api/uploads/gallery | DJ | Upload gallery photo → GCS |
| POST | /api/stripe/create-payment-intent | Bearer | Create Stripe deposit |
| POST | /api/stripe/webhook | Stripe | Stripe payment events |
| GET | /api/calendar/auth-url | DJ | Get Google Calendar OAuth URL |
| GET | /api/reviews/dj/:djId | — | Get DJ reviews |
| POST | /api/reviews | Customer | Leave review |
| GET | /api/admin/stats | Admin | Platform stats |
| PATCH | /api/admin/djs/:id | Admin | Approve/reject DJ |

---

## Cost Estimate (Monthly)

| Service | Free Tier | Paid Estimate |
|---------|-----------|---------------|
| Cloud Run | 2M requests/month free | ~A$5–15 for 100k users |
| MongoDB Atlas M0 | Free (512MB) | M10 ~A$80 for scale |
| GCS Storage | 5GB free | ~A$0.03/GB after |
| Cloud Build | 120 min/day free | ~A$0 for small teams |
| **Total MVP** | **$0/month** | **A$10–100/month** |

---

## Troubleshooting

### "Cannot connect to MongoDB"
- Check Atlas IP whitelist (0.0.0.0/0 for Cloud Run)
- Verify MONGODB_URI in Secret Manager has correct password
- Check Atlas cluster isn't paused (free tier auto-pauses after 60 days idle)

### "401 Unauthorized on all requests"
- JWT_SECRET in Cloud Run env must match what was used to sign tokens
- Check Bearer token is being sent in Authorization header

### "Image uploads failing"
- Verify GCS bucket permissions (allUsers → Storage Object Viewer)
- Check service account has Storage Object Admin role
- Ensure GOOGLE_APPLICATION_CREDENTIALS path is correct in container

### "Stripe webhook 400 error"
- Stripe webhook secret must match STRIPE_WEBHOOK_SECRET in env
- Webhook URL must be HTTPS (Cloud Run provides this)
- Check raw body middleware is applied before other body parsers

### Cold starts on Cloud Run
```bash
# Set minimum instances to avoid cold starts
gcloud run services update eventrevo --min-instances=1 --region australia-southeast1
# Note: min-instances=1 costs ~A$5–10/month
```

---

## First 5 Actions After Going Live

1. **Log in as admin** → Approve all 5 seeded DJ profiles
2. **Log in as a DJ** → Complete profile, add YouTube mix link, set availability
3. **Log in as customer** → Browse, find a DJ, submit a test booking
4. **Log in as DJ** → Confirm the test booking
5. **Check emails** → Verify confirmation emails are sending

---

*Built for EventRevo — Canberra, ACT · eventrevo.com.au*
