'use server';

import { supabase } from '@/lib/supabase';

export async function joinWaitlist(formData: FormData) {
  const email = formData.get("email") as string;
  const score = formData.get("score") as string;
  const rank_label = formData.get("rank_label") as string;
  
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
          rank_label: rank_label 
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