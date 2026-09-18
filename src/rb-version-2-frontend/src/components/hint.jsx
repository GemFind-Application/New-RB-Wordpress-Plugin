import { useState, useCallback } from "react";
import Calendar from "../components/calendar";
import PortalPopup from "../components/portal-popup";
import PropTypes from "prop-types";
import "./hint.css";

const Hint = ({ className = "" }) => {
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const openCalendar = useCallback(() => {
    setCalendarOpen(true);
  }, []);

  const closeCalendar = useCallback(() => {
    setCalendarOpen(false);
  }, []);

  return (
    <>
      <div className={`hint ${className}`}>
        <section className="content5">
          <div className="top6">
            <div className="h13">
              <h3 className="drop-a-hint">Drop A Hint</h3>
              <div className="because-you-deserve">
                Because you deserve this.
              </div>
            </div>
            <div className="inputs3">
              <div className="drop11">
                <input
                  className="your-name2"
                  placeholder="Your Name"
                  type="text"
                />
              </div>
              <div className="drop11">
                <input
                  className="your-email2"
                  placeholder="Your Email"
                  type="text"
                />
              </div>
              <div className="drop11">
                <input
                  className="hint-recipient-name"
                  placeholder="Hint Recipient Name"
                  type="text"
                />
              </div>
              <div className="drop11">
                <input
                  className="hint-recipient-email"
                  placeholder="Hint Recipient Email"
                  type="text"
                />
              </div>
              <div className="mail4">
                <div className="drop15">
                  <input
                    className="reason-for-this"
                    placeholder="Reason for this gift"
                    type="text"
                  />
                </div>
                <textarea
                  className="drop16"
                  placeholder="Your Message"
                  rows={6}
                  cols={27}
                />
                <div className="mail-group">
                  <div className="mail5">
                    <div className="gift-deadline">Gift deadline:</div>
                    <div className="drop17">
                      <input
                        className="input"
                        placeholder="00.00.0000"
                        type="text"
                      />
                      <img
                        className="vector-icon2"
                        alt=""
                        src="/vector1.svg"
                        onClick={openCalendar}
                      />
                    </div>
                  </div>
                  <button className="button6">
                    <b className="drop-hint">Drop Hint</b>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <img className="close-icon4" loading="lazy" alt="" src="/close.svg" />
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

Hint.propTypes = {
  className: PropTypes.string,
};

export default Hint;
