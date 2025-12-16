import api from "../api";


const CATEGORY_MAP_VI = {
  CAT_SANDALS: "Dép / Sandal",
  CAT_SUNGLASSES: "Kính mát",
  CAT_WALLETS: "Ví",
  CAT_FORMAL_SHOES: "Giày tây",
  CAT_KURTAS: "Áo Kurta",
  CAT_WATCHES: "Đồng hồ",
  CAT_SAREES: "Sari (Ấn Độ)",
  CAT_HANDBAGS: "Túi xách",
  CAT_BELTS: "Thắt lưng",
  CAT_SHIRTS: "Áo sơ mi",
  CAT_FLATS: "Giày bệt",
  CAT_TIES: "Cà vạt",
  CAT_JEANS: "Quần jeans",
  CAT_HEELS: "Giày cao gót",
  CAT_SHORTS: "Quần short",
  CAT_DRESSES: "Đầm / Váy",
  CAT_SOCKS: "Tất / Vớ",
  CAT_BRIEFS: "Quần lót nam",
  CAT_CASUAL_SHOES: "Giày thường ngày",
  CAT_BACKPACKS: "Ba lô",
  CAT_EARRINGS: "Bông tai",
  CAT_TOPS: "Áo (Tops)",
  CAT_TROUSERS: "Quần dài",
  CAT_FLIP_FLOPS: "Dép xỏ ngón",
  CAT_TSHIRTS: "Áo thun",
};



/**
 * Lấy danh sách tất cả categories từ API
 * @returns {Promise<Array<object>>} Mảng các object { code, name, category_id, category_description }
 */
export const getAllCategories = async () => {
  try {
    const response = await api.get("/categories");
    console.log("Categories API Response:", response.data);
    // API trả về mảng categories với structure:
    // [{ category_id, category_name, category_code, category_description }]
    return response.data.map(cat => ({
      code: cat.category_code,
      name: CATEGORY_MAP_VI[cat.category_code] || cat.category_name,
      category_id: cat.category_id,
      description: cat.category_description
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
};

// Hàm này có thể hữu ích cho trang danh sách sản phẩm
export const getAllPossibleCategories = async () => {
  return getAllCategories();
};