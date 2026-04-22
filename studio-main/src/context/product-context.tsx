lloewatchshop'use client';

import { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import type { Product, Image } from '@/lib/types';
import type { Product } from '@/lib/types';
import { doc, collection, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useUserProfile } from '@/firebase/auth/use-user-profile';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useUserProfile } from '@/firebase/auth/use-user-profile';
import { useCollection } from '@/firebase/firestore/use-collection';


const ProductContext = createContext({
  products: [] as Product[],
  loading: false,
  addProduct: async () => {},
  updateProduct: async () => {},
  deleteProduct: async () => {},
getProductById: (id: string) => undefined as Product | undefined,
} as any);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const isAdmin = user?.email === 'admin@example.com'; // Mock

  useEffect(() => {
    // Demo products
    const demoProducts: Product[] = [
      {
        id: '1',
        name: 'Demo Watch 1',
        category: 'Men',
        productType: 'watch',
        price: 4999,
        images: ['hsk-m-001-1'],
        description: 'Demo product - local state only',
        stockStatus: 'Available',
        tags: ['demo'],
        isTrending: true,
        isDealOfTheDay: false,
        rating: 4.5,
        reviewCount: 10,
        viewCount: 100,
        createdAt: new Date().toISOString(),
      },
    ];
    setProducts(demoProducts);
  }, []);

  const addProduct = async (productData: any) => {
    if (!isAdmin) return;
    setLoading(true);
    const newProduct: Product = {
      ...productData,
      id: `demo-${Date.now()}`,
      isTrending: false,
      isDealOfTheDay: false,
      rating: 4.0,
      reviewCount: 0,
      viewCount: 0,
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    setLoading(false);
    console.log('Added demo product:', newProduct);
  };

  const updateProduct = async (id: string, updates: any) => {
    if (!isAdmin) return;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = async (id: string) => {
    if (!isAdmin) return;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  return context;
}

