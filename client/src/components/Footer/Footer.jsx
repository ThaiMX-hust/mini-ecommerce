import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <Link to="/" className={styles.logo}>
            FASCO
          </Link>
          <nav className={styles.navLinks}>
            <Link className={styles.link}>Support Center</Link>
            <Link className={styles.link}>Invoicing</Link>
            <Link className={styles.link}>Contract</Link>
            <Link className={styles.link}>Careers</Link>
            <Link className={styles.link}>Blog</Link>
            <Link className={styles.link}>FAQs</Link>
          </nav>
        </div>
        <div className={styles.footerBottom}>
          <p>Copyright © 2024 FASCO. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
