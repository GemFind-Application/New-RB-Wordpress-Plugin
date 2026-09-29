import React, { useEffect, useMemo, useRef, useState } from "react";
import Breadcumb from "../elements/Breadcumb";
import Topheader from "../elements/Topheader";
import Data from "../elements/data";
import DataDiamond from "../elements/data-diamond";
import Table from "react-bootstrap/Table";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { LoadingOverlay, Loader } from "react-overlay-loader";
import Filter from "../diamondtoolsettings/settings-element/Filter";
import { formatPrice } from "../../utils/priceUtils";
import { RB_BASE, wpFetch } from '../../wp/wpEnv';

const parseCookieArray = (cookieValue) => {
    if (!cookieValue) {
        return [];
    }

    if (Array.isArray(cookieValue)) {
        return cookieValue;
    }

    if (typeof cookieValue === "string") {
        const normalizedValue = cookieValue.startsWith("j:")
            ? cookieValue.substring(2)
            : cookieValue;

        try {
            const parsed = JSON.parse(normalizedValue);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.warn("[COMPARE] Failed to parse cookie array", {
                cookieValue,
                normalizedValue,
                error,
            });
            return [];
        }
    }

    return [];
};

const buildCookieKey = (value) => {
    if (!value) {
        return "[]";
    }

    if (typeof value === "string") {
        return value;
    }

    try {
        return JSON.stringify(value);
    } catch (error) {
        console.warn("[COMPARE] Failed to stringify cookie", {
            value,
            error,
        });
        return String(value);
    }
};

const getDiamondIdentifier = (item) =>
    item?.diamondId ||
    item?.DiamondId ||
    item?.DID ||
    item?.inventoryId ||
    null;

const buildKey = (item, index, prefix) => {
    const identifier = getDiamondIdentifier(item);
    return `${prefix}-${identifier ?? `idx-${index}`}`;
};

// The detail API (proxied through WordPress) returns image2/image1; colorDiamond and
// biggerDiamondimage are often empty there, which left compare cards without a picture.
const getDisplayImage = (item) =>
    (item &&
        (item.image2 ||
            item.image1 ||
            item.biggerDiamondimage ||
            item.defaultDiamondImage ||
            item.colorDiamond ||
            item.diamondImage ||
            item.diamondImageUrl)) ||
    "";

