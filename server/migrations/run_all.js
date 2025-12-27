require('dotenv').config();
const logger = require('../src/utils/logger');

async function runAll() {
  try {
    logger.info('Starting migration runner');

    const migr1 = require('./0001_default_seed');
    const migr2 = require('./0002_add_admin_permissions');
    const migr3 = require('./0003_migrate_pathway_modules_to_course_modules');

    logger.info('Running migration 0001_default_seed...');
    if (migr1 && migr1.run) await migr1.run();

    logger.info('Running migration 0002_add_admin_permissions...');
    if (migr2 && migr2.run) await migr2.run();

    logger.info('Running migration 0003_migrate_pathway_modules_to_course_modules...');
    if (migr3 && migr3.run) await migr3.run();

    logger.info('All migrations completed successfully');
  } catch (err) {
    logger.error('Migration runner failed:', err);
    throw err;
  }
}

if (require.main === module) {
  runAll()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runAll };
