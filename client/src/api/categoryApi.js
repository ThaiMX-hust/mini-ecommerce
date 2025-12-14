import api from "../api";

// Bản đồ để chuyển code thành tên. Đây là "nguồn sự thật" của chúng ta.
const CATEGORY_MAP = {
  CAT_COAT: "Áo Khoác",
  CAT_FORMAL: "Công Sở",
  CAT_JEANS: "Quần Jeans",
  CAT_TSHIRT: "Áo Thun",
  CAT_SUMMER: "Đồ Hè",
  CAT_SHORT: "Quần Short",
  CAT_SHIRT: "Áo Sơ Mi",
  CAT_SKIRT: "Chân Váy",
  CAT_SWEATER: "Áo Len",
  CAT_DRESS: "Đầm/Váy",
  CAT_JACKET: "Áo Khoác Gió",
  CAT_HOODIE: "Áo Hoodie",
};

// **QUAN TRỌNG:** Danh sách các category chính mà bạn muốn hiển thị dưới dạng tab.
// Bạn có thể thêm/bớt các category ở đây để kiểm soát giao diện.
const PRIMARY_CATEGORY_CODES = [
  "CAT_TSHIRT",
  "CAT_SHIRT",
  "CAT_JEANS",
  "CAT_DRESS",
  "CAT_COAT",
  "CAT_SWEATER",
];

/**
 * Lấy danh sách các category chính được định nghĩa sẵn.
 * @returns {Promise<Array<object>>} Mảng các object { code, name }.
 */
export const getAllCategories = async () => {
  // Hàm này giờ đây không cần gọi API nữa, nó trả về dữ liệu đã được định nghĩa.
  // Điều này làm cho trang tải nhanh hơn và đáng tin cậy hơn.
  const categories = PRIMARY_CATEGORY_CODES.map((code) => ({
    code: code,
    name: CATEGORY_MAP[code] || code,
  }));

  // Trả về trong một Promise để giữ cấu trúc bất đồng bộ (async)
  return Promise.resolve(categories);
};

// Hàm này có thể hữu ích cho trang danh sách sản phẩm, nếu bạn muốn hiển thị TẤT CẢ categories
export const getAllPossibleCategories = () => {
  return Object.entries(CATEGORY_MAP).map(([code, name]) => ({ code, name }));
};

/**
 * Fetches all categories.
 * Note: The API might need a dedicated endpoint like GET /api/categories.
 * We'll assume one exists for this admin page.
 * @returns {Promise<object>}
 */
export const getAllCategoriesAdmin = () => {
  // Assuming the backend provides a GET /categories endpoint. If not, this needs adjustment.
  return api.get("/categories");
};

/**
 * Creates one or more new categories.
 * @param {Array<object>} categoriesData - Array of category objects to create.
 * @returns {Promise<object>}
 */
export const createCategories = (categoriesData) => {
  return api.post("/categories", { categories: categoriesData });
};

/**
 * Updates a specific category.
 * @param {string} categoryId - The ID of the category to update.
 * @param {object} categoryData - The new data for the category.
 * @returns {Promise<object>}
 */
export const updateCategory = (categoryId, categoryData) => {
  return api.patch(`/categories/${categoryId}`, categoryData);
};

/**
 * Deletes a specific category.
 * @param {string} categoryId - The ID of the category to delete.
 * @returns {Promise<object>}
 */
export const deleteCategory = (categoryId) => {
  return api.delete(`/categories/${categoryId}`);
};
