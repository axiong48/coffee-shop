import { createContext, useContext, useState, useCallback, useMemo } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [locationId, setLocationId] = useState(null);
  const [items, setItems] = useState([]); // { cartId, menuItem, quantity, selectedOptions: [optionObj] }

  const addItem = useCallback((menuItem, quantity, selectedOptions) => {
    setItems((prev) => [
      ...prev,
      {
        cartId: `${menuItem.id}-${Date.now()}-${Math.random()}`,
        menuItem,
        quantity,
        selectedOptions,
      },
    ]);
  }, []);

  const removeItem = useCallback((cartId) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId, quantity) => {
    setItems((prev) => prev.map((i) => (i.cartId === cartId ? { ...i, quantity } : i)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const unitPrice = (item) =>
    item.menuItem.base_price + item.selectedOptions.reduce((sum, o) => sum + o.price_delta, 0);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + unitPrice(i) * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        locationId,
        setLocationId,
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        unitPrice,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
