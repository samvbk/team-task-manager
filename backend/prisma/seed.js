const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskflow.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@taskflow.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create member user
  const memberPassword = await bcrypt.hash('Member@123', 10);
  const member = await prisma.user.upsert({
    where: { email: 'member@taskflow.com' },
    update: {},
    create: {
      name: 'Jane Member',
      email: 'member@taskflow.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  // Create demo project
  const project = await prisma.project.upsert({
    where: { id: 'demo-project-001' },
    update: {},
    create: {
      id: 'demo-project-001',
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design and improved UX.',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Create demo tasks
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.task.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'task-001',
        title: 'Design new homepage mockup',
        description: 'Create Figma mockups for the new homepage design.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: yesterday,
        projectId: project.id,
        assigneeId: member.id,
        createdById: admin.id,
      },
      {
        id: 'task-002',
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: tomorrow,
        projectId: project.id,
        assigneeId: admin.id,
        createdById: admin.id,
      },
      {
        id: 'task-003',
        title: 'Write API documentation',
        description: 'Document all REST API endpoints using Swagger/OpenAPI.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: nextWeek,
        projectId: project.id,
        assigneeId: member.id,
        createdById: admin.id,
      },
      {
        id: 'task-004',
        title: 'Fix mobile navigation bug',
        description: 'Hamburger menu not closing after item selection on iOS.',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: yesterday, // overdue!
        projectId: project.id,
        assigneeId: member.id,
        createdById: admin.id,
      },
      {
        id: 'task-005',
        title: 'Add dark mode support',
        description: 'Implement CSS variable-based dark mode toggle.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: nextWeek,
        projectId: project.id,
        assigneeId: null,
        createdById: admin.id,
      },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('👤 Admin:  admin@taskflow.com / Admin@123');
  console.log('👤 Member: member@taskflow.com / Member@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
