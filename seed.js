import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Customer from './models/Customer.js';
import Inventory from './models/Inventory.js';
import Invoice from './models/Invoice.js';
import StockMovement from './models/StockMovement.js';

dotenv.config();

const mockUsers = [
  {
    id: '1',
    email: 'admin@carpetflow.com',
    password: 'password123',
    fullName: 'Admin User',
    role: 'admin',
    location: 'all',
    isActive: true,
  },
  {
    id: '2',
    email: 'dubai@carpetflow.com',
    password: 'password123',
    fullName: 'Dubai Sales Manager',
    role: 'salesperson',
    location: 'dubai',
    isActive: true,
  },
  {
    id: '3',
    email: 'abu-dhabi@carpetflow.com',
    password: 'password123',
    fullName: 'Abu Dhabi Warehouse',
    role: 'warehouse',
    location: 'abu-dhabi',
    isActive: true,
  },
  {
    id: '4',
    email: 'accountant@carpetflow.com',
    password: 'password123',
    fullName: 'Finance Manager',
    role: 'accountant',
    location: 'dubai',
    isActive: true,
  },
];

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Customer.deleteMany();
    await Inventory.deleteMany();
    await Invoice.deleteMany();
    await StockMovement.deleteMany();

    // Insert users
    for (const user of mockUsers) {
      const { id, ...userData } = user;
      await User.create(userData);
    }

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Customer.deleteMany();
    await Inventory.deleteMany();
    await Invoice.deleteMany();
    await StockMovement.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  if (process.argv[2] === '-d') {
    await destroyData();
  } else {
    await importData();
  }
};

run();
