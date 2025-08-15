require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Import your models
const Counter = require("./src/models/counter");
const User = require("./src/models/user");
const User_type = require("./src/models/user_type");

// Connect to DB first
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university-management-system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Call default data creation after connection
    await createDefaultData();

    // Close connection if this is a standalone script
    mongoose.connection.close();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}

async function createDefaultData() {
  try {
    // Initialize counters to 999 if not present
    const counters = ["unique_id_sequence", "course_id_sequence"];

    for (const counterName of counters) {
      const existingCounter = await Counter.findById(counterName);
      if (!existingCounter) {
        await Counter.create({
          _id: counterName,
          sequence_value: 999,
        });
        console.log(`Counter '${counterName}' initialized to 999`);
      } else {
        console.log(`Counter '${counterName}' already exists`);
      }
    }

    // Create default user types
    const userTypes = [
      {
        name: "system_administrator",
        displayName: "System Administrator",
        user: "CRUD",
        student: "CRUD",
        course: "CRUD",
        batch: "CRUD",
        enrollments: "CRUD",
        finance: "CRUD",
        reports: "CRUD",
      },
      {
        name: "academic_administrator",
        displayName: "Academic Administrator",
        user: "R",
        student: "CRUD",
        course: "CRUD",
        batch: "CRUD",
        enrollments: "CRUD",
        finance: "R",
        reports: "R",
      },
      {
        name: "finance_admin",
        displayName: "Finance Administrator",
        user: "R",
        student: "R",
        course: "R",
        batch: "R",
        enrollments: "R",
        finance: "CRUD",
        reports: "R",
      },
      {
        name: "accountant",
        displayName: "Accountant",
        user: "R",
        student: "R",
        course: "R",
        batch: "R",
        enrollments: "R",
        finance: "CRUD",
        reports: "R",
      },
    ];

    for (const userTypeData of userTypes) {
      const existingUserType = await User_type.findOne({ name: userTypeData.name });
      if (!existingUserType) {
        await User_type.create(userTypeData);
        console.log(`User type '${userTypeData.displayName}' created`);
      } else {
        console.log(`User type '${userTypeData.displayName}' already exists`);
      }
    }

    // Create default system administrator user if not exists
    const adminEmail = "demo-admin@mail.com";
    const adminPassword = "demo-admin-mail";

    // Get system administrator user type
    const systemAdminUserType = await User_type.findOne({ name: "system_administrator" });
    if (!systemAdminUserType) {
      console.error("System Administrator user type not found");
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const newAdmin = await User.create({
        name: "Demo System Administrator",
        email: adminEmail,
        password: hashedPassword,
        user_type: systemAdminUserType._id,
      });

      console.log("Default system administrator user created:", newAdmin.email);
    } else {
      console.log("Default system administrator user already exists:", existingAdmin.email);
    }

  } catch (error) {
    console.error("Error creating default data:", error.message);
  }
}

// Run this script
connectToDatabase();