const Compare = () => {
    const navigate = useNavigate();
    const [getcomparecookie, setcomparecookie] = useCookies([
        "finalcompareproductcookie",
    ]);
    const [getsavedcomparecookie] = useCookies([
        "_wpsavedcompareproductcookie",
    ]);
    const [getdiamondtypecookie, setDiamondTypeCookie] = useCookies([
        "compareProductDiamondTypeCookie",
    ]);
    const [getsettingcookies, setsettingcookies] = useCookies([
        "_shopify_ringsetting",
    ]);
    const [getdiamondcookies, setdiamondcookies] = useCookies([
        "_shopify_diamondsetting",
    ]);
    const [loaded, setLoaded] = useState(false);
    const [getsettingcookie, setsettingcookie] = useState(false);
    const [getDiamondCookie, setDiamondCookie] = useState(false);
    const [compareData, setCompareData] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const fetchSignatureRef = useRef(null);

    const rawSavedIds = getsavedcomparecookie._wpsavedcompareproductcookie;
    const rawSavedTypes = getdiamondtypecookie.compareProductDiamondTypeCookie;

    const savedDiamondIdsKey = useMemo(
        () => buildCookieKey(rawSavedIds),
        [rawSavedIds]
    );

    const savedDiamondTypesKey = useMemo(
        () => buildCookieKey(rawSavedTypes),
        [rawSavedTypes]
    );

    const savedDiamondIds = useMemo(
        () => parseCookieArray(rawSavedIds),
        [savedDiamondIdsKey]
    );

    const savedDiamondTypes = useMemo(
        () => parseCookieArray(rawSavedTypes),
        [savedDiamondTypesKey]
    );

    // Fetch diamond data on component mount
    useEffect(() => {
        const signature = `${savedDiamondIdsKey}|${savedDiamondTypesKey}`;

        if (!savedDiamondIds.length) {
            navigate(`${RB_BASE}/diamondtools`);
            return;
        }

        if (fetchSignatureRef.current === signature) {
            return;
        }

        fetchSignatureRef.current = signature;

        const fetchCompareData = async () => {
            setLoaded(true);

            try {
                const diamondIds = savedDiamondIds;
                const diamondTypes = savedDiamondTypes;

                // Fetch data for each diamond
                const fetchPromises = diamondIds.map(async (diamondId) => {
                    // Find diamond type for this ID
                    const typeInfo = diamondTypes.find(
                        (item) => item?.diamondId === diamondId
                    );
                    const diamondType = typeInfo?.diamondType || "mined";

                    // Determine API parameters
                    let isLabGrown = false;
                    let isFancy = false;

                    if (diamondType === "labcreated" || diamondType === "labgrown") {
                        isLabGrown = true;
                    }
                    if (diamondType === "fancydiamonds" || diamondType === "fancy") {
                        isFancy = true;
                    }

                    // Build API URL
                    let url = `${window.initData.data[0].diamonddetailapi}DealerID=${window.initData.data[0].dealerid}&DID=${diamondId}`;

                    if (isFancy && isLabGrown) {
                        url += `&IsLabGrown=true&IsFancy=true`;
                    } else if (isFancy) {
                        url += `&IsLabGrown=false&IsFancy=true`;
                    } else if (isLabGrown) {
                        url += `&IsLabGrown=true`;
                    } else {
                        url += `&IsLabGrown=false`;
                    }

                    // Fetch diamond data
                    const response = await wpFetch(url);
                    if (!response.ok) {
                        console.error(`Failed to fetch diamond ${diamondId}`);
                        return null;
                    }
                    const data = await response.json();
                    return data;
                });

                // Wait for all fetches to complete
                const results = await Promise.all(fetchPromises);
                
                // Filter out null results (failed fetches)
                const validResults = results.filter(item => item !== null);

                if (validResults.length === 0) {
                    navigate(`${RB_BASE}/diamondtools`);
                    return;
                }

                // Set the compare data
                setCompareData(validResults);
                setDataLoaded(true);
                
                // Also save to cookie for compatibility
                setcomparecookie("finalcompareproductcookie", validResults, {
                    path: "/",
                    maxAge: 604800,
                });
            } catch (error) {
                console.error("Error fetching compare data:", error);
                navigate(`${RB_BASE}/diamondtools`);
            } finally {
                setLoaded(false);
            }
        };

        fetchCompareData();
    }, [
        savedDiamondIds,
        savedDiamondTypes,
        savedDiamondIdsKey,
        savedDiamondTypesKey,
        navigate,
        setcomparecookie,
    ]);

    useEffect(() => {
        // Check for setting and diamond cookies
        if (getsettingcookies._shopify_ringsetting) {
            setsettingcookie(true);
        }
        if (getdiamondcookies._shopify_diamondsetting) {
            setDiamondCookie(true);
        }
    }, [getsettingcookies, getdiamondcookies]);

    const onClickDelete = (e) => {
        e.preventDefault();
        const diamondId = e.target.id || e.target.closest('i').id;
        
        if (compareData) {
            const updatedData = compareData.filter(
                (item) => item.diamondId !== diamondId
            );
            
            // Update saved diamond IDs cookie
            const updatedIds = savedDiamondIds.filter((id) => id !== diamondId);
            const updatedTypes = savedDiamondTypes.filter(
                (entry) => entry?.diamondId !== diamondId
            );
            
            if (updatedData.length === 0) {
                // No items left, clear cookies and redirect
                setcomparecookie("finalcompareproductcookie", [], {
                    path: "/",
                    maxAge: 604800,
                });
                setcomparecookie("_wpsavedcompareproductcookie", [], {
                    path: "/",
                    maxAge: 604800,
                });
                setDiamondTypeCookie("compareProductDiamondTypeCookie", [], {
                    path: "/",
                    maxAge: 604800,
                });
                navigate(`${RB_BASE}/diamondtools`);
            } else {
                // Update state and cookies
                setCompareData(updatedData);
                setcomparecookie("finalcompareproductcookie", updatedData, {
                    path: "/",
                    maxAge: 604800,
                });
                setcomparecookie("_wpsavedcompareproductcookie", updatedIds, {
                    path: "/",
                    maxAge: 604800,
                });
                setDiamondTypeCookie(
                    "compareProductDiamondTypeCookie",
                    updatedTypes,
                    {
                        path: "/",
                        maxAge: 604800,
                    }
                );
            }
        }
    };

    const handleSetBackValue = (item, e) => {
        e.preventDefault();
        
        // Determine navigation path based on diamond type
        if (item.isLabCreated === true || item.isLabCreated === "true") {
            navigate(
                `${RB_BASE}/diamondtools/product/` +
                    item.shape.replace(/\s+/g, "-").toLowerCase() +
                    "-shape-" +
                    item.caratWeight.replace(/\s+/g, "-").toLowerCase() +
                    "-carat-" +
                    item.color.replace(/\s+/g, "-").toLowerCase() +
                    "-color-" +
                    item.clarity.replace(/\s+/g, "-").toLowerCase() +
                    "-clarity-" +
                    (item.cut ? item.cut.replace(/\s+/g, "-").toLowerCase() : "cut") +
                    "-cut-" +
                    (item.certificate ? item.certificate.replace(/\s+/g, "-").toLowerCase() : "cert") +
                    "-certificate-" +
                    "-sku-" +
                    item.diamondId +
                    "/labcreated"
            );
            window.location.reload();
        } else if (item.isfancy || item.fancyColorIntensity) {
            navigate(
                `${RB_BASE}/diamondtools/product/` +
                    item.shape.replace(/\s+/g, "-").toLowerCase() +
                    "-shape-" +
                    item.caratWeight.replace(/\s+/g, "-").toLowerCase() +
                    "-carat-" +
                    item.color.replace(/\s+/g, "-").toLowerCase() +
                    "-color-" +
                    item.clarity.replace(/\s+/g, "-").toLowerCase() +
                    "-clarity-" +
                    (item.cut ? item.cut.replace(/\s+/g, "-").toLowerCase() : "cut") +
                    "-cut-" +
                    (item.certificate ? item.certificate.replace(/\s+/g, "-").toLowerCase() : "cert") +
                    "-certificate-" +
                    "-sku-" +
                    item.diamondId +
                    "/fancydiamonds"
            );
            window.location.reload();
        } else {
            navigate(
                `${RB_BASE}/diamondtools/product/` +
                    item.shape.replace(/\s+/g, "-").toLowerCase() +
                    "-shape-" +
                    item.caratWeight.replace(/\s+/g, "-").toLowerCase() +
                    "-carat-" +
                    item.color.replace(/\s+/g, "-").toLowerCase() +
                    "-color-" +
                    item.clarity.replace(/\s+/g, "-").toLowerCase() +
                    "-clarity-" +
                    (item.cut ? item.cut.replace(/\s+/g, "-").toLowerCase() : "cut") +
                    "-cut-" +
                    (item.certificate ? item.certificate.replace(/\s+/g, "-").toLowerCase() : "cert") +
                    "-certificate-" +
                    "-sku-" +
                    item.diamondId
            );
            window.location.reload();
        }
    };

    // Show loading while data is being fetched
    if (!dataLoaded || compareData.length === 0) {
        return (
            <div className="tool-container">
                <LoadingOverlay className="_loading_overlay_wrapper">
                    <Loader fullPage loading={true} />
                </LoadingOverlay>
            </div>
        );
    }

    return (
        <>
            <div className="tool-container">
                <LoadingOverlay className="_loading_overlay_wrapper">
                    <Loader fullPage loading={loaded} />
                </LoadingOverlay>

                <Topheader></Topheader>

                {getsettingcookie === false &&
                    getDiamondCookie === false && (
                        <div className="breadCumbs">
                            {DataDiamond.map((item) => (
                                <Breadcumb Data={item} key={item.key} />
                            ))}
                        </div>
                    )}

                {getsettingcookie === true &&
                    getDiamondCookie === false && (
                        <div className="breadCumbs">
                            {Data.map((item) => (
                                <Breadcumb Data={item} key={item.key} />
                            ))}
                        </div>
                    )}

                {getsettingcookie === false &&
                    getDiamondCookie === true && (
                        <div className="breadCumbs">
                            {DataDiamond.map((item) => (
                                <Breadcumb Data={item} key={item.key} />
                            ))}
                        </div>
                    )}

                {getsettingcookie === true &&
                    getDiamondCookie === true && (
                        <div className="breadCumbs">
                            {DataDiamond.map((item) => (
                                <Breadcumb Data={item} key={item.key} />
                            ))}
                        </div>
                    )}

                <div className="diamond-filter">
                    <Filter
                        callBack={() => {}}
                        callbacktab={() => {}}
                    />
                </div>

                {compareData && compareData.length > 0 && (
                    <>
                        <div className="compareitems">
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th> &nbsp; </th>
                                        {compareData.map((item, index) => (
                                            <th
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-image"
                                                )}
                                            >
                                                <img
                                                    src={getDisplayImage(item)}
                                                    alt={item.mainHeader}
                                                    style={{
                                                        width: "150px",
                                                        height: "150px",
                                                    }}
                                                ></img>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr>
                                        <th>Shape </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-shape"
                                                )}
                                            >
                                                {item.shape
                                                    ? item.shape
                                                    : "NA"}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th>#Sku </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-id"
                                                )}
                                            >
                                                {item.diamondId
                                                    ? item.diamondId
                                                    : "NA"}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th>Carat </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-carat"
                                                )}
                                            >
                                                {item.caratWeight
                                                    ? item.caratWeight
                                                    : "NA"}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th>Table </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-table"
                                                )}
                                            >
                                                {item.table
                                                    ? item.table
                                                    : "NA"}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th>Color </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-color"
                                                )}
                                            >
                                                {item.color
                                                    ? item.color
                                                    : "NA"}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th>Polish </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-polish"
                                                )}
                                            >
                                                {item.polish
                                                    ? item.polish
                                                    : "NA"}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th>Symmetry </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-symmetry"
                                                )}
                                            >
                                                {item.symmetry
                                                    ? item.symmetry
                                                    : "NA"}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th>Clarity </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-clarity"
                                                )}
                                            >
                                                {item.clarity
                                                    ? item.clarity
                                                    : "NA"}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th>Fluorescence </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-fluorescence"
                                                )}
                                            >
                                                {item.fluorescence
                                                    ? item.fluorescence
                                                    : "NA"}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th>Depth </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-depth"
                                                )}
                                            >
                                                {item.depth
                                                    ? item.depth
                                                    : "NA"}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th>Measurement </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-measurement"
                                                )}
                                            >
                                                {item.measurement
                                                    ? item.measurement
                                                    : "NA"}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th>Cert </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-certificate"
                                                )}
                                            >
                                                {item.certificate
                                                    ? item.certificate
                                                    : "NA"}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th>Cut </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-cut"
                                                )}
                                            >
                                                {item.cut ? item.cut : "NA"}{" "}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th>Price </th>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-price"
                                                )}
                                            >
                                                {formatPrice(item)}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>

                                <tfoot>
                                    <tr>
                                        <td> &nbsp; </td>
                                        {compareData.map((item, index) => (
                                            <td
                                                key={buildKey(
                                                    item,
                                                    index,
                                                    "product-actions"
                                                )}
                                            >
                                                <a
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleSetBackValue(
                                                            item,
                                                            e
                                                        );
                                                    }}
                                                    title="View Diamond"
                                                >
                                                    <span>
                                                        <i className="fas fa-eye"></i>
                                                    </span>
                                                </a>
                                                &nbsp;
                                                <a
                                                    href="#"
                                                    id={item.diamondId}
                                                    onClick={onClickDelete}
                                                >
                                                    <span>
                                                        <i
                                                            id={
                                                                item.diamondId
                                                            }
                                                            className="fas fa-trash-alt"
                                                        ></i>
                                                    </span>
                                                </a>
                                            </td>
                                        ))}
                                    </tr>
                                </tfoot>
                            </Table>
                        </div>
                        <div className="gf-mobile-compare-view">
                            {compareData.map((item, index) => (
                                <div
                                    className="gf-compare-mob-items"
                                    key={buildKey(
                                        item,
                                        index,
                                        "compare-mob-items"
                                    )}
                                >
                                    <div className="lists">
                                        <div className="list-items">
                                            <span className="item-image">
                                                <img
                                                    src={getDisplayImage(item)}
                                                    alt={item.mainHeader}
                                                ></img>
                                            </span>
                                            <h5 className="item-name">
                                                {item.shape
                                                    ? item.shape
                                                    : "NA"}
                                            </h5>
                                        </div>
                                    </div>
                                    <div className="lists">
                                        <div className="list-items">
                                            <h5 className="item-value">
                                                {item.caratWeight
                                                    ? item.caratWeight
                                                    : "NA"}
                                            </h5>
                                            <span className="item-name">
                                                Carat
                                            </span>
                                        </div>
                                        <div className="list-items">
                                            <h5 className="item-value">
                                                {item.clarity
                                                    ? item.clarity
                                                    : "NA"}
                                            </h5>
                                            <span className="item-name">
                                                Clarity
                                            </span>
                                        </div>
                                    </div>
                                    <div className="lists">
                                        <div className="list-items">
                                            <h5 className="item-value">
                                                {item.color ? item.color : "NA"}
                                            </h5>
                                            <span className="item-name">
                                                Color
                                            </span>
                                        </div>
                                        <div className="list-items">
                                            <h5 className="item-value">
                                                {item.cut ? item.cut : "NA"}
                                            </h5>
                                            <span className="item-name">
                                                Cut
                                            </span>
                                        </div>
                                    </div>
                                    <div className="lists">
                                        <div className="list-items">
                                            <h5 className="item-value">
                                                {formatPrice(item)}
                                            </h5>
                                            <span className="item-name">
                                                Price
                                            </span>
                                        </div>
                                        <div className="list-items">
                                            <h5 className="item-value" style={{ display: 'flex', alignItems: 'center' }}>
                                                <a
                                                    href="#"
                                                    onClick={(e) =>
                                                        handleSetBackValue(
                                                            item,
                                                            e
                                                        )
                                                    }
                                                    title="View Diamond"
                                                    style={{ marginRight: '0px' }}
                                                >
                                                    <span>
                                                        <i className="fas fa-eye"></i>
                                                    </span>
                                                </a>
                                                &nbsp;
                                                <a
                                                    href="#"
                                                    id={item.diamondId}
                                                    onClick={onClickDelete}
                                                    title="Delete Diamond"
                                                    style={{ marginRight: '0px' }}
                                                >
                                                    <span>
                                                        <i
                                                            id={item.diamondId}
                                                            className="fas fa-trash-alt"
                                                        ></i>
                                                    </span>
                                                </a>
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Compare;
