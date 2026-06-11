/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';

// 1. Inisialisasi Konteks Keranjang Belanja MotoPart
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const localData = localStorage.getItem('motopart_cart');
    return localData ? JSON.parse(localData) : [];
  });

  // Sinkronisasi otomatis ke LocalStorage setiap ada perubahan isi keranjang
  useEffect(() => {
    localStorage.setItem('motopart_cart', JSON.stringify(cart));
  }, [cart]);

  // Fungsi Tambah ke Keranjang
  const addToCart = (product) => {
    setCart((prevCart) => {
      const isExist = prevCart.find((item) => item.id === product.id);
      if (isExist) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Fungsi Ubah Jumlah Qty (+1 atau -1)
  const updateQuantity = (id, amount) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + amount } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  // Fungsi Hapus Item Tunggal
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Fungsi Kosongkan Keranjang (Setelah Checkout Sukses)
  const clearCart = () => {
  setCart([]);
  localStorage.removeItem('motopart_cart');
};

  // Hitung Total Kuantitas Barang untuk Badge Navbar Putihmu
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

// 2. Custom Hooks untuk Digunakan di Seluruh Komponen Frontend (Navbar, Produk, dll)
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart harus digunakan di dalam CartProvider');
  }
  return context;
};
