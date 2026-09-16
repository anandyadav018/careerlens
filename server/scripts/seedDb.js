const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Job = require('../src/models/Job');

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Job.deleteMany({});

    console.log('Seeding Demo User...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = await User.create({
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@careerpilot.com',
      password: hashedPassword,
      isEmailVerified: true,
      preferences: {
        desiredRoles: ['Frontend Developer', 'Full Stack Developer'],
        desiredLocations: ['Remote', 'New York, NY'],
      },
    });

    console.log('Seeding Sample Jobs...');
    await Job.insertMany([
      {
        externalId: 'sample-1',
        source: 'linkedin',
        sourceUrl: 'https://linkedin.com/jobs/sample-1',
        title: 'Senior Frontend Developer',
        company: { name: 'TechCorp' },
        location: { city: 'New York', state: 'NY', isRemote: true },
        description: 'Looking for an experienced React developer to lead our frontend team.',
        requirements: ['React', 'Node.js', '5+ years experience'],
        skills: ['react', 'node.js', 'javascript', 'typescript'],
        jobType: 'full-time',
        experienceLevel: 'senior',
        postedAt: new Date(),
        isActive: true,
      },
      {
        externalId: 'sample-2',
        source: 'indeed',
        sourceUrl: 'https://indeed.com/jobs/sample-2',
        title: 'Full Stack Engineer',
        company: { name: 'StartupInc' },
        location: { city: 'San Francisco', state: 'CA', isRemote: false },
        description: 'Build end-to-end features using the MERN stack.',
        requirements: ['MongoDB', 'Express', 'React', 'Node.js'],
        skills: ['mongodb', 'express', 'react', 'node.js'],
        jobType: 'full-time',
        experienceLevel: 'mid',
        postedAt: new Date(Date.now() - 86400000), // 1 day ago
        isActive: true,
      }
    ]);

    console.log('Database seeded successfully!');
    console.log('Login with: demo@careerpilot.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
