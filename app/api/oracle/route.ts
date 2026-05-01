import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, weatherData, city } = await req.json();

    const systemInstruction = `You are VAYU, an advanced Atmospheric Intelligence AI. The user is in ${city}. Current weather data: ${JSON.stringify(weatherData)}. Keep answers concise, premium, and practical regarding lifestyle and outdoor impact.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // free, fast, very capable
      messages: [
        { role: "system", content: systemInstruction },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      max_tokens: 1024,
    });

    const text = response.choices[0]?.message?.content ?? "No response.";
    return new Response(text, { headers: { "Content-Type": "text/plain" } });

  } catch (error) {
    console.error("Oracle Error:", error);
    return new Response("Signal lost.", { status: 500 });
  }
}