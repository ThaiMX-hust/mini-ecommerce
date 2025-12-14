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
        {/* Left Column */}
        <div className={styles.heroImageContainer} id={styles.left}>
          <img
            src={heroLeft}
            alt="Fashion model in modern outfit"
            className={styles.heroImage}
          />
        </div>

        {/* Center Column */}
        <div className={styles.heroCenter}>
          <div
            className={`${styles.heroImageContainer} ${styles.smallImage}`}
            id={styles.top}
          >
            <img
              src={heroTop}
              alt="Fashion collection preview"
              className={styles.heroImage}
            />
          </div>

          <div className={styles.saleContent}>
            <h1 className={styles.mainHeading}>ULTIMATE</h1>
            <h1 className={`${styles.mainHeading} ${styles.outline}`}>SALE</h1>
            <p className={styles.subHeading}>NEW COLLECTION</p>
            <Link to="/products" className={styles.shopButton}>
              <span>SHOP NOW</span>
            </Link>
          </div>

          <div
            className={`${styles.heroImageContainer} ${styles.smallImage}`}
            id={styles.bottom}
          >
            <img
              src={heroBottom}
              alt="Fashion models collection"
              className={styles.heroImage}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.heroImageContainer} id={styles.right}>
          <img
            src={heroRight}
            alt="Model in turtleneck sweater"
            className={styles.heroImage}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;