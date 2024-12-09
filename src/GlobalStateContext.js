/* eslint-disable react/prop-types */
// src/GlobalStateContext.js
import React, { createContext, useContext, useState } from 'react';

// Create the context
const GlobalStateContext = createContext();

// Create a provider component
export const GlobalStateProvider = ({ children }) => {
  const [globalBrandsData, setGlobalBrandsData] = useState([]);

  return (
    <GlobalStateContext.Provider value={{ globalBrandsData, setGlobalBrandsData }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook for easy access to the context
export const useGlobalState = () => useContext(GlobalStateContext);
