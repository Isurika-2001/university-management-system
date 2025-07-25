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
    await mongoose.connect(process.env.MONGO_URI, {
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

    // Create default admin user if not exists
    const adminEmail = "demo-admin@mail.com";
    const adminPassword = "demo-admin-mail";
    const adminUserTypeName = "admin";

    // Check if user type 'admin' exists
    let adminUserType = await User_type.findOne({ name: adminUserTypeName });
    if (!adminUserType) {
      // Create 'admin' user_type if it does not exist
      adminUserType = await User_type.create({ name: adminUserTypeName });
      console.log(`User type '${adminUserTypeName}' created`);
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const newAdmin = await User.create({
        name: "Demo Admin",
        email: adminEmail,
        password: hashedPassword,
        user_type: adminUserType._id,
      });

      console.log("Default admin user created:", newAdmin.email);
    } else {
      console.log("Default admin user already exists:", existingAdmin.email);
    }

  } catch (error) {
    console.error("Error creating default data:", error.message);
  }
}

// Run this script
connectToDatabase();
