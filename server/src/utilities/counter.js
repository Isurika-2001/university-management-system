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

module.exports = {
  getNextSequenceValue,
};
