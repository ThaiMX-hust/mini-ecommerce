import React, { useState } from 'react'; // ✅ THÊM useState
import OptionSelector from '../OptionSelector/OptionSelector';
import QuantitySelector from '../QuantitySelector/QuantitySelector';
import styles from './ProductInfo.module.css';

const ProductInfo = ({ 
    productData, 
    activeVariant, 
    selectedOptions, 
    quantity, 
    onOptionSelect, 
    onQuantityChange, 
    onAddToCart,
    isAddingToCart,
    averageRating =0,
    reviewCount =0 
}) => {
    const [isFavorite, setIsFavorite] = useState(false);

    const handleToggleFavorite = () => {
        setIsFavorite(!isFavorite);
        // TODO: Call API to add/remove from wishlist
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: productData.name,
                    text: `Check out ${productData.name}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <>
                {'★'.repeat(fullStars)}
                {hasHalfStar && '⯨'}
                {'☆'.repeat(emptyStars)}
            </>
        );
    };

    if (!productData || !productData.options) {
        return <div className={styles.loading}>Loading product information...</div>;
    }

    return (
        <div className={styles.infoContainer}>
            <div className={styles.headerRow}>
                <p className={styles.brand}>FASCO</p>
                <button 
                    className={styles.favoriteButton}
                    onClick={handleToggleFavorite}
                    aria-label="Add to wishlist"
                >
                    
                </button>
            </div>
            
            <h1 className={styles.title}>{productData.name}</h1>
            
            <div className={styles.rating}>
                <span className={styles.stars}>
                    {renderStars(averageRating)}
                </span>
                <span className={styles.ratingText}>
                    {averageRating > 0 
                        ? `${averageRating.toFixed(1)} (${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})` 
                        : 'No reviews yet'}
                </span>
            </div>


            {activeVariant ? (
                <>
                    <div className={styles.priceContainer}>
                        <p className={styles.currentPrice}>
                            {activeVariant.price.toLocaleString('vi-VN')} VND
                        </p>
                    </div>
                    <div className={`${styles.stock} ${activeVariant.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                        {activeVariant.stock > 10 
                            ? 'In Stock' 
                            : activeVariant.stock > 0 
                            ? `Only ${activeVariant.stock} left in stock!` 
                            : 'Out of Stock'}
                    </div>
                </>
            ) : (
                <p className={styles.priceUnavailable}>Please select an option to view prices</p>
            )}

            {/* Render options */}
            {productData.options.map(option => (
                <OptionSelector
                    key={option.product_option_id}
                    option={option}
                    selectedValueId={selectedOptions[option.product_option_id]}
                    onSelect={onOptionSelect}
                />
            ))}
            
            <QuantitySelector 
                quantity={quantity} 
                onQuantityChange={onQuantityChange} 
                maxStock={activeVariant ? activeVariant.stock : 0} 
            />
            
            <div className={styles.actionButtons}>
                <button 
                    className={styles.addToCartButton}
                    onClick={onAddToCart}
                    disabled={!activeVariant || activeVariant.stock === 0 || isAddingToCart}
                >
                    {isAddingToCart ? (
                        <>
                            <span className={styles.spinner}></span>
                            Adding...
                        </>
                    ) : (
                        !activeVariant || activeVariant.stock === 0 ? 'Out of Stock' : 'Add to Cart'
                    )}
                </button>
            </div>

            {/* Share Section */}
            <div className={styles.shareSection}>
                <span>Share:</span>
                <button onClick={handleShare} className={styles.shareButton}>
                    🔗 Share
                </button>
            </div>
        </div>
    );
};

export default ProductInfo;