const VALID_TYPES = [
  "SET_PRICE",
  "FLASH_SALE",
  "FIXED",
  "PERCENTAGE",
];

const VALID_STATUS = ["DRAFT", "RUNNING", "EXPIRED", "ARCHIVED"];

function validateCreatePromotion(data) {
  const required = [
    "product_id",
    "promotion_name",
    "promotion_type",
    "start_at",
    "end_at"
  ];

  for (const field of required) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }

  if (!VALID_TYPES.includes(data.promotion_type)) {
    throw new Error(`Invalid promotion_type`);
  }

  if (data.promotion_status && !VALID_STATUS.includes(data.promotion_status)) {
    throw new Error(`Invalid promotion_status`);
  }

  const start = new Date(data.start_at);
  const end = new Date(data.end_at);
  if (start >= end) {
    throw new Error("start_at must be earlier than end_at");
  }

  return true;
}

module.exports = { validateCreatePromotion };
