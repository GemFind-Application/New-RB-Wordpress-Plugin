import React from 'react'
import './pagination-panel.css'

function isPoweredByEnabled(configAppData) {
    const value = configAppData?.show_powered_by;
    return value === true || value === 1 || value === '1' || value === 'true';
}

function Footer({ configAppData }) {
    if (!isPoweredByEnabled(configAppData)) {
        return null;
    }
    return (
        <div className="pagination7 gemfind-powered-by-footer">
            <div className="gemfind-app-store5">
                Powered by GemFind
            </div>
        </div>
    )
}

export default Footer
