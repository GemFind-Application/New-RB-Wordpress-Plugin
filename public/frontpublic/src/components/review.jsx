import React from "react";
import PropTypes from "prop-types";
import "./review.css";

const Review = ({ review, productName, className = "" }) => {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<img key={i} className="stars-child" loading="lazy" alt="" src="/stars-full.svg" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<img key={i} className="stars-child" loading="lazy" alt="" src="/stars-half.svg" />);
      } else {
        stars.push(<img key={i} className="stars-child" loading="lazy" alt="" src="/stars-empty.svg" />);
      }
    }

    return stars;
  };

  return (
    <div className={`review ${className}`}>
      <div className="rating1">
        <b className="rating-values">{review.rating.toFixed(1)}</b>
        <div className="stars1">
          {renderStars(review.rating)}
        </div>
      </div>
      <footer className="contet">
        <div className="namedate">
          <div className="name1">
            <b className="maria-c">{review.reviewerName}</b>
            {review.verified && (
              <div className="verified-wrapper">
                <b className="verified">Verified</b>
              </div>
            )}
          </div>
          <div className="div53">{new Date(review.date).toLocaleDateString()}</div>
        </div>
        <div className="review-details">
          <div className="pharetra-vel-mauris">
            {review.text}
          </div>
          <div className="link2">
            <div className="prong-round-solitaire1">
              {productName}
            </div>
            <img className="review-link-icons" alt="" src="/vector-2-31.svg" />
          </div>
        </div>
        <div className="review-helpfulness">
          <div className="help">
            <b className="was-it-helpful">Was it Helpful?</b>
            <div className="helpfulness-counters">
              <div className="upvote-buttons">
                <img className="fi-10349124-icon" loading="lazy" alt="" src="/fi-10349124.svg" />
                <div className="downvote-buttons">{review.helpfulCount}</div>
              </div>
              <div className="downvote-icons">
                <img className="fi-10349124-icon1" loading="lazy" alt="" src="/fi-10349124-1.svg" />
                <div className="downvote-buttons">{review.notHelpfulCount}</div>
              </div>
            </div>
          </div>
          <div className="name1">
            <b className="share5">Share:</b>
            <div className="socials">
              <img className="fi-2111564-icon" loading="lazy" alt="" src="/fi-2111564.svg" />
              <img className="fi-2111564-icon" loading="lazy" alt="" src="/fi-2111819.svg" />
              <img className="fi-2111564-icon" loading="lazy" alt="" src="/fi-1051380.svg" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

Review.propTypes = {
  review: PropTypes.shape({
    rating: PropTypes.number.isRequired,
    reviewerName: PropTypes.string.isRequired,
    verified: PropTypes.bool,
    date: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    helpfulCount: PropTypes.number.isRequired,
    notHelpfulCount: PropTypes.number.isRequired
  }).isRequired,
  productName: PropTypes.string.isRequired,
  className: PropTypes.string
};

export default Review;