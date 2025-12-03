import { NextRequest, NextResponse } from 'next/server';
import { automatedPostService } from '../../../../services/automatedPostService';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('Daily post cron triggered at:', new Date().toISOString());
    
    const result = await automatedPostService.runScheduledPost();
    
    automatedPostService.cleanupOldImages();
    
    return NextResponse.json({
      ...result,
      cronTriggeredAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Cron job failed',
        cronTriggeredAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
