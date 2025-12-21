const mongoose = require('mongoose');
const { PATHWAYS } = require('../config/pathways');

const moduleSchema = new mongoose.Schema({
  pathway: {
    type: Number,
    required: true,
    enum: [PATHWAYS.HD, PATHWAYS.DIP, PATHWAYS.FOUNDATION, PATHWAYS.TOPUP],
    unique: true // one document per pathway
  },
  modules: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const PathwayModule = mongoose.model('PathwayModule', moduleSchema);
module.exports = PathwayModule;
