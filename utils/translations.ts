
import { Language, EmergencyStep } from '../types';

export const PROMPT_LANGUAGES: Record<Language, string> = {
  de: "Deutsch",
  en: "Englisch",
  ro: "Rumänisch",
  hr: "Kroatisch",
  sr: "Serbisch",
  bs: "Bosnisch"
};

interface TranslationContent {
  title: string;
  subtitle: string;
  startBtn: string;
  locating: string;
  analyzing: string;
  errorTitle: string;
  errorGeo: string;
  backBtn: string;
  sheetTitle: string;
  sheetSubtitle: string;
  emergencySectionTitle: string;
  emergencyCallAction: string;
  mapTitle: string;
  openMaps: string;
  coordsLabel: string;
  locationDetailsTitle: string;
  autoLocationLabel: string;
  addressLabel: string;
  rescueChainTitle: string;
  manualAddressBtn: string;
  extractionTitle: string;
  extractionSubtitle: string;
  extractionPlaceholder: string;
  analyzeBtn: string;
  resultTitle: string;
  verifiedAddressLabel: string;
  useAsLocationBtn: string;
  noAddressFound: string;
  steps: EmergencyStep[];
}

const stepsTemplate = {
  de: [
    { title: 'Sofortmaßnahmen', description: 'Unfallstelle absichern. Selbstschutz beachten. Verletzte aus Gefahrenzone bringen.', icon: 'shield' },
    { title: 'Notruf', description: '112 oder 144 wählen. Wo? Was? Wie viele? Wer? Warten auf Rückfragen.', icon: 'phone' },
    { title: 'Erste Hilfe', description: 'Blutungen stillen. Schockbekämpfung. Stabile Seitenlage. Wiederbelebung.', icon: 'medkit' },
    { title: 'Rettungsdienst', description: 'Rettungskräfte einweisen. Zufahrt freihalten. Tragehilfe leisten.', icon: 'ambulance' },
    { title: 'Krankenhaus', description: 'Übergabe an Ärzte. Weitere medizinische Versorgung.', icon: 'hospital' }
  ],
  en: [
    { title: 'Immediate Measures', description: 'Secure the scene. Ensure self-protection. Move injured from danger zone.', icon: 'shield' },
    { title: 'Emergency Call', description: 'Dial 112. Where? What? How many? Who? Wait for instructions.', icon: 'phone' },
    { title: 'First Aid', description: 'Stop bleeding. Treat shock. Recovery position. CPR if needed.', icon: 'medkit' },
    { title: 'Rescue Service', description: 'Guide ambulance. Keep access clear. Assist crew if asked.', icon: 'ambulance' },
    { title: 'Hospital', description: 'Handover to doctors. Further medical treatment.', icon: 'hospital' }
  ],
  ro: [
    { title: 'Măsuri Imediate', description: 'Securizați locul. Protecție personală. Scoateți răniții din pericol.', icon: 'shield' },
    { title: 'Apel de Urgență', description: 'Sunați la 112. Unde? Ce? Câți? Cine? Așteptați instrucțiuni.', icon: 'phone' },
    { title: 'Primul Ajutor', description: 'Opriți sângerarea. Poziție de siguranță. Resuscitare dacă este necesar.', icon: 'medkit' },
    { title: 'Serviciul de Salvare', description: 'Ghidați ambulanța. Eliberați accesul. Ajutați echipajul.', icon: 'ambulance' },
    { title: 'Spital', description: 'Predare către medici. Tratament medical ulterior.', icon: 'hospital' }
  ],
  hr: [
    { title: 'Hitne Mjere', description: 'Osigurajte mjesto. Pazite na sebe. Maknite ozlijeđene iz opasnosti.', icon: 'shield' },
    { title: 'Hitni Poziv', description: 'Nazovite 112. Gdje? Što? Koliko? Tko? Čekajte upute.', icon: 'phone' },
    { title: 'Prva Pomoć', description: 'Zaustavite krvarenje. Bočni položaj. Oživljavanje ako treba.', icon: 'medkit' },
    { title: 'Hitna Služba', description: 'Dočekajte hitnu. Osigurajte prilaz. Pomozite timu.', icon: 'ambulance' },
    { title: 'Bolnica', description: 'Predaja liječnicima. Daljnje liječenje.', icon: 'hospital' }
  ],
  sr: [
    { title: 'Hitne Mere', description: 'Obezbedite mesto. Lična zaštita. Sklonite povređene od opasnosti.', icon: 'shield' },
    { title: 'Hitni Poziv', description: 'Pozovite 112. Gde? Šta? Koliko? Ko? Sačekajte uputstva.', icon: 'phone' },
    { title: 'Prva Pomoć', description: 'Zaustavite krvarenje. Bočni položaj. Reanimacija po potrebi.', icon: 'medkit' },
    { title: 'Hitna Služba', description: 'Sačekajte hitnu. Oslobodite prilaz. Pomozite ekipi.', icon: 'ambulance' },
    { title: 'Bolnica', description: 'Predaja lekarima. Dalje lečenje.', icon: 'hospital' }
  ],
  bs: [
    { title: 'Hitne Mjere', description: 'Osigurajte mjesto. Lična zaštita. Sklonite povrijeđene.', icon: 'shield' },
    { title: 'Hitni Poziv', description: 'Nazovite 112. Gdje? Šta? Koliko? Ko? Čekajte instrukcije.', icon: 'phone' },
    { title: 'Prva Pomoć', description: 'Zaustavite krvarenje. Bočni položaj. Reanimacija ako treba.', icon: 'medkit' },
    { title: 'Hitna Služba', description: 'Dočekajte hitnu. Osigurajte prilaz. Pomozite timu.', icon: 'ambulance' },
    { title: 'Bolnica', description: 'Predaja ljekarima. Daljnje liječenje.', icon: 'hospital' }
  ]
};

