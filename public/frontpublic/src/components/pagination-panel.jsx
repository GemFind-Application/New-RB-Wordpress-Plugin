import React from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import PropTypes from "prop-types";
import "./pagination-panel.css";
import Footer from "../components/Footer"

const PaginationPanel = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  className = ""
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const imageUrl = `${getImageBaseUrl()}`;
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <div
            key={i}
            className={`wrapper${i === currentPage ? '5' : '6'}`}
            onClick={() => onPageChange(i)}
          >
            <b className={i === currentPage ? 'link_pagination' : 'inactive_pagination'}>{i}</b>
          </div>
        );
      }
    } else {
      // Show first page : <
      pageNumbers.push(
        <div
          key={1}
          className={`wrapper${currentPage === 1 ? '5' : '6'}`}
          onClick={() => onPageChange(1)}
        >
          <b className={currentPage === 1 ? 'link_pagination' : 'inactive_pagination'}>1</b>
        </div>
      );

      // Range of pages to show" Calc
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(startPage + 2, totalPages - 1);
      if (endPage - startPage < 2) {
        startPage = Math.max(2, endPage - 2);
      }

      // Ellipsis ... 
      if (startPage > 2) {
        pageNumbers.push(
          <div key="ellipsis1" className="wrapper7">
            <div className="div114">...</div>
          </div>
        );
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <div
            key={i}
            className={`wrapper${i === currentPage ? '5' : '6'}`}
            onClick={() => onPageChange(i)}
          >
            <b className={i === currentPage ? 'link_pagination' : 'inactive_pagination'}>{i}</b>
          </div>
        );
      }

      // Ellipsis ... 
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <div key="ellipsis2" className="wrapper7">
            <div className="div114">...</div>
          </div>
        );
      }

      // Last page : >
      pageNumbers.push(
        <div
          key={totalPages}
          className={`wrapper${currentPage === totalPages ? '5' : '9'}`}
          onClick={() => onPageChange(totalPages)}
        >
          <div className={currentPage === totalPages ? 'link_pagination' : 'div114'}>{totalPages}</div>
        </div>
      );
    }

    return pageNumbers;
  };

  return (
    <div className={`pagination-panel ${className}`}>
      <div className="pagination-container">
        <div className="pagination-results">
          <div className="results2">Results:</div>
          <b className="total-results">{`${startItem}-${endItem} of ${totalItems} `}</b>
        </div>
        {totalItems > 0 &&
          <div className="pages1">
            <div
              className="page-number-icons-wrapper"
              onClick={() => onPageChange(1)}
            >
              <img className="page-number-icons" alt="Previous" src={`${imageUrl}` + "/double-arrow-left.png"} />

            </div>
            <div
              className="page-number-icons-wrapper"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            >
              <img className="page-number-icons" alt="Previous" src={`${imageUrl}` + "/vector-2-11.svg"} />
            </div>
            {renderPageNumbers()}
            <div
              className="page-number-icons-wrapper"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            >
              <img className="instance-item" alt="Next" src={`${imageUrl}` + "/vector-2-12.svg"} />
            </div>
            <div
              className="page-number-icons-wrapper"
              onClick={() => onPageChange(totalPages)}
            >
              <img className="page-number-icons" alt="Last" src={`${imageUrl}` + "/double-arrow-right.png"} />
            </div>
          </div>
        }
      </div>

    </div>
  );
};

PaginationPanel.propTypes = {
  currentPage: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default PaginationPanel;