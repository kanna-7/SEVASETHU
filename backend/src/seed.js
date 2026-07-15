import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Home from './models/Home.js';
import Inventory from './models/Inventory.js';
import MedicalCamp from './models/MedicalCamp.js';
import { ROLES } from './config/roles.js';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sevasethu');
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Home.deleteMany({});
  await Inventory.deleteMany({});
  await MedicalCamp.deleteMany({});

  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@sevasethu.org',
    password: 'admin123',
    role: ROLES.SUPER_ADMIN,
    phone: '9876543210',
  });

  const home = await Home.create({
    name: 'Ananda Orphanage',
    type: 'orphanage',
    description: 'A caring home for orphaned children providing education, healthcare, and emotional support.',
    address: { street: '12 Temple Road', city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
    phone: '9876543211',
    email: 'ananda@example.org',
    residentCount: 45,
    capacity: 60,
    conditionStatus: 'good',
    status: 'approved',
    isVerified: true,
    verifiedAt: new Date(),
    verifiedBy: admin._id,
    contactPerson: { name: 'Smt. Lakshmi', phone: '9876543211', designation: 'Director' },
    images: {
      building: ['/api/uploads/1784017184410-349127804-park_bg_v2.png'],
      gallery: ['/api/uploads/1784017184410-349127804-park_bg_v2.png'],
    },
    temporaryPassword: 'manager123',
    currentNeeds: [
      { item: 'Rice', quantity: 50, priority: 'high' },
      { item: 'School Books', quantity: 30, priority: 'medium' },
    ],
    monthlyExpenses: [
      { month: 'June', year: 2026, amount: 85000, breakdown: [{ category: 'Food', amount: 40000 }, { category: 'Education', amount: 25000 }] },
    ],
  });

  const manager = await User.create({
    name: 'Smt. Lakshmi',
    email: 'manager@ananda.org',
    password: 'manager123',
    role: ROLES.HOME_MANAGER,
    phone: '9876543211',
    home: home._id,
  });

  home.manager = manager._id;
  await home.save();

  const oldAgeHome = await Home.create({
    name: 'Seva Old Age Home',
    type: 'old_age_home',
    description: 'Providing dignified care and comfort for elderly citizens.',
    address: { street: '45 Gandhi Nagar', city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520001' },
    phone: '9876543212',
    email: 'seva@example.org',
    residentCount: 32,
    capacity: 40,
    conditionStatus: 'needs_support',
    status: 'approved',
    isVerified: true,
    verifiedAt: new Date(),
    verifiedBy: admin._id,
    contactPerson: { name: 'Mr. Rao', phone: '9876543212', designation: 'Manager' },
    images: {
      building: ['/api/uploads/1784017184410-349127804-park_bg_v2.png'],
      gallery: ['/api/uploads/1784017184410-349127804-park_bg_v2.png'],
    },
    currentNeeds: [
      { item: 'Blankets', quantity: 20, priority: 'high' },
      { item: 'Medicines', quantity: 10, priority: 'high' },
    ],
  });

  const defaultItems = ['Rice', 'Dal', 'Oil', 'Medicines', 'Blankets', 'Books'];
  for (const item of defaultItems) {
    await Inventory.create({
      home: home._id,
      item,
      category: item === 'Medicines' ? 'medicine' : item === 'Blankets' || item === 'Books' ? (item === 'Books' ? 'education' : 'clothing') : 'food',
      currentStock: Math.floor(Math.random() * 50) + 5,
      minimumStock: 10,
      unit: item === 'Medicines' ? 'units' : item === 'Books' ? 'pieces' : 'kg',
    });
  }

  await MedicalCamp.insertMany([
    { title: 'Free Senior Health Check-up Camp', description: 'General health screening, BP and diabetes checks for elderly residents.', hospitalName: 'Apollo Hospitals', date: new Date('2026-08-04'), location: { address: 'Ananda Orphanage Campus', city: 'Hyderabad' }, homes: [home._id], doctors: ['Dr. Kavitha Rao'], specializations: ['General Medicine', 'Geriatrics'], status: 'approved', approvedBy: admin._id, approvedAt: new Date() },
    { title: 'Child Wellness & Vaccination Camp', description: 'Paediatric consultations and routine vaccination awareness.', hospitalName: 'Government Hospital', date: new Date('2026-08-18'), location: { address: 'Seva Old Age Home Community Hall', city: 'Vijayawada' }, homes: [oldAgeHome._id], doctors: ['Dr. Suresh Kumar'], specializations: ['Paediatrics', 'Preventive Care'], status: 'approved', approvedBy: admin._id, approvedAt: new Date() },
  ]);

  console.log('\nSeed data created:');
  console.log('  Admin:   admin@sevasethu.org / admin123');
  console.log('  Manager: manager@ananda.org / manager123');
  console.log(`  Homes:   ${home.name}, ${oldAgeHome.name}`);

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
