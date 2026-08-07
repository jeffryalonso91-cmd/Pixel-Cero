import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../data';
import type { Product } from '../data';
import { MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

function Lightbox({ images, onClose }: { images: string[], onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button 
        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-10 transition-colors bg-black/20 rounded-full"
        onClick={onClose}
      >
        <X size={28} />
      </button>

      {images.length > 1 && (
        <>
          <button 
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 z-10 transition-colors bg-black/20 hover:bg-black/40 rounded-full"
            onClick={prev}
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 z-10 transition-colors bg-black/20 hover:bg-black/40 rounded-full"
            onClick={next}
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div className="relative w-full max-w-5xl h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img 
          key={currentIndex}
          src={images[currentIndex]} 
          alt={`Vista en HD ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
        />
        
        {images.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-4' : 'bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Catalog({ products }: { products: Product[] }) {
  const [activeGallery, setActiveGallery] = useState<string[] | null>(null);

  const handleWhatsApp = (model: string, price: number) => {
    const message = encodeURIComponent(`Hola ${CONFIG.storeName}, estoy interesado en el ${model} por ${CONFIG.currencySymbol}${price}. ¿Aún está disponible?`);
    window.open(`https://wa.me/${CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <section id="catalog" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.h2 
          className="text-4xl md:text-5xl font-semibold tracking-tight text-apple-text mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Modelos Disponibles
        </motion.h2>
        <motion.p
          className="text-lg text-apple-gray"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          El inventario se mueve rápido. Envíanos un mensaje para asegurar el tuyo.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, index) => (
          <motion.div 
            key={product.id}
            className="bg-apple-card rounded-[24px] overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div 
              className="aspect-[4/3] bg-apple-bg overflow-hidden p-8 flex items-center justify-center cursor-pointer relative"
              onClick={() => setActiveGallery(product.images && product.images.length > 0 ? product.images : [(product as any).imageUrl])}
            >
              <img 
                src={(product.images && product.images.length > 0) ? product.images[0] : (product as any).imageUrl} 
                alt={product.model} 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-white/90 backdrop-blur-sm text-apple-text text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                  Ver galería
                </span>
              </div>
            </div>
            
            <div className="p-8 flex-grow flex flex-col">
              <h3 className="text-2xl font-semibold tracking-tight mb-2">{product.model}</h3>
              <p className="text-sm text-apple-gray mb-6 tracking-tight">
                {product.storage} &middot; Condición {product.condition} &middot; Batería {product.battery}
              </p>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xl font-medium tracking-tight">
                  {CONFIG.currencySymbol}{product.price}
                </span>
                <button 
                  onClick={() => handleWhatsApp(product.model, product.price)}
                  className="bg-apple-bg text-apple-text hover:bg-apple-blue hover:text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  Preguntar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeGallery && (
          <Lightbox images={activeGallery} onClose={() => setActiveGallery(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
