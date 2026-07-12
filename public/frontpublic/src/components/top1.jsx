import PropTypes from "prop-types";
import "./top1.css";

const Top1 = ({ className = "" }) => {
  return (
    <div className={`top11 ${className}`}>
      <div className="top12">
        <b className="reviews2">1.234 Reviews</b>
        <div className="sort2">
          <div className="sort3">
            <div className="sort-by1">Sort by:</div>
            <b className="newest-first">Newest First</b>
            <img className="sort-icon" alt="" src="/sort-show-icons.svg" />
          </div>
        </div>
      </div>
      <div className="quotes">
        <div className="quote">
          <blockquote className="looks-incredible">
            “looks incredible”
          </blockquote>
        </div>
        <div className="quote">
          <blockquote className="fast-delivery">“fast delivery”</blockquote>
        </div>
        <div className="quote">
          <blockquote className="so-many-options">“so many options”</blockquote>
        </div>
        <div className="quote">
          <blockquote className="highest-quality">“highest quality”</blockquote>
        </div>
        <div className="quote">
          <blockquote className="made-my-proposal">
            “made my proposal day great”
          </blockquote>
        </div>
        <div className="quote">
          <blockquote className="looks-incredible">
            “looks incredible”
          </blockquote>
        </div>
        <div className="quote">
          <blockquote className="fast-delivery">“fast delivery”</blockquote>
        </div>
        <div className="quote">
          <blockquote className="so-many-options">“so many options”</blockquote>
        </div>
        <div className="quote">
          <blockquote className="highest-quality">“highest quality”</blockquote>
        </div>
        <div className="quote">
          <blockquote className="made-my-proposal">
            “made my proposal day great”
          </blockquote>
        </div>
      </div>
    </div>
  );
};

Top1.propTypes = {
  className: PropTypes.string,
};

export default Top1;
