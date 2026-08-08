/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import localforage from 'localforage';
import Header from './components/Header';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import Trust from './components/Trust';
import Footer from './components/Footer';
import Admin from './components/Admin';
import { PRODUCTS, Product } from './data';

export default function App() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localforage.getItem('apple_store_products').then((saved: any) => {
      if (saved) {
        setProducts(saved.map((p: any) => ({
          ...p,
          images: p.images || (p.imageUrl ? [p.imageUrl] : [])
        })));
      } else {
        const legacy = localStorage.getItem('apple_store_products');
        if (legacy) {
          const parsed = JSON.parse(legacy);
          setProducts(parsed.map((p: any) => ({
            ...p,
            images: p.images || (p.imageUrl ? [p.imageUrl] : [])
          })));
        }
      }
      setLoading(false);
    }).catch(err => {
      console.error("Error loading from localforage:", err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      localforage.setItem('apple_store_products', products).catch(e => {
        console.error("Storage error:", e);
        alert("No se pudieron guardar los cambios. Intenta con menos imágenes.");
      });
    }
  }, [products, loading]);

  useEffect(() => {
    const checkHash = () => setIsAdmin(window.location.hash === '#admin');
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-apple-bg flex items-center justify-center font-sans text-apple-gray">Cargando...</div>;
  }

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

