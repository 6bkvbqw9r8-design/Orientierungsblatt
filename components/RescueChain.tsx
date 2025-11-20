import React from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { AlertTriangle, Phone, Heart, Ambulance, Building2 } from 'lucide-react';

interface RescueChainProps {
  language: Language;
}

const IconMap = {
  shield: AlertTriangle,
  phone: Phone,
  medkit: Heart,
  ambulance: Ambulance,
  hospital: Building2
};

export const RescueChain: React.FC<RescueChainProps> = ({ language }) => {
  const content = translations[language];

  return (
    <div className="w-full py-8">
      <h3 className="font-serif text-2xl text-lumar-dark mb-8 border-b border-lumar-green pb-2 inline-block">
        {content.rescueChainTitle}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {content.steps.map((step) => {
          const Icon = IconMap[step.icon];
          return (
            <div key={step.id} className="bg-white p-5 border-l-4 border-lumar-green shadow-sm flex items-start gap-5 hover:shadow-md transition-shadow">
              <div className="bg-lumar-grey p-3 rounded-full text-lumar-dark shrink-0">
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-baseline gap-3 mb-1">
                   <span className="text-xs font-bold text-lumar-green uppercase tracking-wider bg-lumar-grey px-2 py-0.5 rounded">
                    {step.id}
                  </span>
                  <h4 className="font-serif text-xl text-lumar-dark font-semibold leading-none">{step.title}</h4>
                </div>
                <p className="font-sans text-sm text-gray-600 leading-relaxed mt-2">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};