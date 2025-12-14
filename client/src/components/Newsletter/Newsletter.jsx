import React, { useState } from "react";
import styles from "./Newsletter.module.css";

// Import hình ảnh
import modelLeft from "../../assets/images/newsletter-left.jpg";
import modelRight from "../../assets/images/newsletter-right.jpg";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      console.log("Subscribing email:", email);
      setMessage(`Cảm ơn bạn đã đăng ký với email: ${email}`);
      setEmail(""); // Xóa input sau khi submit
      // Ở đây bạn sẽ gọi API để đăng ký email
    }
  };

  return (
    <section className={styles.newsletterSection}>
      <div className={styles.container}>
        <img
          src={modelLeft}
          alt="Model in a yellow coat"
          className={styles.modelImage}
          id={styles.leftModel}
        />

        <div className={styles.content}>
          <h2 className={styles.title}>Subscribe To Our Newsletter</h2>
          <p className={styles.description}>
            Get 10% off your first order.
            Be the first to know about new arrivals and exclusive offers.

          </p>
          <form className={styles.subscribeForm} onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="michael@ymail.com"
              className={styles.emailInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className={styles.subscribeButton}>
              Subscribe Now
            </button>
          </form>
          {message && <p className={styles.successMessage}>{message}</p>}
        </div>

        <img
          src={modelRight}
          alt="Model in a grey coat"
          className={styles.modelImage}
          id={styles.rightModel}
        />
      </div>
    </section>
  );
};

export default Newsletter;
