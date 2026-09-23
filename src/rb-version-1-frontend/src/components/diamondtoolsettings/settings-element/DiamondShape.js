import React, { useEffect, useState } from "react";
// import ReactDOM from 'react-dom';
import { Modal } from "react-responsive-modal";
import { useCookies } from "react-cookie";

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
const DiamondShape = (props) => {
    const [open, setOpen] = useState(false);
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const [userFirstClicked, setUserFirstClicked] = useState("0");
    const [finalShapeArray, setFinalShapeArray] = useState([]);
    const [itemId, selectedItemId] = useState("-1");
    const [getsettingcookie, setsettingcookie] = useState(false);
    const [getsettingcookies, setsettingcookies] = useCookies([
        "_shopify_ringsetting",
    ]);
    const [getshapevalue, setshapevalue] = useState();

    let sliderSelection = [];
    let sliderSelection1 = [];

    const toggleActive = (id) => {
        selectedItemId(id);
        if (props.selectedShape === "") {
            selectedItemId("-1");
        } else {
            selectedItemId(id);
        }
    };

    const handleShape = (e) => {
        setUserFirstClicked("1");

        if (e.target.className === "") {
            const arr = props.selectedShape.split(",");
            arr.push(e.target.id);
            sliderSelection.push(arr);
            const initfinalinten = sliderSelection
                .map(function (m) {
                    return m;
                })
                .join(",");
            props.callBack(initfinalinten);
        } else {
            let arrnew;
            const arr = props.selectedShape.split(",");
            var index = arr.indexOf(e.target.id);
            if (index !== -1) {
                arrnew = arr.splice(index, 1);
            }
            sliderSelection1.push(arr);
            const initfinalinten1 = sliderSelection1
                .map(function (m) {
                    return m;
                })
                .join(",");
            props.callBack(initfinalinten1);
        }
    };
    useEffect(() => {
        {
            var finalCompareData = [];
            var i = 0;
            if (getsettingcookies._shopify_ringsetting) {
                var selectedShapeArray =
                    getsettingcookies._shopify_ringsetting[0].centerStoneFit.split(
                        ","
                    );
                props.shapeData.forEach((element) => {
                    finalCompareData.push({
                        $id: element.$id,
                        shapeImage: element.shapeImage,
                        shapeName: element.shapeName,
                        same_shape:
                            selectedShapeArray.indexOf(element.shapeName) > -1
                                ? "1"
                                : "0",
                    });
                    i++;
                });
            } else {
                props.shapeData.forEach((element) => {
                    finalCompareData.push({
                        $id: element.$id,
                        shapeImage: element.shapeImage,
                        shapeName: element.shapeName,
                        same_shape: "1",
                    });
                });
            }

            setFinalShapeArray(finalCompareData);
        }

        if (
            getsettingcookies._shopify_ringsetting &&
            getsettingcookies._shopify_ringsetting[0].centerStoneFit
        ) {
            setsettingcookie(true);
            setshapevalue(
                getsettingcookies._shopify_ringsetting[0].centerStoneFit
            );
        }
        if (
            getsettingcookies._shopify_ringsetting &&
            getsettingcookies._shopify_ringsetting[0].centerStoneFit
        ) {
            var selectedShapeArray =
                getsettingcookies._shopify_ringsetting[0].centerStoneFit.split(
                    ","
                );
            setTimeout(() => {
                selectedShapeArray.forEach((element) => {
                    document.getElementById(element).click();
                });
            }, 100);
        }
    }, [userFirstClicked]);

    const showFilterInfo = Number(window.initData?.data?.[0]?.show_filter_info) === 1 || window.initData?.data?.[0]?.show_filter_info === true;

    return (
        <>
            <style>{``}</style>
            <h4 className="f_heading diamond_heading">
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
            {getsettingcookie === false && (
                <ul>
                    {finalShapeArray.map((item, index) => (
                        <li
                            onClick={handleShape}
                            key={item.$id || item.shapeName || `shape-${index}`}
                            id={item.shapeName}
                            className={`diamond_shapes_lists shapes_lists ${
                                item.shapeName
                            }  ${
                                props.selectedShape.indexOf(item.shapeName) > -1
                                    ? "active"
                                    : ""
                            }`}
                        >
                            <div className="shape_box">
                                <input
                                    onChange={() => toggleActive(item.$id)}
                                    type="radio"
                                    value={item.shapeName}
                                    name="ring_shape"
                                    className={`${
                                        props.selectedShape.indexOf(
                                            item.shapeName
                                        ) > -1
                                            ? "active"
                                            : ""
                                    }`}
                                    id={item.shapeName}
                                />
                            </div>
                            <span>{item.shapeName}</span>
                        </li>
                    ))}
                </ul>
            )}

            {getsettingcookie === true && userFirstClicked === "0" && (
                <ul>
                    {finalShapeArray.map((item) => (
                        <li
                            onClick={handleShape}
                            key={item.$id || item.shapeName || `shape-${Math.random()}`}
                            id={item.shapeName}
                            className={`diamond_shapes_lists shapes_lists ${
                                item.shapeName
                            }  ${
                                props.selectedShape.indexOf(item.shapeName) > -1
                                    ? ""
                                    : "inactive"
                            }
              ${item.same_shape === "0" ? "inactive" : ""}
              `}
                        >
                            <div className="shape_box">
                                <input
                                    onChange={() => toggleActive()}
                                    type="radio"
                                    value={item.shapeName}
                                    name="ring_shape"
                                    className={`${
                                        props.selectedShape.indexOf(
                                            item.shapeName
                                        ) > -1
                                            ? "active"
                                            : ""
                                    }`}
                                    id={item.shapeName}
                                />
                            </div>
                            <span>{item.shapeName}</span>
                        </li>
                    ))}
                </ul>
            )}
            {getsettingcookie === true && userFirstClicked === "1" && (
                <ul>
                    {finalShapeArray.map((item) => (
                        <li
                            onClick={handleShape}
                            key={item.$id || item.shapeName || `shape-${Math.random()}`}
                            id={item.shapeName}
                            className={`diamond_shapes_lists shapes_lists ${
                                item.shapeName
                            }  ${
                                props.selectedShape.indexOf(item.shapeName) > -1
                                    ? "active"
                                    : ""
                            }
              ${item.same_shape === "0" ? "inactive" : ""}
              `}
                        >
                            <div className="shape_box">
                                <input
                                    onChange={() => toggleActive()}
                                    type="radio"
                                    value={item.shapeName}
                                    name="ring_shape"
                                    className={`${
                                        props.selectedShape.indexOf(
                                            item.shapeName
                                        ) > -1
                                            ? "active"
                                            : ""
                                    }`}
                                    id={item.shapeName}
                                />
                            </div>
                            <span>{item.shapeName}</span>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};

export default DiamondShape;
