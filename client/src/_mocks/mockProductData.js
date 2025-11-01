// Dữ liệu này có cấu trúc y hệt như những gì backend sẽ trả về
export const mockProductData = {
  product_id: "a3f7943c-8a0b-4bc3-8c24-41306cbcd498",
  name: "Áo chống nắng TomiJun Siêu Cấp",
  description: "Chất liệu co dãn 4 chiều, thoáng khí, chống tia UV UPF50+. Thiết kế hiện đại, phù hợp cho mọi hoạt động ngoài trời.",
  categories: ["Thời trang", "Áo khoác", "Chống nắng"],
  is_disabled: false,
  options: [
    {
      product_option_id: "b0859f28-0cda-4a4d-a3d1-d75cf54fc285",
      option_name: "Color",
      values: [
        { option_value_id: "1dbe7b26-c189-45ac-8d29-6602bd0d11f0", value: "Black" },
        { option_value_id: "a80c6ae2-6ba6-4af8-8f53-2b05757df33b", value: "White" },
      ],
    },
    {
      product_option_id: "660a1b2a-1f02-4fdc-8817-7ce143a47a42",
      option_name: "Size",
      values: [
        { option_value_id: "e2094432-9c54-486e-9fd3-d02fc3a542b9", value: "M" },
        { option_value_id: "41552ad4-fc52-4697-823a-7c97c29bde1a", value: "L" },
        { option_value_id: "bf3b2b1a-c21e-4b2e-8a7f-71de2e9a5e2a", value: "XL" },
      ],
    },
  ],
  variants: [
    {
      product_variant_id: "7c4acd34-d706-4c4c-8cbf-9399cf2281f6",
      sku: "TMJ-UV-BLK-M",
      price: 219000,
      stock: 12,
      images: ["https://bizweb.dktcdn.net/thumb/large/100/399/392/products/h-ak8-pp-web-thumbnails-11.jpg?v=1753066546360", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQibr_FJjXgUeS1Etzs6t8YI5fHFlG-HAR7Hg&s"], // Thay bằng link ảnh thật để test
      options: [
        { product_option_id: "b0859f28-0cda-4a4d-a3d1-d75cf54fc285", values: [{ option_value_id: "1dbe7b26-c189-45ac-8d29-6602bd0d11f0", value: ["Black", "White"] }] },
        { product_option_id: "660a1b2a-1f02-4fdc-8817-7ce143a47a42", values: [{ option_value_id: "e2094432-9c54-486e-9fd3-d02fc3a542b9", value: ["M", "L", "XL"] }] },
      ],
    },
    {
      product_variant_id: "c94c1f0c-66d7-43b5-ba17-fc63d6a753b8",
      sku: "TMJ-UV-WHT-L",
      price: 219000,
      stock: 8,
      images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQibr_FJjXgUeS1Etzs6t8YI5fHFlG-HAR7Hg&s"], // Thay bằng link ảnh thật để test
      options: [
        { product_option_id: "b0859f28-0cda-4a4d-a3d1-d75cf54fc285", values: [{ option_value_id: "a80c6ae2-6ba6-4af8-8f53-2b05757df33b", value: "White" }] },
        { product_option_id: "660a1b2a-1f02-4fdc-8817-7ce143a47a42", values: [{ option_value_id: "41552ad4-fc52-4697-823a-7c97c29bde1a", value: "L" }] },
      ],
    },
     // Thêm các variant khác nếu cần
  ],
};