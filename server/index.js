// script to start the server
require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");

// project imports
const connectToDatabase = require("./database");

// Routes
const studentRoutes = require("./src/routes/student");
const courseRoutes = require("./src/routes/course");
const batchRoutes = require("./src/routes/batch");
const courseRegistrationRoutes = require("./src/routes/course_registration");
const user_typeRoutes = require("./src/routes/user_type");
const userRoutes = require("./src/routes/user");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// default route
app.get("/", (req, res) => {
  res.send("Welcome to the student management system");
});

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectToDatabase();

// Routes
app.use("/api", studentRoutes);
app.use("/api", courseRoutes);
app.use("/api", batchRoutes);
app.use("/api", courseRegistrationRoutes);
app.use("/api", user_typeRoutes);
app.use("/api", userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
