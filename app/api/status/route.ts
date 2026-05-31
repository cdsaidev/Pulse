import { NextRequest, NextResponse } from 'next/server';
import { ResendService } from '@/lib/resend';
import { prisma } from '@/lib/prisma';
import {
  getConfiguredDatabaseEnvKeys,
  resolveDatabaseUrl,
} from '@/lib/database-url';

async function checkDatabase(): Promise<{ connected: boolean; error?: string }> {
  if (!resolveDatabaseUrl()) {
    return { connected: false, error: 'DATABASE_URL is not set' };
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Database connection failed",
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const [apiStatus, dbStatus] = await Promise.all([
      ResendService.checkApiStatus(),
      checkDatabase(),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        apiConnected: apiStatus,
        dbConnected: dbStatus.connected,
        dbError: dbStatus.error,
        hasDatabaseUrl: Boolean(resolveDatabaseUrl()),
        databaseEnvKeys: getConfiguredDatabaseEnvKeys(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check API status',
        data: {
          apiConnected: false,
          dbConnected: false,
          dbError: undefined,
          hasDatabaseUrl: Boolean(resolveDatabaseUrl()),
          databaseEnvKeys: getConfiguredDatabaseEnvKeys(),
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        }
      },
      { status: 500 }
    );
  }
}