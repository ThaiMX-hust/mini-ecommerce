import React, { useState, useEffect } from 'react';
import styles from './ImageGallery.module.css';

const ImageGallery = ({ images = [] }) => {
    const [mainImage, setMainImage] = useState('');
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (images && images.length > 0) {
            setMainImage(images[0]);
        }
    }, [images]);

    // ✅ FIX: Cải thiện zoom behavior
    const handleMouseMove = (e) => {
        if (!isZoomed) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePosition({ x, y });
    };

    const handleMouseEnter = () => setIsZoomed(true);
    const handleMouseLeave = () => setIsZoomed(false);

    // ✅ FIX: Đường dẫn placeholder đúng
    if (!images || images.length === 0) {
        return (
            <div className={styles.galleryContainer}>
                <div className={styles.mainImageContainer}>
                    <img 
                        src="/images/placeholder.png" 
                        alt="Product placeholder" 
                        className={styles.mainImage} 
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.galleryContainer}>
            {/* ✅ Chỉ hiển thị thumbnails nếu có nhiều hơn 1 ảnh */}
            {images.length > 1 && (
                <div className={styles.thumbnails}>
                    {images.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className={`${styles.thumbnail} ${mainImage === img ? styles.active : ''}`}
                            onClick={() => setMainImage(img)}
                        />
                    ))}
                </div>
            )}

            {/* ✅ ADD: Zoom indicator */}
            <div 
                className={styles.mainImageContainer}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {isZoomed && (
                    <div className={styles.zoomIndicator}>
                        🔍 Hover to zoom
                    </div>
                )}
                <img 
                    src={mainImage} 
                    alt="Main product" 
                    className={styles.mainImage}
                    style={isZoomed ? {
                        transform: `scale(2)`,
                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                        cursor: 'zoom-in',
                        transition: 'none' // ✅ Tắt transition khi zoom để mượt hơn
                    } : {
                        transition: 'transform 0.3s ease' // ✅ Smooth khi không zoom
                    }}
                />
            </div>
        </div>
    );
};

export default ImageGallery;