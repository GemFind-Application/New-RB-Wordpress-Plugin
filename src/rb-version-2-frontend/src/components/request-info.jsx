import PropTypes from "prop-types";
import "./request-info.css";

const RequestInfo = ({ className = "" }) => {
  return (
    <div className={`request-info ${className}`}>
      <section className="content1">
        <div className="top1">
          <div className="h1">
            <h3 className="request-more-information">
              Request More Information
            </h3>
            <div className="our-specialists-will">
              Our specialists will contact you.
            </div>
          </div>
          <div className="inputs">
            <div className="contact-details">
              <div className="drop">
                <input
                  className="your-name"
                  placeholder="Your Name"
                  type="text"
                />
              </div>
              <div className="drop">
                <input
                  className="your-email"
                  placeholder="Your Email"
                  type="text"
                />
              </div>
              <div className="drop">
                <input
                  className="your-phone-number"
                  placeholder="Your Phone Number"
                  type="text"
                />
              </div>
            </div>
            <div className="mail">
              <textarea
                className="drop3"
                placeholder="Your Message"
                rows={6}
                cols={27}
              />
              <div className="mail-parent">
                <div className="mail1">
                  <div className="contact-preference">Contact Preference:</div>
                  <div className="radio">
                    <div className="radio-buttons">
                      <input className="radio1" type="radio" />
                      <div className="by-phone">By Phone</div>
                    </div>
                    <div className="radio-buttons">
                      <input className="radio1" type="radio" />
                      <div className="by-email">By Email</div>
                    </div>
                  </div>
                </div>
                <button className="button3">
                  <b className="request">Request</b>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <img className="close-icon" loading="lazy" alt="" src="/close.svg" />
    </div>
  );
};

RequestInfo.propTypes = {
  className: PropTypes.string,
};

export default RequestInfo;
