'use server';

import { createClient } from '@/app/utils/supabase/server';

export async function joinWaitlist(formData: FormData) {
  // 1. Initialize the correct Server Client
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const score = formData.get("score") as string;
  const rank_label = formData.get("rank_label") as string;
  const visitor_id = formData.get("visitor_id") as string; // <--- Capture the ID
  
  if (!email || !email.includes("@")) {
    return { success: false, message: "Invalid email address." };
  }

  try {
    const { error } = await supabase
      .from('waitlist')
      .insert([
        { 
          email: email, 
          score: parseInt(score), 
          rank_label: rank_label,
          visitor_id: visitor_id // <--- Save it to the DB
        }
      ]);

    if (error) {
      // Code 23505 is for unique violation (already signed up)
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