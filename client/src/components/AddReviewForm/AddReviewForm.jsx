import React, {useState} from 'react'
import styles from './AddReviewForm.module.css'

const AddReviewForm = ({ onSubmit, isSubmitting}) =>{

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            alert('Vui lòng nhập nội dung đánh giá');
            return;
        }

        await onSubmit({rating, comment});

        setRating(5);
        setComment('');
    };

    const handleReset = () => {
        setRating(5);
        setComment('');
    };

    return (
        <form className={styles.reviewForm} onSubmit={handleSubmit}>
            <h3 className={styles.formTitle}>Viết đánh giá của bạn</h3>
            
            <div className={styles.formGroup}>
                <label>Đánh giá của bạn:</label>
                <div className={styles.starSelector}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={styles.starButton}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <span className={star <= (hoveredRating || rating) ? styles.starFilled : styles.starEmpty}>
                                ★
                            </span>
                        </button>
                    ))}
                    <span className={styles.ratingText}>({rating} sao)</span>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="comment">Nhận xét của bạn:</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    rows="5"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className={styles.formActions}>
                <button 
                    type="button" 
                    onClick={handleReset}
                    className={styles.resetButton}
                    disabled={isSubmitting}
                >
                    Đặt lại
                </button>
                <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
            </div>
        </form>
    );      

};
export default AddReviewForm;