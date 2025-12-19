import fs from "fs";
import axios from "axios";
import FormData from "form-data";

// ================= CONFIG =================
const API_URL = "http://100.115.59.81:3636/api/v1/products";
const TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjVhYmI4NDMtYzdiNi00YjJjLTllYmItYjc2YTc3M2NhZjNlIiwiY2FydF9pZCI6bnVsbCwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2NTcxODkyMywiZXhwIjoxNzY1NzIyNTIzfQ.4xZ6qEZLeXP9X-9_5jaY2o36saBcSEwKq_nZ4Cgnof8";
const DATA_FILE = "./products.json";
// =========================================

// download image → Buffer
async function downloadImage(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 20000
  });
  return Buffer.from(res.data);
}

async function addProduct(product) {
  const form = new FormData();

  /* ========= BASIC TEXT FIELDS ========= */
  form.append("name", product.name);
  form.append("description", product.description);
  form.append("is_disabled", String(product.is_disabled));

  /* ========= JSON STRING FIELDS ========= */
  form.append("categories", JSON.stringify(product.categories));
  form.append("options", JSON.stringify(product.options));

  /* ========= VARIANTS IMAGES ========= */
  const imageMap = new Map(); // image_url -> index
  let index = 0;

  for (const v of product.variants) {
    if (!v.image_url) continue;

    if (!imageMap.has(v.image_url)) {
      const buffer = await downloadImage(v.image_url);
      const filename = v.image_url.split("/").pop();

      // ⚠️ field name MUST be variants_images
      form.append("variants_images", buffer, { filename });

      imageMap.set(v.image_url, index++);
    }
  }

  /* ========= VARIANTS (JSON STRING – ĐÚNG FORMAT BẠN ĐƯA) ========= */
  const variantsPayload = product.variants.map(v => ({
    sku: String(v.sku),
    raw_price: String(v.raw_price),
    stock_quantity: String(v.stock_quantity),
    image_indexes: v.image_url ? [imageMap.get(v.image_url)] : [],
    is_disabled: String(v.is_disabled),
    options: v.options
  }));

  form.append("variants", JSON.stringify(variantsPayload));

  /* ========= CALL API ========= */
  const res = await axios.post(API_URL, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: TOKEN
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });

  return res.data;
}

async function run() {
  const products = JSON.parse(
    fs.readFileSync(DATA_FILE, "utf-8")
  );

  for (const product of products) {
    try {
      console.log("🚀 Creating:", product.name);
      const result = await addProduct(product);
      console.log("✅ Created product_id:", result.product_id);
    } catch (err) {
      console.error("❌ Failed:", product.name);
      console.error(err.response?.data || err.message);
    }
  }
}

run();
