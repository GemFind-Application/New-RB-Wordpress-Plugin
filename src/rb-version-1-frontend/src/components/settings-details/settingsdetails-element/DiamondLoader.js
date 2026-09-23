import React from "react";
import "./DiamondLoader.css";
import diamondLoaderGif from '../../../images/diamond-loader.gif';

const DiamondLoader = () => {
    return (
        <div className="diamond-loader-overlay">
            <div className="diamond-loader-content">
                <img 
                    src={diamondLoaderGif} 
                    alt="Loading..." 
                    className="diamond-loader-image"
                />
            </div>
        </div>
    );
};

export default DiamondLoader;
