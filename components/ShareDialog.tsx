
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { GeoLocation, LocationContext, Language } from '../types';
import { X, Share2, Check } from 'lucide-react';
import { translations } from '../utils/translations';

interface ShareDialogProps {
  location: GeoLocation;
  context: LocationContext | null;
  onClose: () => void;
  language?: Language;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ location, context, onClose, language = 'de' }) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'shared'>('idle');
  const t = translations[language];

  // Helper to fetch a static map image and convert to base64
  const fetchStaticMapBase64 = async (lat: number, lng: number): Promise<string | null> => {
    try {
      // Using a standard static map URL provider
      const mapUrl = `https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${lng},${lat}&z=16&l=map&size=450,450&pt=${lng},${lat},pm2rdl`;
      const response = await fetch(mapUrl);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error fetching map image:", error);
      return null;
    }
  };

  const generatePDFBlob = async (): Promise<Blob> => {
    const doc = new jsPDF({
        format: 'a4',
        unit: 'mm'
    });

    // Accessibility Metadata
    doc.setProperties({
        title: t.sheetTitle + " / Safety Sheet",
        subject: "Emergency Location and Rescue Chain",
        author: "LUMAR Personal Service",
        keywords: "safety, emergency, 112, 144",
        creator: "LUMAR App"
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12; 
    const contentWidth = pageWidth - (margin * 2);
    
    // --- COLORS (Corporate Identity) ---
    const cGreen = [128, 173, 113]; // #80AD71
    const cDark = [44, 59, 65];    // #2C3B41
    const cRed = [220, 38, 38];    // Red-600
    const cLightRed = [254, 242, 242]; // Red-50
    const cGrey = [237, 237, 237]; // #EDEDED

    // ==========================================
    // HEADER
    // ==========================================
    doc.setFillColor(cDark[0], cDark[1], cDark[2]);
    doc.rect(0, 0, pageWidth, 35, 'F'); 
    
    doc.setDrawColor(cGreen[0], cGreen[1], cGreen[2]);
    doc.setLineWidth(2);
    doc.line(0, 35, pageWidth, 35);

    // Wordmark
    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text("LUMAR", margin, 18, { align: "left" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setCharSpace(3);
    doc.text("PERSONAL SERVICE", margin, 25, { align: "left" });
    doc.setCharSpace(0);

    // ==========================================
    // TITLE SECTION
    // ==========================================
    let yPos = 48;
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text(t.sheetTitle, margin, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`${new Date().toLocaleString()}`, pageWidth - margin, yPos, { align: "right" });

    // ==========================================
    // EMERGENCY BOX
    // ==========================================
    yPos += 8;
    const boxHeight = 45;
    
    doc.setFillColor(cLightRed[0], cLightRed[1], cLightRed[2]);
    doc.rect(margin, yPos, contentWidth, boxHeight, 'F');
    doc.setFillColor(cRed[0], cRed[1], cRed[2]);
    doc.rect(margin, yPos, 3, boxHeight, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(cRed[0], cRed[1], cRed[2]);
    doc.text("IM NOTFALL / IN EMERGENCY", margin + 8, yPos + 8);
    
    doc.setFontSize(6);
    doc.setTextColor(cRed[0], cRed[1], cRed[2]);
    doc.text("AKTUELLER STANDORT / CURRENT LOCATION", margin + 8, yPos + 14);

    doc.setFont("times", "bold");
    doc.setFontSize(14); 
    doc.setTextColor(0, 0, 0);
    
    const addr = context?.address || "Standort verifiziert";
    const addressLines = doc.splitTextToSize(addr, contentWidth - 80);
    doc.text(addressLines, margin + 8, yPos + 22);
    
    const coordY = yPos + 28;
    doc.setFillColor(255, 230, 230);
    doc.roundedRect(margin + 8, coordY, 80, 8, 1, 1, 'F');
    
    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`LAT: ${location.lat.toFixed(6)} | LNG: ${location.lng.toFixed(6)}`, margin + 10, coordY + 5);

    const btnY = yPos + 10;
    const btnH = 22;
    const btnW = 32;
    const rightMargin = pageWidth - margin;
    
    doc.setDrawColor(cRed[0], cRed[1], cRed[2]);
    doc.setLineWidth(0.5);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(rightMargin - btnW, btnY, btnW, btnH, 2, 2, 'FD');
    doc.setTextColor(cRed[0], cRed[1], cRed[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("144", rightMargin - (btnW/2), btnY + 14, { align: "center" });
    
    doc.setFillColor(cRed[0], cRed[1], cRed[2]);
    doc.roundedRect(rightMargin - (btnW * 2) - 4, btnY, btnW, btnH, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("112", rightMargin - (btnW * 1.5) - 4, btnY + 14, { align: "center" });

    yPos += boxHeight + 10;

    // ==========================================
    // MAP & DASHBOARD GRID
    // ==========================================
    const colGap = 5;
    const mapWidth = (contentWidth * 0.45); 
    const infoWidth = contentWidth - mapWidth - colGap;
    const sectionHeight = 65; 

    // --- LEFT: MAP IMAGE ("SCREENSHOT") ---
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text(t.mapTitle, margin, yPos - 2);

    const mapImageBase64 = await fetchStaticMapBase64(location.lat, location.lng);
    if (mapImageBase64) {
      doc.addImage(mapImageBase64, 'JPEG', margin, yPos, mapWidth, sectionHeight);
    } else {
      doc.setFillColor(cGrey[0], cGrey[1], cGrey[2]);
      doc.rect(margin, yPos, mapWidth, sectionHeight, 'F');
      doc.text("Karte nicht verfügbar", margin + 10, yPos + 30);
    }

    // --- RIGHT: INFO CARDS ---
    const rx = margin + mapWidth + colGap;
    
    // Card 1: Medical (Green Border)
    const card1H = 30;
    doc.setDrawColor(cGreen[0], cGreen[1], cGreen[2]);
    doc.setLineWidth(0.5);
    doc.rect(rx, yPos, infoWidth, card1H, 'S');
    doc.setFillColor(cGreen[0], cGreen[1], cGreen[2]);
    doc.rect(rx, yPos, 2, card1H, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(cGreen[0], cGreen[1], cGreen[2]);
    doc.text("MEDIZINISCHE HILFE / MEDICAL HELP", rx + 6, yPos + 6);
    
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const medText = doc.splitTextToSize(context?.medicalFacility || "Keine Information zu Krankenhäusern verfügbar", infoWidth - 10);
    doc.text(medText, rx + 6, yPos + 12);

    // Card 2: Context (Dark Border)
    const card2Y = yPos + card1H + 5;
    const card2H = sectionHeight - card1H - 5;
    
    doc.setDrawColor(cDark[0], cDark[1], cDark[2]);
    doc.rect(rx, card2Y, infoWidth, card2H, 'S');
    doc.setFillColor(cDark[0], cDark[1], cDark[2]); // Fixed the jsPDF.f2 error here
    doc.rect(rx, card2Y, 2, card2H, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text("UMGEBUNG / CONTEXT", rx + 6, card2Y + 6);
    
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const descText = doc.splitTextToSize(context?.description || "Keine Beschreibung verfügbar", infoWidth - 10);
    doc.text(descText, rx + 6, card2Y + 12);

    yPos += sectionHeight + 10;

    // ==========================================
    // RESCUE CHAIN
    // ==========================================
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text(t.rescueChainTitle, margin, yPos);
    
    doc.setDrawColor(cGreen[0], cGreen[1], cGreen[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 2, margin + 60, yPos + 2);

    yPos += 10;
    const stepHeight = 12; 
    
    t.steps.forEach((step, index) => {
        const stepY = yPos + (index * stepHeight);
        doc.setFillColor(cGreen[0], cGreen[1], cGreen[2]);
        doc.circle(margin + 3, stepY + 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.text(String(index + 1), margin + 3, stepY + 3, { align: "center", baseline: "middle" });

        doc.setTextColor(cDark[0], cDark[1], cDark[2]);
        doc.setFont("times", "bold");
        doc.setFontSize(11);
        doc.text(step.title, margin + 10, stepY + 4);

        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(step.description, margin + 10, stepY + 8);
    });

    // ==========================================
    // FOOTER
    // ==========================================
    const footerY = pageHeight - 10;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text("Haftungsausschluss: Dieses Dokument dient der Orientierung. Keine Gewähr für Standortdaten.", pageWidth/2, footerY, { align: "center" });
    doc.text("© 2025 LUMAR Personal Service GmbH", pageWidth/2, footerY + 3, { align: "center" });

    return doc.output('blob');
  };

  const handleShare = async () => {
    setStatus('generating');
    
    try {
      const pdfBlob = await generatePDFBlob();
      const file = new File([pdfBlob], "LUMAR_Orientierungsblatt.pdf", { type: "application/pdf" });
      
      const shareData = {
        title: 'LUMAR Orientierungsblatt',
        text: `LUMAR Notfall Info. GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}.`,
        files: [file]
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setStatus('shared');
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "LUMAR_Orientierungsblatt.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus('shared');
      }
      
      setTimeout(() => onClose(), 2000);

    } catch (error) {
      console.error("Error sharing/exporting:", error);
      setStatus('idle');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl p-6 relative border-t-4 border-lumar-green">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
          aria-label="Schließen"
        >
            <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-lumar-dark p-4 rounded-full text-white mb-2 shadow-lg" aria-hidden="true">
                {status === 'shared' ? <Check size={32} /> : <Share2 size={32} />}
            </div>

            <h3 className="font-serif text-2xl text-lumar-dark">
                {language === 'de' ? 'Orientierungsblatt' : 'Orientation Sheet'}
            </h3>
            
            <p className="text-sm text-gray-500">
                {language === 'de' 
                    ? 'Generiert ein PDF mit Karte, GPS-Daten und Krankenhaus-Anschrift.' 
                    : 'Generates a PDF with map, GPS data, and hospital address.'}
            </p>
            
            <div className="w-full pt-4">
                <button 
                    onClick={handleShare}
                    disabled={status === 'generating'}
                    className="w-full bg-lumar-green text-white py-4 font-sans font-bold tracking-wide hover:bg-[#6d9660] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                    {status === 'generating' ? (
                        <div className="flex items-center gap-2">
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                             Erstelle PDF...
                        </div>
                    ) : (
                        <>
                            <Share2 size={18} />
                            {language === 'de' ? 'Teilen / Download' : 'Share / Download'}
                        </>
                    )}
                </button>
            </div>
            
            <div className="text-[10px] text-gray-400 pt-2 leading-relaxed italic">
                {language === 'de' 
                    ? 'Inklusive Name, Straße, PLZ und Ort des nächsten Krankenhauses für Rettungskräfte.'
                    : 'Includes name, street, zip and city of nearest hospital for rescue services.'}
            </div>
        </div>
      </div>
    </div>
  );
};
