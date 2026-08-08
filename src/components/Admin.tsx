import React, { useState } from 'react';
import { Product } from '../data';
import { Plus, Pencil, Trash2, X, Copy, Check, ArrowLeft, Lock } from 'lucide-react';

const ADMIN_USER = 'jeffryalonso';
const ADMIN_PASS_HASH = 'da493771a623609181757240c69dfc2ff99bb1fef4a12789b3f3c7f6c4f7afb3';

async function hashPassword(password: string) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Admin({
  products,
  setProducts
}: {
  products: Product[];
  setProducts: (p: Product[]) => void;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [editing, setEditing] = useState<Product | null>(null);
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = username.trim();
    const pass = password.trim();
    
    if (user !== ADMIN_USER) {
      setError('Credenciales incorrectas');
      return;
    }
    
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const hashed = await hashPassword(pass);
        if (hashed === ADMIN_PASS_HASH) {
          setIsAuthenticated(true);
          setError('');
          return;
        }
      } else {
        // Fallback for environments where Web Crypto API is unavailable (e.g. unsecure iframes)
        // In a real production environment this should be handled server-side.
        if (pass === 'jf4ij3jsl0Fdd') {
          setIsAuthenticated(true);
          setError('');
          return;
        }
      }
    } catch (err) {
      console.error(err);
    }
    
    setError('Credenciales incorrectas');
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const product: Product = {
      id: editing?.id || Date.now().toString(),
      model: formData.get('model') as string,
      storage: formData.get('storage') as string,
      condition: formData.get('condition') as string,
      battery: formData.get('battery') as string,
      price: Number(formData.get('price')),
      status: (formData.get('status') as 'Disponible' | 'Vendido') || 'Disponible',
      images: editingImages.length > 0 ? editingImages : [formData.get('imageUrl') as string].filter(Boolean),
    };

    if (isNew) {
      setProducts([...products, product]);
    } else {
      setProducts(products.map(p => p.id === product.id ? product : p));
    }
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      setProducts(products.filter(p => p.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const handleExport = () => {
    const code = `export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-apple-bg flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-apple-bg rounded-full flex items-center justify-center text-apple-text">
              <Lock size={28} strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-center tracking-tight mb-2">Acceso Restringido</h1>
          <p className="text-apple-gray text-center mb-8 text-sm">Ingresa tus credenciales para acceder al panel de administración.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Usuario" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <button 
              type="submit"
              className="w-full py-4 bg-apple-text text-white rounded-full font-medium hover:bg-black transition-colors mt-2"
            >
              Iniciar Sesión
            </button>
            <div className="text-center mt-6">
              <a href="#" className="text-apple-gray hover:text-apple-text text-sm transition-colors inline-flex items-center gap-2">
                <ArrowLeft size={14} /> Volver a la tienda
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-bg p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <a href="#" className="inline-flex items-center gap-2 text-apple-gray hover:text-apple-text transition-colors text-sm font-medium mb-4">
              <ArrowLeft size={16} /> Volver a la Tienda
            </a>
            <h1 className="text-3xl md:text-4xl font-semibold text-apple-text tracking-tight">Inventario</h1>
            <p className="text-apple-gray mt-2">Agrega, edita o elimina artículos de tu catálogo.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-apple-text hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              {copied ? '¡Código Copiado!' : 'Exportar Cambios'}
            </button>
            <button
              onClick={() => { setEditing({} as Product); setEditingImages([]); setIsNew(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-apple-blue text-white rounded-full hover:bg-apple-blue-hover transition-colors font-medium shadow-sm"
            >
              <Plus size={18} />
              Nuevo Artículo
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 text-apple-gray text-sm tracking-tight bg-gray-50/50">
                  <th className="px-6 py-4 font-medium">Producto</th>
                  <th className="px-6 py-4 font-medium">Capacidad</th>
                  <th className="px-6 py-4 font-medium">Precio</th>
                  <th className="px-6 py-4 font-medium">Batería</th>
                  <th className="px-6 py-4 font-medium">Condición</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                   <tr>
                     <td colSpan={7} className="px-6 py-12 text-center text-apple-gray">
                       No hay artículos en el inventario. Haz clic en "Nuevo Artículo" para empezar.
                     </td>
                   </tr>
                ) : null}
                {products.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-apple-text flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-apple-bg overflow-hidden flex-shrink-0">
                        <img src={(p.images && p.images.length > 0) ? p.images[0] : (p as any).imageUrl} alt={p.model} className="w-full h-full object-cover" />
                      </div>
                      {p.model}
                    </td>
                    <td className="px-6 py-4 text-apple-gray">{p.storage}</td>
                    <td className="px-6 py-4 font-medium text-apple-text">${p.price}</td>
                    <td className="px-6 py-4 text-apple-gray">{p.battery}</td>
                    <td className="px-6 py-4 text-apple-gray">{p.condition}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === 'Vendido' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {p.status || 'Disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2 items-center h-[81px]">
                      <button
                        onClick={() => { setEditing(p); setEditingImages(p.images || [(p as any).imageUrl]); setIsNew(false); }}
                        className="p-2.5 text-apple-gray hover:text-apple-blue hover:bg-blue-50 rounded-full transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2.5 text-apple-gray hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {editing && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => { setEditing(null); setIsNew(false); }}
                className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-apple-gray hover:text-apple-text hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-semibold mb-6 tracking-tight">
                {isNew ? 'Nuevo Artículo' : 'Editar Artículo'}
              </h2>

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Modelo</label>
                  <input required name="model" defaultValue={editing.model} className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="Ej: iPhone 13 Pro" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Precio ($)</label>
                    <input required type="number" name="price" defaultValue={editing.price} className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="999" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Capacidad</label>
                    <input required name="storage" defaultValue={editing.storage} className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="Ej: 256GB" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Condición</label>
                    <input required name="condition" defaultValue={editing.condition} className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="Ej: Excelente" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Batería (%)</label>
                    <input required name="battery" defaultValue={editing.battery} className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="Ej: 100%" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Estado</label>
                  <select name="status" defaultValue={editing.status || 'Disponible'} className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all">
                    <option value="Disponible">Disponible</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Fotos del Artículo</label>
                  
                  {editingImages.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {editingImages.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                          <img src={img} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setEditingImages(editingImages.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm text-red-500 hover:bg-red-50"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <label className="w-full p-4 bg-apple-bg hover:bg-gray-200 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer transition-all flex flex-col items-center justify-center text-apple-gray text-sm">
                      <span className="font-medium mb-1">Subir fotos desde tu dispositivo</span>
                      <span>Formatos soportados: JPG, PNG, WEBP</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden"
                        onChange={async (e) => {
                          if (!e.target.files) return;
                          const files = Array.from(e.target.files);
                          const newImages = await Promise.all(files.map(file => {
                            return new Promise<string>((resolve) => {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  const MAX_WIDTH = 800;
                                  const MAX_HEIGHT = 800;
                                  let width = img.width;
                                  let height = img.height;

                                  if (width > height) {
                                    if (width > MAX_WIDTH) {
                                      height *= MAX_WIDTH / width;
                                      width = MAX_WIDTH;
                                    }
                                  } else {
                                    if (height > MAX_HEIGHT) {
                                      width *= MAX_HEIGHT / height;
                                      height = MAX_HEIGHT;
                                    }
                                  }

                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  ctx?.drawImage(img, 0, 0, width, height);
                                  resolve(canvas.toDataURL('image/jpeg', 0.7));
                                };
                                img.src = e.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            });
                          }));
                          setEditingImages(prev => [...prev, ...newImages]);
                        }}
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        id="urlInput"
                        className="flex-1 p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400" 
                        placeholder="O pega una URL (https://...)" 
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('urlInput') as HTMLInputElement;
                          if (input.value) {
                            setEditingImages(prev => [...prev, input.value]);
                            input.value = '';
                          }
                        }}
                        className="p-4 bg-apple-blue text-white rounded-2xl hover:bg-apple-blue-hover transition-colors font-medium whitespace-nowrap"
                      >
                        Añadir URL
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-apple-text text-white rounded-full font-medium hover:bg-black transition-colors">
                    {isNew ? 'Crear Artículo' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
              <h3 className="text-xl font-semibold mb-4 text-apple-text">¿Eliminar artículo?</h3>
              <p className="text-apple-gray mb-8">Esta acción no se puede deshacer.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-apple-text rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
