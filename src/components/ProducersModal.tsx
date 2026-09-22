import React from 'react';
import { X, Globe, Sparkles, Award } from 'lucide-react';
import { Producer, Product } from '../types';

interface ProducersModalProps {
  isOpen: boolean;
  onClose: () => void;
  producers: Producer[];
  products: Product[];
  onSelectProducerFilter: (producerName: string) => void;
}

export const ProducersModal: React.FC<ProducersModalProps> = ({
  isOpen,
  onClose,
  producers,
  products,
  onSelectProducerFilter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        id="producers-modal-container"
        className="relative bg-[#FAF8F5] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-[#E8DFD3] my-6 flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 bg-white border-b border-[#E8DFD3] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8C6B3E]">
              Korean & Chinese Master Formulators
            </span>
            <h2 className="font-serif-luxury text-2xl text-[#1A1817] font-medium">
              Sovereign Botanical Laboratories & Imperial Houses
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#736A61] hover:text-black rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <p className="text-xs sm:text-sm text-[#5C534B] font-light max-w-2xl leading-relaxed">
            BEAUTY SPHERE SHOP collaborates exclusively with certified bio-cellular laboratories in Seoul & Jeju and heritage Chinese medicine sanctuaries in Hangzhou & Yunnan holding true mastery over Hanbang saponin extraction, pearl milling, and medicinal bio-ferments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {producers.map((prod) => {
              const producerProducts = products.filter(p => p.producer === prod.name);
              return (
                <div key={prod.id} className="bg-white border border-[#E5DDD2] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6B3E] flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {prod.origin}
                        </span>
                        <h3 className="font-serif-luxury text-xl font-medium text-[#1A1817] mt-0.5">
                          {prod.name}
                        </h3>
                      </div>
                      <span className="text-[10px] bg-[#FAF5EE] border border-[#E0D7CC] text-[#4A423A] font-semibold px-2 py-0.5 rounded-md">
                        Est. {prod.foundedYear}
                      </span>
                    </div>

                    <div className="my-2.5 p-2 bg-[#FAF8F5] rounded-lg border border-[#EDE5DA]">
                      <p className="text-[11px] font-semibold text-[#5A5149] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#C5A880]" />
                        <span>Specialty:</span>
                      </p>
                      <p className="text-xs text-[#2C2723] mt-0.5">{prod.specialty}</p>
                    </div>

                    <p className="text-xs text-[#70675E] leading-relaxed font-light">{prod.description}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F2EDE7] flex items-center justify-between">
                    <span className="text-xs text-[#8C8075]">
                      {producerProducts.length} Formulations in Boutique
                    </span>
                    <button
                      onClick={() => {
                        onSelectProducerFilter(prod.name);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 bg-[#1F1B18] hover:bg-[#38312B] text-white text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all"
                    >
                      View Creations →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
