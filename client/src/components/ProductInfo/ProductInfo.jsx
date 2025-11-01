import React from 'react';
import OptionSelector from '../OptionSelector/OptionSelector';
import QuantitySelector from '../QuantitySelector/QuantitySelector';
import styles from './ProductInfo.module.css';

const ProductInfo = ({ productData, activeVariant , selectedOptions, quantity, onOptionSelect, onQuantityChange, onAddToCart}) => {
    if (!productData) {
        return <div>Loading...</div>;
    }

    // Them neu có phần sale

    return (
        <div className={styles.infoContainer}>
            <p className ={styles.brand}>FASCO</p>
            <h1 className={styles.title}>{productData.name}</h1>
            {/* rating star */}
            <div className={styles.rating}>
                <span>★★★★☆</span>
                <span>(3)</span>
                </div>


            { activeVariant ? (
                <>
                <div className={styles.priceContainer}>
                    <p className={styles.currentPrice}>{activeVariant.price} VND</p>
                    {/*có thể hiển thị giá cũ ở đây */}
                </div>
                <div className={`${styles.stock} ${activeVariant.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                    {activeVariant.stock > 10 ? 'In Stock' : activeVariant.stock > 0 ? `Only ${activeVariant.stock} left in stock!` : 'Out of Stock'}
                </div>
                
                </>
            ) : (
                <p className={styles.priceUnavailable}>Please select an option to view prices</p>
            )}

            {/*render các nhóm tùy chọn*/}
            {productData.options.map(option => (
                <OptionSelector
                    key={option.product_option_id}
                    option={option}
                    selectedValueId={selectedOptions[option.product_option_id]}
                    onSelect={onOptionSelect}
                />
            ))}
            <QuantitySelector quantity={quantity} onQuantityChange={onQuantityChange} maxStock={activeVariant? activeVariant.stock: 0} />
            <button 
                className ={styles.addToCartButton}
                onClick={onAddToCart}
                disabled={!activeVariant || activeVariant.stock === 0}
            >
                {!activeVariant || activeVariant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            </div>
    )
}
export default ProductInfo;