const Counter = require("../models/counter");

async function getNextSequenceValue(sequenceName) {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  let prefix = "";

  if (sequenceName === "unique_id_sequence") {
    prefix = "ST_REG";
  } else if (sequenceName === "course_id_sequence") {
    prefix = "CS_REG";
  }

  return `${prefix}${counter.sequence_value}`;
}

/**
 * Get the next per-course numeric sequence and format the enrollment number.
 * Format: `${batchName}${courseCode}${NNN}` where NNN is a 3-digit zero-padded counter per course.
 * The counter document key is `${courseCode}_sequence`.
 */
async function getAndFormatCourseEnrollmentNumber(courseCode, batchName) {
  if (!courseCode || !batchName) {
    throw new Error("courseCode and batchName are required to generate enrollment number");
  }

  const counter = await Counter.findOneAndUpdate(
    { _id: `${courseCode}_sequence` },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  const padded = String(counter.sequence_value).padStart(3, '0');
  return `${batchName}${courseCode}${padded}`;
}

module.exports = {
  getNextSequenceValue,
  getAndFormatCourseEnrollmentNumber,
};
