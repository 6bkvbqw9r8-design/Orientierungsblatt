
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { GeoLocation, LocationContext } from '../types';
import { X, Download, Send, Check } from 'lucide-react';

interface ExportDialogProps {
  location: GeoLocation;
  context: LocationContext | null;
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ location, context, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const generatePDF = () => {
    const doc = new jsPDF();

    // Set PDF Metadata for Accessibility
    doc.setProperties({
        title: "LUMAR Safety Sheet",
        subject: "Emergency Location and Information",
        author: "LUMAR Personal Service",
        keywords: "safety, emergency, location, lumar, pdf",
        creator: "LUMAR Safety App"
    });
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(44, 59, 65); // lumar-dark
    doc.text("LUMAR", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(128, 173, 113); // lumar-green
    doc.text("PERSONAL SERVICE", 105, 26, { align: "center" });

    doc.setDrawColor(128, 173, 113);
    doc.line(20, 30, 190, 30);

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Orientierungsblatt / Safety Sheet", 20, 45);

    // Content
    doc.setFontSize(12);
    doc.text(`Datum/Date: ${new Date().toLocaleString()}`, 20, 55);
    
    doc.setFontSize(14);
    doc.setTextColor(44, 59, 65);
    doc.text("Standort / Location:", 20, 70);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`, 20, 80);
    if (location.accuracy) {
        doc.text(`Genauigkeit/Accuracy: +/- ${Math.round(location.accuracy)}m`, 20, 87);
    }

    doc.setFontSize(14);
    doc.setTextColor(44, 59, 65);
    doc.text("Adresse & Beschreibung:", 20, 100);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const addr = context?.address || "Adresse verifiziert";
    const desc = context?.description || "Keine Beschreibung";
    
    const splitDescription = doc.splitTextToSize(`${addr}\n\n${desc}`, 170);
    doc.text(splitDescription, 20, 110);

    const descHeight = splitDescription.length * 5;

    // Emergency Numbers
    doc.setFillColor(255, 240, 240);
    doc.rect(20, 120 + descHeight, 170, 30, 'F');
    doc.setFontSize(16);
    doc.setTextColor(200, 0, 0);
    doc.text("Notruf / Emergency: 112", 105, 140 + descHeight, { align: "center" });

    // Map Link
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 255);
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
    doc.textWithLink("Google Maps Link", 20, 160 + descHeight, { url: mapLink });

    doc.save("Lumar_Safety_Sheet.pdf");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate and download PDF (workaround for no backend SMS)
    generatePDF();
    
    // Fallback to SMS protocol for mobile integration
    const smsBody = `LUMAR Safety Info. GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}. Map: https://maps.google.com/?q=${location.lat},${location.lng}`;
    // window.location.href = `sms:${phoneNumber}?&body=${encodeURIComponent(smsBody)}`;
    
    setStatus('sent');
    setTimeout(() => {
        onClose();
    }, 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
    >
      <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Schließen"
        >
            <X size={24} />
        </button>

        <h3 id="export-dialog-title" className="font-serif text-2xl text-lumar-dark mb-2">Exportieren</h3>
        <p className="text-sm text-gray-600 mb-6">
          Senden Sie das Orientierungsblatt als PDF an eine Telefonnummer.
        </p>

        {status === 'sent' ? (
            <div className="flex flex-col items-center py-8 text-green-600">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                    <Check size={32} />
                </div>
                <p className="font-bold">Erfolgreich!</p>
                <p className="text-sm text-gray-500 mt-2">PDF wurde heruntergeladen.</p>
            </div>
        ) : (
            <form onSubmit={handleSend} className="space-y-4">
            <div>
                <label htmlFor="phone-input" className="block text-xs uppercase font-bold text-lumar-dark mb-1">Telefonnummer</label>
                <input 
                    id="phone-input"
                    type="tel" 
                    required
                    placeholder="+43 660 ..." 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-none focus:border-lumar-green focus:ring-1 focus:ring-lumar-green outline-none"
                />
            </div>
            
            <div className="text-xs text-gray-400 italic">
                *Da dies eine Demo ist, wird das PDF direkt auf Ihr Gerät heruntergeladen.
            </div>

            <button 
                type="submit" 
                disabled={status === 'sending'}
                className="w-full bg-lumar-dark text-white py-3 font-sans tracking-wide hover:bg-gray-800 transition flex items-center justify-center gap-2 focus:ring-2 focus:ring-offset-2 focus:ring-lumar-dark"
            >
                {status === 'sending' ? (
                    <>Sende...</>
                ) : (
                    <>
                        <Send size={16} aria-hidden="true" /> Senden & PDF Laden
                    </>
                )}
            </button>
            </form>
        )}
      </div>
    </div>
  );
};
