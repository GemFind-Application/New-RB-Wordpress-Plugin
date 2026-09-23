// "5.72X5.56X3.87" / "5.72 * 5.56 * 3.87 mm" -> "5.72 × 5.56 × 3.87 mm".
// A hyphen is a range (round diamonds: "6.40-6.45x3.95" -> "6.40–6.45 × 3.95 mm").
// Anything that isn't a list of numbers is returned unchanged.
const formatMeasurement = (value) => {
    if (value === null || value === undefined) {
        return value;
    }
    const raw = String(value).trim().replace(/\s*mm\.?$/i, "");
    const parts = raw.split(/\s*[xX×*]\s*/).filter(Boolean);
    const isDimension = (p) => /^\d*\.?\d+(\s*-\s*\d*\.?\d+)?$/.test(p);
    if (parts.length < 2 || !parts.every(isDimension)) {
        return value;
    }
    return `${parts.map((p) => p.replace(/\s*-\s*/, "–")).join(" × ")} mm`;
};

export default formatMeasurement;
