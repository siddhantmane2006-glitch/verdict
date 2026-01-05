'use server';

import { createClient } from '@/app/utils/supabase/server';
import { headers } from 'next/headers';

export async function trackVisit(visitorId: string) {
  const supabase = await createClient();
  const headersList = await headers();
  
  const country = headersList.get('x-vercel-ip-country') || 'Unknown';
  const city = headersList.get('x-vercel-ip-city') || 'Unknown';
  
  // Combine them into the country column or create a new 'location' column
  const location = `${city}, ${country}`; 

  await supabase.from('site_visits').insert({
    visitor_id: visitorId,
    user_agent: headersList.get('user-agent'),
    country: location // Now stores "Mumbai, IN"
  });
}

export async function trackQuizResult(visitorId: string, score: number, passed: boolean) {
  const supabase = await createClient();
  
  // Log the result linked to that visitor
  await supabase.from('quiz_attempts').insert({
    visitor_id: visitorId,
    score: score,
    passed: passed
  });
}