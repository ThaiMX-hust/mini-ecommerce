import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import styles from './PaymentResultPage.module.css';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const success = searchParams.get('success') === 'true';
    const message = searchParams.get('message') || 'Unknown error';
    const orderId = searchParams.get('orderId');

    const handleBackToOrders = () => {
        // Thêm query param để trigger refresh
        navigate('/orders?fromPayment=true');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {success ? (
                    <>
                        <div className={styles.iconSuccess}>✓</div>
                        <h1 className={styles.title}>Thanh toán thành công!</h1>
                        <p className={styles.message}>{message}</p>
                        {orderId && (
                            <p className={styles.orderId}>Mã đơn hàng: {orderId}</p>
                        )}
                        <div className={styles.actions}>
                            <button onClick={handleBackToOrders} className={styles.btnPrimary}>
                                Xem lịch sử đơn hàng
                            </button>
                            <Link to="/" className={styles.btnSecondary}>
                                Về trang chủ
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.iconError}>✕</div>
                        <h1 className={styles.title}>Payment Failed</h1>
                        <p className={styles.message}>{message}</p>
                        <div className={styles.actions}>
                            <Link to="/checkout" className={styles.btnPrimary}>
                                Thử lại
                            </Link>
                            <Link to="/" className={styles.btnSecondary}>
                                Về trang chủ
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentResultPage;