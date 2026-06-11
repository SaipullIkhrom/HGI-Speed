/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const localData = localStorage.getItem('motopart_wishlist');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem('motopart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Fungsi toggle: Kalau belum ada ditambahkan, kalau sudah ada dihapus (Like/Unlike)
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const isExist = prev.find((item) => item.id === product.id);
      if (isExist) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (id) => wishlist.some((item) => item.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist harus digunakan di dalam WishlistProvider');
  }
  return context;
};
