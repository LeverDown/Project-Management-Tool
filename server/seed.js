import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './src/models/User.js';
import Project from './src/models/Project.js';
import Task from './src/models/Task.js';
import Comment from './src/models/Comment.js';

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is missing from environment');
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding...');

    // Wipe all collections
    await Comment.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data (Users, Projects, Tasks, Comments).');

    // 1. Create 2 demo users (using User.create to trigger password hash hook)
    const alex = await User.create({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'Password123!'
    });

    const priya = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'Password123!'
    });

    console.log('Created demo users:');
    console.log('  - alex@example.com / Password123!');
    console.log('  - priya@example.com / Password123!');

    // 2. Create 2 projects
    const websiteProject = await Project.create({
      name: 'Website Redesign',
      description: 'Comprehensive overhaul of the marketing site, design system, and checkout funnel.',
      owner: alex._id,
      members: [alex._id, priya._id]
    });

    const mobileProject = await Project.create({
      name: 'Mobile App Launch',
      description: 'Cross-platform mobile application development for iOS and Android release.',
      owner: priya._id,
      members: [priya._id, alex._id]
    });

    console.log('Created demo projects:');
    console.log(`  - ${websiteProject.name} (Owner: Alex)`);
    console.log(`  - ${mobileProject.name} (Owner: Priya)`);

    // Helper to calculate relative dates
    const now = new Date();
    const relDate = (daysOffset) => {
      const d = new Date(now);
      d.setDate(d.getDate() + daysOffset);
      return d;
    };

    // 3. Create 15 realistic tasks across both projects
    // Project 1 tasks
    const p1Tasks = [
      {
        title: 'Brand Guidelines & Design Tokens',
        description: 'Define foundational typography, color palette, and spacing scale for Tailwind.',
        project: websiteProject._id,
        status: 'Done',
        priority: 'High',
        assignee: alex._id,
        startDate: relDate(-18),
        dueDate: relDate(-10),
        order: 0,
        createdBy: alex._id
      },
      {
        title: 'Hero Component & Navigation Menu',
        description: 'Implement responsive navbar and hero section with CTA buttons.',
        project: websiteProject._id,
        status: 'Done',
        priority: 'Medium',
        assignee: priya._id,
        startDate: relDate(-14),
        dueDate: relDate(-8),
        order: 1,
        createdBy: alex._id
      },
      {
        title: 'Pricing Page Interactive Calculator',
        description: 'Build tier selector with monthly and annual billing toggles.',
        project: websiteProject._id,
        status: 'In Progress',
        priority: 'High',
        assignee: alex._id,
        startDate: relDate(-6),
        dueDate: relDate(4),
        order: 0,
        createdBy: alex._id
      },
      {
        title: 'Customer Testimonial Carousel',
        description: 'Integrate carousel slider featuring enterprise customer case studies.',
        project: websiteProject._id,
        status: 'In Progress',
        priority: 'Medium',
        assignee: priya._id,
        startDate: relDate(-4),
        dueDate: relDate(6),
        order: 1,
        createdBy: alex._id
      },
      {
        title: 'SEO Metadata & OpenGraph Tags Audit',
        description: 'Review title tags, description snippets, and social preview cards.',
        project: websiteProject._id,
        status: 'Review',
        priority: 'High',
        assignee: priya._id,
        startDate: relDate(-10),
        dueDate: relDate(-2), // OVERDUE (DueDate in past, status !== Done)
        order: 0,
        createdBy: alex._id
      },
      {
        title: 'Accessibility (WCAG 2.1 AA) Compliance Audit',
        description: 'Screen reader testing and keyboard navigation contrast checks.',
        project: websiteProject._id,
        status: 'Todo',
        priority: 'High',
        assignee: alex._id,
        startDate: relDate(-12),
        dueDate: relDate(-4), // OVERDUE
        order: 0,
        createdBy: alex._id
      },
      {
        title: 'Setup Google Analytics 4 & Conversion Events',
        description: 'Configure event tracking for signups, demo requests, and newsletter opt-ins.',
        project: websiteProject._id,
        status: 'Todo',
        priority: 'Medium',
        assignee: priya._id,
        startDate: relDate(-8),
        dueDate: relDate(-3), // OVERDUE
        order: 1,
        createdBy: alex._id
      },
      {
        title: 'Lighthouse Performance Optimization',
        description: 'Aim for 95+ score on mobile and desktop performance benchmarks.',
        project: websiteProject._id,
        status: 'Todo',
        priority: 'Low',
        assignee: alex._id,
        startDate: relDate(1),
        dueDate: relDate(10),
        order: 2,
        createdBy: alex._id
      },
      {
        title: 'User Feedback Backlog Grooming',
        description: 'Review initial feedback from beta testers and group into sprint candidates.',
        project: websiteProject._id,
        status: 'Todo',
        priority: 'Low',
        assignee: null,
        startDate: null,
        dueDate: null,
        order: 3,
        createdBy: alex._id
      }
    ];

    // Project 2 tasks
    const p2Tasks = [
      {
        title: 'Authentication & Biometric Login',
        description: 'Implement FaceID and Fingerprint authentication with JWT token refresh.',
        project: mobileProject._id,
        status: 'Done',
        priority: 'High',
        assignee: priya._id,
        startDate: relDate(-20),
        dueDate: relDate(-12),
        order: 0,
        createdBy: priya._id
      },
      {
        title: 'Push Notification Integration',
        description: 'Setup APNS and FCM notification channels for urgent updates.',
        project: mobileProject._id,
        status: 'In Progress',
        priority: 'High',
        assignee: priya._id,
        startDate: relDate(-9),
        dueDate: relDate(-1), // OVERDUE
        order: 0,
        createdBy: priya._id
      },
      {
        title: 'Offline Data Sync & Conflict Resolution',
        description: 'Implement SQLite local store with optimistic delta sync.',
        project: mobileProject._id,
        status: 'In Progress',
        priority: 'Medium',
        assignee: alex._id,
        startDate: relDate(-5),
        dueDate: relDate(5),
        order: 1,
        createdBy: priya._id
      },
      {
        title: 'In-App Purchase & Subscription Tiers',
        description: 'Integrate App Store and Google Play billing SDKs.',
        project: mobileProject._id,
        status: 'Review',
        priority: 'High',
        assignee: priya._id,
        startDate: relDate(-7),
        dueDate: relDate(3),
        order: 0,
        createdBy: priya._id
      },
      {
        title: 'App Store Screenshots & Marketing Copy',
        description: 'Prepare localized preview images and release notes for version 1.0.',
        project: mobileProject._id,
        status: 'Todo',
        priority: 'Medium',
        assignee: alex._id,
        startDate: relDate(2),
        dueDate: relDate(9),
        order: 0,
        createdBy: priya._id
      },
      {
        title: 'Crashlytics & Performance Monitoring',
        description: 'Ensure crash telemetry and network latency breadcrumbs are logged.',
        project: mobileProject._id,
        status: 'Todo',
        priority: 'Low',
        assignee: null,
        startDate: null,
        dueDate: null,
        order: 1,
        createdBy: priya._id
      }
    ];

    const createdTasks = await Task.create([...p1Tasks, ...p2Tasks]);
    console.log(`Created ${createdTasks.length} realistic tasks across both projects.`);

    // 4. Create 12 realistic comments across tasks
    const taskMap = {};
    createdTasks.forEach((t) => {
      taskMap[t.title] = t._id;
    });

    const commentsData = [
      {
        task: taskMap['Accessibility (WCAG 2.1 AA) Compliance Audit'],
        author: alex._id,
        text: 'Initial axe-core scan revealed 4 contrast issues on dark buttons. Fixing those first.'
      },
      {
        task: taskMap['Accessibility (WCAG 2.1 AA) Compliance Audit'],
        author: priya._id,
        text: 'Let me know if you need help testing screen readers on macOS VoiceOver.'
      },
      {
        task: taskMap['SEO Metadata & OpenGraph Tags Audit'],
        author: priya._id,
        text: 'Twitter cards and OG image tags are updated in the staging environment.'
      },
      {
        task: taskMap['SEO Metadata & OpenGraph Tags Audit'],
        author: alex._id,
        text: 'Verified on Twitter card validator. Looks crisp!'
      },
      {
        task: taskMap['Pricing Page Interactive Calculator'],
        author: alex._id,
        text: 'Working on currency conversion logic and annual discount percentage calculation.'
      },
      {
        task: taskMap['Pricing Page Interactive Calculator'],
        author: priya._id,
        text: 'Please ensure we have smooth transition animations when toggling annual billing.'
      },
      {
        task: taskMap['Pricing Page Interactive Calculator'],
        author: alex._id,
        text: 'Added spring transition with Tailwind transition classes. Feels great.'
      },
      {
        task: taskMap['Setup Google Analytics 4 & Conversion Events'],
        author: priya._id,
        text: 'Measurement ID has been set in our environment configuration.'
      },
      {
        task: taskMap['Setup Google Analytics 4 & Conversion Events'],
        author: alex._id,
        text: 'Testing custom dimensions in DebugView now.'
      },
      {
        task: taskMap['Push Notification Integration'],
        author: priya._id,
        text: 'FCM server key is configured in backend secrets.'
      },
      {
        task: taskMap['Push Notification Integration'],
        author: alex._id,
        text: 'Receiving test notifications on Android 14 emulator successfully.'
      },
      {
        task: taskMap['Offline Data Sync & Conflict Resolution'],
        author: alex._id,
        text: 'Last-write-wins strategy implemented as fallback for non-destructive merges.'
      }
    ];

    const createdComments = await Comment.create(commentsData);
    console.log(`Created ${createdComments.length} comments.`);

    console.log('\n================ SEED SUMMARY ================');
    console.log('Database seeded successfully!');
    console.log('Demo Credentials:');
    console.log('  Alex Johnson : alex@example.com / Password123!');
    console.log('  Priya Sharma : priya@example.com / Password123!');
    console.log(`Projects: ${2}`);
    console.log(`Tasks: ${createdTasks.length}`);
    console.log(`Comments: ${createdComments.length}`);
    console.log('==============================================\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Seed script failed:', error);
    process.exit(1);
  }
};

seedDatabase();
