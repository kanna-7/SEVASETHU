import dotenv from 'dotenv';
import mongoose from 'mongoose';
import MedicalCamp from './models/MedicalCamp.js';
import Home from './models/Home.js';
import User from './models/User.js';

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
const admin = await User.findOne({ role: { $in: ['super_admin', 'admin'] } });
const homes = await Home.find({ status: 'approved' }).limit(2);
const camps = [
  { title: 'Free Senior Health Check-up Camp', hospitalName: 'Apollo Hospitals', date: new Date('2026-08-04'), location: { address: 'Community Health Centre', city: 'Hyderabad' }, doctors: ['Dr. Kavitha Rao'], specializations: ['General Medicine', 'Geriatrics'] },
  { title: 'Child Wellness & Vaccination Camp', hospitalName: 'Government Hospital', date: new Date('2026-08-18'), location: { address: 'Community Hall', city: 'Vijayawada' }, doctors: ['Dr. Suresh Kumar'], specializations: ['Paediatrics', 'Preventive Care'] },
];
for (const [index, camp] of camps.entries()) {
  await MedicalCamp.findOneAndUpdate({ title: camp.title }, { ...camp, homes: homes[index] ? [homes[index]._id] : [], status: 'approved', approvedBy: admin?._id, approvedAt: new Date() }, { upsert: true, new: true });
}
console.log('Two demo medical camps are ready.');
await mongoose.disconnect();
