# 🎓 GuruMitra — Retired Government Teachers Support Platform

A highly accessible, elderly-friendly digital platform that helps retired government teachers manage health, pension, documents, community interaction, and government updates.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                               │
│   React 18 + Vite + Tailwind CSS (Mobile-First PWA)          │
│   ┌─────┐ ┌────────┐ ┌───────┐ ┌─────────┐ ┌──────────┐    │
│   │Home │ │Health  │ │Pension│ │Documents│ │Community │    │
│   └─────┘ └────────┘ └───────┘ └─────────┘ └──────────┘    │
│   ┌──────────────┐ ┌──────────┐                              │
│   │Gov Updates   │ │Help/SOS  │                              │
│   └──────────────┘ └──────────┘                              │
├──────────────────────────────────────────────────────────────┤
│                      REST API (Express.js)                    │
│   /api/auth  /api/home  /api/health  /api/pension            │
│   /api/documents  /api/community  /api/gov-updates           │
│   /api/help  /api/notifications                              │
├──────────────────────────────────────────────────────────────┤
│                      AI MODULES                               │
│   ┌─────────────┐ ┌────────────┐ ┌──────────┐               │
│   │Smart        │ │Policy      │ │Document  │               │
│   │Reminder     │ │Simplifier  │ │AI        │               │
│   │Engine       │ │            │ │          │               │
│   └─────────────┘ └────────────┘ └──────────┘               │
│   ┌─────────────┐ ┌────────────┐                             │
│   │Help         │ │Fraud       │                             │
│   │Classifier   │ │Detector    │                             │
│   └─────────────┘ └────────────┘                             │
├──────────────────────────────────────────────────────────────┤
│                    DATABASE (SQLite/PostgreSQL)                │
│   Users · HealthRecords · Medicines · PensionData            │
│   Documents · CommunityPosts · GovernmentUpdates             │
│   HelpRequests · Reminders · Notifications · Volunteers      │
└──────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### 1. Backend Setup
```bash
cd backend
npm install
npm run db:init    # Initialize database
npm run db:seed    # Add demo data
npm run dev        # Start development server (port 5000)
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev        # Start dev server (port 5173)
```

### 3. Demo Login
- Phone: `9876543210`
- OTP will be shown in console (development mode)

---

## Project Structure

