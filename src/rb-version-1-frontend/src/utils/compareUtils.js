export const ensureCompareTypeTracker = () => {
    if (!Array.isArray(window.compareProductDiamondType)) {
        window.compareProductDiamondType = [];
    }
};

export const determineDiamondType = (item) => {
    if (!item) {
        return "mined";
    }

    if (item.isLabCreated === true || item.isLabCreated === "true") {
        return "labcreated";
    }

    if (
        item.isfancy === true ||
        item.isfancy === "true" ||
        (item.fancyColorIntensity && item.fancyColorIntensity !== "") ||
        (item.fancyColor && item.fancyColor !== "")
    ) {
        return "fancydiamonds";
    }

    return "mined";
};

export const registerCompareDiamondType = (diamondId, diamondType) => {
    
    if (!diamondId) {
        return;
    }

    ensureCompareTypeTracker();

    const existingIndex = window.compareProductDiamondType.findIndex(
        (entry) => entry.diamondId === diamondId
    );

    if (existingIndex === -1) {
        window.compareProductDiamondType.push({ diamondId, diamondType });
    } else {
        window.compareProductDiamondType[existingIndex].diamondType = diamondType;
    }
};

export const removeCompareDiamondType = (diamondId) => {
    if (!diamondId || !Array.isArray(window.compareProductDiamondType)) {
        return;
    }

    const index = window.compareProductDiamondType.findIndex(
        (entry) => entry.diamondId === diamondId
    );

    if (index !== -1) {
        window.compareProductDiamondType.splice(index, 1);
    }
};
