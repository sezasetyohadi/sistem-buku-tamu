import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/backend/config/db';
import migrationManager from '@/backend/migrations/migrationManager';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to connect to database. Please check your .env configuration.' 
      }, { status: 500 });
    }
    
    // Initialize migration and seed tables
    await migrationManager.initMigrationTable();
    
    // Run all migrations
    console.log('Running migrations...');
    await migrationManager.runMigrations();
    
    // Run all seeds
    console.log('Running seeds...');
    await migrationManager.runSeeds();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully with migrations and seeds'
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
