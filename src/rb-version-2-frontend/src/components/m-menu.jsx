import Head4 from "./head4";
import PropTypes from "prop-types";
import "./m-menu.css";

const MMenu = ({ className = "" }) => {
  return (
    <div className={`m-menu ${className}`}>
      <div className="menu">
        <div className="menu-element">Menu Element</div>
        <div className="menu-item" />
        <div className="menu-element">Menu Element</div>
        <div className="menu-item" />
        <div className="menu-element">Menu Element</div>
        <div className="menu-item" />
        <div className="menu-element">Menu Element</div>
        <div className="menu-item" />
        <div className="menu-element">Menu Element</div>
      </div>
      <main className="frame1">
        <Head4 />
      </main>
    </div>
  );
};

MMenu.propTypes = {
  className: PropTypes.string,
};

export default MMenu;
