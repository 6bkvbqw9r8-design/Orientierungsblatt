
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { GeoLocation, LocationContext, Language, ExtractedAddress } from '../types';
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

export const extractAddressFromText = async (inputText: string): Promise<ExtractedAddress> => {
  const ai = getAIClient();
  
  const systemPrompt = `SYSTEM:
You are an information extraction engine. Your job is to extract an address for a specific site/location from the given input. 
Rules:
- Output must be VALID JSON ONLY. No prose, no markdown.
- Do NOT guess or invent data.
- Only return values that are explicitly present in the input text.
- If a field is missing or ambiguous, return null for that field.
- If multiple addresses exist, choose the one that best matches the target location criteria in "TARGET". If still ambiguous, set all fields to null and set "confidence" to "low".
- Keep original spelling and formatting (e.g., "Straße" vs "Strasse") as in the input.

TARGET:
Extract the address of the current site/location relevant for my web application. 
Prefer: the address labeled as Standort / Einsatzort / Adresse / Location / Site. 
Avoid: company HQ, billing address, footer legal address, bank address.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `INPUT:\n${inputText}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            street: { type: Type.STRING, nullable: true },
            houseNumber: { type: Type.STRING, nullable: true },
            postalCode: { type: Type.STRING, nullable: true },
            city: { type: Type.STRING, nullable: true },
            country: { type: Type.STRING, nullable: true },
            sourceText: { type: Type.STRING, nullable: true },
            confidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
            notes: { type: Type.STRING, nullable: true }
          },
          required: ["street", "houseNumber", "postalCode", "city", "country", "sourceText", "confidence", "notes"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Extraction error:", error);
    return {
      street: null,
      houseNumber: null,
      postalCode: null,
      city: null,
      country: null,
      sourceText: null,
      confidence: "low",
      notes: "Fehler bei der Extraktion."
    };
  }
};

export const getLocationContext = async (coords: GeoLocation, lang: Language = 'de', manualAddress?: string): Promise<LocationContext> => {
  try {
    const ai = getAIClient();
    const targetLanguage = PROMPT_LANGUAGES[lang];
    
    const prompt = manualAddress 
      ? `Ich befinde mich an der Adresse: ${manualAddress}. Die Koordinaten sind: ${coords.lat}, ${coords.lng}.
         Finde das nächstgelegene Krankenhaus (Spital) für diese Adresse.`
      : `Ich befinde mich an den Koordinaten: ${coords.lat}, ${coords.lng}.
      
      Nutze das Google Maps Tool, um:
      1. Die exakte Adresse für diese Koordinaten zu finden.
      2. Das nächstgelegene Krankenhaus (Spital) zu finden. Erfasse unbedingt den NAMEN, die STRASSE, die HAUSNUMMER, die PLZ und den ORT.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${prompt}
      
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
    
    let verifiedAddress = manualAddress || lines[0] || "";
    let medicalInfo = lines[1] || "";
    let description = lines.slice(2).join('\n') || "";

    verifiedAddress = verifiedAddress.replace(/^(Zeile 1:|Line 1:|Adresse:|Address:)/i, '').trim();
    if (verifiedAddress.length < 5 && !manualAddress) verifiedAddress = `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;

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
      address: manualAddress || `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
      description: "Standortdaten konnten nicht vollständig geladen werden.",
      medicalFacility: undefined,
      mapUrl: undefined
    };
  }
};
