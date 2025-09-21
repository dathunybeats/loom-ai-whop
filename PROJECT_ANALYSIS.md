# Meraki Reach - Project Analysis

## Overview
Meraki Reach is an AI-powered video outreach platform that enables users to create personalized video campaigns with automated voice cloning and prospect targeting. The platform combines video personalization, website scraping, voice synthesis, and bulk prospect management.
## Tech Stack

### Frontend Framework
- **Next.js 15.5.2** - React-based full-stack framework
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development

### UI/UX Libraries
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Comprehensive component library (dialogs, dropdowns, forms)
- **HeroUI** - Additional UI components
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **Sonner** - Toast notifications

### Backend & Database
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - Authentication and user management
- **Supabase Storage** - File storage for videos, images, and audio

### Media Processing
- **FFmpeg (fluent-ffmpeg)** - Video processing and composition
- **Puppeteer** - Web scraping and screenshot generation
- **ScreenshotOne API** - Professional website screenshot service

### AI & Voice Services
- **OpenAI Whisper** - Speech recognition and transcription
- **ElevenLabs** - Voice cloning and speech synthesis

### Payment Processing
- **Dodo Payments** - Subscription and payment management

### Development & Testing
- **Jest** - Testing framework with React Testing Library
- **ESLint** - Code linting and quality
- **Bundle Analyzer** - Performance optimization
## API Architecture

### 16 Core Endpoints Across 8 Categories:

#### 1. Authentication (1 endpoint)
- `/auth/callback` - OAuth callback handling with auto-subscription setup

#### 2. User Management (2 endpoints)
- `/api/profile` - Profile CRUD operations
- `/api/upload-avatar` - Avatar image uploads

#### 3. Project Management (3 endpoints)
- `/api/projects` - Project creation and management
- `/api/upload-video` - Base video file uploads
- `/api/share-project` - Public project sharing

#### 4. Video Processing (2 endpoints)
- `/api/personalize-video` - Core personalization engine
- `/api/test-personalization` - Testing and debugging

#### 5. Voice & Audio (4 endpoints)
- `/api/voice/detect-prospect` - Keyword detection in audio
- `/api/voice/clone` - Voice model creation
- `/api/voice/generate` - Text-to-speech synthesis
- `/api/audio/personalize` - Audio replacement and splicing

#### 6. Prospect Management (2 endpoints)
- `/api/prospects/bulk` - Bulk prospect operations (CSV import/export)

#### 7. Payments & Subscriptions (3 endpoints)
- `/api/payments/dodo/create-checkout` - Checkout session creation
- `/api/payments/dodo/webhook` - Payment event handling
- `/api/subscription/onboarding` - User onboarding flow

#### 8. Analytics (1 endpoint)
- `/api/analytics/web-vitals` - Performance metrics collection

## Core Features

### Video Personalization Engine
- Website screenshot integration for dynamic content
- Video overlay positioning (4 corners)
- Batch processing for multiple prospects
- FFmpeg-based video composition
- Preview mode for testing

### Voice Cloning System
- ElevenLabs integration for voice model creation
- Keyword detection using Whisper AI
- Automated "PROSPECT" replacement with first names
- Audio splicing and timing synchronization

### Prospect Management
- CSV bulk import/export
- Enhanced web scraping for company data
- Website screenshot capture
- Batch video generation

### Authentication & Subscriptions
- Supabase Auth with OAuth (Google)
- Trial subscriptions for new users
- Dodo Payments integration
- Subscription lifecycle management

## File Structure

```
src/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Main application
│   ├── projects/         # Project management
│   ├── settings/         # User settings
│   ├── login/           # Login page
│   ├── signup/          # Registration page
│   └── pricing/         # Pricing page
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, Subscription)
├── lib/               # Utilities and integrations
└── types/             # TypeScript type definitions
```

## Key Integrations

### External APIs
- **ScreenshotOne** - Website screenshot generation
- **ElevenLabs** - Voice cloning and synthesis
- **OpenAI Whisper** - Speech recognition
- **Dodo Payments** - Payment processing

### Storage & Database
- **Supabase PostgreSQL** - User data, projects, prospects
- **Supabase Storage** - Videos, audio files, avatars, screenshots

## Performance Optimizations

### Build Optimizations
- Bundle analyzer integration
- Package import optimization for Radix UI
- Font optimization with display: swap
- Experimental Next.js features

### Runtime Optimizations
- Background processing for video generation
- Batch operations for prospects
- Efficient media file handling
- Progress tracking for long-running operations

## Security Features

- **Authentication**: Supabase Auth with OAuth
- **Authorization**: Row-level security (RLS) policies
- **File Validation**: Size and type restrictions
- **API Protection**: User authentication middleware
- **Webhook Security**: Signature verification for payments

## Current Status
- **Active Development** - Server running on port 3003
- **16 API endpoints** fully implemented
- **Core features** operational
- **UI rebranded** to Meraki Reach
- **Payment system** integrated
- **Voice cloning** functional
- **Video personalization** working

## Deployment Configuration

### Environment Variables Required
- Database: Supabase URL and keys
- Storage: Supabase storage configuration
- AI Services: OpenAI and ElevenLabs API keys
- Screenshots: ScreenshotOne API key
- Payments: Dodo Payments configuration

### Next.js Configuration
- ESLint disabled during builds (performance)
- Bundle analyzer optional
- Optimized package imports
- Production-ready server configuration

## Future Considerations
- Enhanced analytics dashboard
- Advanced video templates
- A/B testing for campaigns
- Email integration
- Advanced prospect filtering
- Bulk campaign management
- API rate limiting improvements
- Performance monitoring