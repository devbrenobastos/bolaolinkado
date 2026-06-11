import React, { useEffect } from 'react';

export default function LiveScoreWidget() {
  useEffect(() => {
    // 1. Cria a tag script que vai buscar o widget do provedor externo
    const script = document.createElement('script');
    script.src = 'https://www.scoreaxis.com/widget/live-score/v1/init.js';
    script.async = true;
    
    // 2. Adiciona o script no corpo da página
    document.body.appendChild(script);

    // 3. Limpa o script se o usuário mudar de página
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="w-full bg-[#151515] border border-[#262626] rounded-md p-4 shadow-card space-y-3">
      <h3 className="text-sm font-semibold uppercase text-neutral-400 tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        <span>Placares Ao Vivo</span>
      </h3>

      {/* Container onde o widget será renderizado */}
      <div 
        className="scoreaxis-widget w-full" 
        data-widget="live-score" 
        data-theme="dark"
        data-language="pt"
      />
    </div>
  );
}
