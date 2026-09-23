import React from "react";
import Checkbox from "@mui/material/Checkbox";

const Certificates = (props) => {
  const handleChange = (event) => {
    // Assuming you have an ordertype associated with the event
    const ordertype = event.target.value;
    // Pass the ordertype to the callback prop
    props.onChangeOrderType(ordertype);

  };

  return (
    <div className="range-slider_diamond">
      <div className="slider">
        <h4 className="f_heading diamond_heading"> CERTIFICATES</h4>
        <div className="diamond-ui-slider diamond-small-slider">
          <select
            name="dropdown-orderby"
            id="cerfificate"
            className="cer-sort"
            onChange={handleChange} // Add onChange event handler
          >
            {props.certificateData.map((item) => (
              <option key={item.certificateName} value={item.certificateName}>
                {item.certificateName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Certificates;
