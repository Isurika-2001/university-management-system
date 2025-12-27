require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../src/config');
const logger = require('../src/utils/logger');

// Collections to keep (do NOT drop)
const PROTECTED_COLLECTIONS = new Set([
  'user_types',
  'users',
  'required_documents',
]);

async function clearDatabase() {
  if (!config.mongoUri) {
    logger.error('MONGO_URI is not defined. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection.db;

  try {
    const collections = await db.listCollections().toArray();

    const toDrop = collections
      .map(c => c.name)
      .filter(name => !PROTECTED_COLLECTIONS.has(name));

    if (toDrop.length === 0) {
      logger.info('No collections to drop. Protected collections remain intact.');
      return;
    }

    logger.info('Dropping collections:', toDrop.join(', '));
    for (const name of toDrop) {
      try {
        await db.dropCollection(name);
        logger.info(`Dropped collection: ${name}`);
      } catch (err) {
        // Ignore NamespaceNotFound and proceed
        if (err && err.codeName !== 'NamespaceNotFound') {
          logger.warn(`Failed to drop ${name}:`, err.message);
        }
      }
    }

    logger.info('Database cleared successfully (protected collections preserved).');
  } catch (error) {
    logger.error('Error clearing database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

clearDatabase();


