import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const WhatsAppWidget = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  const whatsappNumber = "34632332050";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        aria-label="Close WhatsApp widget"
        className="flex items-center justify-center w-6 h-6 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-all duration-200"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* WhatsApp button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
};

export default WhatsAppWidget;
