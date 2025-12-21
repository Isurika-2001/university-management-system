const PathwayModule = require('../models/module');
const { PATHWAY_LIST } = require('../config/pathways');

async function getAllModules(req, res) {
  try {
    // fetch all module documents
    const docs = await PathwayModule.find();

    // map by pathway id for easy lookup
    const map = {};
    docs.forEach((d) => {
      map[d.pathway] = d.modules;
    });

    // Ensure all pathways present in response
    const data = PATHWAY_LIST.map((p) => ({ pathway: p.id, label: p.label, modules: map[p.id] || [] }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching modules' });
  }
}

async function upsertModules(req, res) {
  try {
    const { pathway, modules } = req.body;
    if (!pathway) return res.status(400).json({ success: false, message: 'Pathway is required' });
    const modulesArray = Array.isArray(modules) ? modules : [];

    const result = await PathwayModule.findOneAndUpdate(
      { pathway },
      { $set: { modules: modulesArray } },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: 'Modules saved', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error saving modules' });
  }
}

module.exports = {
  getAllModules,
  upsertModules
};
