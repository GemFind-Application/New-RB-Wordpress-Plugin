import React from "react";
import Nouislider from "nouislider-react";

/**
 * noUiSlider throws when range.min === range.max, which JewelCloud filters produce whenever a
 * facet has a single value (one price, one carat, …). Widen max by one step in that case.
 */
export const safeRange = (range, step) => {
    if (!range || range.min !== range.max) {
        return range;
    }
    const width = Number(step) > 0 ? Number(step) : 1;
    return { ...range, max: Number(range.min) + width };
};

const SafeNouislider = (props) => <Nouislider {...props} range={safeRange(props.range, props.step)} />;

export default SafeNouislider;
