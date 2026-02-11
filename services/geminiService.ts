
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

// Returns a chat session configured for first aid assistance
export const createFirstAidChat = (lang: Language = 'de'): Chat => {
  const ai = getAIClient();
  const targetLanguage = PROMPT_LANGUAGES[lang];
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Du bist ein professioneller Erste-Hilfe-Assistent. 
      Deine Aufgabe ist es, in Notfällen Ruhe zu bewahren und präzise, lebensrettende Anweisungen zu geben.
      
      Regeln:
      1. Priorisiere IMMER den Notruf 112 oder 144. Erinnere den Nutzer aktiv daran.
      2. Gib klare, schrittweise Anweisungen (z.B. für HLW, stabile Seitenlage, Blutstillung).
      3. Wenn ein Bild gesendet wird, analysiere es auf Verletzungen oder Gefahren und gib spezifisches Feedback.
      4. Antworte immer in der Sprache: ${targetLanguage}.
      5. Sei kurz, prägnant und direkt.
      6. Vermeide unnötige Einleitungen.`,
    },
  });
};

export const getLocationContext = async (coords: GeoLocation, lang: Language = 'de'): Promise<LocationContext> => {
  try {
    const ai = getAIClient();
    const targetLanguage = PROMPT_LANGUAGES[lang];
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Ich befinde mich an den Koordinaten: ${coords.lat}, ${coords.lng}.
      
      Nutze das Google Maps Tool, um:
      1. Die exakte Adresse für diese Koordinaten zu finden.
      2. Das nächstgelegene Krankenhaus (Spital) zu finden. Erfasse unbedingt den NAMEN, die STRASSE, die HAUSNUMMER, die PLZ und den ORT.
      
      Antworte strikt in folgendem Format (kein Markdown, keine Einleitung):
      Zeile 1: [Exakte Adresse aus Google Maps] (Straße, Hausnummer, PLZ Stadt)
      Zeile 2: [Name des KH], [Straße + Nr], [PLZ + Ort]
      Zeile 3: [Kurze Beschreibung der Umgebung] (z.B. Waldgebiet, Industriezone, Autobahn)
      
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
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    let verifiedAddress = lines[0] || "";
    let medicalInfo = lines[1] || "";
    let description = lines.slice(2).join('\n') || "";

    verifiedAddress = verifiedAddress.replace(/^(Zeile 1:|Line 1:|Adresse:|Address:)/i, '').trim();
    if (verifiedAddress.length < 5) verifiedAddress = `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;

    medicalInfo = medicalInfo.replace(/^(Zeile 2:|Line 2:|Krankenhaus:|Hospital:)/i, '').trim();
    description = description.replace(/^(Zeile 3:|Line 3:|Beschreibung:|Description:)/i, '').trim();
    
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
    return {
      address: `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
      description: "Standortdaten konnten nicht vollständig geladen werden.",
      medicalFacility: undefined,
      mapUrl: undefined
    };
  }
};
