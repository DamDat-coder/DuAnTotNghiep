// src/contexts/LookupContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface LookupContextType {
  isLookupOpen: boolean;
  setIsLookupOpen: (isOpen: boolean) => void;
}

const LookupContext = createContext<LookupContextType | undefined>(undefined);

export const LookupProvider = ({ children }: { children: ReactNode }) => {
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  return (
    <LookupContext.Provider value={{ isLookupOpen, setIsLookupOpen }}>
      {children}
    </LookupContext.Provider>
  );
};

export const useLookup = () => {
  const context = useContext(LookupContext);
  if (!context) {
    throw new Error("useLookup must be used within a LookupProvider");
  }
  return context;
};