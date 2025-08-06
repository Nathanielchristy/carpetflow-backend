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

const mockCustomers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    address: '123 Main St',
    city: 'Dubai',
    location: 'dubai',
    taxNumber: '12345',
    creditLimit: 10000,
    paymentTerms: 'Net 30',
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '098-765-4321',
    address: '456 Oak Ave',
    city: 'Abu Dhabi',
    location: 'abu-dhabi',
    taxNumber: '67890',
    creditLimit: 15000,
    paymentTerms: 'Net 60',
  },
];

const mockInventory = [
  {
    name: 'Persian Carpet',
    type: 'Hand-knotted',
    color: 'Red',
    size: '8x10',
    material: 'Wool',
    unitPrice: 2500,
    costPrice: 1500,
    stockQuantity: 10,
    minimumStock: 2,
    maximumStock: 20,
    barcode: 'PC1234567890',
    sku: 'PC-RED-8X10',
    location: 'dubai',
    supplier: 'Persian Carpets Co.',
    description: 'A beautiful hand-knotted Persian carpet.',
  },
  {
    name: 'Turkish Kilim',
    type: 'Flatweave',
    color: 'Blue',
    size: '6x9',
    material: 'Cotton',
    unitPrice: 1200,
    costPrice: 700,
    stockQuantity: 15,
    minimumStock: 5,
    maximumStock: 30,
    barcode: 'TK0987654321',
    sku: 'TK-BLUE-6X9',
    location: 'abu-dhabi',
    supplier: 'Kilim Weavers Ltd.',
    description: 'A vibrant Turkish Kilim rug.',
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
    const usersToCreate = mockUsers.map(({ id, ...user }) => user);
    const createdUsers = await User.insertMany(usersToCreate);

    const adminUser = createdUsers.find((user) => user.role === 'admin');
    if (!adminUser) {
      console.error('Admin user not found!');
      process.exit(1);
    }
    const adminUserId = adminUser._id;

    // Insert customers
    const customersToCreate = mockCustomers.map((customer) => ({
      ...customer,
      createdBy: adminUserId,
    }));
    await Customer.insertMany(customersToCreate);
    console.log('Customers Imported!');

    // Insert inventory
    const inventoryToCreate = mockInventory.map((item) => ({
      ...item,
      createdBy: adminUserId,
    }));
    await Inventory.insertMany(inventoryToCreate);
    console.log('Inventory Imported!');

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
