import React, { useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";

const GoogleTranslate = () => {
  useEffect(() => {
    if (document.querySelector("#google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="relative group">
      {/* 1. THE BEAUTIFUL 'FAKE' BUTTON (What the user sees) */}
      <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 transition-transform group-hover:scale-105 cursor-pointer">
        <div className="bg-blue-100 p-1.5 rounded-full text-blue-600">
          <Globe size={16} />
        </div>
        <span className="text-sm font-bold text-gray-700 font-sans">Translate</span>
        <ChevronDown size={14} className="text-gray-400" />
      </div>

      {/* 2. THE UGLY GOOGLE WIDGET (Invisible Overlay) */}
      {/* We stretch this over the button and make it invisible so clicks pass through to the dropdown */}
      <div 
        id="google_translate_element" 
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer overflow-hidden"
      />
    </div>
  );
};

export default GoogleTranslate;