import { resetDatabase, closeDatabase } from './utils/test-db';

async function globalSetup() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Ensure .env.local exists and playwright.config.ts loads it.'
    );
  }

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
