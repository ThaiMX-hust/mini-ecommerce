import React from 'react';
import ReviewItem from '../ReviewItem/ReviewItem';
import AddReviewForm from '../AddReviewForm/AddReviewForm';
import styles from './ProductReviews.module.css';

const ProductReviews = ({ 
  reviews, 
  isAuthenticated, 
  onAddReview, 
  isSubmitting 
}) => {
  return (
    <div className={styles.reviewsContainer}>
      <h2 className={styles.title}>Đánh giá của khách hàng</h2>
      
      {/* Form thêm review - chỉ hiển thị khi user đã đăng nhập */}
      {isAuthenticated ? (
        <AddReviewForm 
          onSubmit={onAddReview} 
          isSubmitting={isSubmitting}
        />
      ) : (
        <div className={styles.loginPrompt}>
          <p>Bạn cần <a href="/login">đăng nhập</a> để có thể đánh giá sản phẩm này.</p>
        </div>
      )}

      {/* Danh sách reviews */}
      {reviews && reviews.length > 0 ? (
        <div className={styles.reviewList}>
          {reviews.map(review => (
            <ReviewItem key={review.review_id} review={review} />
          ))}
        </div>
      ) : (
        <p className={styles.noReviews}>
          Chưa có đánh giá nào cho sản phẩm này. 
          {isAuthenticated && ' Hãy là người đầu tiên đánh giá!'}
        </p>
      )}
    </div>
  );
};

export default ProductReviews;