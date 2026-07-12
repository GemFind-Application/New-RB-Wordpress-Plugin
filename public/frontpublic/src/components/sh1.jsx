import PropTypes from "prop-types";
import "./sh1.css";

const Sh1 = ({
  className = "",
  colour,
  txt,
  txt1,
  txt2,
  txt3,
  txt4,
  txt5,
  txt6,
  txt7,
  txt8,
  txt9,
}) => {
  return (
    <div className={`sh5 ${className}`}>
      <div className="colour1">{colour}</div>
      <div className="div46">
        <b className="i3">i</b>
      </div>
      <div className="from-to5">
        <div className="range68">
          <div className="txt68">{txt}</div>
        </div>
        <div className="range68">
          <div className="txt69">{txt1}</div>
        </div>
        <div className="range70">
          <b className="txt69">{txt2}</b>
        </div>
        <div className="range70">
          <b className="txt71">{txt3}</b>
        </div>
        <div className="range70">
          <b className="txt71">{txt4}</b>
        </div>
        <div className="range70">
          <b className="txt73">{txt5}</b>
        </div>
        <div className="range68">
          <div className="txt74">{txt6}</div>
        </div>
        <div className="range68">
          <div className="txt75">{txt7}</div>
        </div>
        <div className="range68">
          <div className="txt69">{txt8}</div>
        </div>
        <div className="range77">
          <div className="txt77">{txt9}</div>
        </div>
      </div>
    </div>
  );
};

Sh1.propTypes = {
  className: PropTypes.string,
  colour: PropTypes.string,
  txt: PropTypes.string,
  txt1: PropTypes.string,
  txt2: PropTypes.string,
  txt3: PropTypes.string,
  txt4: PropTypes.string,
  txt5: PropTypes.string,
  txt6: PropTypes.string,
  txt7: PropTypes.string,
  txt8: PropTypes.string,
  txt9: PropTypes.string,
};

export default Sh1;
