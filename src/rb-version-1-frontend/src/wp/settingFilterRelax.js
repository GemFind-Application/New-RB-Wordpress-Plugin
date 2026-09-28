/**
 * Setting-constrained diamond search fallback (WordPress fix).
 *
 * After "Add your diamond" the setting cookie (_shopify_ringsetting) forces the diamond search to the
 * setting's center-stone shape and carat range. When that combination has no inventory the listing
 * showed "No Records Found" until the visitor pressed Reset — which also dropped the chosen setting.
 *
 * Instead, a zero-result search under setting constraints "relaxes" them for listing only (the setting
 * cookie is kept for the complete-ring step). The flag lives for the browser session and is cleared as
 * soon as a new setting is chosen.
 */
const KEY = 'gemfindrb_relax_setting_diamond';
let memoryFlag = false;

export const isSettingFilterRelaxed = () => {
    try {
        return window.sessionStorage.getItem(KEY) === '1';
    } catch (e) {
        return memoryFlag;
    }
};

export const enableSettingFilterRelax = () => {
    memoryFlag = true;
    try {
        window.sessionStorage.setItem(KEY, '1');
    } catch (e) {
        // sessionStorage unavailable (privacy mode): in-memory flag only
    }
};

export const clearSettingFilterRelax = () => {
    memoryFlag = false;
    try {
        window.sessionStorage.removeItem(KEY);
    } catch (e) {
        // ignore
    }
};

/** Setting cookie constraints apply only while a setting is chosen and the search is not relaxed. */
export const settingConstrains = (ringSettingCookie) =>
    Boolean(ringSettingCookie && ringSettingCookie[0] && ringSettingCookie[0].setting_id) && !isSettingFilterRelaxed();
