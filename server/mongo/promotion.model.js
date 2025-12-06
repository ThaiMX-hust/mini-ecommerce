const mongoose = require("mongoose");

const VariantExcludeSchema = new mongoose.Schema({
  product_variant_id: { type: String }
}, { _id: false });

const TimeSlotSchema = new mongoose.Schema({
  start_time: { type: Number, required: true },
  end_time: { type: Number, required: true }
}, { _id: false });

const PromotionSchema = new mongoose.Schema({
  promotion_name: { type: String, required: true },
  promotion_description: { type: String },
  promotion_type: { type: String, required: true },
  promotion_status: { type: String, required: true },
  promotion_value: { type: Number, required: true },

  promotion_metadata: {
    product_id: { type: String, required: true },
    exclude_variant_id: { type: [VariantExcludeSchema], default: [] },
    max_usage: { type: Number, required: true },
    current_usage: { type: Number, required: true },
    start_at: { type: Number, required: true },
    end_at: { type: Number, required: true }
  },

  promotion_rules: {
    time: {
      time_slots_count: { type: Number },
      time_slots: { type: [TimeSlotSchema], default: [] }
    },
    limit: {
      max_per_order: { type: Number },
      max_per_user: { type: Number }
    },
    constraints: {
      min_order_value: { type: Number },
      min_quantity: { type: Number }
    }
  },

  created_at: { type: Number, required: true }
});

module.exports = mongoose.model(
  "Promotion",
  PromotionSchema
);
