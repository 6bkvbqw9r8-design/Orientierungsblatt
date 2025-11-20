import React from 'react';
import { Logo } from './Logo';
import { Language } from '../types';

interface LanguageSelectorProps {
  onSelect: (lang: Language) => void;
}

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'de', label: 'Deutsch', flag: '🇦🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
  { code: 'hr', label: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr', label: 'Srpski', flag: '🇷🇸' },
  { code: 'bs', label: 'Bosanski', flag: '🇧🇦' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-lumar-grey px-4 py-8 animate-fadeIn">
      <div className="mb-16">
        <Logo />
      </div>
      
      <div className="w-full max-w-lg bg-white shadow-xl rounded-sm overflow-hidden">
         <div className="bg-lumar-dark p-6 text-center">
            <h2 className="text-white font-serif text-2xl">Select Language</h2>
            <p className="text-lumar-green text-xs uppercase tracking-widest mt-1">Bitte Sprache wählen</p>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 border-b border-gray-100">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                className="flex items-center justify-center gap-3 p-6 hover:bg-lumar-green hover:text-white transition-colors duration-300 group text-lumar-dark"
              >
                <span className="text-2xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{lang.flag}</span>
                <span className="font-sans font-medium text-lg">{lang.label}</span>
              </button>
            ))}
         </div>
      </div>
    </div>
  );
};