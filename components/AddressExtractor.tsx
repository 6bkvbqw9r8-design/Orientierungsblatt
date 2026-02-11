
import React, { useState } from 'react';
import { Button } from './Button';
import { Logo } from './Logo';
import { extractAddressFromText } from '../services/geminiService';
import { ExtractedAddress, Language } from '../types';
import { translations } from '../utils/translations';
import { FileText, Search, MapPin, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface AddressExtractorProps {
  language: Language;
  onAddressSelected: (address: string) => void;
  onBack: () => void;
}

export const AddressExtractor: React.FC<AddressExtractorProps> = ({ language, onAddressSelected, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<ExtractedAddress | null>(null);
  const t = translations[language];

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setIsExtracting(true);
    const extracted = await extractAddressFromText(inputText);
    setResult(extracted);
    setIsExtracting(false);
  };

  const formattedAddress = result 
    ? `${result.street || ''} ${result.houseNumber || ''}, ${result.postalCode || ''} ${result.city || ''}`.trim()
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-lumar-grey animate-fadeIn">
      <main className="flex-grow flex flex-col items-center py-12 px-6">
        <div className="mb-12">
          <Logo />
        </div>

        <div className="max-w-2xl w-full bg-white shadow-2xl p-8 rounded-sm">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-lumar-dark opacity-60 hover:opacity-100 mb-6 transition-all"
          >
            <ArrowLeft size={16} /> {t.backBtn}
          </button>

          <h2 className="font-serif text-3xl text-lumar-dark mb-2">
            {language === 'de' ? 'Adresse eingeben' : 'Enter Address'}
          </h2>
          <p className="font-sans text-gray-500 mb-8 text-sm leading-relaxed">
            {language === 'de' 
              ? 'Geben Sie eine Adresse in der Nähe oder Text aus einem Dokument ein. Die KI findet den Einsatzort für Sie.' 
              : 'Please enter a nearby address or paste text from a document. The AI will find the site location for you.'}
          </p>

          <div className="space-y-6">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={language === 'de' ? "Adresse hier eingeben..." : "Enter address here..."}
                className="w-full h-48 p-4 bg-gray-50 border border-gray-200 focus:border-lumar-green focus:ring-1 focus:ring-lumar-green outline-none font-sans text-base resize-none rounded-none"
              />
              <FileText className="absolute bottom-4 right-4 text-gray-300 pointer-events-none" size={24} />
            </div>

            <Button 
              onClick={handleExtract} 
              isLoading={isExtracting}
              className="w-full"
            >
              <Search size={20} />
              {language === 'de' ? 'Daten analysieren' : 'Analyze Data'}
            </Button>

            {result && (
              <div className={`mt-8 p-6 border-l-4 ${result.confidence === 'high' ? 'border-lumar-green bg-green-50' : result.confidence === 'medium' ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'} animate-slideUp`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-serif text-xl text-lumar-dark flex items-center gap-2">
                    {result.confidence === 'high' ? <CheckCircle className="text-lumar-green" size={20} /> : <AlertCircle className="text-amber-500" size={20} />}
                    {language === 'de' ? 'Ergebnis' : 'Result'}
                  </h3>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${result.confidence === 'high' ? 'bg-lumar-green text-white' : 'bg-gray-200 text-gray-600'}`}>
                    Konfidenz: {result.confidence}
                  </span>
                </div>

                {formattedAddress ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 border border-gray-100 shadow-sm">
                      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Verifizierte Adresse</p>
                      <p className="font-serif text-xl text-lumar-dark">{formattedAddress}</p>
                    </div>
                    
                    {result.notes && (
                      <p className="text-xs text-gray-500 italic">Hinweis: {result.notes}</p>
                    )}

                    <Button 
                      onClick={() => onAddressSelected(formattedAddress)}
                      className="w-full bg-lumar-dark hover:bg-black"
                    >
                      <MapPin size={20} />
                      {language === 'de' ? 'Als Standort verwenden' : 'Use as Location'}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {language === 'de' ? 'Es konnte keine eindeutige Adresse gefunden werden.' : 'No clear address could be found.'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
