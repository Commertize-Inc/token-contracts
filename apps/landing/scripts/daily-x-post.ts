import 'dotenv/config';

async function runDailyPost() {
  const now = new Date();
  console.log(`[${now.toISOString()}] Starting daily X post job...`);

  const dayOfWeek = now.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    console.log('Weekend - skipping post');
    process.exit(0);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
  const cronSecret = process.env.CRON_SECRET;

  try {
    const response = await fetch(`${baseUrl}/api/cron/daily-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': cronSecret ? `Bearer ${cronSecret}` : ''
      }
    });

    const result = await response.json();

    if (result.success) {
      console.log(`Successfully posted! Tweet ID: ${result.tweetId}`);
      console.log(`Content: ${result.text?.substring(0, 100)}...`);
    } else {
      console.log(`Post skipped or failed: ${result.error || 'Unknown reason'}`);
    }

  } catch (error) {
    console.error('Failed to run daily post:', error);
    process.exit(1);
  }

  console.log(`[${new Date().toISOString()}] Daily X post job completed`);
  process.exit(0);
}

runDailyPost();
