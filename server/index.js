require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");

// project imports
const connectToDatabase = require("./database");

// Routes
const routes = require('./src/routes/index');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Replace this with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add the HTTP methods you want to allow
  allowedHeaders: ['Content-Type', 'Authorization'], // Add the headers you want to allow
}));

const PORT = process.env.PORT || 5000;

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
app.use("/api", routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
