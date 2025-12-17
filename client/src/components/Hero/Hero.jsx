import React from "react";
import { Link } from "react-router-dom";
import styles from "./Hero.module.css";

import heroLeft from "../../assets/images/hero-left.jpg";
import heroTop from "../../assets/images/hero-top.jpg";
import heroRight from "../../assets/images/hero-right.jpg";
import heroBottom from "../../assets/images/hero-bottom.jpg";

const Hero = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        {/* Cột trái */}
        <div className={styles.heroImageContainer} id={styles.left}>
          <img
            src={heroLeft}
            alt="Người mẫu thời trang với trang phục hiện đại"
            className={styles.heroImage}
          />
        </div>

        {/* Cột giữa */}
        <div className={styles.heroCenter}>
          <div
            className={`${styles.heroImageContainer} ${styles.smallImage}`}
            id={styles.top}
          >
            <img
              src={heroTop}
              alt="Bộ sưu tập thời trang mới"
              className={styles.heroImage}
            />
          </div>

          <div className={styles.saleContent}>
            <h1 className={styles.mainHeading}>ULTIMATE</h1>
            <h1 className={`${styles.mainHeading} ${styles.outline}`}>
              SALE
            </h1>
            <p className={styles.subHeading}>BỘ SƯU TẬP MỚI</p>
            <Link to="/products" className={styles.shopButton}>
              <span>MUA NGAY</span>
            </Link>
          </div>

          <div
            className={`${styles.heroImageContainer} ${styles.smallImage}`}
            id={styles.bottom}
          >
            <img
              src={heroBottom}
              alt="Bộ sưu tập người mẫu thời trang"
              className={styles.heroImage}
            />
          </div>
        </div>

        {/* Cột phải */}
        <div className={styles.heroImageContainer} id={styles.right}>
          <img
            src={heroRight}
            alt="Người mẫu mặc áo cổ lọ"
            className={styles.heroImage}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
