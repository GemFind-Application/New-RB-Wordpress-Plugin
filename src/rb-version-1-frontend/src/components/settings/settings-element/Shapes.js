import React, { useEffect, useState } from "react";
// import ReactDOM from 'react-dom';
import { Modal } from "react-responsive-modal";
import round from "../../../images/round.png";
import radiant from "../../../images/radiant.png";
import princess from "../../../images/princess.png";
import pear from "../../../images/pear.png";
import oval from "../../../images/oval.png";
import marquise from "../../../images/marquise.png";
import heart from "../../../images/heart.png";
import emerald from "../../../images/emerald.png";
import cushion from "../../../images/cushion.png";
import asscher from "../../../images/asscher.png";
import ShapeInfoGrid from "../../elements/ShapeInfoGrid";

const Shape = (props) => {
    const [open, setOpen] = useState(false);
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const [itemId, selectedItemId] = useState("-1");
    const toggleActive = (id) => {
        selectedItemId(id);
        if (props.selectedShape !== "") {
            selectedItemId(id);
        }
        selectedItemId("-1");
    };

    const showFilterInfo = Number(window.initData?.data?.[0]?.show_filter_info) === 1 || window.initData?.data?.[0]?.show_filter_info === true;

    return (
        <>
            <style>
                {`.setting_shapes ul .shapes_lists .shape_box:hover , .setting_shapes ul .active .shape_box{
                background-color: ${window.initData["data"][0].hover_colour};
            }`}
            </style>
            <h4 className="f_heading ">
                Shape
                {showFilterInfo && (
                    <span className="f_popup" onClick={onOpenModal}>
                        <i className="fas fa-info-circle"></i>
                    </span>
                )}
            </h4>
            <Modal
                open={open}
                onClose={onCloseModal}
                center
                classNames={{
                    overlay: "popup_Overlay",
                    modal: "popup_Modal gf-rb-v1-filter-modal",
                }}
            >
                <div className="gf-rb-v1-filter-popup">
                    <p className="gf-rb-v1-filter-popup__text">
                    Select the overall outline of the diamond, from timeless rounds to more distinctive shapes like oval, emerald, or pear. Shape defines the diamond’s character and plays a big role in its visual appeal.
                    </p>
                    <ShapeInfoGrid />
                </div>
            </Modal>

            <ul>
                {props.shapeData.map((item) => (
                    <li
                        onClick={() => props.callBack(item.shapeName)}
                        key={item.$id || item.shapeName || Math.random()}
                        className={`shapes_lists ${item.shapeName} ${
                            itemId === item.$id ? "active" : ""
                        } ${item.isActive !== "1" ? "disabled" : ""} ${
                            props.selectedShape === item.shapeName
                                ? "active"
                                : ""
                        }`}
                    >
                        <div className="shape_box">
                            <input
                                onChange={() => toggleActive(item.$id)}
                                type="radio"
                                disabled={item.isActive !== "1" ? true : false}
                                value={item.shapeName}
                                name="ring_shape"
                                id={"ring_shape_" + item.shapeName}
                            />
                        </div>
                        <span>{item.shapeName}</span>
                    </li>
                ))}
            </ul>
        </>
    );
};

export default Shape;
