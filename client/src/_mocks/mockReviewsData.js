export const mockReviewsData = {
  reviews: [
    {
      review_id: "review-uuid-01",
      product_id: "a3f7943c-8a0b-4bc3-8c24-41306cbcd498",
      user: {
        user_id: "user-uuid-101",
        first_name: "An",
        last_name: "Nguyễn",
        avatar_url: "https://i.pravatar.cc/150?u=annguyen"
      },
      rating: 5,
      comment: "Vải rất đẹp, mặc mát và thấm mồ hôi tốt. Form áo chuẩn, mình rất ưng ý. Sẽ ủng hộ shop lần sau!",
      created_at: "2025-10-28T10:30:00.000Z"
    },
    {
      review_id: "review-uuid-02",
      product_id: "a3f7943c-8a0b-4bc3-8c24-41306cbcd498",
      user: {
        user_id: "user-uuid-102",
        first_name: "Bình",
        last_name: "Trần",
        avatar_url: "https://i.pravatar.cc/150?u=binhtran"
      },
      rating: 4,
      comment: "Giao hàng nhanh. Màu sắc hơi khác một chút so với trên ảnh nhưng chất lượng vải ổn trong tầm giá.",
      created_at: "2025-10-25T15:00:00.000Z"
    },
    {
        review_id: "review-uuid-03",
        product_id: "a3f7943c-8a0b-4bc3-8c24-41306cbcd498",
        user: {
          user_id: "user-uuid-103",
          first_name: "Chi",
          last_name: "Lê",
          avatar_url: null // Trường hợp người dùng không có avatar
        },
        rating: 5,
        comment: "Sản phẩm tuyệt vời!",
        created_at: "2025-10-22T09:12:00.000Z"
      }
  ]
};