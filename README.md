<p align="center">
  <a href="https://creet.io" target="_blank">
    <img src="public/icon.svg" alt="Creet.io Logo" width="80" height="80">
  </a>
</p>

<h1 align="center">Creet.io</h1>

<p align="center">
  <a href="https://creet.io" target="_blank"><strong>🌐 Visit Creet.io</strong></a>
</p>

<p align="center">
  <strong>A free, open-source testimonial collection and management platform</strong>
</p>

<p align="center">
  Collect, manage, and showcase customer testimonials effortlessly. <br/>
  Self-host with full control over your data.
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Self-Hosting Guide](#-self-hosting-guide)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Set Up Supabase](#3-set-up-supabase)
  - [4. Set Up Cloudflare Stream (Optional)](#4-set-up-cloudflare-stream-optional)
  - [5. Configure Environment Variables](#5-configure-environment-variables)
  - [6. Run the Application](#6-run-the-application)
- [Environment Variables Reference](#-environment-variables-reference)
- [Database Setup](#-database-setup)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Creet.io** is a powerful, feature-rich platform for collecting, managing, and displaying customer testimonials. Unlike expensive proprietary solutions, Creet.io gives you complete control over your testimonial data while providing enterprise-grade features at zero cost.

Whether you're an individual creator, a startup, or an enterprise, Creet.io helps you leverage the power of social proof to build trust and convert more customers.

---

## ✨ Features

- 📝 **Text & Video Testimonials** - Collect rich testimonials in multiple formats
- 🎨 **Customizable Forms** - Create branded collection forms with custom fields
- 🖼️ **Beautiful Widgets** - Embed testimonials anywhere with customizable widgets
- 🏛️ **Wall of Love** - Showcase testimonials on stunning, shareable pages
- 👥 **Customer Management** - Organize testimonials by customer profiles
- 📂 **Project Organization** - Manage multiple projects from one dashboard
- 🔐 **Authentication** - Secure access with Supabase Auth (Google, Email, etc.)
- 📱 **Responsive Design** - Works beautifully on all devices
- 🎥 **Video Streaming** - Powered by Cloudflare Stream (optional)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Supabase](https://supabase.com/) | Database, Auth & Storage |
| [Cloudflare Stream](https://www.cloudflare.com/products/cloudflare-stream/) | Video hosting & streaming (optional) |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS |
| [Radix UI](https://www.radix-ui.com/) | Accessible UI components |
| [Framer Motion](https://www.framer.com/motion/) | Animations |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **pnpm** or **yarn** - Package manager
- **Git** - [Download](https://git-scm.com/)

You will also need:

- A **Supabase** account (free tier available) - [Sign up](https://supabase.com/)
- A **Cloudflare** account (optional, for video testimonials) - [Sign up](https://cloudflare.com/)
- A **Google Cloud** account (optional, for Google Fonts API) - [Console](https://console.cloud.google.com/)

---

## 🚀 Self-Hosting Guide

### 1. Clone the Repository

```bash
git clone https://github.com/creet/creet.io.git
cd creet.io
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Supabase

Supabase is **required** for Creet.io to function. It provides the database, authentication, and file storage.

#### Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Enter your project details:
   - **Name**: Choose a name (e.g., `creet`)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Select the region closest to your users
4. Click **"Create new project"** and wait for it to be ready

#### Step 2: Get Your API Keys

1. Navigate to **Settings** → **API** in your Supabase dashboard
2. You'll find:
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → This is your `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **Security Warning**: The `service_role` key has full access to your database. Never expose it in client-side code or commit it to version control.

#### Step 3: Run the Database Setup Script

1. In your Supabase dashboard, navigate to **SQL Editor**
2. Click **"New query"**
3. Copy the contents of `supabase/setup.sql` from this repository
4. Paste it into the SQL editor
5. Click **"Run"** to execute the script

This script will create:
- All necessary tables (profiles, projects, forms, customers, testimonials, walls, widgets)
- Row Level Security (RLS) policies
- Performance indexes
- Storage buckets
- User creation triggers

#### Step 4: Configure Authentication Providers (Optional)

To enable social login (Google, GitHub, etc.):

1. Go to **Authentication** → **Providers** in Supabase
2. Enable and configure your preferred providers
3. For Google OAuth:
   - Create credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Add your authorized redirect URLs from Supabase
   - Enter your Client ID and Secret in Supabase

### 4. Set Up Cloudflare Stream (Optional)

> 💡 **Note**: Cloudflare Stream is **only required for video testimonials**. If you only need text testimonials, you can skip this entire section and leave the Cloudflare environment variables empty.

Cloudflare Stream provides video hosting, encoding, and playback for video testimonials. It charges a 

#### Step 1: Enable Cloudflare Stream

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Stream** in the sidebar
3. If you haven't already, enable Stream for your account
4. Note your **Account ID** from the URL or sidebar

#### Step 2: Create an API Token

1. Go to **My Profile** → **API Tokens**
2. Click **"Create Token"**
3. Use the **"Edit Cloudflare Stream"** template or create a custom token with:
   - **Zone Resources**: Include all zones (or specific zones)
   - **Account Permissions**: Stream (Edit)
4. Click **"Continue to summary"** → **"Create Token"**
5. Copy and save your token (you won't see it again!)

#### Step 3: Get Your Stream Subdomain

1. Go to **Stream** → **Settings**
2. Find your customer subdomain (format: `customer-XXXXXXXXXX`)
3. You only need the part after `customer-` for `NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN`

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local  # If example exists
# OR create manually:
touch .env.local
```

Add the following environment variables:

```env
# =============================================================================
# SUPABASE CONFIGURATION (Required)
# =============================================================================

# Your Supabase project URL
# Found in: Supabase Dashboard → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anonymous/public key
# Found in: Supabase Dashboard → Settings → API → anon public
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Your Supabase service role key (KEEP SECRET!)
# Found in: Supabase Dashboard → Settings → API → service_role
# ⚠️ Never expose this in client-side code
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =============================================================================
# GOOGLE FONTS API (Optional)
# =============================================================================

# API key for Google Fonts (for custom font selection in widgets)
# Get yours at: https://console.cloud.google.com/apis/credentials
NEXT_PUBLIC_GOOGLE_FONTS_API_KEY=AIzaSy...

# =============================================================================
# CLOUDFLARE STREAM CONFIGURATION (Optional - for video testimonials only)
# =============================================================================

# Your Cloudflare Account ID
# Found in: Cloudflare Dashboard URL or sidebar
CLOUDFLARE_ACCOUNT_ID=your-account-id-here

# API token with Stream edit permissions
# Create at: Cloudflare Dashboard → My Profile → API Tokens
CLOUDFLARE_API_TOKEN=your-api-token-here

# Your Stream customer subdomain (without "customer-" prefix)
# Found in: Stream → Settings
NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN=xxxxxxxxxx
```

### 6. Run the Application

#### Development Mode

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Production Build

```bash
npm run build
npm start
```

---

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key for client-side auth |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service role key for server-side operations |
| `NEXT_PUBLIC_GOOGLE_FONTS_API_KEY` | ❌ No | Google Fonts API key for custom font selection |
| `CLOUDFLARE_ACCOUNT_ID` | ⚡ Conditional | Required only for video testimonials |
| `CLOUDFLARE_API_TOKEN` | ⚡ Conditional | Required only for video testimonials |
| `NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN` | ⚡ Conditional | Required only for video testimonials |

### Environment Variable Details

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Type**: URL
- **Example**: `https://abcd1234.supabase.co`
- **Where to find**: Supabase Dashboard → Settings → API → Project URL
- **Used for**: Connecting to your Supabase database and auth

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Type**: JWT Token
- **Where to find**: Supabase Dashboard → Settings → API → anon public
- **Used for**: Client-side authentication and database queries with RLS

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Type**: JWT Token
- **Security**: 🔒 Keep this secret! Never expose in client-side code
- **Where to find**: Supabase Dashboard → Settings → API → service_role
- **Used for**: Server-side administrative operations (bypasses RLS)

#### `NEXT_PUBLIC_GOOGLE_FONTS_API_KEY`
- **Type**: API Key
- **Where to get**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Used for**: Fetching available Google Fonts for widget customization
- **Note**: The app works without this, but font selection will be limited

#### `CLOUDFLARE_ACCOUNT_ID`
- **Type**: String
- **Where to find**: Cloudflare Dashboard URL or sidebar
- **Used for**: Uploading and managing videos on Cloudflare Stream


#### `CLOUDFLARE_API_TOKEN`
- **Type**: API Token
- **Where to create**: Cloudflare Dashboard → My Profile → API Tokens
- **Required permissions**: Stream (Edit)
- **Used for**: Authenticating video upload and delete requests

#### `NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN`
- **Type**: String
- **Example**: If your Stream URL is `customer-abc123xyz.cloudflarestream.com`, use `abc123xyz`
- **Where to find**: Stream → Settings → Customer subdomain
- **Used for**: Constructing video playback URLs

---

## 🗄️ Database Setup

The complete database schema is in `supabase/setup.sql`. Here's what it creates:

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User accounts extending Supabase Auth |
| `projects` | Workspaces for organizing testimonials |
| `forms` | Collection form configurations |
| `customers` | People who submit testimonials |
| `testimonials` | Text and video testimonials |
| `walls` | Wall of Love display pages |
| `widgets` | Embeddable widget configurations |

### Security

- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Service role key is required for admin operations

### Storage

- An `assets` bucket is created for public file storage
- Authenticated users can upload
- Public read access for assets

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/) and import your repository
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Other Platforms

Creet.io can be deployed on any platform that supports Next.js:

- **Netlify** - [Deploy Guide](https://docs.netlify.com/frameworks/next-js/overview/)
- **Railway** - [Deploy Guide](https://railway.app/)
- **DigitalOcean App Platform** - [Deploy Guide](https://www.digitalocean.com/products/app-platform)
- **AWS Amplify** - [Deploy Guide](https://aws.amazon.com/amplify/)
- **Self-hosted** - Run with `npm run build && npm start`

---

## 🤝 Contributing

We welcome contributions from developers of all skill levels!

- 🎨 **Designers** - Help improve our UI/UX
- 💻 **Developers** - Add features and fix bugs  
- 📝 **Writers** - Improve documentation
- 🌐 **Translators** - Help make Creet.io multilingual
- 🧪 **Testers** - Help us find and fix issues

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **Creet.io Community License v1.0**.

### Quick Summary

✅ **You CAN freely:**
- Use for your personal projects
- Deploy on your own website to collect testimonials
- Modify however you want for your own use
- Use for your company's internal purposes
- Self-host instead of using a paid service
- Learn from the code

❌ **You CANNOT:**
- Build a competing testimonial/social proof SaaS to sell
- Take features and use them in a competing product
- White-label and resell as your own product

See the [LICENSE](LICENSE) file for full legal terms.

---

## 💬 Support

- 📧 **Email**: support@creet.io
- 🐛 **Issues**: [GitHub Issues](https://github.com/creet/creet.io/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/creet/creet.io/discussions)

---

<p align="center">
  Made with ❤️ by the Creet.io Community
</p>
