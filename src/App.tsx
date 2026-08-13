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
      import('./supabase').then(async ({ supabase }) => {
        try {
          // Check config
          const { data: configData, error: configError } = await supabase
            .from('store_config')
            .select('*')
            .eq('id', 'store')
            .single();

          if (configError && configError.code === 'PGRST116') {
             // Does not exist
             if (savedConfig) {
               await supabase.from('store_config').insert({ id: 'store', ...savedConfig });
             } else {
               await supabase.from('store_config').insert({ id: 'store', ...CONFIG });
             }
          }

          // Check products
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*');

          if (productsData && productsData.length === 0) {
            let initialProducts = PRODUCTS;
            if (savedProducts) {
               initialProducts = savedProducts.map((p: any) => ({
                ...p,
                images: p.images || (p.imageUrl ? [p.imageUrl] : [])
              }));
            }
            // insert initial products
            for (const p of initialProducts) {
               await supabase.from('products').insert(p);
            }
          }
        } catch (err) {
          console.warn('Seeding data skipped.', err);
        }

        // Subscriptions (Supabase Realtime)
        const productsSubscription = supabase
          .channel('public:products')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
             // Fetch all on change for simplicity, like onSnapshot
             supabase.from('products').select('*').then(({ data }) => {
               if (data) setProducts(data as Product[]);
             });
          })
          .subscribe();

        const configSubscription = supabase
          .channel('public:store_config')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'store_config' }, () => {
             supabase.from('store_config').select('*').eq('id', 'store').single().then(({ data }) => {
               if (data) setStoreConfig({ ...CONFIG, ...data });
             });
          })
          .subscribe();

        // Initial fetch
        supabase.from('products').select('*').then(({ data }) => {
          if (data) setProducts(data as Product[]);
          setLoading(false);
        });

        supabase.from('store_config').select('*').eq('id', 'store').single().then(({ data }) => {
          if (data) setStoreConfig({ ...CONFIG, ...data });
        });

        return () => {
          supabase.removeChannel(productsSubscription);
          supabase.removeChannel(configSubscription);
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

