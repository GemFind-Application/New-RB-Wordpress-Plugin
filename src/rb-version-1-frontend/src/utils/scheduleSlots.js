// Schedule Viewing time slots, matching the version 2 ScheduleViewingPopup:
// the shopper picks a location, then a date, and gets 30-minute slots built
// from that location's opening hours for that weekday.
//
// JewelCloud returns `addressList` (locations) and `timingList` (hours) on
// `retailerInfo`; each timing row is tied to a location by `locationID` and
// holds "<day>Start"/"<day>End" ("9 AM", "1:30 PM") plus a "storeClosed<Day>"
// flag that is "" when the store is open.

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const CLOSED_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOT_MINUTES = 30;

/**
 * Timing row for the location the shopper picked, or null when the location
 * is unknown or has no hours on file.
 */
export const getLocationTiming = (addressList, timingList, locationName) => {
    if (!locationName || !Array.isArray(addressList) || !Array.isArray(timingList)) return null;
    const address = addressList.find((item) => item.locationName === locationName);
    if (!address) return null;
    // eslint-disable-next-line eqeqeq -- the API mixes numeric and string ids
    return timingList.find((item) => item.locationID == address.locationID) || null;
};

// "yyyy-MM-dd" -> local Date. new Date("2026-08-01") parses as UTC, which lands
// on the previous day (and the wrong weekday) in western time zones.
const parseLocalDate = (value) => {
    if (!value) return null;
    const [year, month, day] = String(value).split('-').map(Number);
    if (!year || !month || !day) return null;
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Today as "yyyy-MM-dd" in the shopper's time zone. toISOString() gives the
 * UTC date, which is already tomorrow on a US evening and would block today.
 */
export const getTodayValue = () => {
    const now = new Date();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
};

// "9 AM" / "1:30 PM" / "13:00" -> [hours, minutes] on a 24-hour clock.
const parseClockTime = (value) => {
    const match = String(value || '').trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])?$/);
    if (!match) return null;
    let hours = Number(match[1]);
    const minutes = Number(match[2] || 0);
    const meridiem = (match[3] || '').toUpperCase();
    if (meridiem === 'AM' && hours === 12) hours = 0;
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (hours > 23 || minutes > 59) return null;
    return [hours, minutes];
};

/**
 * 30-minute slots ("09:00 AM", "09:30 AM", ...) from opening to closing time
 * on the given "yyyy-MM-dd" date. Empty when the store is closed that day or
 * has no hours for it.
 */
export const getTimeSlotsForDate = (timing, dateValue) => {
    const date = parseLocalDate(dateValue);
    if (!timing || !date) return [];

    const weekday = date.getDay();
    const closedFlag = timing[`storeClosed${CLOSED_KEYS[weekday]}`];
    if (closedFlag !== undefined && closedFlag !== null && String(closedFlag).trim() !== '') return [];

    const open = parseClockTime(timing[`${DAY_KEYS[weekday]}Start`]);
    const close = parseClockTime(timing[`${DAY_KEYS[weekday]}End`]);
    if (!open || !close) return [];

    const cursor = new Date(date);
    cursor.setHours(open[0], open[1], 0, 0);
    const end = new Date(date);
    end.setHours(close[0], close[1], 0, 0);

    const slots = [];
    while (cursor <= end) {
        slots.push(cursor.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' }));
        cursor.setMinutes(cursor.getMinutes() + SLOT_MINUTES);
    }
    return slots;
};
