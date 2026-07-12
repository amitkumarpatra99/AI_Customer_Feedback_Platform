import { PrismaClient, Role, Sentiment, Status } from "@prisma/client";

const prisma = new PrismaClient();

const mockContents = [
  // Support Tickets
  { content: "Onboarding took forever — I couldn't figure out how to invite my team.", channel: "Support ticket", sentiment: Sentiment.NEG, score: -0.6 },
  { content: "Billing page keeps timing out when I try to download an invoice.", channel: "Support ticket", sentiment: Sentiment.NEG, score: -0.7 },
  { content: "How do I change my workspace password? The settings page isn't clear.", channel: "Support ticket", sentiment: Sentiment.NEU, score: 0.0 },
  { content: "The CSV upload failed with a server error, no explanation provided.", channel: "Support ticket", sentiment: Sentiment.NEG, score: -0.5 },
  { content: "Is there a way to export analytics charts to PNG or PDF format?", channel: "Support ticket", sentiment: Sentiment.NEU, score: 0.1 },

  // App Store Reviews
  { content: "The new dashboard is gorgeous and finally fast. Huge improvement.", channel: "App store review", sentiment: Sentiment.POS, score: 0.9 },
  { content: "UI glitches on mobile, elements overlap and buttons are unclickable.", channel: "App store review", sentiment: Sentiment.NEG, score: -0.4 },
  { content: "Simple, easy to use, and saves our team hours of review triage every week.", channel: "App store review", sentiment: Sentiment.POS, score: 0.8 },
  { content: "Recent update broke the notification setting toggle.", channel: "App store review", sentiment: Sentiment.NEG, score: -0.3 },

  // NPS Surveys
  { content: "It does the job, but the mobile experience needs work.", channel: "NPS survey", sentiment: Sentiment.NEU, score: 0.1 },
  { content: "Incredible tool. Having Claude classify our support tickets is a lifesaver.", channel: "NPS survey", sentiment: Sentiment.POS, score: 0.9 },
  { content: "Too expensive for small teams with less than 50 feedback items a month.", channel: "NPS survey", sentiment: Sentiment.NEU, score: -0.2 },
  { content: "Great support, helped us resolve our SSO configuration issue in minutes.", channel: "NPS survey", sentiment: Sentiment.POS, score: 0.8 },

  // Sales Call Notes
  { content: "Prospect wants SSO before they'll sign — third time this month.", channel: "Sales call note", sentiment: Sentiment.NEU, score: -0.1 },
  { content: "Customer loved the theme trends analysis but requested Slack integration.", channel: "Sales call note", sentiment: Sentiment.POS, score: 0.7 },
  { content: "Client is migrating away because they need real-time collaboration tools.", channel: "Sales call note", sentiment: Sentiment.NEG, score: -0.6 },
  { content: "Feedback from pilot: UI loads slightly slow for users outside the US.", channel: "Sales call note", sentiment: Sentiment.NEU, score: -0.2 },

  // Community Posts
  { content: "Love the new export feature, saved me an hour today.", channel: "Community post", sentiment: Sentiment.POS, score: 0.9 },
  { content: "Has anyone figured out how to filter reports by specific date ranges?", channel: "Community post", sentiment: Sentiment.NEU, score: 0.0 },
  { content: "Classify on ingest has been working perfectly for us. Kudos to the team!", channel: "Community post", sentiment: Sentiment.POS, score: 0.8 },
  { content: "Is anyone else experiencing slow loading times on the Trends tab?", channel: "Community post", sentiment: Sentiment.NEG, score: -0.3 }
];

async function main() {
  console.log("Seeding database...");

  // 1. Clean database
  await prisma.feedbackTheme.deleteMany();
  await prisma.embedding.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  // 2. Create demo Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme Corp"
    }
  });

  // 3. Create demo Users
  const admin = await prisma.user.create({
    data: {
      name: "Alice Admin",
      email: "admin@loop.com",
      passwordHash: "Password123", // Default text check for stub, will be hashed in Week 1 Day 3
      role: Role.ADMIN,
      workspaceId: workspace.id
    }
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Bob Analyst",
      email: "analyst@loop.com",
      passwordHash: "Password123",
      role: Role.ANALYST,
      workspaceId: workspace.id
    }
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Charlie Viewer",
      email: "viewer@loop.com",
      passwordHash: "Password123",
      role: Role.VIEWER,
      workspaceId: workspace.id
    }
  });

  // 4. Create Themes
  const themeBilling = await prisma.theme.create({
    data: { name: "Billing & Invoices", description: "Pricing, bills, and invoice downloads", color: "#ef4444", workspaceId: workspace.id }
  });

  const themeOnboarding = await prisma.theme.create({
    data: { name: "Onboarding & Signup", description: "First-run experience and onboarding flows", color: "#3b82f6", workspaceId: workspace.id }
  });

  const themePerformance = await prisma.theme.create({
    data: { name: "Performance & Latency", description: "Dashboard speed and response times", color: "#10b981", workspaceId: workspace.id }
  });

  const themeBugs = await prisma.theme.create({
    data: { name: "Bugs & UI Issues", description: "Visual glitches and unexpected crashes", color: "#f59e0b", workspaceId: workspace.id }
  });

  const themeFeatureRequests = await prisma.theme.create({
    data: { name: "Feature Requests", description: "Slack integration, PDF exports, and SSO requests", color: "#8b5cf6", workspaceId: workspace.id }
  });

  const themes = [themeBilling, themeOnboarding, themePerformance, themeBugs, themeFeatureRequests];

  // 5. Generate 120+ Feedback items
  console.log("Generating 120+ feedback items...");
  const feedbackData: any[] = [];
  
  for (let i = 0; i < 125; i++) {
    const template = mockContents[i % mockContents.length];
    
    // Distribute statuses
    let status = Status.NEW;
    if (i % 3 === 1) status = Status.REVIEWED;
    if (i % 3 === 2) status = Status.ACTIONED;

    // Distribute date range over last 30 days
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - (i % 30));

    feedbackData.push({
      content: `${template.content} (Ref: #${i + 1})`,
      channel: template.channel,
      sentiment: template.sentiment,
      sentimentScore: template.score,
      status: status,
      workspaceId: workspace.id,
      createdAt: createdDate
    });
  }

  // Create feedback items in bulk/sequence
  for (let idx = 0; idx < feedbackData.length; idx++) {
    const fb = await prisma.feedback.create({
      data: feedbackData[idx]
    });

    // Randomly link 1-2 themes to each feedback
    const themeCount = (idx % 2) + 1; // 1 or 2 themes
    const selectedThemes = [...themes].sort(() => 0.5 - Math.random()).slice(0, themeCount);

    for (const t of selectedThemes) {
      await prisma.feedbackTheme.create({
        data: {
          feedbackId: fb.id,
          themeId: t.id,
          confidence: Math.random() * 0.4 + 0.6 // 0.6 to 1.0
        }
      });
    }

    // Seed mock embeddings
    await prisma.embedding.create({
      data: {
        feedbackId: fb.id,
        vector: Array.from({ length: 1536 }, () => Math.random() - 0.5)
      }
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
