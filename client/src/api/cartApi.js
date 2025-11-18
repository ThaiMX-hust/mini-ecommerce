import api from "../api.js";
export const getCart = () => {
  return api.get("/cart");
};

export const addItemToCart = (item) => {
  // item là { product_variant_id: "...", quantity: ... }
  return api.post("/cart", item);
};

export const updateItemQuantity = (itemId, { quantity }) => {
  return api.patch(`/cart/${itemId}`, { quantity });
};

export const removeItemFromCart = (itemId) => {
  return api.delete(`/cart/${itemId}`);
};
