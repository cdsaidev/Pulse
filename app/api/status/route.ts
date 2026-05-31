import { NextRequest, NextResponse } from 'next/server';
import { ResendService } from '@/lib/resend';
import { prisma } from '@/lib/prisma';

async function checkDatabase(): Promise<boolean> {
  if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const [apiStatus, dbConnected] = await Promise.all([
      ResendService.checkApiStatus(),
      checkDatabase(),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        apiConnected: apiStatus,
        dbConnected,
        hasDatabaseUrl: Boolean(
          process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
        ),
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
          hasDatabaseUrl: Boolean(
          process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
        ),
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        }
      },
      { status: 500 }
    );
  }
}