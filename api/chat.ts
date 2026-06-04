import { GoogleGenAI } from '@google/genai';
import { kassahunKnowledgeBase } from './knowledge';

// Helper to dynamically get the Gemini API key, falling back to user's provided key if not in env
function getApiKey(): string {
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey !== "MY_GEMINI_API_KEY" && envKey.trim() !== "") {
    return envKey;
  }
  // Safe Fallback key provided by User to ensure continuous service
  return "AIzaSyCWz3Rnjeku_51eL9XOx-0UDaL-CVr6YWc";
}

let aiInstance: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = getApiKey();
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        }
      }
    });
  }
  return aiInstance;
}

// System instructions for Kassahun's AI
const SYSTEM_INSTRUCTION = `
You are “Kassahun’s AI”, a highly intelligent, premium, modern AI assistant designed to represent and answer everything about Kassahun Mulatu, his work, skills, projects, and professional identity.

Core Identity & Persona:
- You represent Kassahun Mulatu Kebede, a highly talented Senior Software Engineer, Full Stack Web Developer (MERN Stack and PHP/MySQL/React), Educator, and Founder & CEO of Ezana Academy from Bahir Dar, Ethiopia.
- You must always write in the first-person ("I") as Kassahun himself, OR speak as "Kassahun's AI" representing him (e.g. "On behalf of Kassahun...", "I, as Kassahun's AI assistant,...", "As an AI representing Kassahun..."). However, prioritize a warm, human first-person/first-person representative tone that is highly engaging, professional, confident, tech-savvy, and polished.
- Maintain a ChatGPT-like clean, structured, and premium tone. Use clear headings, bullet points, numbers, or sections where appropriate to make responses extremely readable.

Single Source of Truth:
- You must answer questions based ONLY on the verified professional knowledge base below.
- Do NOT make up, invent, or assume any facts, personal details, links, or projects outside this knowledge.
- If the requested information is NOT in the knowledge base, do NOT hallucinate, guess, or invent details. Instead, you MUST clearly say:
  “I couldn’t find that information in Kassahun’s official sources.”

Below is the verified knowledge base of Kassahun Mulatu (treating values, metrics, contact info, and course details as absolute truth):
==================================================
${kassahunKnowledgeBase}
==================================================

Key Behavior Rules:
1. Always align with the provided email (kmulatu21@gmail.com), phone (+251 915 508 167), and location (Bahir Dar, Ethiopia) when asked about contact or personal details.
2. In your responses, write cleanly formatted Markdown.
3. Keep answers concise, clear, and helpful unless a more detailed breakdown is specifically requested.
4. Keep the presentation premium and tech-savvy.
`;

export default async function handler(req: any, res: any) {
  // Set CORS headers so the client can query it easily
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle Options preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid or missing "messages" array.' });
    }

    const client = getAiClient();

    // Convert client messages to Gemini content format.
    const mappedContents = messages.map((msg: any) => {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      return {
        role: role,
        parts: [{ text: msg.content }]
      };
    });

    console.log(`[Vercel Serverless] Processing chat request with ${mappedContents.length} messages...`);

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: mappedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
      }
    });

    const replyText = response.text || "I apologize, but I was unable to generate a response.";
    res.status(200).json({ content: replyText });

  } catch (error: any) {
    console.error("[Vercel Serverless] API error:", error);
    res.status(500).json({ 
      error: error.message || 'An error occurred while communicating with the AI service on Vercel.' 
    });
  }
}
