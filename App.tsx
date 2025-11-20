import React, { useState, useCallback } from 'react';
import { Logo } from './components/Logo';
import { Button } from './components/Button';
import { OrientationSheet } from './components/OrientationSheet';
import { LanguageSelector } from './components/LanguageSelector';
import { AppState, GeoLocation, LocationContext, Language } from './types';
import { getLocationContext } from './services/geminiService';
import { translations } from './utils/translations';
import { MapPin, AlertCircle } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.LANGUAGE_SELECTION);
  const [language, setLanguage] = useState<Language>('de');
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationContext, setLocationContext] = useState<LocationContext | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setAppState(AppState.IDLE);
  };

  const handleStartLocation = useCallback(() => {
    setAppState(AppState.LOCATING);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg("Geolokalisierung wird von diesem Browser nicht unterstützt.");
      setAppState(AppState.ERROR);
      return;
    }

    // Updated options for better accuracy
    const options = {
        enableHighAccuracy: true,
        timeout: 20000, // Increased timeout to allow GPS to lock
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: GeoLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocation(coords);
        setAppState(AppState.ANALYZING);

        try {
          // Call Gemini to get address context in selected language
          const context = await getLocationContext(coords, language);
          setLocationContext(context);
          setAppState(AppState.SUCCESS);
        } catch (err) {
          console.error(err);
          // Even if AI fails, we have coords, so show success with fallback text
          setLocationContext({
             address: "Adresse konnte nicht abgerufen werden",
             description: `Breitengrad: ${coords.lat}, Längengrad: ${coords.lng}`
          });
          setAppState(AppState.SUCCESS);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let msg = "Standort konnte nicht ermittelt werden.";
        if (error.code === 1) msg = "Bitte erlauben Sie den Zugriff auf Ihren Standort.";
        if (error.code === 2) msg = "Position nicht verfügbar (Kein GPS Signal).";
        if (error.code === 3) msg = "Zeitüberschreitung bei der Ortung. Bitte versuchen Sie es erneut (im Freien).";
        setErrorMsg(msg);
        setAppState(AppState.ERROR);
      },
      options
    );
  }, [language]);

  const handleReset = () => {
    setAppState(AppState.LANGUAGE_SELECTION); // Go back to language selection for complete reset
    setLocation(null);
    setLocationContext(null);
    setErrorMsg(null);
  };

  const t = translations[language];

  // ---------------------------------------------------------------------------
  // RENDER: LANGUAGE SELECTION
  // ---------------------------------------------------------------------------
  if (appState === AppState.LANGUAGE_SELECTION) {
    return <LanguageSelector onSelect={handleLanguageSelect} />;
  }

  // ---------------------------------------------------------------------------
  // RENDER: RESULT VIEW
  // ---------------------------------------------------------------------------
  if (appState === AppState.SUCCESS && location) {
    return (
      <OrientationSheet 
        location={location} 
        context={locationContext} 
        language={language}
        onReset={handleReset} 
      />
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: HOME / LOADING / ERROR VIEW
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-lumar-grey">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-white transform skew-x-12 translate-x-1/4 pointer-events-none opacity-50 lg:opacity-100"></div>
      
      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-6">
        
        <div className="mb-12 animate-fadeIn">
          <Logo />
        </div>

        <div className="max-w-md w-full text-center space-y-8 animate-fadeIn">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-lumar-dark mb-4 whitespace-pre-line">
              {t.title}
            </h1>
            <p className="font-sans text-lumar-dark text-opacity-70 text-lg leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
            {appState === AppState.ERROR && (
               <div className="bg-red-50 border-l-4 border-red-500 p-4 w-full text-left rounded shadow-sm flex gap-3 items-start">
                  <AlertCircle className="text-red-500 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-red-800 font-bold text-sm">{t.errorTitle}</p>
                    <p className="text-red-700 text-sm">{errorMsg || t.errorGeo}</p>
                  </div>
               </div>
            )}

            <Button 
              onClick={handleStartLocation} 
              isLoading={appState === AppState.LOCATING || appState === AppState.ANALYZING}
              className="w-full md:w-auto shadow-xl"
            >
              {appState === AppState.IDLE || appState === AppState.ERROR ? (
                <>
                  <MapPin size={20} />
                  {t.startBtn}
                </>
              ) : (
                 appState === AppState.LOCATING ? t.locating : t.analyzing
              )}
            </Button>
          </div>
        </div>
        
        <button 
            onClick={() => setAppState(AppState.LANGUAGE_SELECTION)}
            className="absolute top-4 left-4 text-xs text-lumar-dark opacity-50 hover:opacity-100 uppercase tracking-widest"
        >
            Change Language
        </button>
      </main>
    </div>
  );
}