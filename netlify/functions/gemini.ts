import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { GoogleGenAI } from '@google/genai';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action } = body; // 'message', 'questions', 'chat'
    
    // Check API Key
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ Warning: GEMINI_API_KEY missing');
      // Return mock data based on action
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(getMockResponse(action, body)),
      };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const model = 'gemini-2.5-flash';

    let result;

    switch (action) {
      case 'message':
        const { isWin } = body;
        const promptMsg = isWin 
          ? 'Write a short, funny congratulatory sentence (max 15 words) for beating a hard memory game level with lemon theme.'
          : 'Write a short, funny roast (max 15 words) for stepping on a mine in a lemon-themed memory game.';
        
        const respMsg = await ai.models.generateContent({ model, contents: promptMsg });
        result = { message: respMsg.text };
        break;

      case 'questions':
        const promptQuiz = `Generate a JSON array of 10 multiple choice English vocabulary questions for middle school students.
           Format: [{ "id": 1, "word": "Apple", "options": ["Meaning1", "Meaning2", "Meaning3"], "correctIndex": 0 }, ...].
           The options should be in Chinese. Ensure the output is pure JSON.`;
        
        const respQuiz = await ai.models.generateContent({ model, contents: promptQuiz });
        // Extract JSON from markdown code block if present
        let text = respQuiz.text || '[]';
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        result = { questions: JSON.parse(text) };
        break;

      case 'chat':
        const { message: userMsg, history } = body; // history is array of {role: 'user'|'model', parts: [{text: '...'}]}
        // Note: This is a simplified chat. For full chat history context, you'd pass history to Gemini.
        // Here we just do a single turn for simplicity, or construct content with history.
        
        // Construct full content from history + current message
        const chatContent = [
           { role: 'user', parts: [{ text: "You are a helpful English tutor in a Lemon Party game." }] },
           ...history, 
           { role: 'user', parts: [{ text: userMsg }] }
        ];

        const respChat = await ai.models.generateContent({ model, contents: chatContent });
        result = { reply: respChat.text };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('❌ Error in Gemini function:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal Server Error', details: error.toString() }),
    };
  }
};

function getMockResponse(action: string, body: any) {
  if (action === 'message') {
     return { message: body.isWin ? "Ultimate Champion! (Mock)" : "Boom! (Mock)" };
  }
  if (action === 'questions') {
    return { questions: [
      { id: 1, word: "Lemon", options: ["柠檬", "苹果", "香蕉"], correctIndex: 0 },
      { id: 2, word: "Party", options: ["派对", "会议", "学校"], correctIndex: 0 },
      { id: 3, word: "Game", options: ["游戏", "工作", "学习"], correctIndex: 0 }
    ]};
  }
  if (action === 'chat') {
    return { reply: "I am a mock AI. Please configure your API Key!" };
  }
  return {};
}

export { handler };
