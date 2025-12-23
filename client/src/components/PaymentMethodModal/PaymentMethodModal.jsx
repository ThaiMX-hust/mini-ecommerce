import React, { useState } from 'react';
import styles from './PaymentMethodModal.module.css';

const PaymentMethodModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [selectedMethod, setSelectedMethod] = useState('');

  const handleConfirm = () => {
    if (!selectedMethod) {
      alert('Vui lòng chọn phương thức thanh toán');
      return;
    }
    onConfirm(selectedMethod);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Chọn phương thức thanh toán</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div 
            className={`${styles.paymentOption} ${selectedMethod === 'vnpay' ? styles.selected : ''}`}
            onClick={() => setSelectedMethod('vnpay')}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="vnpay"
              checked={selectedMethod === 'vnpay'}
              onChange={(e) => setSelectedMethod(e.target.value)}
            />
            <div className={styles.optionInfo}>
              <img 
                src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png" 
                alt="VNPay"
                className={styles.paymentLogo}
              />
              <div>
                <h3>VNPay</h3>
                <p>Thanh toán qua ví điện tử VNPay</p>
              </div>
            </div>
          </div>

          <div 
            className={`${styles.paymentOption} ${selectedMethod === 'stripe' ? styles.selected : ''}`}
            onClick={() => setSelectedMethod('stripe')}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={selectedMethod === 'stripe'}
              onChange={(e) => setSelectedMethod(e.target.value)}
            />
            <div className={styles.optionInfo}>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                alt="Stripe"
                className={styles.paymentLogo}
              />
              <div>
                <h3>Stripe</h3>
                <p>Thanh toán qua thẻ tín dụng/ghi nợ quốc tế</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.cancelBtn} 
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button 
            className={styles.confirmBtn} 
            onClick={handleConfirm}
            disabled={isLoading || !selectedMethod}
          >
            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;