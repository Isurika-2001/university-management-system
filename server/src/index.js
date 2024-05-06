// script to start the server
require("dotenv").config();
const bodyParser = require("body-parser");
const express = require('express');
const cors = require("cors");

// project imports
const connectToDatabase = require("../database");

// Routes
const studentRoutes = require('./routes/student');
const courseRoutes = require('./routes/course');
const batchRoutes = require('./routes/batch');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectToDatabase();

// Routes
app.use('/api', studentRoutes);
app.use('/api', courseRoutes);
app.use('/api', batchRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
