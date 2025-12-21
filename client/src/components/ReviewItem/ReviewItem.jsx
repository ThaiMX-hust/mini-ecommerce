import React from 'react';
import styles from './ReviewItem.module.css';

const StarRating = ({ rating }) => {
  return (
    <div className={styles.starRating}>
      {'★★★★★☆☆☆☆☆'.slice(5 - rating, 10 - rating)}
    </div>
  );
};

const ReviewItem = ({ review }) => {
  const reviewDate = new Date(review.created_at).toLocaleDateString('vi-VN');

  return (
    <div className={styles.reviewItem}>
      <div className={styles.userInfo}>
        <img 
          src={review.user.avatar_url || `https://ui-avatars.com/api/?name=${review.user.first_name}+${review.user.last_name}`} 
          alt={`${review.user.first_name} ${review.user.last_name}`} 
          className={styles.avatar}
        />
        <div className={styles.userDetails}>
          <span className={styles.userName}>{`${review.user.first_name} ${review.user.last_name}`}</span>
          <span className={styles.reviewDate}>{reviewDate}</span>
        </div>
      </div>
      <StarRating rating={review.rating} />
      <p className={styles.comment}>{review.comment}</p>
    </div>
  );
};

export default ReviewItem;