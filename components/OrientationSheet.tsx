
import React, { useState } from 'react';
import { GeoLocation, LocationContext, Language } from '../types';
import { RescueChain } from './RescueChain';
import { Phone, Navigation, Share2, Activity, Heart, Info, MapPin } from 'lucide-react';
import { Logo } from './Logo';
import { translations } from '../utils/translations';
import { ShareDialog } from './ShareDialog';

interface OrientationSheetProps {
  location: GeoLocation;
  context: LocationContext | null;
  language: Language;
  onReset: () => void;
}

export const OrientationSheet: React.FC<OrientationSheetProps> = ({ location, context, language, onReset }) => {
  const [showShare, setShowShare] = useState(false);
  const t = translations[language];
  
  const staticMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.001},${location.lat - 0.001},${location.lng + 0.001},${location.lat + 0.001}&layer=mapnik&marker=${location.lat},${location.lng}`;

  const accuracy = location.accuracy || 0;
  const isAccurate = accuracy < 20; 
  const accuracyColor = isAccurate ? 'text-green-600' : accuracy > 100 ? 'text-red-600' : 'text-yellow-600';

  const displayedAddress = context?.address || "Standort wird verifiziert...";

  return (
    <div className="min-h-screen bg-lumar-grey py-4 px-4 sm:px-6 lg:px-8 animate-fadeIn relative">
      
      <div className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden rounded-sm pb-20">
        
        {/* Header */}
        <div className="bg-lumar-dark text-white p-6 md:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-lumar-green"></div>
          <div className="flex justify-between items-start mb-4 md:mb-6">
             <button onClick={onReset} className="text-lumar-grey hover:text-white transition-colors flex items-center gap-2 text-sm font-medium group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> {t.backBtn}
             </button>
             <div className="flex gap-2">
                <button 
                  onClick={() => setShowShare(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs uppercase tracking-wider flex items-center gap-2 transition border border-white/20"
                >
                  <Share2 size={14} /> {language === 'de' ? 'Teilen' : 'Share'}
                </button>
             </div>
          </div>
          
          <h1 className="font-serif text-3xl md:text-5xl mb-2">{t.sheetTitle}</h1>
          <p className="font-sans text-lumar-grey text-opacity-80 text-sm md:text-base">{t.sheetSubtitle}</p>
        </div>

        <div className="p-4 md:p-8 space-y-8">
          
          {/* Emergency Call Section */}
          <div className="bg-red-50 border-l-4 border-red-600 shadow-md rounded-r-lg p-4 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between relative z-10">
                
                <div className="space-y-2 flex-1 w-full">
                     <div className="flex items-center gap-2 text-red-700 font-bold font-sans uppercase tracking-wide text-[10px] mb-1">
                        <Activity size={14} className="animate-pulse" />
                        {t.emergencySectionTitle}
                     </div>
                     
                     <div className="bg-white/60 p-4 rounded border border-red-100 backdrop-blur-sm">
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-2">
                            {language === 'de' ? 'IHRE GPS KOORDINATEN' : 'YOUR GPS COORDINATES'}
                        </p>
                        
                        <div className="font-serif text-3xl sm:text-4xl text-lumar-dark leading-none tracking-tight mb-1">
                             {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </div>
                        
                        <p className="text-[10px] text-gray-500 font-mono mt-1 opacity-70">
                            Lat, Lng
                        </p>
                     </div>
                </div>

                <div className="flex gap-3 shrink-0 w-full lg:w-auto flex-col sm:flex-row">
                    <a href="tel:112" className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded hover:bg-red-700 transition shadow-lg font-bold text-2xl active:scale-95 transform min-w-[120px]">
                        <Phone size={24} fill="currentColor" /> 112
                    </a>
                    <a href="tel:144" className="flex-1 flex items-center justify-center gap-2 bg-white text-red-600 border-2 border-red-600 px-4 py-3 rounded hover:bg-red-50 transition shadow-lg font-bold text-2xl active:scale-95 transform min-w-[120px]">
                        <Phone size={24} /> 144
                    </a>
                </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-5 space-y-2 flex flex-col">
               <div className="flex items-center justify-between border-b-2 border-lumar-green pb-2 mb-2">
                  <h3 className="font-serif text-2xl text-lumar-dark">{t.mapTitle}</h3>
                  {location.accuracy && (
                        <span className={`text-xs font-mono flex items-center gap-1 ${accuracyColor} bg-gray-100 px-2 py-1 rounded`}>
                            <Navigation size={12} /> ±{Math.round(location.accuracy)}m
                        </span>
                    )}
               </div>
               
              <div className="flex-grow bg-lumar-grey rounded-sm overflow-hidden shadow border border-gray-300 relative group min-h-[300px]">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0} 
                  src={staticMapUrl}
                  title="Karte"
                  className="w-full h-full absolute inset-0"
                ></iframe>
                <div className="absolute bottom-4 left-4 right-4">
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full bg-white text-lumar-dark text-sm py-3 rounded shadow-lg hover:bg-lumar-dark hover:text-white transition-colors flex items-center justify-center gap-2 font-bold uppercase tracking-wide border border-gray-200"
                    >
                        <Navigation size={16} />
                        {t.openMaps}
                    </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 gap-4 content-start">
               
              <div className="bg-white p-6 rounded-sm border-l-4 border-green-600 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Heart size={80} />
                  </div>
                  <h4 className="text-green-700 font-bold text-xs uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-green-100 pb-2">
                      <Activity size={14} />
                      {language === 'de' ? 'Medizinische Hilfe / Medical Help' : 'Medical Assistance'}
                  </h4>
                  
                  <div className="flex items-start gap-5">
                      <div className="bg-green-50 p-4 rounded-full text-green-600 shrink-0 shadow-inner">
                          <Heart size={28} />
                      </div>
                      <div>
                          <p className="font-serif text-xl text-gray-900 leading-tight mb-2">
                              {context?.medicalFacility || (language === 'de' ? "Suche nächstes Krankenhaus..." : "Locating nearest hospital...")}
                          </p>
                          <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide">
                              {language === 'de' ? 'Nächstgelegenes Krankenhaus (Spital)' : 'Nearest Hospital'}
                          </p>
                           <a 
                            href={`https://www.google.com/maps/search/hospital/@${location.lat},${location.lng},14z`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-green-600 px-3 py-1.5 rounded hover:bg-green-700 transition"
                          >
                            Google Maps Suche →
                          </a>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-sm border-l-4 border-lumar-dark shadow-sm hover:shadow-md transition-all">
                <h4 className="text-lumar-dark font-bold text-xs uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Info size={14} />
                    {t.locationDetailsTitle}
                </h4>
                <div className="prose prose-sm prose-slate max-w-none">
                     {displayedAddress && (
                        <div className="flex items-start gap-2 mb-3 bg-gray-50 p-3 rounded">
                           <MapPin size={16} className="text-lumar-dark shrink-0 mt-1" />
                           <div>
                               <p className="font-bold text-lumar-dark text-lg leading-tight">
                                   {displayedAddress}
                               </p>
                               <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                                   {language === 'de' ? 'Offizielle Adresse (Google Maps)' : 'Official Address'}
                               </p>
                           </div>
                        </div>
                    )}
                    <p className="font-serif text-gray-700 leading-relaxed text-lg pl-1">
                        {context?.description || "Keine Beschreibung verfügbar."}
                    </p>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <RescueChain language={language} />
          </div>

        </div>

        {/* Footer */}
        <div className="bg-lumar-grey p-8 text-center border-t border-gray-200">
           <Logo className="opacity-50 grayscale" />
           <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest">
               © 2025 LUMAR Personal Service GmbH
           </p>
           <p className="text-[9px] text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
               {language === 'de' 
                ? 'Haftungsausschluss: Diese Anwendung dient als Orientierungshilfe. Für die Richtigkeit der angezeigten Standortdaten und medizinischen Einrichtungen wird keine Haftung übernommen.' 
                : 'Disclaimer: This application serves as an orientation aid. No liability is assumed for the correctness of the displayed location data.'}
           </p>
        </div>
      </div>

      {showShare && (
        <ShareDialog location={location} context={context} onClose={() => setShowShare(false)} language={language} />
      )}

    </div>
  );
};
