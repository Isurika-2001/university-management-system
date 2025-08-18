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
  const { 
    name, 
    code, 
    description,
    // New fields
    prerequisites,
    courseCredits,
    courseDuration,
    weekdayBatch,
    weekendBatch,
  } = req.body;

  try {
    // Check if the course name is already taken
    const isDuplicate = await checkDuplicateCourse(name);
    
    // Check if the course code is already taken
    const isDuplicateCode = await checkDuplicateCourseCode(code);

    if (isDuplicate) {
      return res.status(403).json({
        success: false,
        message: "Course name is already taken",
      });
    }

    if (isDuplicateCode) {
      return res.status(403).json({
        success: false,
        message: "Course code is already taken",
      });
    }

    const course = new Course({ 
      name, 
      code, 
      description,
      // New fields
      prerequisites,
      courseCredits,
      courseDuration,
      weekdayBatch,
      weekendBatch,
    });
    const newCourse = await course.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error(error); // log for debugging

    res.status(500).json({
      success: false,
      message: "Error creating course",
      error: error.message, // optional detailed error
    });
  }
}

async function editCourse(req, res) {
  const { id } = req.params;
  const { 
    name, 
    code, 
    description,
    // New fields
    prerequisites,
    courseCredits,
    courseDuration,
    weekdayBatch,
    weekendBatch,
  } = req.body;

  try {
    const existingCourse = await Course.findById(id);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check for name duplication (if changed)
    if (name && name !== existingCourse.name) {
      const nameTaken = await Course.findOne({ name });
      if (nameTaken) {
        return res.status(403).json({
          success: false,
          message: "Course name is already taken",
        });
      }
    }

    // Check for code duplication (if changed)
    if (code && code !== existingCourse.code) {
      const codeTaken = await Course.findOne({ code });
      if (codeTaken) {
        return res.status(403).json({
          success: false,
          message: "Course code is already taken",
        });
      }
    }

    existingCourse.name = name || existingCourse.name;
    existingCourse.code = code || existingCourse.code;
    existingCourse.description = description || existingCourse.description;
    // Update new fields
    existingCourse.prerequisites = prerequisites || existingCourse.prerequisites;
    existingCourse.courseCredits = courseCredits || existingCourse.courseCredits;
    existingCourse.courseDuration = courseDuration || existingCourse.courseDuration;
    existingCourse.weekdayBatch = weekdayBatch !== undefined ? weekdayBatch : existingCourse.weekdayBatch;
    existingCourse.weekendBatch = weekendBatch !== undefined ? weekendBatch : existingCourse.weekendBatch;

    const updatedCourse = await existingCourse.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating course",
      error: error.message,
    });
  }
}

async function deleteCourse(req, res) {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting course",
      error: error.message,
    });
  }
}

async function getCourseById(req, res) {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: course,
    });
  } catch (error) {
    console.error("Error retrieving course:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving course",
      error: error.message,
    });
  }
}

// seperate function to check if the name is already taken
async function checkDuplicateCourse(name) {
  const course = await Course.findOne
  ({ name });
  return course ? true : false;
}

// seperate function to check if the name is already taken
async function checkDuplicateCourseCode(code) {
  const course = await Course.findOne
  ({ code });
  return course ? true : false;
}

// Export the functions
module.exports = {
  getAllCourses,
  createCourse,
  editCourse,
  getCourseById,
  deleteCourse
};
