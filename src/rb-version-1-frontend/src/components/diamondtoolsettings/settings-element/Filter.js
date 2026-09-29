import { elementAcceptingRef } from "@mui/utils";
import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Modal } from "react-responsive-modal";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { LoadingOverlay, Loader } from "react-overlay-loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RB_BASE, wpFetch } from '../../../wp/wpEnv';

const Filter = (props) => {
    const location = useLocation();
    var productUrl = location.pathname;
    var part = productUrl.substring(productUrl.lastIndexOf("/") + 1);
    const [openFirsts, setOpenFirsts] = useState(false);
    const [openSeconds, setOpenSeconds] = useState(false);
    const [openThirds, setOpenThirds] = useState(false);
    const [openResetModal, setOpenResetModal] = React.useState(false);

    const [cookies, setCookie, removeCookie] = useCookies(["cookie-name"]);

    const [loaded, setLoaded] = useState(false);
    const [getTab, setTab] = useState("mined");
    const navigate = useNavigate();
    // Diamond navigation from API (GetNavigation) - show tabs only when API has loaded and returned truthy values
    const [navigationLoaded, setNavigationLoaded] = useState(false);
    const [navStandard, setNavStandard] = useState(null);
    const [navLabGrown, setNavLabGrown] = useState(null);
    const [navFancyColored, setNavFancyColored] = useState(null);
    const [navCompare, setNavCompare] = useState(null);
    const [getcomparecookies] = useCookies([
        "_wpsavedcompareproductcookie",
    ]);
    const [getfinalcomparecookie] = useCookies([
        "finalcompareproductcookie",
    ]);

    const onChange = (e) => {
        e.preventDefault();
        props.callBack(false);

        if (getTab === "mined") {
            setCookie("_wpsavediamondfiltercookie", props, {
                path: "/",
                maxAge: 604800,
            });
        }
        if (getTab === "labgrown") {
            setCookie("_wpsavedlabgowndiamondfiltercookie", props, {
                path: "/",
                maxAge: 604800,
            });
        }
        if (getTab === "fancycolor") {
            setCookie("_wpsavedfancydiamondfiltercookie", props, {
                path: "/",
                maxAge: 604800,
            });
        }
    };

    const setOpenConfirm = (e) => {
        e.preventDefault();
        props.callBack(false);
        setLoaded(true);

        removeCookie("shopify_diamondbackvalue", { path: "/" });
        removeCookie("_wpsaveringfiltercookie", { path: "/" });
        removeCookie("_wpsavediamondfiltercookie", { path: "/" });
        removeCookie("_wpsavedcompareproductcookie", { path: "/" });
        removeCookie("_shopify_diamondsetting", { path: "/" });
        removeCookie("shopify_ringbackvalue", { path: "/" });
        removeCookie("_shopify_ringsetting", { path: "/" });
        removeCookie("_wpsavediamondfiltercookie", { path: "/" });
        removeCookie("_wpsavedcompareproductcookie", { path: "/" });
        removeCookie("_wpsavedlabgowndiamondfiltercookie", { path: "/" });
        removeCookie("_wpsavedcompareproductcookie", { path: "/" });
        removeCookie("_wpsavedcompareproductcookie", { path: "/" });
        removeCookie("_wpsavedfancydiamondfiltercookie", { path: "/" });
        removeCookie("compareproductcookie", { path: "/" });
        removeCookie("finalcompareproductcookie", { path: "/" });
        removeCookie("shopify_diamondtype", { path: "/" });

        setTimeout(() => {
            window.location.reload();
        }, 3000);
    };

    const handleresetpopup = (e) => {
        e.preventDefault();
        setLoaded(false);
        setOpenResetModal(true);
    };

    const handletab = (e) => {
        if (window.compareproduct.length < 2 && e.target.id === "compare") {
            toast("Please select minimum 2 diamonds to compare.", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            setCookie(
                "compareproductcookie",
                JSON.stringify(window.compareproduct),
                {
                    path: "/",
                    maxAge: 604800,
                }
            );

            if (e.target.id === "compare") {
                setTab(e.target.id);
                setLoaded(true);
                // Save the current tab context before navigating to compare
                // Convert tab name to match version 2 format: 'fancycolor' -> 'fancy', 'labgrown' -> true, 'mined' -> false
                let tabContext = getTab;
                if (getTab === "fancycolor") {
                    tabContext = "fancy";
                } else if (getTab === "labgrown") {
                    tabContext = true;
                } else {
                    tabContext = false;
                }
                setCookie(
                    "_wpsavedcomparetabcontext",
                    tabContext,
                    { path: "/", maxAge: 604800 }
                );
                if (window.compareproduct !== "") {
                    setCookie(
                        "_wpsavedcompareproductcookie",
                        JSON.stringify(window.compareproduct),
                        { path: "/", maxAge: 604800 }
                    );
                }

                if (window.compareproduct) {
                    // Save diamond IDs to cookie
                    setCookie(
                        "_wpsavedcompareproductcookie",
                        JSON.stringify(window.compareproduct),
                        { path: "/", maxAge: 604800 }
                    );

                    // Save diamond types to cookie
                    if (window.compareProductDiamondType && Array.isArray(window.compareProductDiamondType)) {
                        setCookie(
                            "compareProductDiamondTypeCookie",
                            JSON.stringify(window.compareProductDiamondType),
                            { path: "/", maxAge: 604800 }
                        );
                    }

                    // Navigate to compare page - data will be fetched there
                    setTimeout(() => {
                        setLoaded(false);
                        navigate(`${RB_BASE}/compare`);
                    }, 300);
                }

                // setTimeout(() => {
                //   setLoaded(false);
                //   navigate(`${process.env.PUBLIC_URL}/compare`);
                //   window.location.reload();
                // }, 6000);
            }

            if (e.target.id === "mined") {
                setTab(e.target.id);
                props.callbacktab(e.target.id);
                navigate(`${RB_BASE}/diamondtools`);
            }
            if (e.target.id === "labgrown") {
                setTab(e.target.id);
                props.callbacktab(e.target.id);
                navigate(`${RB_BASE}/diamondtools/navlabgrown`);
            }
            if (e.target.id === "fancycolor") {
                setTab(e.target.id);
                props.callbacktab(e.target.id);
                navigate(`${RB_BASE}/diamondtools/navfancycolored`);
            }
        }
    };

    const getNavigationData = async () => {
        try {
            const initData = window.initData?.data?.[0];
            if (!initData?.navigationapi || !initData?.dealerid) {
                return;
            }
            const url = `${initData.navigationapi}DealerId=${initData.dealerid}`;
            const res = await wpFetch(url);
            const actualRes = await res.json();
            if (actualRes?.[0]) {
                const nav = actualRes[0];
                setNavStandard(nav.navStandard ?? null);
                setNavLabGrown(nav.navLabGrown ?? null);
                setNavFancyColored(nav.navFancyColored ?? null);
                setNavCompare(nav.navCompare ?? null);
                setNavigationLoaded(true);
            }
        } catch (error) {
            console.error("Error fetching diamond navigation:", error);
        }
    };

    useEffect(() => {
        getNavigationData();
    }, []);

    useEffect(() => {
        if (loaded === false) {
            if (part === "navlabgrown") {
                setTab("labgrown");
            }
            if (part === "navfancycolored") {
                setTab("fancycolor");
            }
            if (part === "compare") {
                setTab("compare");
                //setLoaded(true);
            }
        }
    }, [getTab]);

    const showFilterInfo = Number(window.initData?.data?.[0]?.show_filter_info) === 1 || window.initData?.data?.[0]?.show_filter_info === true;
    // Before API loads: show all tabs. After API loads: show only tabs with truthy nav values.
    const showMined = !navigationLoaded || Boolean(navStandard);
    const showLabGrown = !navigationLoaded || Boolean(navLabGrown);
    const showFancyColor = !navigationLoaded || Boolean(navFancyColored);
    const showCompare = !navigationLoaded || Boolean(navCompare);

    return (
        <>
            <style>
                {`.diamond-filter{
          background-color:${window.initData["data"][0].header_colour}; 
        }
            .diamond-filter .navigation_filter_left .n_filter_left li:hover a{
                color: ${window.initData["data"][0].hover_colour};
            }
            .diamond-filter .navigation_filter_left .n_filter_left li:hover span i{
              color: ${window.initData["data"][0].hover_colour};
            }
            .diamond-filter .save-reset-filter .navigation_right li a:hover{
              color: ${window.initData["data"][0].hover_colour};
            }
            .compareitems table tfoot tr td a{
              background-color:${window.initData["data"][0].button_colour}; 
            }
             .compareitems table tfoot tr td a:hover{
              background-color:${window.initData["data"][0].hover_colour}; 
              color: #fff;
            }
            `}
            </style>
            <div className="navigation_filter_left ">
                {getTab === "compare" && (
                    <LoadingOverlay className="_loading_overlay_wrapper">
                        <Loader fullPage loading={loaded} />
                    </LoadingOverlay>
                )}
                <ToastContainer
                    limit={1}
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <ul className="n_filter_left">
                    {showMined && (
                    <li className={`${getTab === "mined" ? "active" : ""}`}>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            handletab(e);
                        }} id="mined">
                            {navStandard || "Natural"}
                        </a>
                        {showFilterInfo && (
                            <span onClick={() => setOpenFirsts(true)}>
                                <i className="fas fa-info-circle"></i>{" "}
                            </span>
                        )}
                        <Modal
                            open={openFirsts}
                            onClose={() => setOpenFirsts(false)}
                            center
                            classNames={{
                                overlay: "popup_Overlay",
                                modal: "popup_Modal gf-rb-v1-filter-modal",
                            }}
                        >
                            <div className="gf-rb-v1-filter-popup">
                                <p className="gf-rb-v1-filter-popup__text">
                                    Formed over billions of years, natural
                                    diamonds are mined from the earth. Diamonds
                                    are the hardest mineral on earth, which
                                    makes them an ideal material for daily wear
                                    over a lifetime. Our natural diamonds are
                                    conflict-free and GIA certified.
                                </p>{" "}
                            </div>
                        </Modal>
                    </li>
                    )}
                    {showLabGrown && (
                    <li className={`${getTab === "labgrown" ? "active" : ""}`}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handletab(e);
                            }}
                            id="labgrown"
                        >
                            {navLabGrown || "Lab Grown"}
                        </a>
                        {showFilterInfo && (
                            <span onClick={() => setOpenSeconds(true)}>
                                <i className="fas fa-info-circle"></i>{" "}
                            </span>
                        )}
                        <Modal
                            open={openSeconds}
                            onClose={() => setOpenSeconds(false)}
                            center
                            classNames={{
                                overlay: "popup_Overlay",
                                modal: "popup_Modal gf-rb-v1-filter-modal",
                            }}
                        >
                            <div className="gf-rb-v1-filter-popup">
                                <p className="gf-rb-v1-filter-popup__text">
                                    Lab-grown diamonds are created in a lab by
                                    replicating the high heat and high pressure
                                    environment that causes a natural diamond to
                                    form. They are compositionally identical to
                                    natural mined diamonds (hardness, density,
                                    light refraction, etc), and the two look
                                    exactly the same. A lab-grown diamond is an
                                    attractive alternative for those seeking a
                                    product with less environmental footprint.
                                </p>{" "}
                            </div>
                        </Modal>
                    </li>
                    )}
                    {showFancyColor && (
                    <li
                        className={`${getTab === "fancycolor" ? "active" : ""}`}
                    >
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handletab(e);
                            }}
                            id="fancycolor"
                        >
                            {navFancyColored || "Fancy Color"}
                        </a>
                        {showFilterInfo && (
                            <span onClick={() => setOpenThirds(true)}>
                                <i className="fas fa-info-circle"></i>{" "}
                            </span>
                        )}
                        <Modal
                            open={openThirds}
                            onClose={() => setOpenThirds(false)}
                            center
                            classNames={{
                                overlay: "popup_Overlay",
                                modal: "popup_Modal gf-rb-v1-filter-modal",
                            }}
                        >
                            <div className="gf-rb-v1-filter-popup">
                                <p className="gf-rb-v1-filter-popup__text">
                                    Also known as fancy color diamonds, these
                                    are diamonds with colors that extend beyond
                                    GIA’s D-Z color grading scale. They fall all
                                    over the color spectrum, with a range of
                                    intensities and saturation. The most popular
                                    colors are pink and yellow.
                                </p>
                            </div>
                        </Modal>
                    </li>
                    )}
                    {showCompare && (
                    <li className={`${getTab === "compare" ? "active" : ""}`}>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            handletab(e);
                        }} id="compare">
                            {navCompare || "Compare"}
                        </a>
                    </li>
                    )}
                </ul>
            </div>

            <div className="save-reset-filter">
                <ul className="navigation_right">
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onChange(e);
                            }}
                            className="save-icon"
                        >
                            Save Search
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleresetpopup(e);
                            }}
                            className="reset-icon"
                        >
                            Reset
                        </a>

                        <Modal
                            open={openResetModal}
                            onClose={() => setOpenResetModal(false)}
                            center
                            classNames={{
                                overlay: "popup_Overlay",
                                modal: "popup__reset",
                            }}
                        >
                            <LoadingOverlay className="_loading_overlay_wrapper">
                                <Loader fullPage loading={loaded} />
                            </LoadingOverlay>
                            <p>Are you sure you want to reset data?</p>
                            <div className="reset_popup-btn">
                                <button
                                    className="button btn btn_left"
                                    onClick={setOpenConfirm}
                                >
                                    OK
                                </button>
                                <button
                                    className="button btn"
                                    onClick={() => setOpenResetModal(false)}
                                >
                                    CANCEL
                                </button>
                            </div>
                        </Modal>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Filter;
