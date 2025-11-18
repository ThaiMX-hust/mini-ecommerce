import React from "react";
import ReactPaginate from "react-paginate";
import styles from "./Pagination.module.css";

const Pagination = ({ pageCount, onPageChange, currentPage }) => {
  if (pageCount <= 1) return null; // Ẩn nếu chỉ có 1 trang

  return (
    <ReactPaginate
      previousLabel={"<"}
      nextLabel={">"}
      breakLabel={"..."}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={onPageChange}
      containerClassName={styles.pagination}
      pageClassName={styles.pageItem}
      pageLinkClassName={styles.pageLink}
      previousClassName={styles.pageItem}
      previousLinkClassName={styles.pageLink}
      nextClassName={styles.pageItem}
      nextLinkClassName={styles.pageLink}
      breakClassName={styles.pageItem}
      breakLinkClassName={styles.pageLink}
      activeClassName={styles.active}
      forcePage={currentPage - 1} // react-paginate dùng index (0, 1, 2...), state của ta dùng số trang (1, 2, 3...)
    />
  );
};

export default Pagination;
