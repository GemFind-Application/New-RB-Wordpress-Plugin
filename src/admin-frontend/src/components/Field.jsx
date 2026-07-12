import React from "react";

export function Field({ label, help, children }) {
  return (
    <div className="wpdl-field">
      {label && <label className="wpdl-field__label">{label}</label>}
      {children}
      {help && <p className="wpdl-field__help">{help}</p>}
    </div>
  );
}

export function Toggle({ name, label, checked, onChange }) {
  return (
    <label className="wpdl-toggle">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      <span className="wpdl-toggle__track" />
      <span className="wpdl-toggle__label">{label}</span>
    </label>
  );
}

export function Select({ value, onChange, options, name, className = "wpdl-select" }) {
  return (
    <select className={className} name={name} value={value} onChange={onChange}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
