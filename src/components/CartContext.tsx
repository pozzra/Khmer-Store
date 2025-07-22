import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '@/mock/products';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  mage: string;
  dsc: string;
  quantity: number;
}

const CartContext = createContext<any>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add to cart
  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Remove from cart
  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id));

  // Clear cart
  const clearCart = () => setCart([]);

  // Update quantity
  const updateQuantity = (id: number, quantity: number) =>
    setCart(prev => prev.map(i => (i.id === id ? { ...i, quantity } : i)));

  // Increment/Decrement
  const increment = (id: number) => updateQuantity(id, (cart.find(i => i.id === id)?.quantity || 1) + 1);
  const decrement = (id: number) => updateQuantity(id, Math.max(1, (cart.find(i => i.id === id)?.quantity || 1) - 1));

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, increment, decrement }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 