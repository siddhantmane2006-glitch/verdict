'use server';

import { createClient } from '@/app/utils/supabase/server';

export async function joinWaitlist(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const score = formData.get("score") as string;
  const rank_label = formData.get("rank_label") as string;
  const manifesto = formData.get("manifesto") as string;
  const idea_vote = formData.get("idea_vote") as string; // <--- Capture Vote
  const visitor_id = formData.get("visitor_id") as string;
  
  if (!email || !email.includes("@")) {
    return { success: false, message: "Invalid email address." };
  }

  try {
    const { error } = await supabase
      .from('waitlist')
      .insert([
        { 
          email, 
          score: parseInt(score), 
          rank_label,
          manifesto,
          idea_vote, // <--- Save to DB
          visitor_id
        }
      ]);

    if (error) {
      if (error.code === '23505') {
        return { success: true, message: "Spot already secured." };
      }
      throw error;
    }

    return { success: true, message: "Access Granted." };
  } catch (error: any) {
    console.error("Supabase Error:", error);
    return { success: false, message: "System error. Try again later." };
  }
}