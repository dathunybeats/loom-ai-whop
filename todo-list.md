# Project Todo List

**Priority:** 🔥 Critical → 🔧 Important → 📹 Features → 🎨 Polish

**Focus:** Start with critical bugs before adding new features.

## Authentication & User Management
- [ ] Add OTP and magic links functionality to the authentication system
- [ ] For user signups, populate first_name and last_name columns in addition to full_name
- [ ] Use HeroUI Input OTP component for OTP functionality (Reference: https://www.heroui.com/docs/components/input-otp)
- [ ] For sidebar, display user avatar if available, otherwise fallback to default

## 🔥 Critical UI/UX Fixes
- [ ] **Fix hydration error in NavUser component** - Server/client text mismatch
- [ ] **Fix Google sign-in loading state** - Only clicked button should show spinner
- [ ] **Apply loading fix to signup page** - Same Google sign-in issue
- [ ] **Fix welcome message onboarding** - Update Supabase to use onboarding boolean (no/yes) instead of time-based

## 🔧 UI/UX Improvements
- [ ] **Improve free trial section** - 2-column layout for 'try 5 videos free'
- [ ] **Clean up quick create area** - Remove email icon, add 'upcoming' badges
- [ ] **Style dashboard** - Rounded corners, grey background (shadcn dashboard-01)
  ```bash
  npx shadcn@latest add dashboard-01
  ```
- [ ] **Add HeroUI Dropdown** - For prospects page (Reference: https://www.heroui.com/docs/components/dropdown)
- [ ] **Add HeroUI Progress** - Throughout website (Reference: https://www.heroui.com/docs/components/progress)

## 📹 Video & Content Features
- [ ] **Add video downloads** - Individual and bulk download functionality
- [ ] **Integrate Plyr player** - Replace current video player
- [ ] **Fix prospects page** - Add sidebar, match projects page layout

{{{ ## This Are Mine Dont Focus On This

## Pages & Integration
- [ ] Create a landing page using Framer

## External Setup
- [ ] Set up Instantly for sending cold outreach emails
- [ ] Set up Instagram account and warm up process

till here now focus ## }}}


## 🎨 Assets & Components
- [ ] **Create metric SVGs** - 4 icons for projects, prospects, videos, metrics
- [ ] **Expand HeroUI usage** - Add more components throughout app
