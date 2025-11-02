import React from 'react';
import styles from './QuantitySelector.module.css';

const QuantitySelector = ({quantity, onQuantityChange, maxStock})=>{
    const increment = () =>{
        if(quantity < maxStock){
            onQuantityChange(quantity + 1);
        }
    } 
    const decrement = () => onQuantityChange(Math.max(1, quantity - 1));
    return (
        <div className={styles.selectorContainer}>
            <button className={styles.button} 
            onClick={decrement}
            disabled={quantity <= 1}
            aria-label="Decrement quantity"
    
            >-</button>
            <input type="number" className={styles.input} value={quantity} readOnly />
            <button className={styles.button}
            disabled={quantity >= maxStock}
            aria-label="Increment quantity"
            onClick={increment}
            >+</button>
        </div>
    )
};
export default QuantitySelector;

