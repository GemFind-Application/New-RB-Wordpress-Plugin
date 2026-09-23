import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { RB_BASE } from '../../wp/wpEnv';
import backIconPng from '../../images/1back-icon.png';

const Breadcumb = (props) => {
    const location = useLocation();
    var settingsurl = location.pathname.includes("settings");
    var diamondtoolurl = location.pathname.includes("diamondtools");
    var compareurl = location.pathname.includes("compare");
    var completeRingurl = location.pathname.includes("completering");
    var labgownurl = location.pathname.includes("navlabgrown");
    var fancycolorurl = location.pathname.includes("navfancycolored");
    const [getsettingcookies, setsettingcookies] = useCookies([
        "_shopify_ringsetting",
    ]);
    const [getdiamondcookies, setdiamondcookies] = useCookies([
        "_shopify_diamondsetting",
    ]);
    const [getDiamondTypeCookie, setDiamondTypeCookie] = useCookies([
        "shopify_diamondtype",
    ]);

    const [getDiamondCookie, setDiamondCookie] = useState(false);
    const [getsettingcookie, setsettingcookie] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies([
        "shopify_ringbackvalue",
    ]);
    const navigate = useNavigate();

    // Check if we're on a details page (has product ID pattern or detail page indicators)
    const isDetailsPage = location.pathname.match(/-\d+(\/|$)/) ||
                         location.pathname.includes("/labcreated") ||
                         location.pathname.includes("/fancydiamonds") ||
                         location.pathname.includes("/mined");

    var currentNavValue = "settings";
    if (settingsurl) {
        currentNavValue = "settings";
    }
    if (diamondtoolurl) {
        currentNavValue = "diamonds";
    }
    if (labgownurl) {
        currentNavValue = "diamonds";
    }
    if (fancycolorurl) {
        currentNavValue = "diamonds";
    }
    if (completeRingurl) {
        currentNavValue = "completeRing";
    }
    if (compareurl) {
        currentNavValue = "diamonds";
    }

    const handleBackClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Navigate to appropriate listing page based on current context
        if (currentNavValue === "settings") {
            if (window.initData?.data?.[0]?.is_api === "false") {
                window.location.href = "/collections/ringbuilder-settings";
            } else {
                const diamondIsLab = getdiamondcookies._shopify_diamondsetting &&
                    getdiamondcookies._shopify_diamondsetting[0] &&
                    (getdiamondcookies._shopify_diamondsetting[0].isLabCreated === true ||
                     getdiamondcookies._shopify_diamondsetting[0].isLabCreated === "true");
                navigate(diamondIsLab ? `${RB_BASE}/labgrownsettings` : `${RB_BASE}/settings`);
            }
        } else if (currentNavValue === "diamonds") {
            // Navigate to appropriate diamond tools page based on type
            let targetUrl = `${RB_BASE}/diamondtools`;
            if (getDiamondTypeCookie.shopify_diamondtype === "labcreated") {
                targetUrl = `${RB_BASE}/diamondtools/navlabgrown`;
            } else if (getDiamondTypeCookie.shopify_diamondtype === "fancydiamonds") {
                targetUrl = `${RB_BASE}/diamondtools/navfancycolored`;
            }
            navigate(targetUrl);
        } else {
            // Fallback to browser back
            navigate(-1);
        }
    };

    const handlenavigation = (e) => {
        e.preventDefault();
        if (e.target.id === "completeRing") {
            if (getDiamondCookie === true && getsettingcookie === true) {
                navigate("/completeRing");
            }
        }
        if (e.target.id === "settings") {
            if (window.initData.data[0].is_api === "false") {
                window.location.href = "/collections/ringbuilder-settings";
            } else {
                const diamondIsLab = getdiamondcookies._shopify_diamondsetting &&
                    getdiamondcookies._shopify_diamondsetting[0] &&
                    (getdiamondcookies._shopify_diamondsetting[0].isLabCreated === true ||
                     getdiamondcookies._shopify_diamondsetting[0].isLabCreated === "true");
                navigate(diamondIsLab ? `${RB_BASE}/labgrownsettings` : `${RB_BASE}/settings`);
            }

            //Remove diamond cookies on tab toggling
            // if (
            //     getsettingcookies._shopify_ringsetting &&
            //     getsettingcookies._shopify_ringsetting[0].setting_id
            // ) {
            //     removeCookie("_shopify_ringsetting", { path: "/apps/ringbuilder/" });
            // }
            // if (cookies.shopify_ringbackvalue) {
            //     removeCookie("shopify_ringbackvalue", { path: "/apps/ringbuilder/" });
            // }
        }
        if (e.target.id === "diamonds") {
            //Remove ring setting cookies on tab toggling
            // if (
            //     getdiamondcookies._shopify_diamondsetting &&
            //     getdiamondcookies._shopify_diamondsetting[0].diamondId
            // ) {
            //     removeCookie("_shopify_diamondsetting", { path: "/apps/ringbuilder/" });
            // }

            // Default to diamondtools page
            let targetUrl = `${RB_BASE}/diamondtools`;

            if (getDiamondTypeCookie.shopify_diamondtype === "labcreated") {
                targetUrl = `${RB_BASE}/diamondtools/navlabgrown`;
            } else if (getDiamondTypeCookie.shopify_diamondtype === "fancydiamonds") {
                targetUrl = `${RB_BASE}/diamondtools/navfancycolored`;
            } else if (getDiamondTypeCookie.shopify_diamondtype === "mined") {
                targetUrl = `${RB_BASE}/diamondtools`;
            } else {
                targetUrl = `${RB_BASE}/diamondtools`;
            }

            navigate(targetUrl);
        }
    };

    useEffect(() => {
        if (
            getsettingcookies._shopify_ringsetting &&
            getsettingcookies._shopify_ringsetting[0].setting_id
        ) {
            setsettingcookie(true);
        }
        if (
            getdiamondcookies._shopify_diamondsetting &&
            getdiamondcookies._shopify_diamondsetting[0].diamondId
        ) {
            setDiamondCookie(true);
        }
    }, []);

    return (
        <>
            <style>
                {`.gf-rb-breadCumbs .active a {
                background-color: ${window.initData?.data?.[0]?.header_colour || '#000'};
                position: relative;
                display: flex;
                align-items: center;
            }
            // .gf-rb-breadCumbs .breadCumb.active h2{
            // color: ${window.initData?.data?.[0]?.link_colour || '#000'};
            // }
            // .gf-rb-breadCumbs .active a p.subTitle{
            //   color: ${window.initData?.data?.[0]?.link_colour || '#000'};
            // }
            .gf-rb-breadCumbs .active a::before , .gf-rb-breadCumbs .active a::after{
              border-left-color:${window.initData?.data?.[0]?.header_colour || '#000'};
            }
            .breadcrumb-back-btn {
                background: none;
                border: none;
                max-width: 23px !important;
                padding: 0;
                min-width: 23px !important;
                min-height: 40px !important;
                margin-right: 8px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                vertical-align: middle;
            }
            .breadcrumb-back-btn img {
                width: 20px;
                height: 20px;
                object-fit: contain;
            }
            .breadcrumb-back-btn:hover {
                opacity: 0.8;
            }
            `}
            </style>
            <div
                className={`breadCumb ${
                    currentNavValue === props.Data.urlkey ? "active" : ""
                }`}
            >
                <a
                    href="#"
                    id={`${props.Data.urlkey}`}
                    onClick={handlenavigation}
                >
                    
                    <div
                        id={`${props.Data.urlkey}`}
                        className="breadcumb-title"
                    >
                        {isDetailsPage && currentNavValue === props.Data.urlkey && (
                            <button
                                className="breadcrumb-back-btn"
                                onClick={handleBackClick}
                                title="Go Back"
                            >
                                <img 
                                    src={backIconPng}
                                    alt="Back" 
                                />
                            </button>
                        )}
                        <span>
                            <p className="subTitle" id={`${props.Data.urlkey}`}>
                                {props.Data.subTitle}{" "}
                            </p>
                            <h2 className="btitle" id={`${props.Data.urlkey}`}>
                                {props.Data.title}
                            </h2>
                        </span>
                    </div>
                    <i
                        className={props.Data.image}
                        id={`${props.Data.urlkey}`}
                    ></i>
                </a>
            </div>
        </>
    );
};

export default Breadcumb;
