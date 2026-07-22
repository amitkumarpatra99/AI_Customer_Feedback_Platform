# 🚀 Project LOOP | AI Customer Feedback Intelligence Platform

Project LOOP is a modern, multi-tenant B2B SaaS application designed to help companies collect, analyze, and act on customer feedback using AI-powered insights. It transforms raw, unstructured feedback from various channels into actionable intelligence.

## 🌟 Key Features

- **🔐 Multi-Tenant Auth & RBAC**: Secure role-based access control (Admin, Analyst, Viewer) ensuring strict data isolation between workspaces.
- **📊 Analytics Dashboard**: Real-time visualizations of feedback volume, sentiment breakdown, and top themes using interactive charts.
- **📥 Flexible Feedback Ingestion**: 
  - Manual single-entry form with auto-AI sentiment tagging.
  - Bulk CSV import for migrating historical data.
  - Public feedback widget simulation for real-time data capture.
- **🤖 Ask LOOP (AI Chat)**: Natural language query interface to ask questions like *"Show me negative feedback about billing"* and get instant, data-backed answers.
- **🏷️ AI Themes Engine**: Automatic categorization of feedback into trending topics (e.g., UI/UX, Billing, Performance) with confidence scoring.
- **📈 Comprehensive Reports**: Pre-built, filterable reports (7/30/90 days) with one-click CSV export for stakeholder sharing.
- **✨ Premium UI/UX**: Dark-mode optimized, responsive design with smooth toast notifications for seamless user experience.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Hosted on Neon.tech)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Credentials Provider)
- **Charts**: Recharts
- **Notifications**: Sonner
- **CSV Parsing**: PapaParse

## ⚙️ Local Setup Instructions

Follow these steps to run the project locally:

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd AI_Customer_Feedback_Platform