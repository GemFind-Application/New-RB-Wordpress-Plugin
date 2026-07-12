import React from 'react'

function Footer({ configAppData }) {
    return (
        <div className="pagination7">
            <div className="gemfind-app-store5">
                {configAppData.show_powered_by == 'true' && 'Powered by GemFind'}.
            </div>
        </div>
    )
}

export default Footer