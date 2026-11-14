"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase-auth";
import { db } from "@/lib/firebase-db";
import { doc, getDoc } from "firebase/firestore";
import { isAdmin as checkIsAdmin } from "@/lib/admin-config";

interface AuthContextType {
  user: User | null;
  restaurantData: any | null;
  loading: boolean;
  isAdmin: boolean;
  refreshRestaurantData: () => Promise<void>;
  updateRestaurantDataLocally: (data: Partial<any>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  restaurantData: null,
  loading: true,
  isAdmin: false,
  refreshRestaurantData: async () => {},
  updateRestaurantDataLocally: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [restaurantData, setRestaurantData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRestaurantData = async (uid: string) => {
    try {
      const docRef = doc(db, "restaurants", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRestaurantData(docSnap.data());
      }
    } catch (e) {
      console.error("Failed to fetch restaurant data", e);
    }
  };

  const refreshRestaurantData = async () => {
    if (user?.uid) {
      await fetchRestaurantData(user.uid);
    }
  };

  const updateRestaurantDataLocally = (newData: Partial<any>) => {
    setRestaurantData((prev: any) => ({ ...(prev || {}), ...newData }));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchRestaurantData(user.uid);
      } else {
        setRestaurantData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      restaurantData,
      loading,
      isAdmin: checkIsAdmin(user?.email),
      refreshRestaurantData,
      updateRestaurantDataLocally,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
