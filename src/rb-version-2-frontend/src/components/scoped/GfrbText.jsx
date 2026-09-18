import React from "react";

export const GfrbP = ({ className = "", ...props }) => (
  <p className={`gfrb-p ${className}`.trim()} {...props} />
);

export const GfrbSpan = ({ className = "", ...props }) => (
  <span className={`gfrb-span ${className}`.trim()} {...props} />
);
