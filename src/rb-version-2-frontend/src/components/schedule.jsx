import { useState, useCallback } from "react";
import Calendar from "../components/calendar";
import PortalPopup from "../components/portal-popup";
import PropTypes from "prop-types";
import "./schedule.css";

const Schedule = ({ className = "" }) => {
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const openCalendar = useCallback(() => {
    setCalendarOpen(true);
  }, []);

  const closeCalendar = useCallback(() => {
    setCalendarOpen(false);
  }, []);

  return (
    <>
      <div className={`schedule ${className}`}>
        <section className="content4">
          <div className="top4">
            <div className="h12">
              <h3 className="schedule-viewing">Schedule Viewing</h3>
              <div className="see-this-item">{`See this item & more in our store`}</div>
            </div>
            <div className="inputs2">
              <div className="contact-form">
                <div className="drop5">
                  <input
                    className="your-name1"
                    placeholder="Your Name"
                    type="text"
                  />
                </div>
                <div className="drop5">
                  <input
                    className="your-email1"
                    placeholder="Your Email"
                    type="text"
                  />
                </div>
                <div className="drop5">
                  <input
                    className="your-phone-number1"
                    placeholder="Your Phone Number"
                    type="text"
                  />
                </div>
              </div>
              <form className="mail2">
                <textarea
                  className="drop8"
                  placeholder="Your Message"
                  rows={6}
                  cols={27}
                />
                <div className="drop9">
                  <div className="location">Location</div>
                  <img
                    className="location-icon"
                    alt=""
                    src="/location-icon.svg"
                  />
                </div>
                <footer className="availability">
                  <div className="mail3">
                    <div className="when-are-you">When are you available?</div>
                    <div className="drop10">
                      <input
                        className="time-icon-input"
                        placeholder="00.00.0000"
                        type="text"
                      />
                      <img
                        className="vector-icon1"
                        alt=""
                        src="/vector1.svg"
                        onClick={openCalendar}
                      />
                    </div>
                  </div>
                  <button className="button5">
                    <b className="request1">Request</b>
                  </button>
                </footer>
              </form>
            </div>
          </div>
        </section>
        <img className="close-icon3" loading="lazy" alt="" src="/close.svg" />
      </div>
      {isCalendarOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeCalendar}
        >
          <Calendar onClose={closeCalendar} />
        </PortalPopup>
      )}
    </>
  );
};

Schedule.propTypes = {
  className: PropTypes.string,
};

export default Schedule;
