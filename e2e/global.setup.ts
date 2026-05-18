import { resetDatabase, closeDatabase } from './utils/test-db';

async function globalSetup() {
  console.log('🔄 Resetting test database...');
  try {
    await resetDatabase();
    console.log('✅ Test database reset complete');
  } catch (error) {
    console.error('❌ Failed to reset test database:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

export default globalSetup;
