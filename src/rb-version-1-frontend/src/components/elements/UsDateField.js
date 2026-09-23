import TextField from '@mui/material/TextField';
import { forwardRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// A native <input type="date"> always renders in the *browser's* locale, so the
// same field shows dd/mm/yyyy for one shopper and mm/dd/yyyy for the next and
// there is no attribute that changes it. This wraps react-datepicker instead so
// the displayed format is pinned to US MM/DD/YYYY for everyone, while the value
// handed back to the form stays the "yyyy-MM-dd" string the API expects.

const PORTAL_ID = 'gf-datepicker-portal';

// The calendar has to escape the modal's scrolling form, which would otherwise
// clip an inline popper. react-datepicker renders into this node and still
// positions it against the field.
const ensurePortalRoot = () => {
    if (typeof document === 'undefined' || document.getElementById(PORTAL_ID)) return;
    const node = document.createElement('div');
    node.id = PORTAL_ID;
    document.body.appendChild(node);
};

// "yyyy-MM-dd" -> local Date. Built part-by-part on purpose: new Date("2026-08-01")
// parses as UTC and can land on the previous day in western time zones.
const parseValue = (value) => {
    if (!value) return null;
    const [year, month, day] = String(value).split('-').map(Number);
    if (!year || !month || !day) return null;
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatValue = (date) => {
    if (!date || Number.isNaN(date.getTime())) return '';
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
};

const CalendarIcon = () => (
    <svg className="gf-date-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
        <path
            d="M7.5 2.75v3M16.5 2.75v3M3.75 9.25h16.5M5.25 4.75h13.5a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-13a1.5 1.5 0 0 1 1.5-1.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </svg>
);

// react-datepicker owns the input's value/handlers, so the MUI field is only a
// shell here — it keeps the outlined look and the legend notch the rest of the
// modal fields use.
const DateTextField = forwardRef(({ className, ...rest }, ref) => (
    <TextField
        {...rest}
        className={`gf-date-field${className ? ` ${className}` : ''}`}
        focused
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        InputProps={{ endAdornment: <CalendarIcon /> }}
        inputRef={ref}
    />
));

/**
 * @param {string} value      current date as "yyyy-MM-dd" ('' when unset)
 * @param {Function} onChange called with a synthetic { target: { value } } so
 *                            existing `event.target.value` handlers keep working
 * @param {string} [minDate]  earliest selectable date as "yyyy-MM-dd"
 */
const UsDateField = ({ id, label, value, onChange, minDate }) => {
    useEffect(ensurePortalRoot, []);

    return (
        <DatePicker
            id={id}
            selected={parseValue(value)}
            onChange={(date) => onChange({ target: { value: formatValue(date) } })}
            dateFormat="MM/dd/yyyy"
            placeholderText="mm/dd/yyyy"
            minDate={parseValue(minDate)}
            portalId={PORTAL_ID}
            popperClassName="gf-datepicker-popper"
            showPopperArrow={false}
            customInput={<DateTextField label={label} />}
        />
    );
};

export default UsDateField;
