
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../types';
import { createFirstAidChat } from '../services/geminiService';
import { Send, X, Activity, User, Bot, Camera, Image as ImageIcon } from 'lucide-react';
import { GenerateContentResponse, Chat } from '@google/genai';

interface FirstAidChatProps {
  language: Language;
  onClose: () => void;
}

export const FirstAidChat: React.FC<FirstAidChatProps> = ({ language, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: 'Ich bin dein Erste-Hilfe-Assistent. Was ist passiert? Du kannst mir auch ein Foto der Situation senden.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatSessionRef.current = createFirstAidChat(language);
    scrollToBottom();
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedImage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || !chatSessionRef.current) return;

    const currentInput = input;
    const currentImage = selectedImage;

    // Add user message to UI
    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: currentInput,
      image: currentImage || undefined
    };
    setMessages(prev => [...prev, userMsg]);
    
    // Reset inputs
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      let response: GenerateContentResponse;

      if (currentImage) {
        // Extract base64 data (remove data:image/jpeg;base64, prefix)
        const base64Data = currentImage.split(',')[1];
        const mimeType = currentImage.split(';')[0].split(':')[1];

        // Implicitly structured part, removing explicit 'Part[]' type
        const parts = [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: currentInput || "Analysiere dieses Bild für Erste Hilfe Maßnahmen." }
        ];
        
        response = await chatSessionRef.current.sendMessage({ message: { parts: parts } }); // sendMessage accepts message config object
      } else {
        response = await chatSessionRef.current.sendMessage({ message: currentInput });
      }

      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: response.text || "Bitte rufe sofort 112 an." 
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Verbindungsfehler. Im Zweifel IMMER Notruf 112 wählen!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none bg-black/30 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full max-w-md h-[90vh] sm:h-[80vh] rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col pointer-events-auto border border-red-100 overflow-hidden animate-slideUp">
        
        {/* Header */}
        <div className="bg-red-600 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full animate-pulse">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg leading-none">First Aid AI</h3>
              <span className="text-xs opacity-90">LUMAR Safety Assistant</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-lumar-dark text-white' : 'bg-red-100 text-red-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] space-y-2`}>
                 {msg.image && (
                    <img src={msg.image} alt="User upload" className="rounded-lg w-full object-cover max-h-48 border border-gray-200" />
                 )}
                 {msg.text && (
                    <div className={`p-3 rounded-lg text-sm sm:text-base leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-lumar-dark text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                    }`}>
                        {msg.text}
                    </div>
                 )}
              </div>
            </div>
          ))}
          
          {isLoading && (
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                 <Bot size={16} />
               </div>
               <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-200">
                 <div className="flex gap-1">
                   <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview Area */}
        {selectedImage && (
            <div className="px-4 py-2 bg-lumar-dark border-t border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded overflow-hidden border border-gray-500">
                        <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-gray-300">Bild angehängt</span>
                </div>
                <button onClick={() => setSelectedImage(null)} className="p-1 bg-gray-700 text-white rounded-full hover:bg-gray-600">
                    <X size={14} />
                </button>
            </div>
        )}

        {/* Input Area - RE-STYLED FOR DARK MODE */}
        <form onSubmit={handleSend} className="p-3 bg-lumar-dark border-t border-gray-700 flex gap-2 shrink-0 items-end">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageSelect}
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition mb-0.5"
            title="Foto aufnehmen/hochladen"
          >
            <Camera size={22} />
          </button>
          
          <div className="flex-1 relative">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Beschreibe die Situation..." 
                className="w-full bg-lumar-dark text-white border border-gray-600 rounded-2xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-sans text-base resize-none max-h-32 placeholder-gray-500"
                rows={1}
                style={{ minHeight: '48px' }}
              />
          </div>
          
          <button 
            type="submit" 
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md mb-0.5"
          >
            <Send size={20} />
          </button>
        </form>

      </div>
    </div>
  );
};
