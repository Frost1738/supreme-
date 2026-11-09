import React, { createContext, useState } from "react";

export const GlobalContext = createContext();

export default function GlobalProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [likedItems, setLikedItems] = useState([]);
  const [session, setSession] = useState(null);

  return (
    <GlobalContext.Provider
      value={{
        cartItems,
        likedItems,
        session,
        setCartItems,
        setLikedItems,
        setSession,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
