# SevaSethu – Connecting Care with Compassion

A social welfare management platform connecting orphanages, old-age homes, donors, NGOs, hospitals, and administrators.

## Features

- **Public Website** — Browse homes, view statistics, donate without login, volunteer registration
- **Donor Module** — QR/UPI donations, receipts, certificates, transparency tracker
- **Home Registration** — Orphanages & old-age homes apply, admin verifies, credentials generated
- **Admin Dashboard** — Approve homes, verify donations, manage medical camps, reports
- **Manager Dashboard** — Residents, inventory, events, expenses, needs management
- **Resident Management** — Health profiles, government schemes, daily records, education
- **Inventory** — Stock tracking with low-stock alerts
- **Medical Camps** — Hospital collaboration, resident registration, doctor reports
- **Calendar & Notifications** — Events, email/SMS/in-app alerts
- **Reports** — Donation, expense, health, pension, inventory (PDF/Excel ready)
- **RBAC** — Super Admin, Admin, Home Manager, Medical Partner, Volunteer, Donor

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT + Role-Based Access Control |
| Payments | Razorpay/UPI QR (integration ready) |
| Storage | Cloudinary/AWS S3 (integration ready) |

## Project Structure

```
sevasethu/
├── backend/
│   └── src/
│       ├── config/        # DB, roles, permissions
│       ├── controllers/   # Business logic
│       ├── middleware/    # Auth, RBAC, error handling
│       ├── models/        # MongoDB schemas
│       ├── routes/        # API endpoints
│       ├── seed.js        # Demo data
│       └── server.js      # Entry point
├── frontend/
│   └── src/
│       ├── components/    # Reusable UI
│       ├── context/       # Auth state
│       ├── layouts/       # Dashboard layouts
│       ├── pages/         # Route pages
│       └── services/      # API client
└── package.json           # Root scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install all dependencies
npm run install:all

# Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and JWT secret
```

### Seed Demo Data

```bash
cd backend
node src/seed.js
```

**Demo credentials:**
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@sevasethu.org | admin123 |
| Home Manager | manager@ananda.org | manager123 |

### Run Development Servers

```bash
# From project root — starts both backend (port 5000) and frontend (port 5173)
npm run dev
```

Or separately:

```bash
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/stats` | Public dashboard statistics |
| GET | `/api/public/homes` | List approved homes |
| GET | `/api/public/homes/:slug` | Home detail page |
| POST | `/api/donations` | Create donation (no auth) |
| POST | `/api/homes/register` | Register new home |
| POST | `/api/volunteers/register` | Volunteer registration |
| POST | `/api/auth/login` | Login |
| GET | `/api/admin/dashboard` | Admin stats |
| PUT | `/api/admin/homes/:id/approve` | Approve/reject home |
| GET | `/api/homes/dashboard` | Manager dashboard |
| CRUD | `/api/residents` | Resident management |
| CRUD | `/api/inventory` | Inventory management |
| CRUD | `/api/medical-camps` | Medical camp management |
| GET | `/api/reports?type=donation` | Generate reports |

## Roles & Permissions

| Role | Access |
|------|--------|
| Super Admin | Full platform control |
| Admin | Approve homes, verify donations, manage camps |
| Home Manager | Own home's residents, inventory, events |
| Medical Partner | Create camps, upload medical reports |
| Volunteer | View assigned activities |
| Donor | Public info + own donation history |

## Roadmap

- [ ] Razorpay payment gateway integration
- [ ] Cloudinary image/document uploads
- [ ] Google Maps embed on home pages
- [ ] Email notifications (Nodemailer configured)
- [ ] SMS notifications (Twilio/MSG91)
- [ ] PDF/Excel report export
- [ ] Firebase push notifications
- [ ] Mobile-responsive PWA

## License

MIT
