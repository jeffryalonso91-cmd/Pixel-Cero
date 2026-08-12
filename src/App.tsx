/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext } from 'react';
import localforage from 'localforage';
import Header from './components/Header';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import Trust from './components/Trust';
import Footer from './components/Footer';
import Admin from './components/Admin';
import PopupBanner from './components/PopupBanner';
import { PRODUCTS, Product, CONFIG } from './data';

export const ConfigContext = createContext(CONFIG);

export default function App() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [storeConfig, setStoreConfig] = useState(CONFIG);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      localforage.getItem('apple_store_products'),
      localforage.getItem('apple_store_config')
    ]).then(([savedProducts, savedConfig]: [any, any]) => {
      import('firebase/firestore').then(async ({ collection, onSnapshot, doc, setDoc, getDocs, getDoc }) => {
        const { db } = await import('./firebase');
        
        try {
          // Migrate initial data to Firestore if it's empty
          const configDoc = await getDoc(doc(db, 'config', 'store'));
          if (!configDoc.exists() && savedConfig) {
            await setDoc(doc(db, 'config', 'store'), savedConfig);
          } else if (!configDoc.exists()) {
            await setDoc(doc(db, 'config', 'store'), CONFIG);
          }

          const productsSnapshot = await getDocs(collection(db, 'products'));
          if (productsSnapshot.empty) {
            let initialProducts = PRODUCTS;
            if (savedProducts) {
               initialProducts = savedProducts.map((p: any) => ({
                ...p,
                images: p.images || (p.imageUrl ? [p.imageUrl] : [])
              }));
            }
            await Promise.all(initialProducts.map(p => setDoc(doc(db, 'products', p.id), p)));
          }
        } catch (err) {
          console.warn('Seeding data skipped due to permissions (expected for non-admin users).', err);
        }

        const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
          const loadedProducts = snapshot.docs.map(doc => doc.data() as Product);
          setProducts(loadedProducts);
          setLoading(false);
        });

        const unsubscribeConfig = onSnapshot(doc(db, 'config', 'store'), (docSnap) => {
          if (docSnap.exists()) {
            setStoreConfig({ ...CONFIG, ...docSnap.data() });
          }
        });

        return () => {
          unsubscribeProducts();
          unsubscribeConfig();
        };
      });
    });
  }, []);

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
    return <Admin products={products} setProducts={setProducts} storeConfig={storeConfig} setStoreConfig={setStoreConfig} />;
  }

  return (
    <ConfigContext.Provider value={storeConfig}>
      <div className="min-h-screen bg-apple-bg selection:bg-apple-blue selection:text-white">
        <Header />
        <main>
          <Hero />
          <Catalog products={products} />
          <Trust />
        </main>
        <Footer />
        <PopupBanner />
      </div>
    </ConfigContext.Provider>
  );
}

