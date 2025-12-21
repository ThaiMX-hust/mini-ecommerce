import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import * as cartApi from "../api/cartApi";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Invalid token:", error);
        logout();
      }
    }
  }, [token]);

  const login = (newToken) => {
    const decodedUser = jwtDecode(newToken);
    setToken(newToken);
    setUser(decodedUser);
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  // --- PHẦN CART MỚI ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const fetchCart = useCallback(async () => {
    if (!token) return;
    setCartLoading(true);
    try {
      const response = await cartApi.getCart();
      setCart(response.data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user, fetchCart]);

  const addToCart = async (variantId, quantity) => {
    setCartLoading(true);
    try {
      await cartApi.addItemToCart({ product_variant_id: variantId, quantity });
      await fetchCart();
      openCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setCartLoading(false);
    }
  };

  const updateCartItemQuantity = async (itemId, quantity) => {
    setCartLoading(true);
    try {
      await cartApi.updateItemQuantity(itemId, { quantity });
      await fetchCart();
    } catch (error) {
      console.error("Failed to update cart item:", error);
    } finally {
      setCartLoading(false);
    }
  };

  const removeCartItem = async (itemId) => {
    setCartLoading(true);
    try {
      await cartApi.removeItemFromCart(itemId);
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove cart item:", error);
    } finally {
      setCartLoading(false);
    }
  };

  const value = {
    // Auth
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
    // Cart
    isCartOpen,
    cart,
    cartLoading,
    cartItemCount: cart?.items?.length || 0,
    openCart,
    closeCart,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
