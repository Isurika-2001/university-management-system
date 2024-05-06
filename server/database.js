require("dotenv").config();
const mongoose = require("mongoose");

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit the process if there's an error
  }
}

module.exports = connectToDatabase;
