import React, { useState } from "react";
import styles from "./Newsletter.module.css";

import modelLeft from "../../assets/images/newsletter-left.jpg";
import modelRight from "../../assets/images/newsletter-right.jpg";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      console.log("Đăng ký email:", email);
      setMessage(`Cảm ơn bạn đã đăng ký nhận tin với email: ${email}`);
      setEmail("");
    }
  };

  return (
    <section className={styles.newsletterSection}>
      <div className={styles.container}>
        <img
          src={modelLeft}
          alt="Người mẫu mặc áo khoác màu vàng"
          className={styles.modelImage}
          id={styles.leftModel}
        />

        <div className={styles.content}>
          <h2 className={styles.title}>Đăng ký nhận bản tin</h2>
          <p className={styles.description}>
            Nhận ưu đãi <strong>giảm 10%</strong> cho đơn hàng đầu tiên.
            <br />
            Cập nhật sớm nhất các sản phẩm mới và chương trình khuyến mãi độc
            quyền.
          </p>

          <form className={styles.subscribeForm} onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className={styles.emailInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className={styles.subscribeButton}>
              Đăng ký ngay
            </button>
          </form>

          {message && <p className={styles.successMessage}>{message}</p>}
        </div>

        <img
          src={modelRight}
          alt="Người mẫu mặc áo khoác màu xám"
          className={styles.modelImage}
          id={styles.rightModel}
        />
      </div>
    </section>
  );
};

export default Newsletter;
