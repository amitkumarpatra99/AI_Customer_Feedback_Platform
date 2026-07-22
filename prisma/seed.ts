// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { Channel, Sentiment, Status, Role } from '../types';

const prisma = new PrismaClient();

const feedbackTemplates = [
  { content: "Onboarding took forever — I couldn’t figure out how to invite my team.", channel: Channel.SUPPORT_TICKET, theme: "Onboarding" },
  { content: "The new dashboard is gorgeous and finally fast. Huge improvement.", channel: Channel.APP_STORE, theme: "UI/UX" },
  { content: "It does the job, but the mobile experience needs work.", channel: Channel.NPS_SURVEY, theme: "Performance" },
  { content: "Prospect wants SSO before they’ll sign — third time this month.", channel: Channel.SALES_CALL, theme: "Feature Request" },
  { content: "Love the new export feature, saved me an hour today.", channel: Channel.COMMUNITY, theme: "Feature Request" },
  { content: "Billing page keeps timing out when I try to download an invoice.", channel: Channel.SUPPORT_TICKET, theme: "Billing" },
  { content: "Customer support was very helpful and resolved my issue quickly.", channel: Channel.SUPPORT_TICKET, theme: "Support" },
  { content: "App crashes every time I try to upload a large file.", channel: Channel.APP_STORE, theme: "Performance" },
  { content: "Would love to see a dark mode option in the settings.", channel: Channel.NPS_SURVEY, theme: "UI/UX" },
  { content: "The pricing is a bit steep for small teams like ours.", channel: Channel.SALES_CALL, theme: "Billing" },
];

const sentiments: Sentiment[] = [Sentiment.POSITIVE, Sentiment.NEUTRAL, Sentiment.NEGATIVE];
const statuses: Status[] = [Status.NEW, Status.REVIEWED, Status.ACTIONED];

async function main() {
  console.log('🌱 Starting seed process...');

  // 1. Clean existing data
  await prisma.feedbackTheme.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();
  console.log('🧹 Cleared existing data.');

  // 2. Create Workspace
  const workspace = await prisma.workspace.create({
    data: { name: 'Acme Corp Demo' },
  });
  console.log(`✅ Created Workspace: ${workspace.name}`);

  // 3. Create 3 Users
  await prisma.user.create({
    data: { name: 'Rahul Admin', email: 'admin@acme.com', passwordHash: 'hashed_password_123', role: Role.ADMIN, workspaceId: workspace.id },
  });
  await prisma.user.create({
    data: { name: 'Priya Analyst', email: 'analyst@acme.com', passwordHash: 'hashed_password_123', role: Role.ANALYST, workspaceId: workspace.id },
  });
  await prisma.user.create({
    data: { name: 'Amit Viewer', email: 'viewer@acme.com', passwordHash: 'hashed_password_123', role: Role.VIEWER, workspaceId: workspace.id },
  });
  console.log('✅ Created 3 Users (Admin, Analyst, Viewer)');

  // 4. Create Themes
  const themeNames = ['Billing', 'Onboarding', 'UI/UX', 'Performance', 'Feature Request', 'Support'];
  const createdThemes: Record<string, any> = {};
  
  for (const name of themeNames) {
    const theme = await prisma.theme.create({
      data: { name, description: `Feedback related to ${name}`, color: '#6366f1', workspaceId: workspace.id },
    });
    createdThemes[name] = theme;
  }
  console.log(`✅ Created ${themeNames.length} Themes`);

  // 5. Prepare 125 Feedbacks Data
  const feedbacksToCreate = [];
  for (let i = 0; i < 125; i++) {
    const template = feedbackTemplates[i % feedbackTemplates.length];
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomScore = randomSentiment === Sentiment.POSITIVE ? 0.8 : randomSentiment === Sentiment.NEGATIVE ? -0.7 : 0.0;
    
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    feedbacksToCreate.push({
      content: template.content + ` (Variation #${i})`,
      channel: template.channel,
      sentiment: randomSentiment,
      sentimentScore: randomScore,
      status: randomStatus,
      workspaceId: workspace.id,
      createdAt: createdAt,
      themes: {
        create: {
          themeId: createdThemes[template.theme].id,
          confidence: 0.95,
        },
      },
    });
  }

  // 🛠️ FIX: Insert in batches of 10 to prevent Neon connection drops/timeouts
  console.log('⏳ Inserting 125 feedbacks in safe batches...');
  const batchSize = 10;
  for (let i = 0; i < feedbacksToCreate.length; i += batchSize) {
    const batch = feedbacksToCreate.slice(i, i + batchSize);
    await Promise.all(batch.map(data => prisma.feedback.create({ data })));
    console.log(`   ✅ Inserted ${Math.min(i + batchSize, feedbacksToCreate.length)} / ${feedbacksToCreate.length} feedbacks`);
  }

  console.log('🎉 Seed process completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });