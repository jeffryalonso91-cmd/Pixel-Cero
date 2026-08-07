import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="pt-40 pb-24 px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
      <motion.h1
        className="text-5xl md:text-7xl font-semibold tracking-tighter text-apple-text mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        Poder Pro.<br className="md:hidden" /> Reacondicionado.
      </motion.h1>
      <motion.p
        className="text-xl md:text-2xl text-apple-gray max-w-2xl font-medium tracking-tight mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        iPhones seminuevos premium en perfectas condiciones. Rigurosamente probados, totalmente desbloqueados y listos para ti.
      </motion.p>
      <motion.a
        href="#catalog"
        className="bg-apple-text text-white px-8 py-3 rounded-full font-medium tracking-wide hover:bg-black transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        Ver Catálogo
      </motion.a>
      
      <motion.div 
        className="mt-20 w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl relative"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
         <img 
            src="https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=1200" 
            alt="Refurbished iPhones" 
            className="w-full h-auto object-cover"
         />
      </motion.div>
    </section>
  );
}
