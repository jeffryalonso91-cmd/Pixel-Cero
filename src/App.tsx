/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import Trust from './components/Trust';
import Footer from './components/Footer';
import Admin from './components/Admin';
import { PRODUCTS, Product } from './data';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('apple_store_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((p: any) => ({
        ...p,
        images: p.images || (p.imageUrl ? [p.imageUrl] : [])
      }));
    }
    return PRODUCTS;
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('apple_store_products', JSON.stringify(products));
    } catch (e) {
      console.error("Local storage error:", e);
      alert("No se pudieron guardar los cambios. El tamaño de las imágenes excede el límite permitido. Por favor, intenta con menos imágenes.");
    }
  }, [products]);

  useEffect(() => {
    const checkHash = () => setIsAdmin(window.location.hash === '#admin');
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (isAdmin) {
    return <Admin products={products} setProducts={setProducts} />;
  }

  return (
    <div className="min-h-screen bg-apple-bg selection:bg-apple-blue selection:text-white">
      <Header />
      <main>
        <Hero />
        <Catalog products={products} />
        <Trust />
      </main>
      <Footer />
    </div>
  );
}

