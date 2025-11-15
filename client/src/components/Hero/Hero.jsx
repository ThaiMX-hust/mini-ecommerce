import React from "react";
import { Link } from "react-router-dom";
import styles from "./Hero.module.css";

// Import các hình ảnh bạn đã lưu
import heroLeft from "../../assets/images/hero-left.jpg";
import heroTop from "../../assets/images/hero-top.jpg";
import heroRight from "../../assets/images/hero-right.jpg";
import heroBottom from "../../assets/images/hero-bottom.jpg";

const Hero = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        {/* Cột bên trái */}
        <div className={styles.heroImageContainer} id={styles.left}>
          <img
            src={heroLeft}
            alt="Model wearing modern outfit"
            className={styles.heroImage}
          />
        </div>

        {/* Cột ở giữa chứa nội dung chính */}
        <div className={styles.heroCenter}>
          <div
            className={`${styles.heroImageContainer} ${styles.smallImage}`}
            id={styles.top}
          >
            <img
              src={heroTop}
              alt="Group of models"
              className={styles.heroImage}
            />
          </div>
          <div className={styles.saleContent}>
            <h1 className={styles.mainHeading}>ULTIMATE</h1>
            <h1 className={`${styles.mainHeading} ${styles.outline}`}>SALE</h1>
            <p className={styles.subHeading}>NEW COLLECTION</p>
            <Link to="/products" className={styles.shopButton}>
              SHOP NOW
            </Link>
          </div>
          <div
            className={`${styles.heroImageContainer} ${styles.smallImage}`}
            id={styles.bottom}
          >
            <img
              src={heroBottom}
              alt="Two happy models"
              className={styles.heroImage}
            />
          </div>
        </div>

        {/* Cột bên phải */}
        <div className={styles.heroImageContainer} id={styles.right}>
          <img
            src={heroRight}
            alt="Model in a turtleneck"
            className={styles.heroImage}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
