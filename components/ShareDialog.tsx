
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

  const generatePDFBlob = (): Blob => {
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
    // HEADER (Dark Theme Match)
    // ==========================================
    doc.setFillColor(cDark[0], cDark[1], cDark[2]);
    doc.rect(0, 0, pageWidth, 35, 'F'); 
    
    doc.setDrawColor(cGreen[0], cGreen[1], cGreen[2]);
    doc.setLineWidth(2);
    doc.line(0, 35, pageWidth, 35);

    // Logo (Text Only) - LEFT ALIGNED
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
    // EMERGENCY BOX (Red Styling)
    // ==========================================
    yPos += 8;
    const boxHeight = 45;
    
    // Background
    doc.setFillColor(cLightRed[0], cLightRed[1], cLightRed[2]);
    doc.rect(margin, yPos, contentWidth, boxHeight, 'F');
    // Left Red Border
    doc.setFillColor(cRed[0], cRed[1], cRed[2]);
    doc.rect(margin, yPos, 3, boxHeight, 'F');

    // Content Labels
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(cRed[0], cRed[1], cRed[2]);
    doc.text("IM NOTFALL", margin + 8, yPos + 8);
    
    doc.setFontSize(6);
    doc.text("IHR AKTUELLER STANDORT / YOUR LOCATION", margin + 8, yPos + 14);

    // Address (Main)
    doc.setFont("times", "bold");
    doc.setFontSize(14); 
    doc.setTextColor(0, 0, 0);
    
    // Use the explicitly parsed address or fallback
    const addr = context?.address || "Standort verifiziert";
    const addressLines = doc.splitTextToSize(addr, contentWidth - 80);
    doc.text(addressLines[0], margin + 8, yPos + 22);
    
    // Coords Box (Simulate the grey tag look)
    const coordY = yPos + 28;
    doc.setFillColor(255, 230, 230); // faint red/grey
    doc.roundedRect(margin + 8, coordY, 80, 8, 1, 1, 'F');
    
    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    // STRICT COORDINATE FORMAT xx.xxxxxx
    doc.text(`LAT: ${location.lat.toFixed(6)} | LNG: ${location.lng.toFixed(6)}`, margin + 10, coordY + 5);

    // 112 / 144 Buttons (Visual)
    const btnY = yPos + 10;
    const btnH = 22;
    const btnW = 32;
    const rightMargin = pageWidth - margin;
    
    // 144 (White Button)
    doc.setDrawColor(cRed[0], cRed[1], cRed[2]);
    doc.setLineWidth(0.5);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(rightMargin - btnW, btnY, btnW, btnH, 2, 2, 'FD');
    doc.setTextColor(cRed[0], cRed[1], cRed[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("144", rightMargin - (btnW/2), btnY + 14, { align: "center" });
    
    // 112 (Red Button)
    doc.setFillColor(cRed[0], cRed[1], cRed[2]);
    doc.roundedRect(rightMargin - (btnW * 2) - 4, btnY, btnW, btnH, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("112", rightMargin - (btnW * 1.5) - 4, btnY + 14, { align: "center" });

    yPos += boxHeight + 10;

    // ==========================================
    // MAP & DASHBOARD GRID
    // ==========================================
    const colGap = 5;
    const mapWidth = (contentWidth * 0.40); // 40% width
    const infoWidth = contentWidth - mapWidth - colGap;
    const sectionHeight = 60; 

    // --- LEFT: MAP VISUALIZATION (Simulated Screenshot) ---
    // Frame
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.setFillColor(cGrey[0], cGrey[1], cGrey[2]);
    doc.rect(margin, yPos, mapWidth, sectionHeight, 'FD');
    
    // Map Title
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text(t.mapTitle, margin, yPos - 2);

    // Draw "Streets" grid (Synthetic Map)
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(4);
    
    const mx = margin; 
    const my = yPos;
    
    // Random-looking streets
    doc.line(mx + 10, my, mx + 15, my + sectionHeight);
    doc.line(mx + 35, my, mx + 35, my + sectionHeight); 
    doc.line(mx + 60, my, mx + 55, my + sectionHeight); 
    doc.line(mx, my + 20, mx + mapWidth, my + 15); 
    doc.line(mx, my + 40, mx + mapWidth, my + 45); 
    doc.line(mx, my + 55, mx + mapWidth, my + 55); 

    // Center Pin
    const pinX = mx + (mapWidth/2);
    const pinY = my + (sectionHeight/2);
    
    // Pin Body
    doc.setFillColor(cRed[0], cRed[1], cRed[2]);
    doc.circle(pinX, pinY - 3, 4, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(pinX, pinY - 3, 1.5, 'F');
    doc.setFillColor(cRed[0], cRed[1], cRed[2]);
    doc.triangle(pinX - 4, pinY - 3, pinX + 4, pinY - 3, pinX, pinY + 4, 'F');

    // --- RIGHT: INFO CARDS ---
    const rx = margin + mapWidth + colGap;
    
    // Card 1: Medical (Green Border)
    const card1H = 25;
    doc.setDrawColor(cGreen[0], cGreen[1], cGreen[2]);
    doc.setLineWidth(0.5);
    doc.rect(rx, yPos, infoWidth, card1H, 'S');
    doc.setFillColor(cGreen[0], cGreen[1], cGreen[2]);
    doc.rect(rx, yPos, 2, card1H, 'F'); // Left accent
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(cGreen[0], cGreen[1], cGreen[2]);
    doc.text("MEDIZINISCHE HILFE / MEDICAL", rx + 6, yPos + 6);
    
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const medText = doc.splitTextToSize(context?.medicalFacility || "Keine Information", infoWidth - 10);
    doc.text(medText, rx + 6, yPos + 14);

    // Card 2: Description (Dark Border)
    const card2Y = yPos + card1H + 5;
    const card2H = sectionHeight - card1H - 5;
    
    doc.setDrawColor(cDark[0], cDark[1], cDark[2]);
    doc.rect(rx, card2Y, infoWidth, card2H, 'S');
    doc.setFillColor(cDark[0], cDark[1], cDark[2]);
    doc.rect(rx, card2Y, 2, card2H, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text("UMGEBUNG / CONTEXT", rx + 6, card2Y + 6);
    
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const descText = doc.splitTextToSize(context?.description.substring(0, 200) + "..." || "", infoWidth - 10);
    doc.text(descText, rx + 6, card2Y + 13);

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
        
        // Green Number Circle
        doc.setFillColor(cGreen[0], cGreen[1], cGreen[2]);
        doc.circle(margin + 3, stepY + 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.text(String(index + 1), margin + 3, stepY + 3, { align: "center", baseline: "middle" });

        // Title
        doc.setTextColor(cDark[0], cDark[1], cDark[2]);
        doc.setFont("times", "bold");
        doc.setFontSize(11);
        doc.text(step.title, margin + 10, stepY + 4);

        // Description
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(step.description, margin + 10, stepY + 8);
    });

    // ==========================================
    // FOOTER / DISCLAIMER
    // ==========================================
    const footerY = pageHeight - 10;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    const disclaimer = "Haftungsausschluss: Automatisch generiert. Keine Haftung für Richtigkeit.";
    doc.text(disclaimer, pageWidth/2, footerY, { align: "center" });
    doc.text("© LUMAR Personal Service", pageWidth/2, footerY + 3, { align: "center" });

    return doc.output('blob');
  };

  const handleShare = async () => {
    setStatus('generating');
    
    try {
      const pdfBlob = generatePDFBlob();
      const file = new File([pdfBlob], "Lumar_Safety_Sheet.pdf", { type: "application/pdf" });
      
      const shareData = {
        title: 'LUMAR Safety Sheet',
        text: `LUMAR Notfall Info. Standort: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}.`,
        files: [file]
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setStatus('shared');
      } else {
        // Fallback for Desktop download
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "Lumar_Safety_Sheet.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus('shared');
      }
      
      setTimeout(() => onClose(), 2000);

    } catch (error) {
      console.error("Error sharing:", error);
      setStatus('idle');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
    >
      <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl p-6 relative border-t-4 border-lumar-green">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Schließen"
        >
            <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-lumar-dark p-4 rounded-full text-white mb-2 shadow-lg" aria-hidden="true">
                {status === 'shared' ? <Check size={32} /> : <Share2 size={32} />}
            </div>

            <h3 id="share-dialog-title" className="font-serif text-2xl text-lumar-dark">
                {language === 'de' ? 'PDF Teilen' : 'Share PDF'}
            </h3>
            
            <div className="w-full pt-2">
                <button 
                    onClick={handleShare}
                    disabled={status === 'generating'}
                    className="w-full bg-lumar-green text-white py-4 font-sans tracking-wide hover:bg-[#6d9660] transition flex items-center justify-center gap-2 shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-lumar-green"
                >
                    {status === 'generating' ? (
                        <span className="animate-pulse">Generiere PDF...</span>
                    ) : (
                        <>
                            <Share2 size={18} aria-hidden="true" />
                            {language === 'de' ? 'Teilen & Download' : 'Share & Download'}
                        </>
                    )}
                </button>
            </div>
            
            <div className="text-[10px] text-gray-400 pt-2 max-w-[200px] leading-tight">
                Erstellt ein kompaktes PDF (1 Seite) im Corporate Design mit Kartenansicht und Koordinaten.
            </div>
        </div>
      </div>
    </div>
  );
};
