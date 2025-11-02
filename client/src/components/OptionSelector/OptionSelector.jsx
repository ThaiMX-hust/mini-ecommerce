import React from 'react';
import styles from './OptionSelector.module.css';

const OptionSelector = ({option, selectedValueId, onSelect}) =>{
    const isColorOption = option.option_name.toLowerCase() === 'color';
    return (
        <div className = {styles.optionGroup}>
            <p className={styles.optionName}>{option.option_name}: <span>{option.values.find(value => value.option_value_id === selectedValueId)?.value}</span></p>
            <div className={styles.valuesContainer}>
                {option.values.map(value =>{
                    const isActive = value.option_value_id === selectedValueId;
                    if(isColorOption){
                        return (
                            <button
                            key = {value.option_value_id}
                            className = {`${styles.colorSwatch} ${isActive ? styles.active : ''}`}
                            style = {{backgroundColor:  value.value.toLowerCase()}}
                            onClick ={() => onSelect(option.product_option_id, value.option_value_id)}
                            aria-label={`Select color ${value.value}`}
                            >
                            </button>
                        )
                    }
                    return (
                        <button
                        key = {value.option_value_id}
                        className = {`${styles.sizeButton} ${isActive ? styles.active : ''}`}
                        onClick ={() => onSelect(option.product_option_id, value.option_value_id)}
                        >
                            {value.value}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
                

export default OptionSelector;