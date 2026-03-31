import { resetDatabase, closeDatabase } from './utils/test-db';

async function globalSetup() {
  // Set test environment variables
  process.env.DATABASE_URL = process.env.DATABASE_URL ||
    'postgresql://test_user:test_password@localhost:5432/test_todo_db';
  process.env.DIRECT_DATABASE_URL = process.env.DIRECT_DATABASE_URL ||
    'postgresql://test_user:test_password@localhost:5432/test_todo_db';
  process.env.NEXTAUTH_SECRET = 'test-secret-key-only-for-testing';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';

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
