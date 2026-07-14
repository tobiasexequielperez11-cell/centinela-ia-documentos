import { getMatchingAnalysisPrompt } from '../industries/aiConfig';

export async function analizarMatchConIA(contexto: string): Promise<string | null> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not defined.');
    return null;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = getMatchingAnalysisPrompt();

  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt + '\n\n' + contexto,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Error llamando a Gemini REST API:', err);
      return null;
    }

    const data = await response.json();
    const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error('Respuesta vacía o formato inesperado:', data);
      return null;
    }

    return textContent.trim();
  } catch (error) {
    console.error('Error en fetch a Gemini:', error);
    return null;
  }
}