const mapSteps = (lang: Language): EmergencyStep[] => {
  // @ts-ignore - TS might complain about distinct types but structure is identical
  return stepsTemplate[lang].map((s, index) => ({ ...s, id: index + 1 }));
};

export const translations: Record<Language, TranslationContent> = {
  de: {
    title: "Sicherheit\nam Arbeitsplatz",
    subtitle: "Erstellen Sie sofort ein Orientierungsblatt für Ihren aktuellen Standort inklusive Rettungskette.",
    startBtn: "Ortung starten",
    locating: "Standort wird ermittelt...",
    analyzing: "Analysiere Umgebung...",
    errorTitle: "Fehler",
    errorGeo: "Standort konnte nicht ermittelt werden.",
    backBtn: "Zurück",
    sheetTitle: "Orientierung",
    sheetSubtitle: "Standort & Notfallinformationen",
    emergencySectionTitle: "Im Notfall",
    emergencyCallAction: "Notrufnummern wählen",
    mapTitle: "Kartenansicht",
    openMaps: "In Maps öffnen",
    coordsLabel: "GPS Koordinaten",
    locationDetailsTitle: "Standort Details",
    autoLocationLabel: "Automatische Ortung",
    addressLabel: "Ihre Adresse (für Rettungskräfte)",
    rescueChainTitle: "Standardisierte Rettungskette",
    manualAddressBtn: "Adresse in der Nähe eingeben",
    extractionTitle: "Adresse eingeben",
    extractionSubtitle: "Geben Sie eine Adresse in der Nähe oder Text aus einem Dokument ein. Die KI findet den Einsatzort für Sie.",
    extractionPlaceholder: "Adresse hier eingeben...",
    analyzeBtn: "Daten analysieren",
    resultTitle: "Ergebnis",
    verifiedAddressLabel: "Verifizierte Adresse",
    useAsLocationBtn: "Als Standort verwenden",
    noAddressFound: "Es konnte keine eindeutige Adresse gefunden werden.",
    steps: mapSteps('de')
  },
  en: {
    title: "Workplace\nSafety",
    subtitle: "Instantly create an orientation sheet for your current location including the rescue chain.",
    startBtn: "Start Localization",
    locating: "Locating...",
    analyzing: "Analyzing environment...",
    errorTitle: "Error",
    errorGeo: "Location could not be determined.",
    backBtn: "Back",
    sheetTitle: "Orientation",
    sheetSubtitle: "Location & Emergency Info",
    emergencySectionTitle: "In Emergency",
    emergencyCallAction: "Call Emergency Numbers",
    mapTitle: "Map View",
    openMaps: "Open in Maps",
    coordsLabel: "GPS Coordinates",
    locationDetailsTitle: "Location Details",
    autoLocationLabel: "Automatic Location",
    addressLabel: "Your Address (for rescue services)",
    rescueChainTitle: "Standardized Rescue Chain",
    manualAddressBtn: "Please enter a nearby address",
    extractionTitle: "Enter Address",
    extractionSubtitle: "Please enter a nearby address or paste text from a document. The AI will find the site location for you.",
    extractionPlaceholder: "Enter address here...",
    analyzeBtn: "Analyze Data",
    resultTitle: "Result",
    verifiedAddressLabel: "Verified Address",
    useAsLocationBtn: "Use as Location",
    noAddressFound: "No clear address could be found.",
    steps: mapSteps('en')
  },
  ro: {
    title: "Siguranța\nla locul de muncă",
    subtitle: "Generați instantaneu o fișă de orientare pentru locația dvs. curentă, inclusiv lanțul de salvare.",
    startBtn: "Începe localizarea",
    locating: "Se localizează...",
    analyzing: "Se analizează mediul...",
    errorTitle: "Eroare",
    errorGeo: "Locația nu a putut fi determinată.",
    backBtn: "Înapoi",
    sheetTitle: "Orientare",
    sheetSubtitle: "Locație & Info Urgență",
    emergencySectionTitle: "În caz de urgență",
    emergencyCallAction: "Apelați numerele de urgență",
    mapTitle: "Vizualizare Hartă",
    openMaps: "Deschide în Maps",
    coordsLabel: "Coordonate GPS",
    locationDetailsTitle: "Detalii Locație",
    autoLocationLabel: "Localizare Automată",
    addressLabel: "Adresa Dvs. (pentru salvare)",
    rescueChainTitle: "Lanțul de Salvare Standardizat",
    manualAddressBtn: "Vă rugăm să introduceți o adresă din apropiere",
    extractionTitle: "Introduceți adresa",
    extractionSubtitle: "Vă rugăm să introduceți o adresă din apropiere sau să inserați text dintr-un document. AI va găsi locația șantierului pentru dvs.",
    extractionPlaceholder: "Introduceți adresa aici...",
    analyzeBtn: "Analizează datele",
    resultTitle: "Rezultat",
    verifiedAddressLabel: "Adresă verificată",
    useAsLocationBtn: "Utilizează ca locație",
    noAddressFound: "Nu a putut fi găsită nicio adresă clară.",
    steps: mapSteps('ro')
  },
  hr: {
    title: "Sigurnost\nna radnom mjestu",
    subtitle: "Odmah kreirajte orijentacijski list za svoju trenutnu lokaciju uključujući lanac spašavanja.",
    startBtn: "Pokreni lociranje",
    locating: "Lociranje...",
    analyzing: "Analiza okoline...",
    errorTitle: "Greška",
    errorGeo: "Lokacija nije utvrđena.",
    backBtn: "Natrag",
    sheetTitle: "Orijentacija",
    sheetSubtitle: "Lokacija i hitne informacije",
    emergencySectionTitle: "U hitnom slučaju",
    emergencyCallAction: "Nazovite hitne brojeve",
    mapTitle: "Karta",
    openMaps: "Otvori u kartama",
    coordsLabel: "GPS Koordinate",
    locationDetailsTitle: "Detalji lokacije",
    autoLocationLabel: "Automatsko lociranje",
    addressLabel: "Vaša adresa (za hitne službe)",
    rescueChainTitle: "Standardizirani lanac spašavanja",
    manualAddressBtn: "Unesite obližnju adresu",
    extractionTitle: "Unesite adresu",
    extractionSubtitle: "Unesite obližnju adresu ili zalijepite tekst iz dokumenta. AI će pronaći lokaciju mjesta za vas.",
    extractionPlaceholder: "Unesite adresu ovdje...",
    analyzeBtn: "Analiziraj podatke",
    resultTitle: "Rezultat",
    verifiedAddressLabel: "Provjerena adresa",
    useAsLocationBtn: "Koristi kao lokaciju",
    noAddressFound: "Nije pronađena jasna adresa.",
    steps: mapSteps('hr')
  },
  sr: {
    title: "Bezbednost\nna radnom mestu",
    subtitle: "Odmah kreirajte orijentacioni list za svoju trenutnu lokaciju uključujući lanac spasavanja.",
    startBtn: "Pokreni lociranje",
    locating: "Lociranje...",
    analyzing: "Analiza okoline...",
    errorTitle: "Greška",
    errorGeo: "Lokacija nije utvrđena.",
    backBtn: "Nazad",
    sheetTitle: "Orijentacija",
    sheetSubtitle: "Lokacija i hitne informacije",
    emergencySectionTitle: "U hitnom slučaju",
    emergencyCallAction: "Pozovite hitne brojeve",
    mapTitle: "Mapa",
    openMaps: "Otvori u mapama",
    coordsLabel: "GPS Koordinate",
    locationDetailsTitle: "Detalji lokacije",
    autoLocationLabel: "Automatsko lociranje",
    addressLabel: "Vaša adresa (za hitne službe)",
    rescueChainTitle: "Standardizovani lanac spasavanja",
    manualAddressBtn: "Unesite obližnju adresu",
    extractionTitle: "Unesite adresu",
    extractionSubtitle: "Unesite obližnju adresu ili zalepite tekst iz dokumenta. AI će pronaći lokaciju za vas.",
    extractionPlaceholder: "Unesite adresu ovde...",
    analyzeBtn: "Analiziraj podatke",
    resultTitle: "Rezultat",
    verifiedAddressLabel: "Verifikovana adresa",
    useAsLocationBtn: "Koristi kao lokaciju",
    noAddressFound: "Nije pronađena jasna adresa.",
    steps: mapSteps('sr')
  },
  bs: {
    title: "Sigurnost\nna radnom mjestu",
    subtitle: "Odmah kreirajte orijentacijski list za svoju trenutnu lokaciju uključujući lanac spašavanja.",
    startBtn: "Pokreni lociranje",
    locating: "Lociranje...",
    analyzing: "Analiza okoline...",
    errorTitle: "Greška",
    errorGeo: "Lokacija nije utvrđena.",
    backBtn: "Nazad",
    sheetTitle: "Orijentacija",
    sheetSubtitle: "Lokacija i hitne informacije",
    emergencySectionTitle: "U hitnom slučaju",
    emergencyCallAction: "Nazovite hitne brojeve",
    mapTitle: "Karta",
    openMaps: "Otvori u mapama",
    coordsLabel: "GPS Koordinate",
    locationDetailsTitle: "Detalji lokacije",
    autoLocationLabel: "Automatsko lociranje",
    addressLabel: "Vaša adresa (za hitne službe)",
    rescueChainTitle: "Standardizirani lanac spašavanja",
    manualAddressBtn: "Unesite obližnju adresu",
    extractionTitle: "Unesite adresu",
    extractionSubtitle: "Unesite obližnju adresu ili zalijepite tekst iz dokumenta. AI će pronaći lokaciju mjesta za vas.",
    extractionPlaceholder: "Unesite adresu ovdje...",
    analyzeBtn: "Analiziraj podatke",
    resultTitle: "Rezultat",
    verifiedAddressLabel: "Provjerena adresa",
    useAsLocationBtn: "Koristi kao lokaciju",
    noAddressFound: "Nije pronađena jasna adresa.",
    steps: mapSteps('bs')
  }
};
