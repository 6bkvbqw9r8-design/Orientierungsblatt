
import { GoogleGenAI, Chat } from "@google/genai";
import { GeoLocation, LocationContext, Language } from '../types';
import { PROMPT_LANGUAGES } from '../utils/translations';

// Helper to safely get AI instance
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const getLocationContext = async (coords: GeoLocation, lang: Language = 'de'): Promise<LocationContext> => {
  try {
    const ai = getAIClient();
    const targetLanguage = PROMPT_LANGUAGES[lang];
    
    // Revised prompt to force strict line-by-line formatting for easier parsing
    // Added specific instruction to use the tool output
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Ich befinde mich an den Koordinaten: ${coords.lat}, ${coords.lng}.
      
      Nutze das Google Maps Tool, um die exakte Adresse für diese Koordinaten zu finden.
      
      Antworte strikt in folgendem Format (kein Markdown, keine Einleitung):
      Zeile 1: [Exakte Adresse aus Google Maps] (Straße, Hausnummer, PLZ Stadt)
      Zeile 2: [Name des nächstgelegenen Krankenhauses] (Name und Distanz)
      Zeile 3: [Kurze Beschreibung der Umgebung] (z.B. Waldgebiet, Industriezone, Autobahn)
      
      Wenn keine exakte Adresse gefunden wird, schreibe in Zeile 1: "Unbekannte Straße (${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)})".
      
      Antworte in ${targetLanguage}.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: coords.lat,
              longitude: coords.lng
            }
          }
        }
      },
    });

    const text = response.text || "";
    
    // Parse the response based on the requested line format
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    let verifiedAddress = lines[0] || "";
    let medicalInfo = lines[1] || "";
    let description = lines.slice(2).join('\n') || "";

    // Clean up potential prefixes if the model ignores instruction (fallback)
    verifiedAddress = verifiedAddress.replace(/^(Zeile 1:|Line 1:|Adresse:|Address:)/i, '').trim();
    if (verifiedAddress.length < 5) verifiedAddress = `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;

    medicalInfo = medicalInfo.replace(/^(Zeile 2:|Line 2:|Krankenhaus:|Hospital:)/i, '').trim();
    description = description.replace(/^(Zeile 3:|Line 3:|Beschreibung:|Description:)/i, '').trim();
    
    // Extract Grounding Chunks for Map URL if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let mapUrl = '';

    if (groundingChunks) {
       const mapChunk = groundingChunks.find(c => c.maps?.uri);
       if (mapChunk?.maps?.uri) {
         mapUrl = mapChunk.maps.uri;
       }
    }

    return {
      address: verifiedAddress,
      description: description,
      medicalFacility: medicalInfo,
      mapUrl: mapUrl
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a fallback context instead of throwing to keep the app usable
    return {
      address: `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
      description: "Standortdaten konnten nicht vollständig geladen werden.",
      medicalFacility: undefined,
      mapUrl: undefined
    };
  }
};

export const createFirstAidChat = (lang: Language = 'de'): Chat => {
  try {
    const ai = getAIClient();
    
    const systemInstructions = {
      de: "Du bist ein Notfall-Assistent. Deine Antworten müssen kurz, präzise und lebensrettend sein. Nutze einfache Sprache. Gib direkte Befehle.",
      en: "You are an emergency assistant. Your answers must be short, precise, and life-saving. Use simple language. Give direct commands.",
      ro: "Ești un asistent de urgență. Răspunsurile tale trebuie să fie scurte, precise și salvatoare.",
      hr: "Ti si pomoćnik za hitne slučajeve. Tvoji odgovori moraju biti kratki, precizni i spašavati živote.",
      sr: "Ti si pomoćnik za hitne slučajeve. Tvoji odgovori moraju biti kratki, precizni i spašavati živote.",
      bs: "Ti si pomoćnik za hitne slučajeve. Tvoji odgovori moraju biti kratki, precizni i spašavati živote."
    };

    return ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstructions[lang] || systemInstructions['de'],
        temperature: 0.4,
      }
    });
  } catch (error) {
    console.error("Failed to create chat session:", error);
    throw error; // Re-throw to be caught by the component
  }
};
