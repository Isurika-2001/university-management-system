require('dotenv').config();

async function runAll() {
  try {
    console.log('Starting migration runner');

    const migr1 = require('./0001_default_seed');
    const migr2 = require('./0002_add_admin_permissions');

    console.log('Running migration 0001_default_seed...');
    if (migr1 && migr1.run) await migr1.run();

    console.log('Running migration 0002_add_admin_permissions...');
    if (migr2 && migr2.run) await migr2.run();

    console.log('All migrations completed successfully');
  } catch (err) {
    console.error('Migration runner failed:', err);
    throw err;
  }
}

if (require.main === module) {
  runAll()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runAll };
