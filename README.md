# Loom.ai - AI-Powered Personalized Video Platform

A comprehensive SaaS platform for creating personalized AI videos at scale, built with Next.js, Supabase, and Dodo Payments.

## 🚀 Overview

Loom.ai enables businesses to create personalized video content for their prospects using AI voice cloning and video generation. Upload prospect data via CSV, generate custom videos, and track engagement analytics.

## ✨ Features

### 🎯 Core Functionality
- **AI Video Generation** - Create personalized videos with voice cloning
- **Prospect Management** - Upload and manage prospect data via CSV
- **Project Organization** - Organize videos by projects
- **Analytics Tracking** - Track video views, clicks, and engagement
- **Public Sharing** - Share videos via unique landing pages

### 💳 Payment & Subscription System
- **Payment Provider**: Dodo Payments integration
- **Free Trial**: 5 videos to get started
- **Tiered Pricing**:
  - **Basic** ($49.99/month): 100 videos, HD quality, CSV upload
  - **Pro** ($99/month): 500 videos, advanced features
  - **Agency** ($199/month): Unlimited videos, white-label options

### 🔐 Authentication & User Management
- Supabase Auth integration
- User profiles with preferences
- Email notifications and settings
- Onboarding flow with welcome modals

### 📊 Analytics & Tracking
- Video view tracking
- Click analytics
- IP and user agent logging
- Engagement metrics dashboard

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Next.js API routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Payments**: Dodo Payments
- **Storage**: Supabase Storage
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint, TypeScript

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── payments/dodo/ # Dodo payment endpoints
│   │   ├── profile/       # User profile management
│   │   ├── projects/      # Project CRUD operations
│   │   └── upload-video/  # Video upload handling
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── pricing/           # Pricing page
│   ├── projects/          # Project management
│   ├── settings/          # User settings
│   ├── privacy/           # Privacy policy
│   ├── terms/             # Terms of service
│   └── refund/            # Refund policy
├── components/            # Reusable components
│   ├── ui/               # UI component library
│   └── ...               # Feature components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utilities and configurations
└── database/             # SQL schemas and migrations
    ├── schemas/          # Core database schemas
    ├── fixes/            # Bug fixes and patches
    ├── setup/            # Initial setup scripts
    └── updates/          # Schema updates
```

## 🗄 Database Schema

The application uses PostgreSQL with the following main tables:

### Core Tables
- **profiles** - User profile information and preferences
- **user_subscriptions** - Subscription management with Dodo integration
- **projects** - Video project organization
- **prospects** - Individual prospect data and video status
- **video_jobs** - Background video processing jobs
- **analytics** - Event tracking and engagement metrics
- **csv_uploads** - CSV import tracking and status

### Key Features
- **Subscription Management**: Integrated with Dodo Payments
- **Video Usage Tracking**: Monthly usage limits and resets
- **Analytics**: Comprehensive event tracking
- **File Management**: CSV import with error handling
- **RLS Policies**: Row-level security for data isolation

## 🎨 Pages & Features Completed

### 📄 Public Pages
- **Landing Page** - Hero section, features, pricing
- **Privacy Policy** - GDPR compliant privacy policy
- **Terms of Service** - Complete terms and conditions
- **Refund Policy** - Clear refund terms

### 🔒 Authenticated Pages
- **Dashboard** - Overview, recent projects, usage stats
- **Projects** - Create, manage, and organize video projects
- **Prospects** - Manage prospect data and video status
- **Settings** - User preferences and account management
- **Pricing** - Subscription plans and upgrades

### 🛠 Admin Features
- **CSV Upload** - Bulk prospect import with validation
- **Video Generation** - AI-powered video creation
- **Analytics Dashboard** - Engagement tracking
- **Subscription Management** - Plan upgrades and billing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn
- Supabase account
- Dodo Payments account

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Dodo Payments
DODO_API_KEY=your_dodo_api_key
DODO_BRAND_ID=your_dodo_brand_id
DODO_WEBHOOK_SECRET=your_webhook_secret

# App Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd loom.ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. **Set up Supabase**
```bash
# Run database migrations
supabase db push

# Set up storage buckets
supabase storage create videos
supabase storage create avatars
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🔍 Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run build
```

## 📦 Deployment

The application is optimized for deployment on Vercel:

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Supabase database migrated
- [ ] Dodo Payments webhooks configured
- [ ] DNS and domain setup
- [ ] SSL certificates installed

## 🔄 Recent Updates

### Payment Migration
- ✅ Migrated from Whop to Dodo Payments
- ✅ Cleaned up legacy Whop webhook code
- ✅ Updated pricing plans and product IDs
- ✅ Implemented Dodo webhook handling

### Code Organization
- ✅ Organized SQL files into structured folders
- ✅ Removed unused dependencies and files
- ✅ Fixed Jest/ESLint configuration
- ✅ Cleaned up duplicate mobile hooks

### Testing & Quality
- ✅ Fixed `toBeInTheDocument` lint errors
- ✅ Comprehensive test coverage for core components
- ✅ ESLint configuration optimized

## 📈 Future Roadmap

- [ ] Advanced analytics dashboard
- [ ] Email automation integration
- [ ] Team collaboration features
- [ ] White-label customization
- [ ] API for third-party integrations
- [ ] Mobile application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.