```
GuruMitra/
├── backend/
│   ├── src/
│   │   ├── ai/                    # AI/ML Modules
│   │   │   ├── reminderEngine.js  # Smart adaptive reminders
│   │   │   ├── policySimplifier.js# Government policy simplification
│   │   │   ├── documentAI.js      # Document categorization & OCR
│   │   │   ├── helpClassifier.js  # Help intent classification
│   │   │   └── fraudDetector.js   # Scam/fraud detection
│   │   ├── config/
│   │   │   ├── database.js        # SQLite connection
│   │   │   ├── initDb.js          # Schema initialization
│   │   │   └── seed.js            # Demo data
│   │   ├── controllers/           # Route handlers
│   │   ├── middleware/             # Auth, error handling
│   │   ├── routes/                # API route definitions
│   │   ├── utils/                 # Helpers
│   │   └── server.js              # Express app entry
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── screens/           # 7 main screens + login + notifications
│   │   │   └── shared/            # Reusable components
│   │   ├── context/               # Auth context
│   │   ├── services/              # API service
│   │   ├── App.jsx                # Root routing
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Tailwind + elder-friendly styles
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP and login |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/home/dashboard` | Home screen dashboard data |
| GET | `/api/health/medicines` | List active medicines |
| POST | `/api/health/medicines` | Add medicine |
| POST | `/api/health/medicines/log` | Log medicine intake |
| GET | `/api/health/records` | Health records |
| POST | `/api/health/records` | Add health record |
| GET | `/api/health/alerts` | AI health alerts |
| GET | `/api/health/timeline` | Health timeline |
| GET | `/api/pension` | Pension data + AI analysis |
| GET | `/api/pension/payments` | Payment history |
| POST | `/api/pension/bank-help` | Request bank help |
| POST | `/api/pension/check-fraud` | AI fraud check |
| GET | `/api/documents` | List documents |
| POST | `/api/documents/upload` | Upload document (AI categorization) |
| GET | `/api/documents/deadlines` | Document deadlines |
| DELETE | `/api/documents/:id` | Delete document |
| GET | `/api/community/posts` | Community posts |
| POST | `/api/community/posts` | Create post |
| POST | `/api/community/posts/:id/like` | Like post |
| GET | `/api/community/groups` | List groups |
| POST | `/api/community/groups/:id/join` | Join group |
| GET | `/api/gov-updates` | Government updates |
| GET | `/api/gov-updates/:id` | Update detail + AI simplification |
| POST | `/api/gov-updates/simplify` | AI text simplification |
| POST | `/api/help` | Create help request (AI classification) |
| GET | `/api/help/my` | My help requests |
| POST | `/api/help/sos` | Emergency SOS |
| PUT | `/api/help/:id/status` | Update request status |
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/read-all` | Mark all read |

---

## Database Schema

### Core Tables
- **users** — Teachers, family members, volunteers, admins with OTP auth
- **otp_codes** — Time-limited OTP for phone authentication
- **health_records** — Checkups, prescriptions, lab reports, vaccinations
- **medicines** — Active medicine list with dosage and schedule
- **medicine_logs** — Intake tracking (taken/missed/skipped)
- **pension_data** — PPO, bank details, monthly amounts, status
- **pension_payments** — Monthly payment history
- **documents** — Document vault with AI categorization and OCR text
- **community_posts** — Posts, memories, voice notes, events
- **community_groups** — Batch-wise and interest groups
- **government_updates** — Verified policy updates with simplified text
- **help_requests** — Help/SOS with AI classification and volunteer assignment
- **reminders** — Adaptive reminders for medicines, appointments, deadlines
- **notifications** — Push notifications with read status
- **volunteers** — Volunteer profiles with availability and ratings
- **fraud_alerts** — Detected scam/fraud alerts
- **audit_log** — All actions logged for elder-friendly audit trail

---

## AI Modules

### 1. Smart Reminder Engine (`ai/reminderEngine.js`)
- **Adherence scoring**: Tracks 30-day medicine compliance
- **Missed pattern detection**: Identifies problematic times
- **Adaptive timing**: Adjusts reminder frequency based on behavior
- **Health alert escalation**: Notifies family for consecutive misses

### 2. Policy Simplifier (`ai/policySimplifier.js`)
- **Complex term dictionary**: Hindi explanations for government jargon
- **Action item extraction**: Automatically identifies deadlines and requirements
- **Impact assessment**: Positive/negative/action-needed classification
- **Change detection**: Highlights what changed (e.g., "50% → 53%")

### 3. Document AI (`ai/documentAI.js`)
- **Auto-categorization**: Identity, pension, medical, property, education, legal
- **Smart naming**: Hindi category names with dates
- **Tag suggestions**: Relevant tags per category
- **Expiry detection**: Extracts validity dates from OCR text

### 4. Help Classifier (`ai/helpClassifier.js`)
- **Bilingual intent classification**: Hindi + English keyword matching
- **Emergency detection**: Pattern-based critical situation identification
- **Priority scoring**: Weighted by urgency, category, and user age
- **Auto-escalation**: Critical requests get immediate volunteer assignment

### 5. Fraud Detector (`ai/fraudDetector.js`)
- **9 scam pattern types**: OTP, bank impersonation, lottery, KYC, phishing, etc.
- **Pension anomaly detection**: Amount and date deviation analysis
- **Risk scoring**: Weighted severity calculation
- **Hindi safety advice**: User-friendly warnings for each scam type

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **SQLite for MVP** | Zero-config, single-file DB perfect for MVP. Schema ready for PostgreSQL migration. |
| **React (not Native)** | Faster development, responsive mobile design, no app store dependency. PWA-capable. |
| **OTP-only auth** | No passwords to remember. Familiar to elderly users from banking apps. |
| **Hindi-first UI** | Primary users prefer Hindi. Multi-language ready via context system. |
| **Rule-based AI** | Practical, predictable, no ML infrastructure needed. LLM-ready for scale. |
| **Bottom navigation** | Maximum 5 tabs as specified. Thumb-friendly on mobile. |
| **Large touch targets** | All buttons min 3.5rem height. Senior-friendly per WCAG guidelines. |
| **High contrast** | Saffron/orange theme with strong contrast ratios for weak eyesight. |

---

## Security

- JWT authentication with 30-day expiry
- OTP-based login (no passwords)
- Rate limiting (200 requests/15 min)
- Helmet.js security headers
- File upload validation (type + size)
- SQL injection prevention (parameterized queries)
- CORS configuration
- Audit logging for all actions
- Document encryption ready (add at-rest encryption layer)
- Fraud detection AI for scam prevention

---

## Deployment

### Docker
```bash
docker-compose up -d
```

### Manual Production
```bash
# Backend
cd backend && npm ci --only=production
NODE_ENV=production node src/server.js

# Frontend
cd frontend && npm ci && npm run build
# Serve dist/ with nginx or any static file server
```

### Cloud Deployment Plan
1. **AWS/GCP/Azure**: EC2/Compute Engine + RDS PostgreSQL + S3 for documents
2. **CI/CD**: GitHub Actions → Build → Test → Deploy
3. **Scaling**: Horizontal backend scaling behind load balancer
4. **CDN**: CloudFront/Cloud CDN for static assets
5. **Monitoring**: Health check endpoint + logging + alerts

---

## MVP Rollout Plan

| Phase | Duration | Scope |
|-------|----------|-------|
| Phase 1 | Week 1-2 | Core 7 screens, OTP login, basic data |
| Phase 2 | Week 3-4 | AI modules integration, demo data, testing |
| Phase 3 | Week 5-6 | Beta with 50 retired teachers in one district |
| Phase 4 | Week 7-8 | Feedback incorporation, bug fixes |
| Phase 5 | Week 9-12 | Production launch, volunteer onboarding |

---

## Future Scaling

- **PostgreSQL migration** for production scale
- **Redis caching** for frequently accessed data
- **LLM integration** (GPT/Gemini) for policy simplification
- **Tesseract/Google Vision OCR** for document text extraction
- **SMS gateway** (MSG91) for real OTP delivery
- **Push notifications** via Firebase Cloud Messaging
- **Voice input** using Web Speech API
- **React Native** mobile app for app stores
- **Regional language support** (Marathi, Tamil, Bengali, etc.)
- **Volunteer management dashboard**
- **Family member portal**
- **Analytics and reporting dashboard**

---

Built with ❤️ for India's retired teachers — *GuruMitra, आपका विश्वसनीय साथी*
