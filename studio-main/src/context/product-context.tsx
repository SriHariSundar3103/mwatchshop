
'use client';

import { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import type { Product, Image } from '@/lib/types';
import { doc, collection, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useUserProfile } from '@/firebase/auth/use-user-profile';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';

const ProductContext = createContext({
  products: [] as Product[],
  images: [] as Image[],
  loading: false,
  addProduct: async () => {},
  updateProduct: async () => {},
  deleteProduct: async () => {},
  getProductById: (id: string) => undefined as Product | undefined,
} as any);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const db = useFirestore();
  const { isAdmin } = useUserProfile();
  const { toast } = useToast();

  const productsQuery = useMemoFirebase(
    () => query(collection(db, 'products'), orderBy('createdAt', 'desc')),
    [db]
  );

  const { data: rawProducts } = useCollection<Product>(productsQuery);

  const products = useMemo(
    () => rawProducts?.map((p): Product => ({
      ...p,
      createdAt: p.createdAt && (p.createdAt as any).toDate ? (p.createdAt as any).toDate().toISOString() : p.createdAt || new Date().toISOString(),
    })) || [],
    [rawProducts]
  );

  const imagesQuery = useMemoFirebase(
    () => collection(db, 'images'),
    [db]
  );

  const { data: rawImages } = useCollection<Image>(imagesQuery);

  const images = useMemo(() => rawImages || [], [rawImages]);

  const addProduct = async (productData: any) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "Admin access required.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        ...productData,
        isTrending: false,
        isDealOfTheDay: false,
        rating: 4.0,
        reviewCount: 0,
        viewCount: 0,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Success",
        description: "Product added successfully.",
      });
    } catch (error) {
      console.error("Failed to add product:", error);
      toast({
        title: "Error",
        description: "Failed to add product.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const updateProduct = async (id: string, updates: any) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "Admin access required.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'products', id), updates);
      toast({
        title: "Success",
        description: "Product updated.",
      });
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "Admin access required.",
        variant: "destructive",
      });
      return;
    }
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({
        title: "Success",
        description: "Product deleted.",
      });
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

const getProductById = (id: string) => {
  return products.find((p: Product) => p.id === id);
};

  return (
    <ProductContext.Provider value={{
      products,
      images,
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
