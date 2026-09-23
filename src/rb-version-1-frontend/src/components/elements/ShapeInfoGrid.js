import React from "react";
import roundPng from "../../images/round.png";
import asscherPng from "../../images/asscher.png";
import marquisePng from "../../images/marquise.png";
import ovalPng from "../../images/oval.png";
import cushionPng from "../../images/cushion.png";
import radiantPng from "../../images/radiant.png";
import pearPng from "../../images/pear.png";
import emeraldPng from "../../images/emerald.png";
import heartPng from "../../images/heart.png";
import princessPng from "../../images/princess.png";

// Shape reference grid shown in the "Shape" filter info popups
// (styles: .gf-rb-v1-filter-popup__* in scss/modules/_wordpress.scss).
const SHAPES = [
    ["Round", roundPng],
    ["Asscher", asscherPng],
    ["Marquise", marquisePng],
    ["Oval", ovalPng],
    ["Cushion", cushionPng],
    ["Radiant", radiantPng],
    ["Pear", pearPng],
    ["Emerald", emeraldPng],
    ["Heart", heartPng],
    ["Princess", princessPng],
];

const ShapeInfoGrid = () => (
    <div className="gf-rb-v1-filter-popup__shape-grid">
        <ul className="gf-rb-v1-filter-popup__shape-list">
            {SHAPES.map(([name, icon]) => (
                <li key={name} className="gf-rb-v1-filter-popup__shape-item">
                    <span className="gf-rb-v1-filter-popup__shape-icon popup-Dimond-Sketch">
                        <img src={icon} alt={name} />
                    </span>
                    <span className="gf-rb-v1-filter-popup__shape-label">{name}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default ShapeInfoGrid;
