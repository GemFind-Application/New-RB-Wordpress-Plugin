import React, { useState } from 'react';
import DiamondListHeader1 from "./diamond-list-header1";
import DiamondListHeader from "./diamond-list-header";
import PropTypes from "prop-types";
import "./list2.css";

const List2 = ({ className = "", diamonds }) => {

  return (
    <div className={`list4 ${className}`}>
      {diamonds.map((diamond, index) => (
        <DiamondListHeader1 
          key={index}
          diamond={diamond}
        />
      ))}
      <DiamondListHeader />
      <DiamondListHeader />
    </div>
  );
};

List2.propTypes = {
  className: PropTypes.string,
  diamonds: PropTypes.array.isRequired,
};

export default List2;