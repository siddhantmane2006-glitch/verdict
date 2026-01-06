'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAiVerdict(score: number, manifesto: string) {
  const isPass = score >= 4;
  
  const systemPrompt = isPass 
    ? `You are "Verdict", an elitist AI Judge recruiting for a high-IQ society. The user passed the test with a score of ${score}/6. Write a short, witty, 1-sentence remark approving them. If their manifesto input is interesting, reference it. Tone: Stoic, impressive, exclusive.`
    : `You are "Verdict", a ruthless AI Judge. The user FAILED the test with a score of ${score}/6. Write a short, brutal 1-sentence roast. Mock their manifesto input specifically if it's weak. Tone: Cold, superior, dismissive.`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User Manifesto: "${manifesto}"` }
      ],
      model: "gpt-4o-mini", // Fast and cheap
      max_tokens: 60,
    });

    return completion.choices[0].message.content || "The algorithm is silent.";
  } catch (error) {
    console.error("OpenAI Error:", error);
    return isPass ? "Logic Verified. Welcome." : "Logic Flawed. Access Denied.";
  }
}