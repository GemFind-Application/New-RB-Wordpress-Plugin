import React from 'react'

function isPoweredByEnabled(configAppData) {
    const value = configAppData?.show_powered_by;
    return value === true || value === 1 || value === '1' || value === 'true';
}

function Footer({ configAppData }) {
    if (!isPoweredByEnabled(configAppData)) {
        return null;
    }
    return (
        <div className="pagination7">
            <div className="gemfind-app-store5">
                Powered by GemFind
            </div>
        </div>
    )
}

export default Footer
