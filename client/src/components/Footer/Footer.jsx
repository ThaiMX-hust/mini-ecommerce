import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              FASCO
            </Link>
            <p className={styles.tagline}>Điểm đến thời trang của bạn</p>
          </div>

          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h4 className={styles.sectionTitle}>Liên kết nhanh</h4>
              <nav className={styles.navLinks}>
                <Link to="/" className={styles.link}>
                  Trang chủ
                </Link>
                <Link to="/products" className={styles.link}>
                  Sản phẩm
                </Link>
                <Link to="/about" className={styles.link}>
                  Về chúng tôi
                </Link>
                <Link to="/contact" className={styles.link}>
                  Liên hệ: 0123-456-789
                </Link>
              </nav>
            </div>

            <div className={styles.footerSection}>
              <h4 className={styles.sectionTitle}>Hỗ trợ khách hàng</h4>
              <nav className={styles.navLinks}>
                <Link className={styles.link}>Trung tâm hỗ trợ</Link>
                <Link className={styles.link}>Câu hỏi thường gặp</Link>
                <Link className={styles.link}>Thông tin vận chuyển</Link>
                <Link className={styles.link}>Chính sách đổi trả</Link>
              </nav>
            </div>

            <div className={styles.footerSection}>
              <h4 className={styles.sectionTitle}>Thông tin dự án</h4>
              <p className={styles.projectInfo}>
                Dự án học phần Công nghệ Web
                <br />
                <strong>IT4409</strong> – Công nghệ Web và dịch vụ trực tuyến
                <br />
                Trường Đại học Bách Khoa Hà Nội
                <br />
                Học kỳ 1, năm 2025
              </p>
            </div>

            <div className={styles.footerSection}>
              <h4 className={styles.sectionTitle}>Nhóm phát triển</h4>
              <ul className={styles.teamList}>
                <li>Mạnh Xuân Thái – 20225228</li>
                <li>Phan Anh Tài – 20225391</li>
                <li>Khương Anh Tài – 20235421</li>
                <li>Vũ Đình Tâm – 20225226</li>
              </ul>
              <p className={styles.instructor}>
                <strong>Giảng viên hướng dẫn:</strong> TS. Đỗ Bá Lâm
              </p>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>
            © 2025 FASCO Mini E-commerce | Dự án học tập |{" "}
            <a
              href="https://github.com/ThaiMX-hust/mini-ecommerce"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Xem trên GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
