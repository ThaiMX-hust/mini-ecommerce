import React, {useState, useEffect} from 'react';
import styles from './ImageGallery.module.css';

const ImageGallery = ({ images =[]}) =>{
    // luon co anh hien thi
    const [mainImage, setMainImage] = useState('');
    useEffect ( () =>{
        if(images && images.length > 0) {
            setMainImage(images[0]);
        }
    }, [images]);

    if (!images || images.length === 0) {
    return (
      <div className={styles.galleryContainer}>
        <div className={styles.mainImageContainer}>
          <img 
            src="https://via.placeholder.com/500x650.png?text=No+Image" 
            alt="Product placeholder" 
            className={styles.mainImage} 
          />
        </div>
      </div>
    );
  }

    return (

        // chú ý ten class de chinh sua css
        <div className={styles.galleryContainer}>
            <div className={styles.thumbnails}>
                {images.map((img, index) => (
                    <img
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index+1}`}
                    onClick={() => setMainImage(img)}
                    className={`${styles.thumbnailImage} ${img === mainImage ? styles.active : ''}`}
                    />
                ))}
            </div>
            <div className={styles.mainImageContainer}>
                <img src={mainImage} alt="Main" className={styles.mainImage} />

            </div>

        </div>
    );
}
export default ImageGallery;