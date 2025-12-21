import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './PaymentResultPage.module.css';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get('success') === 'true';
    const message = searchParams.get('message') || 'Unknown error';
    const orderId = searchParams.get('orderId');

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {success ? (
                    <>
                        <div className={styles.iconSuccess}>✓</div>
                        <h1 className={styles.title}>Payment Successful!</h1>
                        <p className={styles.message}>{message}</p>
                        {orderId && (
                            <p className={styles.orderId}>Order ID: {orderId}</p>
                        )}
                        <div className={styles.actions}>
                            <Link to="/orders" className={styles.btnPrimary}>
                                View Order History
                            </Link>
                            <Link to="/" className={styles.btnSecondary}>
                                Back to Home
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
                                Try Again
                            </Link>
                            <Link to="/" className={styles.btnSecondary}>
                                Back to Home
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentResultPage;