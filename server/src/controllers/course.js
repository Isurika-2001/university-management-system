// Import any necessary dependencies
const Course = require("../models/course");

// Function to get all courses
async function getAllCourses(req, res) {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createCourse(req, res) {
  const { name, description } = req.body;

  // Check if the course name is already taken
  const isDuplicate = await checkDuplicateCourse(name);

  if (isDuplicate) {
    return res.status(403).json({ error: "Course name is already taken" });
  }

  const course = new Course({
    name,
    description,
  });

  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// seperate function to check if the name is already taken
async function checkDuplicateCourse(name) {
  const course = await Course.findOne
  ({ name });
  return course ? true : false;
}

// Export the functions
module.exports = {
  getAllCourses,
  createCourse,
};
