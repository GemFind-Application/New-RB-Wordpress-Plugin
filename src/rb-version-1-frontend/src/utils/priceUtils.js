/**
 * Formats a price value based on currency and display format settings
 * @param {Object|string|number} priceData - Price data object with fltPrice/cost, currencyFrom, currencySymbol OR just the price value
 * @returns {string} Formatted price string
 */
export const formatPrice = (priceData) => {
    // Handle different input formats
    let priceValue, currencyFrom, currencySymbol;
    
    if (typeof priceData === 'object' && priceData !== null) {
        // Object format: { fltPrice: 1000, currencyFrom: "USD", currencySymbol: "$" }
        // or { cost: 1000, currencyFrom: "USD", currencySymbol: "$" }
        priceValue = priceData.fltPrice !== undefined ? priceData.fltPrice : priceData.cost;
        currencyFrom = priceData.currencyFrom;
        currencySymbol = priceData.currencySymbol;
    } else {
        // Simple value format: just the price number/string
        priceValue = priceData;
        currencyFrom = undefined;
        currencySymbol = undefined;
    }

    // Check if price is 0, "Call for Price", or invalid
    if (
        priceValue === "Call for Price" || 
        priceValue === "Call For Price" ||
        Number(priceValue) === 0 || 
        isNaN(Number(priceValue)) ||
        priceValue === "" ||
        priceValue === null ||
        priceValue === undefined
    ) {
        return "Call for Price";
    }

    // Format the price number
    const price = Number(priceValue).toLocaleString(undefined, {
        maximumFractionDigits: 0,
    });

    // Get format settings
    const priceRowFormat = window.initData?.data?.[0]?.price_row_format || window.price_row_format || "left";
    const isRightFormat = priceRowFormat === "1" || priceRowFormat === "right";
    
    // Get currency information (fallback to window globals if not in item)
    const finalCurrencyFrom = currencyFrom || window.currencyFrom || "USD";
    const finalCurrencySymbol = currencySymbol || window.currency || "$";

    // If USD, only show currency symbol
    if (finalCurrencyFrom === "USD") {
        if (isRightFormat) {
            return price + finalCurrencySymbol;
        } else {
            return finalCurrencySymbol + price;
        }
    } else {
        // For non-USD currencies
        if (isRightFormat) {
            return price + " " + finalCurrencySymbol + " " + finalCurrencyFrom;
        } else {
            return finalCurrencyFrom + " " + finalCurrencySymbol + " " + price;
        }
    }
};
