import React from 'react';
import ReviewItem from '../ReviewItem/ReviewItem';
import styles from './ProductReviews.module.css';

const ProductReviews = ({ reviews }) => {
  return (
    <div className={styles.reviewsContainer}>
      <h2 className={styles.title}>Đánh giá của khách hàng</h2>
      {reviews && reviews.length > 0 ? (
        <div className={styles.reviewList}>
          {reviews.map(review => (
            <ReviewItem key={review.review_id} review={review} />
          ))}
        </div>
      ) : (
        <p className={styles.noReviews}>Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</p>
      )}
    </div>
  );
};

export default ProductReviews;