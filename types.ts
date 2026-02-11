
export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number; // in meters
}

export interface LocationContext {
  address: string;
  description: string;
  medicalFacility?: string; // Nearest Hospital or AED
  mapUrl?: string;
}

export interface ExtractedAddress {
  street: string | null;
  houseNumber: string | null;
  postalCode: string | null;
  city: string | null;
  country: string | null;
  sourceText: string | null;
  confidence: 'high' | 'medium' | 'low';
  notes: string | null;
}

export enum AppState {
  LANGUAGE_SELECTION = 'LANGUAGE_SELECTION',
  IDLE = 'IDLE',
  LOCATING = 'LOCATING',
  ANALYZING = 'ANALYZING',
  EXTRACTION = 'EXTRACTION',
  EXTRACTING = 'EXTRACTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type Language = 'de' | 'en' | 'ro' | 'hr' | 'sr' | 'bs';

export interface EmergencyStep {
  id: number;
  title: string;
  description: string;
  icon: 'shield' | 'phone' | 'medkit' | 'ambulance' | 'hospital';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string of the uploaded image
}
