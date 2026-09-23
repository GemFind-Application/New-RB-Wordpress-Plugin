import React, { useEffect, useState, useCallback } from "react";
import { Modal } from "react-responsive-modal";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox.css";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router-dom";
import { LoadingOverlay, Loader } from "react-overlay-loader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Scrollbars } from "rc-scrollbars";
import ReCAPTCHA from "react-google-recaptcha";
import { emailService } from "../../../Services";
import { formatPrice } from "../../../utils/priceUtils";
import UsDateField from "../../elements/UsDateField";
import DiamondLoader from "./DiamondLoader";
import { RB_BASE, jcBase } from '../../../wp/wpEnv';
import { clearSettingFilterRelax } from "../../../wp/settingFilterRelax";

const ProductInformation = (props) => {
    let errors = {};
    let formIsValid = true;
    const [loaded, setLoaded] = useState(false);
    const locationurl = useLocation();
    const [cookies, setCookie] = useCookies(["_shopify_ringsetting"]);
    const [getdiamondcookies, setdiamondcookies] = useCookies([
        "_shopify_diamondsetting",
    ]);
    const [getbrowsercookies, setbrowsercookies, removeCookie] = useCookies([
        "shopify_ringbackvalue",
    ]);
    const currentDate = new Date().toISOString().split("T")[0];

    const [getDiamondCookie, setDiamondCookie] = useState(false);
    const [getsettingcookie, setsettingcookie] = useState(false);
    const [getcaratmin, setcaratmin] = useState("");
    const [getcaratmax, setcaratmax] = useState("");
    const [getstone, setstone] = useState("");
    const [getSideStone, setSideStone] = useState("");
    const [getNavUrl, setNavUrl] = useState(`${RB_BASE}/diamondtools`);
    const [getnavmenu, setnavmenu] = useState([]);
    const [notFitMessage, setNotFitMessage] = useState("");
    const [isVariationLoading, setIsVariationLoading] = useState(false);
    
    // State for filtering (matching version 2 approach)
    const [selectedMetalType, setSelectedMetalType] = useState("");
    const [selectedDiamondShape, setSelectedDiamondShape] = useState("");
    const [selectedSideStoneQuality, setSelectedSideStoneQuality] = useState("");
    const [filteredCenterStoneSizes, setFilteredCenterStoneSizes] = useState([]);
    const [uniqueDiamondShapes, setUniqueDiamondShapes] = useState([]);
    const [uniqueSideStoneQualities, setUniqueSideStoneQualities] = useState([]);

    const [recaptchaToken, setRecaptchaToken] = useState("");
    const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);

    const [recaptchaReqToken, setReqRecaptchaToken] = useState("");
    const [isReqRecaptchaVerified, setIsReqRecaptchaVerified] = useState(false);

    const [recaptchaEmailFrndToken, setEmailFrndRecaptchaToken] = useState("");
    const [isEmailFrndRecaptchaVerified, setIsEmailFrndRecaptchaVerified] =
        useState(false);

    const [recaptchaSchlToken, setSchlRecaptchaToken] = useState("");
    const [isSchlRecaptchaVerified, setIsSchlRecaptchaVerified] =
        useState(false);

    const [selectedOption, setSelectedOption] = useState("");

    const [getTryon, setTryon] = useState("false");
    const [getTryonsrc, setTryonsrc] = useState("");

    const [open, setOpen] = useState(false);
    const onOpenModal = (e) => {
        e.preventDefault();
        setOpen(true);
    };
    const onCloseModal = () => setOpen(false);
    const [openSecond, setOpenSecond] = useState(false);
    const onOpenSecondModal = (e) => {
        e.preventDefault();
        setyourname("");
        setyouremail("");
        setrecipientname("");
        setrecipientemail("");
        setgiftreason("");
        sethintmessage("");
        setgiftdeadline("");
        setOpenSecond(true);
    };
    const [openThird, setOpenThird] = useState(false);
    const onOpenThirdModal = (e) => {
        e.preventDefault();
        setreqname("");
        setreqemail("");
        setreqphone("");
        setreqmsg("");
        setreqcp("");
        setOpenThird(true);
    };
    const [openFour, setOpenFour] = useState(false);
    const onOpenFourthModal = (e) => {
        e.preventDefault();
        setname("");
        setemail("");
        setfrndname("");
        setfrndemail("");
        setfrndmessage("");
        setOpenFour(true);
    };
    const [openFive, setOpenFive] = useState(false);
    const onOpenFifthModal = (e) => {
        e.preventDefault();
        setschdname("");
        setschdemail("");
        setschdphone("");
        setschdmsg("");
        setschddate("");
        setschdtime("");
        setLocation("");
        setOpenFive(true);
    };
    const [virtualtryon, setvirtualtryon] = useState(false);
    const handelvirtualtryon = (e) => {
        e.preventDefault();
        setvirtualtryon(true);
    };
    const onCloseVirtualModal = () => setvirtualtryon(false);
    const currentSelectedMetaltype = props.currenturl.split("-sku");

    var listMetal = [];
    const listItems = props.productDetailsData.configurableProduct ? props.productDetailsData.configurableProduct.map(
        (val) => listMetal.push(val.metalType)
        // listMetal.push(val.gfInventoryId)
    ) : [];

    const uniqueNames = Array.from(new Set(listMetal)).filter(item => item !== null && item !== undefined && item !== "");

    var listMetal1 = [];
    const listItems1 = props.centerstoneData.map((x, i) =>
        listMetal1.push(x.stonesize)
    );

    const uniqueCenterStone = Array.from(new Set(listMetal1))
        .filter((item) => item !== null && item !== undefined && item !== "")
        .sort((a, b) => {
            const numA = parseFloat(a);
            const numB = parseFloat(b);

            if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
                return numA - numB;
            }

            return String(a).localeCompare(String(b));
        });

    const [getDefaultMetalType, setDefaultMetalType] = useState(
        currentSelectedMetaltype[0]
    );

    //if (props.selectedSideStone !== "" && props.selectedSideStone !== "null") {
    var listMetal2 = [];
    const listItems2 = props.centerstoneData.map((x, i) =>
        listMetal2.push(x.sidestone)
    );

    const uniqueSideStone = Array.from(new Set(listMetal2)).filter(item => item !== null && item !== undefined && item !== "");
    //}

    const handleRecaptchaChange = (response) => {
        setRecaptchaToken(response);
        setIsRecaptchaVerified(true); // Set verification status
    };

    const handleReqRecaptchaChange = (response) => {
        setReqRecaptchaToken(response);
        setIsReqRecaptchaVerified(true); // Set verification status
    };

    const handleEmailFrndRecaptchaChange = (response) => {
        setEmailFrndRecaptchaToken(response);
        setIsEmailFrndRecaptchaVerified(true); // Set verification status
    };

    const handleSchlRecaptchaChange = (response) => {
        setSchlRecaptchaToken(response);
        setIsSchlRecaptchaVerified(true); // Set verification status
    };

    const navigate = useNavigate();
    
    // Helper function to recalculate all filtered options (matching version 2's fetchProductDetails logic exactly)
    const recalculateFilteredOptions = useCallback((productId = null) => {
        if (!props.productDetailsData || !props.productDetailsData.configurableProduct) {
            return;
        }

        const configurableProduct = props.productDetailsData.configurableProduct;
        const currentProductId = productId || (props.currenturl ? props.currenturl.split("-sku-")[1] : null);
        
        // Find selected setting
        let selectedSetting = [];
        if (currentProductId) {
            selectedSetting = configurableProduct.filter(item => item.gfInventoryId === currentProductId);
        }
        
        // Get available diamond shapes for current metal type (matching version 2 logic)
        // Priority: 1) selectedSetting metal type, 2) productDetailsData.metalType, 3) try to extract from URL
        let currentMetalType = "";
        if (selectedSetting.length > 0) {
            currentMetalType = selectedSetting[0].metalType || "";
        }
        
        if (!currentMetalType || currentMetalType === "") {
            currentMetalType = props.productDetailsData.metalType || "";
        }
        
        // If still empty, try to extract from URL
        if (!currentMetalType || currentMetalType === "") {
            const urlMetalType = props.currenturl ? props.currenturl.split("-sku")[0] : "";
            if (urlMetalType && configurableProduct.length > 0) {
                // Get unique metal types from configurableProduct
                const uniqueMetalTypes = [...new Set(configurableProduct.map(item => item.metalType))].filter(item => item);
                // Find the actual metal type name that matches the formatted URL value
                const actualMetalType = uniqueMetalTypes.find(name => 
                    name && name.replace(/\s+/g, "-").toLowerCase() === urlMetalType.toLowerCase()
                );
                if (actualMetalType) {
                    currentMetalType = actualMetalType;
                }
            }
        }
        
        const diamondShapeAvailable = configurableProduct.filter(item => 
            item.metalType === currentMetalType && item.diamondShape !== null && item.diamondShape !== ""
        );
        
        // Determine diamond shape to filter by (matching version 2 logic exactly)
        const diamondShapeToFilter = selectedSetting.length > 0 && selectedSetting[0].diamondShape && selectedSetting[0].diamondShape.trim() !== '' 
            ? selectedSetting[0].diamondShape 
            : (props.productDetailsData.centerStoneFit || "");
        
        // Filter by metal type and diamond shape (matching version 2 logic)
        let filterByMetalType = [];
        const itemsWithDiamondShape = configurableProduct.filter(item => item.diamondShape === diamondShapeToFilter);
        
        if (diamondShapeToFilter && diamondShapeToFilter.trim() !== '' && itemsWithDiamondShape.length > 0) {
            filterByMetalType = configurableProduct.filter(item => 
                item.metalType == currentMetalType && item.diamondShape == diamondShapeToFilter
            );
        } else {
            filterByMetalType = configurableProduct.filter(item => item.metalType == currentMetalType);
        }

        // Sort all settings according to stone size
        let sortedarray = filterByMetalType.sort((a, b) => a.centerStoneSize - b.centerStoneSize);
        
        // Filter by side stone quality if selected setting has it (matching version 2 logic)
        let filterBySideStoneType = [];
        if (selectedSetting.length > 0) {
            if (selectedSetting[0].sideStoneQuality != null) {
                filterBySideStoneType = filterByMetalType.filter(item => 
                    item.sideStoneQuality == selectedSetting[0].sideStoneQuality
                );
            }
        }

        let sortedarrayforSideStoneQuality = filterBySideStoneType.sort((a, b) => a.centerStoneSize - b.centerStoneSize);

        // Available diamond shape for selected metal type
        const allDiamondShape = diamondShapeAvailable ? [...new Set(diamondShapeAvailable.map(item => item.diamondShape))].filter(function (e) { return e }) : [];
        
        // Always set selectedMetalType, even if no products found (important for handleCorner)
        setSelectedMetalType(currentMetalType);
        
        if (sortedarray.length > 0) {
            const uniqueSideStoneQualityArray = [...new Set(sortedarray.map(item => item.sideStoneQuality))].filter(function (e) { return e });
            
            // Calculate unique center stone sizes (matching version 2 logic exactly)
            let uniqueCenterStoneSizesArray = [];
            if (uniqueSideStoneQualityArray.length > 0 && filterBySideStoneType.length > 0) {
                uniqueCenterStoneSizesArray = [...new Set(sortedarrayforSideStoneQuality.map(item => item.centerStoneSize))].filter(function (e) { return e });
            } else {
                uniqueCenterStoneSizesArray = [...new Set(sortedarray.map(item => item.centerStoneSize))].filter(function (e) { return e });
            }
            
            // Update all state (matching version 2's state updates)
            setUniqueDiamondShapes(allDiamondShape);
            setUniqueSideStoneQualities(uniqueSideStoneQualityArray);
            setFilteredCenterStoneSizes(uniqueCenterStoneSizesArray);
            
            // Update selected values from selected setting (matching version 2 logic)
            if (selectedSetting.length > 0) {
                // IMPORTANT: Use the product's actual diamond shape, even if empty
                // Empty string means the product works with any diamond shape
                const selectedShape = selectedSetting[0].diamondShape !== undefined && selectedSetting[0].diamondShape !== null
                    ? selectedSetting[0].diamondShape
                    : (props.productDetailsData.centerStoneFit || "");
                const selectedQuality = selectedSetting[0].sideStoneQuality || "";
                
                setSelectedDiamondShape(selectedShape);
                setSelectedSideStoneQuality(selectedQuality);
                if (selectedSetting[0].centerStoneSize) {
                    setstone(selectedSetting[0].centerStoneSize);
                }
            } else {
                setSelectedDiamondShape(props.productDetailsData.centerStoneFit || "");
            }
        } else {
            // Even if no products found, still set basic state
            setUniqueDiamondShapes(allDiamondShape);
            setUniqueSideStoneQualities([]);
            setFilteredCenterStoneSizes([]);
            
            // Still set selected values from product data
            if (selectedSetting.length > 0) {
                const selectedShape = selectedSetting[0].diamondShape !== undefined && selectedSetting[0].diamondShape !== null
                    ? selectedSetting[0].diamondShape
                    : (props.productDetailsData.centerStoneFit || "");
                const selectedQuality = selectedSetting[0].sideStoneQuality || "";
                setSelectedDiamondShape(selectedShape);
                setSelectedSideStoneQuality(selectedQuality);
                if (selectedSetting[0].centerStoneSize) {
                    setstone(selectedSetting[0].centerStoneSize);
                }
            } else {
                setSelectedDiamondShape(props.productDetailsData.centerStoneFit || "");
            }
        }
    }, [props.productDetailsData, props.currenturl]);
    
    // Helper function to construct path by replacing the metal type segment
    const constructPath = (metalType, gfid) => {
        const currentPath = locationurl.pathname;
        const pathSegments = currentPath.split('/');
        
        // Find the index of the last segment that contains '-sku-'
        let lastSkuIndex = -1;
        for (let i = pathSegments.length - 1; i >= 0; i--) {
            if (pathSegments[i].includes('-sku-')) {
                lastSkuIndex = i;
                break;
            }
        }
        
        // Construct new path: replace the metal type segment or append if not found
        let newPath;
        if (lastSkuIndex >= 0) {
            // Replace the metal type segment
            const basePath = pathSegments.slice(0, lastSkuIndex).join('/');
            newPath = basePath + '/' + metalType + '-sku-' + gfid;
        } else {
            // Fallback: construct from collection
            const settingCollection = props.productDetailsData.collection;
            newPath = '/' + settingCollection.replace(/\s+/g, "-").toLowerCase() +
                '/' + metalType + '-sku-' + gfid;
        }
        
        return newPath;
    };
    
    const handlemetalType = (event) => {
        const metalValueFormatted = event.target.value; // This is "18k-rose-gold" format
        
        // Find the actual metal type name from uniqueNames that matches the formatted value
        const actualMetalType = uniqueNames.find(name => 
            name.replace(/\s+/g, "-").toLowerCase() === metalValueFormatted
        );
        
        if (!actualMetalType) {
            setIsVariationLoading(false);
            return;
        }
        
        setDefaultMetalType(metalValueFormatted);
        setIsVariationLoading(true);
        
        // Filter products by metal type using the actual metal type name
        const selectedMetalTypeProducts = props.productDetailsData.configurableProduct 
            ? props.productDetailsData.configurableProduct.filter(item => item.metalType == actualMetalType)
            : [];
        
        // Sort by center stone size and get the smallest (matching version 2)
        let sortedarray = selectedMetalTypeProducts.sort((a, b) => a.centerStoneSize - b.centerStoneSize);
        
        // Update side stone qualities based on the newly selected metal type (matching version 2)
        const uniqueSideStoneQualityArray = [...new Set(sortedarray.map(item => item.sideStoneQuality))].filter(function (e) { return e });
        setUniqueSideStoneQualities(uniqueSideStoneQualityArray);
        
        // Reset side stone quality selection when metal type changes (matching version 2)
        setSelectedSideStoneQuality("");
        
        if (sortedarray.length > 0) {
            const gfid = sortedarray[0].gfInventoryId;
            const newPath = constructPath(metalValueFormatted, gfid);
            
            // Navigate first, then wait for URL to update before calling callback
            navigate(newPath, { replace: true });
            
            // Use setTimeout to ensure URL has updated before calling callback
            // This prevents race conditions where callback reads stale URL
            setTimeout(() => {
                if (props.callback) {
                    props.callback().finally(() => {
                        setIsVariationLoading(false);
                    });
                } else {
                    setIsVariationLoading(false);
                }
            }, 0);
        } else {
            setIsVariationLoading(false);
        }
    };
    const handleSideStone = (event) => {
        const sideStoneQuality = event.target.value;
        
        setSideStone(sideStoneQuality);
        setSelectedSideStoneQuality(sideStoneQuality);
        setIsVariationLoading(true);
        
        // Filter products by side stone quality, metal type, and diamond shape
        const selectedSideStoneQualityProducts = props.productDetailsData.configurableProduct 
            ? props.productDetailsData.configurableProduct.filter(item => {
                const metalMatches = item.metalType == selectedMetalType;
                const qualityMatches = item.sideStoneQuality === sideStoneQuality;
                
                // Diamond shape matching logic (matching version 2):
                // If selectedDiamondShape is empty, match products with the same empty shape
                // If selectedDiamondShape is set, match exact diamond shape
                const shapeMatches = item.diamondShape === selectedDiamondShape;
                
                const matches = metalMatches && qualityMatches && shapeMatches;
                
                return matches;
            })
            : [];
        
        let sortedarray = selectedSideStoneQualityProducts.sort((a, b) => a.centerStoneSize - b.centerStoneSize);
        
        // Update center stone sizes based on new side stone quality (matching version 2 logic)
        if (sortedarray.length > 0) {
            const uniqueCenterStoneSizesArray = [...new Set(sortedarray.map(item => item.centerStoneSize))].filter(function (e) { return e });
            setFilteredCenterStoneSizes(uniqueCenterStoneSizesArray);
            
            const gfid = sortedarray[0].gfInventoryId;
            const newPath = constructPath(getDefaultMetalType, gfid);
            
            navigate(newPath, { replace: true });
            
            // Use setTimeout to ensure URL has updated before calling callback
            // This prevents race conditions where callback reads stale URL
            setTimeout(() => {
                // Call callback to update parent component - this will trigger page refresh with new data
                if (props.callback) {
                    props.callback().finally(() => {
                        setIsVariationLoading(false);
                    });
                } else {
                    setIsVariationLoading(false);
                }
            }, 0);
        } else {
            setIsVariationLoading(false);
        }
    };
    
    const handleDiamondShape = (shape) => {
        setIsVariationLoading(true);
        
        // Filter products by metal type and diamond shape (matching version 2's selectByDiamondShape exactly)
        const selectedShapeProducts = props.productDetailsData.configurableProduct 
            ? props.productDetailsData.configurableProduct.filter(item => 
                item.metalType == selectedMetalType && 
                item.diamondShape === shape
            )
            : [];
        
        let sortedarray = selectedShapeProducts.sort((a, b) => a.centerStoneSize - b.centerStoneSize);
        
        if (sortedarray.length > 0) {
            const gfid = sortedarray[0].gfInventoryId;
            const newPath = constructPath(getDefaultMetalType, gfid);
            
            // Navigate first, then wait for URL to update before calling callback
            navigate(newPath, { replace: true });
            
            // Use setTimeout to ensure URL has updated before calling callback
            // This prevents race conditions where callback reads stale URL
            setTimeout(() => {
                if (props.callback) {
                    props.callback().finally(() => {
                        setIsVariationLoading(false);
                    });
                } else {
                    setIsVariationLoading(false);
                }
            }, 0);
        } else {
            setIsVariationLoading(false);
        }
    };
    const handleCorner = (event) => {
        const size = event.target.value;
        setstone(size);
        setNotFitMessage(''); // Clear any existing message (matching version 2)
        setIsVariationLoading(true);

        // Determine the metal type to use for filtering
        // Priority: 1) selectedMetalType (if set), 2) productDetailsData.metalType, 3) extract from URL
        let metalTypeToUse = selectedMetalType;
        
        if (!metalTypeToUse || metalTypeToUse === "") {
            // Try to get from product data
            metalTypeToUse = props.productDetailsData.metalType || "";
            
            // If still empty, try to extract from URL and convert to actual metal type name
            if (!metalTypeToUse && getDefaultMetalType) {
                // Find the actual metal type name from uniqueNames that matches the formatted URL value
                const actualMetalType = uniqueNames.find(name => 
                    name.replace(/\s+/g, "-").toLowerCase() === getDefaultMetalType.toLowerCase()
                );
                if (actualMetalType) {
                    metalTypeToUse = actualMetalType;
                }
            }
        }

        // Filter products by center stone size, metal type, diamond shape, and side stone quality (matching version 2 exactly)
        let selectedCenterStoneSizeProduct = [];
        if (uniqueSideStoneQualities.length > 0 && selectedSideStoneQuality) {
            selectedCenterStoneSizeProduct = props.productDetailsData.configurableProduct 
                ? props.productDetailsData.configurableProduct.filter(item => 
                    item.metalType == metalTypeToUse && 
                    item.diamondShape == selectedDiamondShape && 
                    item.sideStoneQuality == selectedSideStoneQuality && 
                    item.centerStoneSize == size
                )
                : [];
        } else {
            //show all products with selected metal type and selected center stone size (matching version 2 comment)
            selectedCenterStoneSizeProduct = props.productDetailsData.configurableProduct 
                ? props.productDetailsData.configurableProduct.filter(item => 
                    item.metalType == metalTypeToUse && 
                    item.centerStoneSize == size && 
                    item.diamondShape == selectedDiamondShape
                )
                : [];
        }
        
        if (selectedCenterStoneSizeProduct.length === 0) {
            // Fallback: try to find any product with matching metal type and center stone size
            selectedCenterStoneSizeProduct = props.productDetailsData.configurableProduct 
                ? props.productDetailsData.configurableProduct.filter(item => 
                    item.metalType == metalTypeToUse && 
                    item.centerStoneSize == size
                )
                : [];
        }

        if (selectedCenterStoneSizeProduct.length > 0) {
            const gfid = selectedCenterStoneSizeProduct[0].gfInventoryId;
            
            // Check carat range compatibility with selected diamond (matching version 2 logic exactly)
            // Try localStorage first (version 2 pattern), then fallback to cookies
            let selecteddiamond = null;
            try {
                const storedDiamond = JSON.parse(localStorage.getItem('selectedDiamond'));
                if (storedDiamond && storedDiamond.diamondId) {
                    selecteddiamond = storedDiamond;
                }
            } catch (e) {
                // Fallback to cookies
            }
            
            if (!selecteddiamond && getdiamondcookies._shopify_diamondsetting && getdiamondcookies._shopify_diamondsetting[0]) {
                selecteddiamond = getdiamondcookies._shopify_diamondsetting[0];
            }
            
            if (selecteddiamond && selecteddiamond.diamondId && selecteddiamond.diamondId !== "") {
                if (window.initData && 
                    window.initData.data && 
                    window.initData.data[0] && 
                    window.initData.data[0].settings_carat_ranges) {
                    
                    const caratWeight = size;
                    const caratRangesData = window.initData.data[0].settings_carat_ranges;
                    
                    // Handle both string JSON and object formats
                    let caratRanges;
                    if (typeof caratRangesData === 'string') {
                        let trimmedData = caratRangesData.trim();
                        
                        // Handle string that might be missing outer braces
                        if (!trimmedData.startsWith('{')) {
                            trimmedData = '{' + trimmedData;
                        }
                        
                        // Count closing braces at the end
                        let closingBracesCount = 0;
                        for (let i = trimmedData.length - 1; i >= 0; i--) {
                            if (trimmedData[i] === '}') {
                                closingBracesCount++;
                            } else {
                                break;
                            }
                        }
                        
                        // If no closing brace, add one
                        if (closingBracesCount === 0) {
                            trimmedData = trimmedData + '}';
                        } else if (closingBracesCount > 1) {
                            // Remove extra closing braces (keep only one)
                            trimmedData = trimmedData.slice(0, -(closingBracesCount - 1));
                        }
                        
                        try {
                            caratRanges = JSON.parse(trimmedData);
                        } catch (parseError) {
                            console.warn('Error parsing carat ranges JSON:', parseError);
                            caratRanges = null;
                        }
                    } else if (typeof caratRangesData === 'object' && caratRangesData !== null) {
                        caratRanges = caratRangesData;
                    } else {
                        caratRanges = null;
                    }
                    
                    // Ensure caratWeight is treated as a string for lookup
                    const caratWeightKey = String(caratWeight);
                    let caratRange = null;
                    
                    if (caratRanges && caratRanges[caratWeightKey]) {
                        caratRange = caratRanges[caratWeightKey];
                    } else {
                        // Try alternative formats
                        const alternatives = [
                            caratWeight,
                            String(caratWeight),
                            Number(caratWeight).toFixed(2),
                            parseFloat(caratWeight).toString()
                        ];
                        
                        for (const alt of alternatives) {
                            if (caratRanges && caratRanges[alt]) {
                                caratRange = caratRanges[alt];
                                break;
                            }
                        }
                    }
                    
                    if (caratRange) {
                        // Match version 2 logic exactly: use caratRange[0] if exists, else (size - 0.1)
                        const minRange = caratRange[0] ? Number(caratRange[0]) : (Number(caratWeight) - 0.1);
                        // Match version 2 logic exactly: use caratRange[1] if exists, else (size + 0.1)
                        const maxRange = caratRange[1] ? Number(caratRange[1]) : (Number(caratWeight) + 0.1);
                        
                        // Version 2 uses caratWeight property from localStorage
                        const diamondCaratWeight = selecteddiamond.caratWeight 
                            ? Number(selecteddiamond.caratWeight) 
                            : (selecteddiamond.carat ? Number(selecteddiamond.carat) : null);
                        
                        // Only show message if measurement exists and diamond is out of range (matching version 2 exactly)
                        if (diamondCaratWeight !== null && props.productDetailsData.measurement && props.productDetailsData.measurement !== "") {
                            if (diamondCaratWeight < minRange || diamondCaratWeight > maxRange) {
                                setNotFitMessage("This ring will not properly fit with selected diamond.");
                            }
                        }
                    }
                }
            }
            
            const newPath = constructPath(getDefaultMetalType, gfid);
            
            // Navigate first, then wait for URL to update before calling callback
            navigate(newPath, { replace: true });
            
            // Use setTimeout to ensure URL has updated before calling callback
            // This prevents race conditions where callback reads stale URL
            setTimeout(() => {
                if (props.callback) {
                    props.callback().finally(() => {
                        setIsVariationLoading(false);
                    });
                } else {
                    setIsVariationLoading(false);
                }
            }, 0);
        } else {
            setIsVariationLoading(false);
        }
    };
    const [location, setLocation] = React.useState("");
    const [loadedtry, setLoadedtry] = useState(false);

    const handleChange = (event) => {
        setLocation(event.target.value);
    };
    const onclickpopup = (e) => {
        e.preventDefault();
    };

    const [getRingSize, setRingSize] = useState("");

    const handleRingSize = (e) => {
        e.preventDefault();
        setRingSize(e.target.value);
    };

    const handlevirtual = (e) => {
        var styleNumber = props.productDetailsData.styleNumber
            .split("-")
            .map((item) => item.trim());

        e.preventDefault();
        setLoadedtry(true);
        setTryon("true");
        setTryonsrc(
            `https://cdn.camweara.com/gemfind/index_client.php?company_name=Gemfind&ringbuilder=1&skus=${styleNumber[0]}&buynow=0`
        );
    };

    const handleadddiamonds = (e) => {
        e.preventDefault();

        var ringData = [];
        var data = {};
        var styleNumber = props.productDetailsData.styleNumber
            .split("-")
            .map((item) => item.trim());
        
        if (getRingSize === "" || getRingSize === 0) {
            alert("Please Select Ring Size");
            return;
        } else {
            data.ringsizewithdia = getRingSize;
        }
        
        // Use setting's API carat range first (same as version 2 - getSettingDetail returns centerStoneMinCarat/MaxCarat)
        // This ensures the diamond list API gets the same carat values and returns results instead of "no diamond"
        const apiMinCarat = props.productDetailsData.centerStoneMinCarat;
        const apiMaxCarat = props.productDetailsData.centerStoneMaxCarat;
        const hasApiCaratRange = apiMinCarat != null && apiMinCarat !== "" && apiMaxCarat != null && apiMaxCarat !== "";

        let caratRangeForDiamond = null;
        if (!hasApiCaratRange && window.initData?.data?.[0]?.settings_carat_ranges) {
            const caratRangesData = window.initData.data[0].settings_carat_ranges;
            const caratWeight = getstone;
            let caratRanges = null;
            if (typeof caratRangesData === 'string') {
                let trimmedData = caratRangesData.trim();
                if (!trimmedData.startsWith('{')) trimmedData = '{' + trimmedData;
                let closingBracesCount = 0;
                for (let i = trimmedData.length - 1; i >= 0; i--) {
                    if (trimmedData[i] === '}') closingBracesCount++;
                    else break;
                }
                if (closingBracesCount === 0) trimmedData = trimmedData + '}';
                else if (closingBracesCount > 1) trimmedData = trimmedData.slice(0, -(closingBracesCount - 1));
                try {
                    caratRanges = JSON.parse(trimmedData);
                } catch (parseError) {
                    caratRanges = null;
                }
            } else if (typeof caratRangesData === 'object' && caratRangesData !== null) {
                caratRanges = caratRangesData;
            }
            const caratWeightKey = String(caratWeight);
            if (caratRanges?.[caratWeightKey]) {
                caratRangeForDiamond = caratRanges[caratWeightKey];
            } else {
                const alternatives = [caratWeight, String(caratWeight), Number(caratWeight).toFixed(2), parseFloat(caratWeight).toString()];
                for (const alt of alternatives) {
                    if (caratRanges?.[alt]) {
                        caratRangeForDiamond = caratRanges[alt];
                        break;
                    }
                }
            }
        }
        
        // Set carat range: prefer API values (match version 2), then settings_carat_ranges, then getstone ± 0.1
        if (hasApiCaratRange) {
            data.ringmincarat = Number(apiMinCarat);
            data.ringmaxcarat = Number(apiMaxCarat);
            data.centerStoneSize = data.ringmincarat + "-" + data.ringmaxcarat;
        } else if (caratRangeForDiamond && Array.isArray(caratRangeForDiamond)) {
            data.ringmincarat = caratRangeForDiamond[0] ?? (Number(getstone) - 0.1).toFixed(2);
            data.ringmaxcarat = caratRangeForDiamond[1] ?? (Number(getstone) + 0.1).toFixed(2);
            data.centerStoneSize = data.ringmincarat + "-" + data.ringmaxcarat;
        } else {
            data.ringmincarat = (Number(getstone) - 0.1).toFixed(2);
            data.ringmaxcarat = (Number(getstone) + 0.1).toFixed(2);
            data.centerStoneSize = data.ringmincarat + "-" + data.ringmaxcarat;
        }
        
        data.centerStoneFit = props.productDetailsData.centerStoneFit.replace(
            /\s/g,
            ""
        );
        // Save the actually selected side stone quality and center stone size (not the first one from array)
        data.sideStoneQuality = selectedSideStoneQuality || getSideStone || (props.productDetailsData.sideStoneQuality && props.productDetailsData.sideStoneQuality[0]) || null;
        data.centerStoneSize = getstone; // Save the actual selected center stone size
        data.setting_id = props.productDetailsData.settingId;
        data.isLabSetting = props.productDetailsData.isLabSetting;
        data.ringpath = locationurl.pathname;
        data.styleNumber = styleNumber[0];
        
        ringData.push(data);
        clearSettingFilterRelax(); // new setting: its constraints apply again
        setCookie("_shopify_ringsetting", JSON.stringify(ringData), {
            path: "/",
            maxAge: 604800,
        });
        
        navigate(getNavUrl);
    };

    const handleCompletering = (e) => {
        e.preventDefault();
        
        var ringData = [];
        var data = {};
        
        if (getRingSize === "" || getRingSize === 0) {
            alert("Please Select Ring Size");
            return;
        } else {
            data.ringsizewithdia = getRingSize;
        }
        
        // Calculate carat range using settings_carat_ranges if available (matching version 2 logic)
        let caratRangeForDiamond = null;
        
        if (window.initData && 
            window.initData.data && 
            window.initData.data[0] && 
            window.initData.data[0].settings_carat_ranges) {
            
            const caratWeight = getstone; // Use selected center stone size
            const caratRangesData = window.initData.data[0].settings_carat_ranges;
            
            // Handle both string JSON and object formats (matching version 2)
            let caratRanges = null;
            if (typeof caratRangesData === 'string') {
                let trimmedData = caratRangesData.trim();
                
                // Handle string that might be missing outer braces
                if (!trimmedData.startsWith('{')) {
                    trimmedData = '{' + trimmedData;
                }
                
                // Count closing braces at the end
                let closingBracesCount = 0;
                for (let i = trimmedData.length - 1; i >= 0; i--) {
                    if (trimmedData[i] === '}') {
                        closingBracesCount++;
                    } else {
                        break;
                    }
                }
                
                // If no closing brace, add one
                if (closingBracesCount === 0) {
                    trimmedData = trimmedData + '}';
                } else if (closingBracesCount > 1) {
                    // Remove extra closing braces (keep only one)
                    trimmedData = trimmedData.slice(0, -(closingBracesCount - 1));
                }
                
                try {
                    caratRanges = JSON.parse(trimmedData);
                } catch (parseError) {
                    console.error('Error parsing carat ranges JSON:', parseError);
                    caratRanges = null;
                }
            } else if (typeof caratRangesData === 'object' && caratRangesData !== null) {
                caratRanges = caratRangesData;
            }
            
            // Ensure caratWeight is treated as a string for lookup
            const caratWeightKey = String(caratWeight);
            
            if (caratRanges && caratRanges[caratWeightKey]) {
                caratRangeForDiamond = caratRanges[caratWeightKey];
            } else {
                // Try alternative formats
                const alternatives = [
                    caratWeight,
                    String(caratWeight),
                    Number(caratWeight).toFixed(2),
                    parseFloat(caratWeight).toString()
                ];
                
                for (const alt of alternatives) {
                    if (caratRanges && caratRanges[alt]) {
                        caratRangeForDiamond = caratRanges[alt];
                        break;
                    }
                }
            }
        }
        
        // Set carat range values (matching version 2 logic)
        if (caratRangeForDiamond && Array.isArray(caratRangeForDiamond)) {
            // Use configured range from settings_carat_ranges
            data.ringmincarat = caratRangeForDiamond[0] || (Number(getstone) - 0.1).toFixed(2);
            data.ringmaxcarat = caratRangeForDiamond[1] || (Number(getstone) + 0.1).toFixed(2);
        } else {
            // Fallback: use +/- 0.1 from selected center stone size (matching version 2 fallback logic)
            data.ringmincarat = (Number(getstone) - 0.1).toFixed(2);
            data.ringmaxcarat = (Number(getstone) + 0.1).toFixed(2);
        }
        
        // Match V2: send all compatible shapes (API centerStoneFit order first, then any from UI not in API).
        const apiShapes = (props.productDetailsData.centerStoneFit || "").split(",").map((s) => (s || "").trim()).filter(Boolean);
        const uiShapes = (uniqueDiamondShapes || []).map((s) => (s || "").trim()).filter(Boolean);
        const seen = new Set();
        const allShapes = [];
        [...apiShapes, ...uiShapes].forEach((s) => { if (s && !seen.has(s)) { seen.add(s); allShapes.push(s); } });
        data.centerStoneFit = allShapes.length > 0 ? allShapes.join(",") : (props.productDetailsData.centerStoneFit || "");
        // Save the actually selected side stone quality and center stone size (not the first one from array)
        data.sideStoneQuality = selectedSideStoneQuality || getSideStone || (props.productDetailsData.sideStoneQuality && props.productDetailsData.sideStoneQuality[0]) || null;
        data.centerStoneSize = getstone; // Save the actual selected center stone size
        data.setting_id = props.productDetailsData.settingId;
        data.isLabSetting = props.productDetailsData.isLabSetting;
        data.ringpath = locationurl.pathname;
        
        ringData.push(data);
        clearSettingFilterRelax(); // new setting: its constraints apply again
        setCookie("_shopify_ringsetting", JSON.stringify(ringData), {
            path: "/",
            maxAge: 604800,
        });
        
        navigate(`${RB_BASE}/completering`);
    };

    //DROP HINT SUBMIT BUTTON
    const [getyourname, setyourname] = useState("");
    const [getyouremail, setyouremail] = useState("");
    const [getrecipientname, setrecipientname] = useState("");
    const [getrecipientemail, setrecipientemail] = useState("");
    const [getgiftreason, setgiftreason] = useState("");
    const [gethintmessage, sethintmessage] = useState("");
    const [getgiftdeadline, setgiftdeadline] = useState(currentDate);

    const [geterror, seterror] = useState([""]);

    const handleYourname = (event) => {
        setyourname(event.target.value);
    };
    const handleYouremail = (event) => {
        setyouremail(event.target.value);
    };
    const handleRecipientname = (event) => {
        setrecipientname(event.target.value);
    };
    const handleRecipientemail = (event) => {
        setrecipientemail(event.target.value);
    };
    const handleGiftreason = (event) => {
        setgiftreason(event.target.value);
    };
    const handleHintmessage = (event) => {
        sethintmessage(event.target.value);
    };
    const handleGiftdeadline = (event) => {
        setgiftdeadline(event.target.value);
    };

    const handledrophintSubmit = async (e) => {
        e.preventDefault();
        setLoaded(true);

        //Validation

        //Name
        if (getyourname === "") {
            errors["yourname"] = "Please enter your name";
            formIsValid = false;
        }
        if (getrecipientname === "") {
            errors["yourrpname"] = "Please enter your recipient name";
            formIsValid = false;
        }

        //Email
        const regex =
            /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (regex.test(getyouremail) === false) {
            errors["youremail"] = "Please enter valid email";
            formIsValid = false;
        }
        if (regex.test(getrecipientemail) === false) {
            errors["recipientemail"] = "Please enter valid email";
            formIsValid = false;
        }

        //Reason
        if (getgiftreason === "") {
            errors["yourreason"] = "Please enter your reason";
            formIsValid = false;
        }

        //Message
        if (gethintmessage === "") {
            errors["yourmsg"] = "Please enter your message";
            formIsValid = false;
        }

        //Deadline
        if (getgiftdeadline === "") {
            errors["yourdeadline"] = "Please enter your deadline";
            formIsValid = false;
        }

        if (
            window.initData.data[0].google_site_key &&
            window.initData.data[0].google_secret_key
        ) {
            if (recaptchaToken === "") {
                errors["yourrecaptcha"] =
                    "The recaptcha token field is required.";
                formIsValid = false;
            }
        }

        if (formIsValid == false) {
            seterror(errors);
            setLoaded(false);
            return;
        }

        try {
            const formData = {
                name: getyourname,
                email: getyouremail,
                phone_no: '',
                hint_Recipient_name: getrecipientname,
                hint_Recipient_email: getrecipientemail,
                reason_of_gift: getgiftreason,
                hint_message: gethintmessage,
                deadline: getgiftdeadline,
                settingId: props.productDetailsData.settingId,
                isLabSetting: props.productDetailsData.isLabSetting,
            };
            
            const result = await emailService.ringDropHint(formData, recaptchaToken);
            
            setOpenSecond(false);
            toast(result.message || "Email Send Successfully");
            setLoaded(false);
            setyourname("");
            setyouremail("");
            setrecipientname("");
            setrecipientemail("");
            setgiftreason("");
            sethintmessage("");
            setgiftdeadline("");
            seterror("");
        } catch (error) {
            console.error('Drop hint error:', error);
            toast(error.message || "Failed to send email");
            setLoaded(false);
            seterror({ general: error.message || "Failed to send email" });
        }
    };

    //REQUEST MORE INFORMATION SUBMIT BUTTON

    const [getreqname, setreqname] = useState("");
    const [getreqemail, setreqemail] = useState("");
    const [getreqphone, setreqphone] = useState("");
    const [getreqmsg, setreqmsg] = useState("");
    const [getreqcp, setreqcp] = useState("");

    const [getreqerror, setreqerror] = useState([""]);

    const handleReqname = (event) => {
        setreqname(event.target.value);
    };
    const handleReqemail = (event) => {
        setreqemail(event.target.value);
    };
    const handleReqphone = (event) => {
        setreqphone(event.target.value);
    };
    const handleReqmsg = (event) => {
        setreqmsg(event.target.value);
    };
    const handleReqcp = (event) => {
        setreqcp(event.target.value);
    };

    const handlereginfoSubmit = async (e) => {
        e.preventDefault();
        setLoaded(true);

        //Validation

        //Name
        if (getreqname === "") {
            errors["yourname"] = "Please enter your name";
            formIsValid = false;
        }

        //Email
        const regex =
            /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (regex.test(getreqemail) === false) {
            errors["reqemail"] = "Please enter valid email";
            formIsValid = false;
        }

        //Phone no.
        var pattern = new RegExp(/^[0-9\b]+$/);
        if (!pattern.test(getreqphone)) {
            errors["yourphone"] = "Please enter only number";
            formIsValid = false;
        } else if (getreqphone.length != 10) {
            errors["yourphone"] = "Please enter valid phone number.";
            formIsValid = false;
        }

        //Message
        if (getreqmsg === "") {
            errors["yourmsg"] = "Please enter your message";
            formIsValid = false;
        }

        //Contact Preference
        if (getreqcp === "") {
            errors["yourcp"] = "Please select contact preference";
            formIsValid = false;
        }

        if (
            window.initData.data[0].google_site_key &&
            window.initData.data[0].google_secret_key
        ) {
            if (recaptchaReqToken === "") {
                errors["yourreqrecaptcha"] =
                    "The recaptcha token field is required.";
                formIsValid = false;
            }
        }

        if (formIsValid == false) {
            setreqerror(errors);
            setLoaded(false);
            return;
        }

        try {
            const formData = {
                name: getreqname,
                email: getreqemail,
                phone_no: getreqphone,
                message: getreqmsg,
                contact_preference: getreqcp,
                settingId: props.productDetailsData.settingId,
                isLabSetting: props.productDetailsData.isLabSetting,
            };
            
            const result = await emailService.ringRequestInfo(formData, recaptchaReqToken);
            
            setOpenThird(false);
            toast(result.message || "Email Send Successfully");
            setLoaded(false);
            setreqname("");
            setreqemail("");
            setreqphone("");
            setreqmsg("");
            setreqcp("");
            setreqerror("");
        } catch (error) {
            console.error('Request info error:', error);
            toast(error.message || "Failed to send email");
            setLoaded(false);
            setreqerror({ general: error.message || "Failed to send email" });
        }
    };

    //EMAIL A FRIENDS SUBMIT BUTTON
    const [getname, setname] = useState("");
    const [getemail, setemail] = useState("");
    const [getfrndname, setfrndname] = useState("");
    const [getfrndemail, setfrndemail] = useState("");
    const [getfrndmessage, setfrndmessage] = useState("");

    const [getfrnderror, setfrnderror] = useState([""]);

    const handleName = (event) => {
        setname(event.target.value);
    };
    const handleEmail = (event) => {
        setemail(event.target.value);
    };
    const handleFrndname = (event) => {
        setfrndname(event.target.value);
    };
    const handleFrndemail = (event) => {
        setfrndemail(event.target.value);
    };
    const handleFrndmessage = (event) => {
        setfrndmessage(event.target.value);
    };

    const handleemailfrndSubmit = async (e) => {
        e.preventDefault();
        setLoaded(true);

        //Validation

        //Name
        if (getname === "") {
            errors["yourname"] = "Please enter your name";
            formIsValid = false;
        }

        if (getfrndname === "") {
            errors["yourfrndname"] = "Please enter your friend name";
            formIsValid = false;
        }

        //Email
        const regex =
            /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (regex.test(getemail) === false) {
            errors["email"] = "Please enter valid email";
            formIsValid = false;
        }
        if (regex.test(getfrndemail) === false) {
            errors["frndemail"] = "Please enter valid email";
            formIsValid = false;
        }

        //Message
        if (getfrndmessage === "") {
            errors["yourmsg"] = "Please enter your message";
            formIsValid = false;
        }

        if (
            window.initData.data[0].google_site_key &&
            window.initData.data[0].google_secret_key
        ) {
            if (recaptchaEmailFrndToken === "") {
                errors["yourfrndrecaptcha"] =
                    "The recaptcha token field is required.";
                formIsValid = false;
            }
        }

        if (formIsValid == false) {
            setfrnderror(errors);
            setLoaded(false);
            return;
        }

        try {
            const formData = {
                name: getname,
                email: getemail,
                phone_no: '',
                frnd_name: getfrndname,
                frnd_email: getfrndemail,
                frnd_message: getfrndmessage,
                settingId: props.productDetailsData.settingId,
                isLabSetting: props.productDetailsData.isLabSetting,
            };
            
            const result = await emailService.ringEmailFriend(formData, recaptchaEmailFrndToken);
            
            setOpenFour(false);
            toast(result.message || "Email Send Successfully");
            setLoaded(false);
            setname("");
            setemail("");
            setfrndname("");
            setfrndemail("");
            setfrndmessage("");
            setfrnderror("");
        } catch (error) {
            console.error('Email friend error:', error);
            toast(error.message || "Failed to send email");
            setLoaded(false);
            setfrnderror({ general: error.message || "Failed to send email" });
        }
    };

    //SCHEDULE VIWING SUBMIT BUTTON

    const [getschdname, setschdname] = useState("");
    const [getschdemail, setschdemail] = useState("");
    const [getschdphone, setschdphone] = useState("");
    const [getschdmsg, setschdmsg] = useState("");
    const [getschddate, setschddate] = useState("");
    const [getschdtime, setschdtime] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showTime, setShowtime] = useState(false);
    const [getschderror, setschderror] = useState([""]);

    const handleSchdname = (event) => {
        setschdname(event.target.value);
    };
    const handleSchdemail = (event) => {
        setschdemail(event.target.value);
    };
    const handleSchdphone = (event) => {
        setschdphone(event.target.value);
    };
    const handleSchdmsg = (event) => {
        setschdmsg(event.target.value);
    };
    const handleSchddate = (event) => {
        // setschddate(event.target.value);

        const selectedDate = event.target.value;
        // Parse the selected date to a JavaScript Date object
        const selectedDateObj = new Date(selectedDate);

        const selectedDay = selectedDateObj.toLocaleDateString("en-US", {
            weekday: "long",
        });

        if (missingDays.includes(selectedDay)) {
            setErrorMessage("Slots not available on selected date");
            setShowtime(false);
            setschddate("");
        } else {
            setErrorMessage("");
            setShowtime(true);
            setschddate(selectedDate);
        }
    };
    const handleSchdtime = (event) => {
        setschdtime(event.target.value);
    };

    const handleschdSubmit = async (e) => {
        e.preventDefault();
        setLoaded(true);

        //Validation

        //Name
        if (getschdname === "") {
            errors["yourname"] = "Please enter your name";
            formIsValid = false;
        }

        //Email
        const regex =
            /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (regex.test(getschdemail) === false) {
            errors["schdemail"] = "Please enter valid email";
            formIsValid = false;
        }

        //Phone no.
        var pattern = new RegExp(/^[0-9\b]+$/);
        if (!pattern.test(getschdphone)) {
            errors["yourphone"] = "Please enter only number";
            formIsValid = false;
        } else if (getschdphone.length != 10) {
            errors["yourphone"] = "Please enter valid phone number.";
            formIsValid = false;
        }

        //Message
        if (getschdmsg === "") {
            errors["yourmsg"] = "Please enter your message";
            formIsValid = false;
        }

        //Location
        if (location === "") {
            errors["yourlocation"] = "Please select your location";
            formIsValid = false;
        }

        //Availibilty Date
        if (getschddate === "") {
            errors["yourdate"] = "Please select your availibility date";
            formIsValid = false;
        }

        if (
            window.initData.data[0].google_site_key &&
            window.initData.data[0].google_secret_key
        ) {
            if (recaptchaSchlToken === "") {
                errors["yourscrecaptcha"] =
                    "The recaptcha token field is required.";
                formIsValid = false;
            }
        }

        if (formIsValid == false) {
            setschderror(errors);
            setLoaded(false);
            return;
        }

        try {
            const formData = {
                name: getschdname,
                email: getschdemail,
                phone_no: getschdphone,
                schl_message: getschdmsg,
                location: location,
                availability_date: getschddate,
                appnt_time: getschdtime,
                settingId: props.productDetailsData.settingId,
                isLabSetting: props.productDetailsData.isLabSetting,
            };
            
            const result = await emailService.ringScheduleViewing(formData, recaptchaSchlToken);
            
            setOpenFive(false);
            toast(result.message || "Email Send Successfully");
            setLoaded(false);
            setschdname("");
            setschdemail("");
            setschdphone("");
            setschdmsg("");
            setschddate("");
            setschdtime("");
            setLocation("");
            setschderror("");
        } catch (error) {
            console.error('Schedule viewing error:', error);
            toast(error.message || "Failed to send email");
            setLoaded(false);
            setschderror({ general: error.message || "Failed to send email" });
        }
    };

    const getNavigationData = async () => {
        try {
            const navigationapirb =
                window.initData.data[0].navigationapirb ||
                `${jcBase()}/GetRBNavigation?`;
            var url =
                navigationapirb +
                `DealerID=` +
                window.initData.data[0].dealerid;

            const res = await fetch(url);
            const acrualRes = await res.json();
            
            var navarray = [];
            if (
                acrualRes[0].navMinedSetting &&
                acrualRes[0].navMinedSetting === "Mined Setting"
            ) {
                navarray.push("Natural");
            }

            if (
                acrualRes[0].navLabSetting &&
                acrualRes[0].navLabSetting === "Lab Setting"
            ) {
                navarray.push("Lab Grown");
            }
            setnavmenu(navarray);
        } catch (error) {
            console.error('Error fetching navigation data:', error);
        }
    };

    const handleNavigation = (e) => {
        setSelectedOption(e.target.value);
        if (e.target.value === "Natural") {
            setNavUrl(`${RB_BASE}/diamondtools`);
        } else if (e.target.value === "Lab Grown") {
            setNavUrl(`${RB_BASE}/navlabgrown`);
        }
    };

    const retailerInfo = props.productDetailsData?.retailerInfo || {};
    const addressList = retailerInfo.addressList ? retailerInfo.addressList : [];
    const timingList = retailerInfo.timingList ? retailerInfo.timingList : [];

    // Extract the day names, start times, and end times
    const days = [
        {
            name: "Sunday",
            start:
                timingList && timingList[0] ? timingList[0].sundayStart : "NA",
            end: timingList && timingList[0] ? timingList[0].sundayEnd : "NA",
        },
        {
            name: "Monday",
            start:
                timingList && timingList[0] ? timingList[0].mondayStart : "NA",
            end: timingList && timingList[0] ? timingList[0].mondayEnd : "NA",
        },
        {
            name: "Tuesday",
            start:
                timingList && timingList[0] ? timingList[0].tuesdayStart : "NA",
            end: timingList && timingList[0] ? timingList[0].tuesdayEnd : "NA",
        },
        {
            name: "Wednesday",
            start:
                timingList && timingList[0]
                    ? timingList[0].wednesdayStart
                    : "NA",
            end:
                timingList && timingList[0] ? timingList[0].wednesdayEnd : "NA",
        },
        {
            name: "Thursday",
            start:
                timingList && timingList[0]
                    ? timingList[0].thursdayStart
                    : "NA",
            end: timingList && timingList[0] ? timingList[0].thursdayEnd : "NA",
        },
        {
            name: "Friday",
            start:
                timingList && timingList[0] ? timingList[0].fridayStart : "NA",
            end: timingList && timingList[0] ? timingList[0].fridayEnd : "NA",
        },
        {
            name: "Saturday",
            start:
                timingList && timingList[0]
                    ? timingList[0].saturdayStart
                    : "NA",
            end: timingList && timingList[0] ? timingList[0].saturdayEnd : "NA",
        },
    ];

    // Filter days with available slots
    const daysWithSlots = days.filter((day) => day.start);

    const [missingDays, setMissingDays] = useState([]);

    useEffect(() => {
        const foundDays = daysWithSlots.map((day) => day.name);
        const allDays = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        const missing = allDays.filter((day) => !foundDays.includes(day));
        setMissingDays(missing);
    }, []);

    // Filter data when product details change (matching version 2's fetchProductDetails pattern)
    useEffect(() => {
        // Use the helper function to recalculate all filtered options
        recalculateFilteredOptions();
    }, [recalculateFilteredOptions]);

    useEffect(() => {
        let isMounted = true;
        let removePopStateListener = null;

        const initializeData = async () => {
            try {
                await getNavigationData();

                // Add safety check for undefined cookies
                if (isMounted && getbrowsercookies.shopify_ringbackvalue && 
                    getbrowsercookies.shopify_ringbackvalue[0] && 
                    getbrowsercookies.shopify_ringbackvalue[0].tab === "mined") {
                    setNavUrl(`${RB_BASE}/diamondtools`);
                } else if (
                    isMounted && getbrowsercookies.shopify_ringbackvalue && 
                    getbrowsercookies.shopify_ringbackvalue[0] &&
                    getbrowsercookies.shopify_ringbackvalue[0].tab === "labgrown"
                ) {
                    setNavUrl(`${RB_BASE}/navlabgrown`);
                }
                
                // Check localStorage for selectedDiamond (version 2 pattern)
                let localStorageDiamond = null;
                try {
                    localStorageDiamond = JSON.parse(localStorage.getItem('selectedDiamond'));
                } catch (e) {
                    // Fallback to cookies
                }
                
                if (
                    isMounted && getdiamondcookies._shopify_diamondsetting &&
                    getdiamondcookies._shopify_diamondsetting[0] &&
                    getdiamondcookies._shopify_diamondsetting[0].diamondId
                ) {
                    setDiamondCookie(true);
                    const isLab = getdiamondcookies._shopify_diamondsetting[0].isLabCreated;
                    if (isLab === true || isLab === "true") {
                        setNavUrl(`${RB_BASE}/navlabgrown`);
                        setSelectedOption("Lab Grown");
                    } else {
                        setNavUrl(`${RB_BASE}/diamondtools`);
                        setSelectedOption("Natural");
                    }
                } else if (localStorageDiamond && localStorageDiamond.diamondId) {
                    setDiamondCookie(true);
                    const isLab = localStorageDiamond.isLabCreated;
                    if (isLab === true || isLab === "true") {
                        setNavUrl(`${RB_BASE}/navlabgrown`);
                        setSelectedOption("Lab Grown");
                    } else {
                        setNavUrl(`${RB_BASE}/diamondtools`);
                        setSelectedOption("Natural");
                    }
                }
                if (
                    isMounted && cookies._shopify_ringsetting &&
                    cookies._shopify_ringsetting[0] &&
                    cookies._shopify_ringsetting[0].setting_id
                ) {
                    setsettingcookie(true);
                }
                if (
                    isMounted && getdiamondcookies._shopify_diamondsetting &&
                    getdiamondcookies._shopify_diamondsetting[0] &&
                    getdiamondcookies._shopify_diamondsetting[0].centerstonemincarat
                ) {
                    setcaratmin(
                        getdiamondcookies._shopify_diamondsetting[0].centerstonemincarat
                    );
                }
                if (
                    isMounted && getdiamondcookies._shopify_diamondsetting &&
                    getdiamondcookies._shopify_diamondsetting[0] &&
                    getdiamondcookies._shopify_diamondsetting[0].centerstonemaxcarat
                ) {
                    setcaratmax(
                        getdiamondcookies._shopify_diamondsetting[0].centerstonemaxcarat
                    );
                }

                // if (isMounted && props.selectedCenterStone === "") {
                //     toast(
                //         "This match is not available for selected metal type and centerstone",
                //         {
                //             position: "top-center",
                //             autoClose: 2000,
                //             hideProgressBar: false,
                //             closeOnClick: true,
                //             pauseOnHover: true,
                //             draggable: true,
                //             progress: undefined,
                //         }
                //     );
                // }
                if (isMounted && props.selectedCenterStone) {
                    setstone(props.selectedCenterStone);
                    // Removed initial carat range check to match version 2 behavior
                    // Error message now only shows when user actively changes center stone size
                }

                if (isMounted && props.selectedSideStone) {
                    setSideStone(props.selectedSideStone);
                }

                if (isMounted) {
                    // Reload only on a real back/forward that leaves this route.
                    // Fragment navigations (an `href="#"` link elsewhere in the tool)
                    // also fire popstate, and reloading on those wipes the builder state.
                    const routeAtMount =
                        window.location.pathname + window.location.search;
                    const handlePopState = () => {
                        const currentRoute =
                            window.location.pathname + window.location.search;
                        if (currentRoute !== routeAtMount) {
                            window.location.reload();
                        }
                    };

                    window.addEventListener("popstate", handlePopState);
                    removePopStateListener = () =>
                        window.removeEventListener("popstate", handlePopState);

                    const handleMessage = function (event) {
                        if (event.data === "closeIframe") {
                            setLoadedtry(false);
                            setTryon("false");
                        }
                    };

                    window.addEventListener("message", handleMessage);
                }

            } catch (error) {
                console.error("Error in initializeData:", error);
            }
        };

        initializeData();

        // Cleanup function
        return () => {
            isMounted = false;
            // The popstate handler is on window, so it outlives this component
            // unless we take it off explicitly.
            if (removePopStateListener) {
                removePopStateListener();
            }
            // Note: handleMessage is defined inside the useEffect, so we don't need to remove it here
            // The event listener will be automatically cleaned up when the component unmounts
        };
    }, []);
    return (
        <>
            {isVariationLoading && <DiamondLoader />}
            <div className="ring-descreption">
                {loadedtry && (
                    <LoadingOverlay className="_loading_overlay_wrapper">
                        <Loader fullPage loading={loadedtry} />{" "}
                    </LoadingOverlay>
                )}
                <div className="product-info__title">
                    <h2>{props.productDetailsData.settingName}</h2>
                    <h4 className="ring-spacifacation">
                        <a href="#" onClick={onOpenModal}>
                            <span>
                                <i className="far fa-edit"></i>
                            </span>
                            Ring Specification
                        </a>
                    </h4>
                    <Modal
                        open={open}
                        onClose={onCloseModal}
                        center
                        classNames={{
                            overlay: "popup_Overlay",
                            modal: "popup_product gf-spec-popup",
                        }}
                    >
                        <div className="popup_content">
                            <div className="diamond-information">
                                <div className="spacification-info">
                                    <h2>Setting Details</h2>
                                </div>
                                <ul>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Setting Number</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>
                                                {
                                                    props.productDetailsData
                                                        .styleNumber
                                                }
                                            </p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Price</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>
                                                {formatPrice(props.productDetailsData)}
                                            </p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Metal Type</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>
                                                {
                                                    props.productDetailsData
                                                        .metalType
                                                }
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                                <div className="spacification-info">
                                    <h2>Can Be Set With</h2>
                                </div>
                                <ul>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>
                                                {
                                                    props.productDetailsData
                                                        .centerStoneFit
                                                }
                                            </p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>
                                                {
                                                    props.productDetailsData
                                                        .centerStoneMinCarat
                                                }
                                                -
                                                {
                                                    props.productDetailsData
                                                        .centerStoneMaxCarat
                                                }
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Modal>
                </div>
                <div className="product-info__descreption">
                    {props.productDetailsData.description && /<[^>]+>/.test(props.productDetailsData.description) ? (
                        <div dangerouslySetInnerHTML={{ __html: props.productDetailsData.description }} />
                    ) : (
                        <p>{props.productDetailsData.description}</p>
                    )}
                </div>
                <div className="diaomnd-info">
                    {uniqueNames && uniqueNames.length > 0 && (
                        <div className="metaltype product-dropdown">
                            <span>Metal Type</span>
                            <select
                                className="metaldropdown"
                                defaultValue={currentSelectedMetaltype[0]}
                                name="metal_type"
                                id="metal_type"
                                onChange={handlemetalType}
                            >
                                {uniqueNames.map((item) => (
                                    <option
                                        key={item}
                                        data-id={item.gfInventoryId}
                                        value={item
                                            .replace(/\s+/g, "-")
                                            .toLowerCase()}
                                    >
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {uniqueDiamondShapes && uniqueDiamondShapes.length > 0 && (
                        <div className="stonesize product-dropdown">
                            <span>Select Diamond Shape</span>
                            <select
                                className="stonesizedropdown"
                                value={selectedDiamondShape}
                                name="diamond_shape"
                                id="diamond_shape"
                                onChange={(e) => handleDiamondShape(e.target.value)}
                            >
                                {uniqueDiamondShapes.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {uniqueSideStoneQualities && uniqueSideStoneQualities.length > 0 && (
                        <div className="stonesize product-dropdown">
                            <span className={`${getSideStone}`}>
                                {" "}
                                Side Stone Quality{" "}
                            </span>
                            <select
                                className="stonesizedropdown"
                                value={selectedSideStoneQuality}
                                name="stone_Size"
                                id="side_stone"
                                onChange={handleSideStone}
                            >
                                {uniqueSideStoneQualities.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {filteredCenterStoneSizes && filteredCenterStoneSizes.length > 0 && (
                        <div className="stonesize product-dropdown">
                            <span className={`${getstone}`}>
                                Center Stone Size{" "}
                            </span>
                            <select
                                className="stonesizedropdown"
                                value={getstone}
                                name="stone_Size"
                                id="stone_Size"
                                onChange={handleCorner}
                            >
                                {filteredCenterStoneSizes.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {props.productDetailsData.ringSize && props.productDetailsData.ringSize.filter(item => item !== null && item !== undefined && item !== "").length > 0 && (
                        <div className="ringsize product-dropdown">
                            <span>Ring Size</span>
                            <select
                                className="ringdropdown"
                                //defaultValue={props.productDetailsData.ringSize[0]}
                                name="ring_size"
                                id="ring_size"
                                onChange={handleRingSize}
                            >
                                <option key={0} value={0}>
                                    {"Select Ring Size"}
                                </option>
                                {props.productDetailsData.ringSize.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {(() => {
                        const dn = props.diamondNavigation || {};
                        const diamondNavMenu = [];
                        if (dn.navStandard) diamondNavMenu.push("Natural");
                        if (dn.navLabGrown) diamondNavMenu.push("Lab Grown");

                        if (diamondNavMenu.length === 0 || getDiamondCookie) return null;

                        return (
                            <div className="ringsize product-dropdown">
                                <span
                                    className={`${getbrowsercookies.shopify_ringbackvalue && getbrowsercookies.shopify_ringbackvalue[0] ? getbrowsercookies.shopify_ringbackvalue[0].tab : 'mined'}`}
                                >
                                    Center Diamond Type{" "}
                                </span>
                                <select
                                    className="centerstonedropdown"
                                    name="centerstone_size"
                                    value={
                                        selectedOption === ""
                                            ? getbrowsercookies.shopify_ringbackvalue &&
                                              getbrowsercookies.shopify_ringbackvalue[0] &&
                                              getbrowsercookies.shopify_ringbackvalue[0].tab === "labgrown"
                                                ? "Lab Grown"
                                                : "Natural"
                                            : selectedOption
                                    }
                                    id="centerstone_size"
                                    onChange={handleNavigation}
                                >
                                    {diamondNavMenu.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    })()}
                </div>
                <p className="image-note">
                    NOTE: All metal color images may not be available.
                </p>

                {window.initData.data[0].announcement_text_rbdetail !== "" && window.initData.data[0].announcement_text_rbdetail !== null && (
                    <div className="gf-diamond-details-text">
                        <span>
                            {window.initData.data[0].announcement_text_rbdetail}
                        </span>
                    </div>
                )}
                <div className="product-controller">
                    <ul>
                        {(window.initData?.data?.[0]?.enable_hint === "1" || window.initData?.data?.[0]?.enable_hint === "true") && (
                            <li>
                                <a
                                    href="#"
                                    onClick={onOpenSecondModal}
                                >
                                    <span>
                                        <i className="fas fa-gift"></i>
                                    </span>
                                    Drop A Hint
                                </a>
                                <Modal
                                    open={openSecond}
                                    onClose={() => setOpenSecond(false)}
                                    center
                                    classNames={{
                                        overlay: "popup_Overlay",
                                        modal: "popup-form",
                                    }}
                                >
                                    <LoadingOverlay className="_loading_overlay_wrapper">
                                        <Loader fullPage loading={loaded} />
                                    </LoadingOverlay>

                                    <div className="Diamond-form">
                                        <div className="requested-form">
                                            <h2>Drop a hint</h2>
                                            <p>Because you deserve this.</p>
                                        </div>
                                        <form
                                            onSubmit={handledrophintSubmit}
                                            className="drop-hint-form"
                                        >
                                            <div className="form-field">
                                                <TextField
                                                    id="drophint_name"
                                                    label="Your Name"
                                                    focused
                                                    variant="outlined"
                                                    value={getyourname}
                                                    onChange={handleYourname}
                                                />
                                                {geterror.yourname && <p className="form-error">{geterror.yourname}</p>}
                                                <TextField
                                                    id="drophint_email"
                                                    type="email"
                                                    label="Your E-mail"
                                                    focused
                                                    variant="outlined"
                                                    value={getyouremail}
                                                    onChange={handleYouremail}
                                                />
                                                {geterror.youremail && <p className="form-error">{geterror.youremail}</p>}
                                                <TextField
                                                    id="drophint_rec_name"
                                                    label="Hint Recipient's Name"
                                                    variant="outlined"
                                                    focused
                                                    value={getrecipientname}
                                                    onChange={
                                                        handleRecipientname
                                                    }
                                                />
                                                {geterror.yourrpname && <p className="form-error">{geterror.yourrpname}</p>}
                                                <TextField
                                                    id="drophint_rec_email"
                                                    type="email"
                                                    focused
                                                    label="Hint Recipient's E-mail"
                                                    variant="outlined"
                                                    value={getrecipientemail}
                                                    onChange={
                                                        handleRecipientemail
                                                    }
                                                />
                                                {geterror.youremail && <p className="form-error">{geterror.youremail}</p>}
                                                <TextField
                                                    id="dgift_reason"
                                                    label="Reason For This Gift"
                                                    variant="outlined"
                                                    focused
                                                    value={getgiftreason}
                                                    onChange={handleGiftreason}
                                                />
                                                {geterror.yourreason && <p className="form-error">{geterror.yourreason}</p>}

                                                <TextField
                                                    id="drophint_message"
                                                    multiline
                                                    rows={3}
                                                    focused
                                                    label="Add A Personal Message Here.."
                                                    variant="outlined"
                                                    value={gethintmessage}
                                                    onChange={handleHintmessage}
                                                />

                                                {geterror.yourmsg && <p className="form-error">{geterror.yourmsg}</p>}

                                                <UsDateField
                                                    id="date"
                                                    label="Gift Deadline"
                                                    value={getgiftdeadline}
                                                    onChange={
                                                        handleGiftdeadline
                                                    }
                                                    minDate={currentDate}
                                                />
                                                {geterror.yourdeadline && <p className="form-error">{geterror.yourdeadline}</p>}

                                                <div className="prefrence-action">
                                                    <div className="prefrence-action action moveUp">
                                                        {window.initData.data[0]
                                                            .google_site_key &&
                                                            window.initData
                                                                .data[0]
                                                                .google_secret_key && (
                                                                <div className="gf-grecaptcha">
                                                                    <ReCAPTCHA
                                                                        sitekey={
                                                                            window
                                                                                .initData
                                                                                .data[0]
                                                                                .google_site_key
                                                                        }
                                                                        onChange={
                                                                            handleRecaptchaChange
                                                                        }
                                                                    />

                                                                    {geterror.yourrecaptcha && (
                                                                        <p className="form-error">
                                                                            {
                                                                                geterror.yourrecaptcha
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        <button
                                                            type="submit"
                                                            title="Submit"
                                                            className="btn preference-btn"
                                                        >
                                                            <span>
                                                                Drop Hint
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </Modal>
                            </li>
                        )}
                        {(window.initData?.data?.[0]?.enable_more_info === "1" || window.initData?.data?.[0]?.enable_more_info === "true") && (
                            <li>
                                <a
                                    href="#"
                                    onClick={onOpenThirdModal}
                                >
                                    <span>
                                        <i className="fas fa-info"></i>
                                    </span>
                                    Request More Info
                                </a>
                                <Modal
                                    open={openThird}
                                    onClose={() => setOpenThird(false)}
                                    center
                                    classNames={{
                                        overlay: "popup_Overlay",
                                        modal: "popup-form",
                                    }}
                                >
                                    <LoadingOverlay className="_loading_overlay_wrapper">
                                        <Loader fullPage loading={loaded} />
                                    </LoadingOverlay>
                                    <div className="Diamond-form--small">
                                        <div className="requested-form">
                                            <h2>Request more information</h2>
                                            <p>
                                                Our specialists will contact
                                                you.
                                            </p>
                                        </div>
                                        <form
                                            onSubmit={handlereginfoSubmit}
                                            className="request-form"
                                        >
                                            <div className="form-field">
                                                <TextField
                                                    id="request_name"
                                                    label="Your Name"
                                                    focused
                                                    variant="outlined"
                                                    value={getreqname}
                                                    onChange={handleReqname}
                                                />
                                                {getreqerror.yourname && <p className="form-error">{getreqerror.yourname}</p>}
                                                <TextField
                                                    id="request_email"
                                                    type="email"
                                                    label="Your E-mail"
                                                    focused
                                                    variant="outlined"
                                                    value={getreqemail}
                                                    onChange={handleReqemail}
                                                />
                                                {getreqerror.youremail && <p className="form-error">{getreqerror.youremail}</p>}
                                                <TextField
                                                    id="request_phone"
                                                    label="Your Phone Number"
                                                    focused
                                                    variant="outlined"
                                                    value={getreqphone}
                                                    onChange={handleReqphone}
                                                />
                                                {getreqerror.yourphone && <p className="form-error">{getreqerror.yourphone}</p>}
                                                <TextField
                                                    id="req_message"
                                                    multiline
                                                    rows={3}
                                                    label="Add A Personal Message Here.."
                                                    focused
                                                    variant="outlined"
                                                    value={getreqmsg}
                                                    onChange={handleReqmsg}
                                                />

                                                {getreqerror.yourmsg && <p className="form-error">{getreqerror.yourmsg}</p>}

                                                <div className="contact-prefrtence">
                                                    <span>
                                                        Contact Preference:
                                                    </span>
                                                    <div className="pref_container">
                                                        <FormControl>
                                                            <RadioGroup
                                                                aria-labelledby="demo-radio-buttons-group-label"
                                                                defaultValue="female"
                                                                name="radio-buttons-group"
                                                                value={getreqcp}
                                                                onChange={
                                                                    handleReqcp
                                                                }
                                                            >
                                                                <FormControlLabel
                                                                    value="By Email"
                                                                    name="contact_pref"
                                                                    control={
                                                                        <Radio />
                                                                    }
                                                                    label="By Email"
                                                                />
                                                                <FormControlLabel
                                                                    value="By Phone"
                                                                    name="contact_pref"
                                                                    control={
                                                                        <Radio />
                                                                    }
                                                                    label="By Phone"
                                                                />
                                                            </RadioGroup>
                                                        </FormControl>
                                                    </div>
                                                </div>
                                                {getreqerror.yourcp && <p className="form-error">{getreqerror.yourcp}</p>}
                                                <div className="prefrence-action">
                                                    <div className="prefrence-action action moveUp">
                                                        {window.initData.data[0]
                                                            .google_site_key &&
                                                            window.initData
                                                                .data[0]
                                                                .google_secret_key && (
                                                                <div className="gf-grecaptcha">
                                                                    <ReCAPTCHA
                                                                        sitekey={
                                                                            window
                                                                                .initData
                                                                                .data[0]
                                                                                .google_site_key
                                                                        }
                                                                        onChange={
                                                                            handleReqRecaptchaChange
                                                                        }
                                                                    />
                                                                    {getschderror.yourscrecaptcha && <p className="form-error">{getschderror.yourscrecaptcha}</p>}
                                                                </div>
                                                            )}
                                                        <button
                                                            type="submit"
                                                            title="Submit"
                                                            className="btn preference-btn"
                                                        >
                                                            <span>Request</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </Modal>
                            </li>
                        )}
                        {(window.initData?.data?.[0]?.enable_email_friend === "1" || window.initData?.data?.[0]?.enable_email_friend === "true") && (
                            <li>
                                <a
                                    href="#"
                                    onClick={onOpenFourthModal}
                                >
                                    <span>
                                        <i className="fas fa-envelope"></i>
                                    </span>
                                    E-Mail A Friend
                                </a>
                                <Modal
                                    open={openFour}
                                    onClose={() => setOpenFour(false)}
                                    center
                                    classNames={{
                                        overlay: "popup_Overlay",
                                        modal: "popup-form-extra-small",
                                    }}
                                >
                                    <LoadingOverlay className="_loading_overlay_wrapper">
                                        <Loader fullPage loading={loaded} />
                                    </LoadingOverlay>
                                    <div className="Diamond-form--xx-small">
                                        <div className="requested-form">
                                            <h2>E-mail a friend</h2>
                                        </div>
                                        <form
                                            onSubmit={handleemailfrndSubmit}
                                            className="email-form"
                                        >
                                            <div className="form-field">
                                                <TextField
                                                    id="your_name"
                                                    label="Your Name"
                                                    focused
                                                    variant="outlined"
                                                    value={getname}
                                                    onChange={handleName}
                                                />
                                                {getfrnderror.yourname && <p className="form-error">{getfrnderror.yourname}</p>}
                                                <TextField
                                                    id="your_email"
                                                    type="email"
                                                    label="Your E-mail"
                                                    focused
                                                    variant="outlined"
                                                    value={getemail}
                                                    onChange={handleEmail}
                                                />
                                                {getfrnderror.youremail && <p className="form-error">{getfrnderror.youremail}</p>}
                                                <TextField
                                                    id="fri_name"
                                                    label="Your Friend's Name"
                                                    focused
                                                    variant="outlined"
                                                    value={getfrndname}
                                                    onChange={handleFrndname}
                                                />
                                                {getfrnderror.yourfrndname && <p className="form-error">{getfrnderror.yourfrndname}</p>}
                                                <TextField
                                                    id="f_email"
                                                    type="email"
                                                    label="Your Friend's E-mail"
                                                    focused
                                                    variant="outlined"
                                                    value={getfrndemail}
                                                    onChange={handleFrndemail}
                                                />
                                                {getfrnderror.youremail && <p className="form-error">{getfrnderror.youremail}</p>}
                                                <TextField
                                                    id="email-fri_message"
                                                    multiline
                                                    focused
                                                    rows={3}
                                                    label="Add A Personal Message Here.."
                                                    variant="outlined"
                                                    value={getfrndmessage}
                                                    onChange={handleFrndmessage}
                                                />

                                                {getfrnderror.yourmsg && <p className="form-error">{getfrnderror.yourmsg}</p>}

                                                <div className="prefrence-action">
                                                    <div className="prefrence-action action moveUp">
                                                        {window.initData.data[0]
                                                            .google_site_key &&
                                                            window.initData
                                                                .data[0]
                                                                .google_secret_key && (
                                                                <div className="gf-grecaptcha">
                                                                    <ReCAPTCHA
                                                                        sitekey={
                                                                            window
                                                                                .initData
                                                                                .data[0]
                                                                                .google_site_key
                                                                        }
                                                                        onChange={
                                                                            handleEmailFrndRecaptchaChange
                                                                        }
                                                                    />
                                                                    {getfrnderror.yourfrndrecaptcha && <p className="form-error">{getfrnderror.yourfrndrecaptcha}</p>}
                                                                </div>
                                                            )}
                                                        <button
                                                            type="submit"
                                                            title="Submit"
                                                            className="btn preference-btn"
                                                        >
                                                            <span>
                                                                Send To Friend
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </Modal>
                            </li>
                        )}
                        {(window.initData?.data?.[0]?.enable_schedule_viewing === "1" || window.initData?.data?.[0]?.enable_schedule_viewing === "true") && (
                            <li>
                                <a
                                    href="#"
                                    onClick={onOpenFifthModal}
                                >
                                    <span>
                                        <i className="far fa-calendar-alt"></i>
                                    </span>
                                    Schedule Viewing
                                </a>
                                <Modal
                                    open={openFive}
                                    onClose={() => setOpenFive(false)}
                                    center
                                    classNames={{
                                        overlay: "popup_Overlay",
                                        modal: "popup-form",
                                    }}
                                >
                                    <LoadingOverlay className="_loading_overlay_wrapper">
                                        <Loader fullPage loading={loaded} />
                                    </LoadingOverlay>

                                    <div className="Diamond-form">
                                        <div className="requested-form">
                                            <h2>Schedule a viewing</h2>
                                            <p>
                                                See This Item And More In Our
                                                Store.
                                            </p>
                                        </div>
                                        <form
                                            onSubmit={handleschdSubmit}
                                            className="schedule-form"
                                        >
                                            <div className="form-field">
                                                <TextField
                                                    id="schedule_name"
                                                    label="Your Name"
                                                    focused
                                                    value={getschdname}
                                                    onChange={handleSchdname}
                                                />
                                                {getschderror.yourname && <p className="form-error">{getschderror.yourname}</p>}

                                                <TextField
                                                    id="schedule_email"
                                                    type="email"
                                                    label="Your E-mail Address"
                                                    focused
                                                    variant="outlined"
                                                    value={getschdemail}
                                                    onChange={handleSchdemail}
                                                />
                                                {getschderror.youremail && <p className="form-error">{getschderror.youremail}</p>}

                                                <TextField
                                                    id="schedule_num"
                                                    label="Your Phone Number"
                                                    focused
                                                    variant="outlined"
                                                    value={getschdphone}
                                                    onChange={handleSchdphone}
                                                />
                                                {getschderror.yourphone && <p className="form-error">{getschderror.yourphone}</p>}

                                                <TextField
                                                    id="drophint_message"
                                                    multiline
                                                    focused
                                                    rows={3}
                                                    label="Add A Personal Message Here.."
                                                    variant="outlined"
                                                    value={getschdmsg}
                                                    onChange={handleSchdmsg}
                                                />
                                                {getschderror.yourmsg && <p className="form-error">{getschderror.yourmsg}</p>}

                                                <Select
                                                    labelId="demo-simple-select-standard-label"
                                                    id="select_schedule"
                                                    value={location}
                                                    onChange={handleChange}
                                                    label="Location"
                                                    focused
                                                    variant="outlined"
                                                >
                                                    {addressList.map(
                                                        (
                                                            addressList,
                                                            index
                                                        ) => (
                                                            <MenuItem
                                                                key={index}
                                                                value={
                                                                    addressList.locationName
                                                                }
                                                            >
                                                                {
                                                                    addressList.locationName
                                                                }
                                                            </MenuItem>
                                                        )
                                                    )}
                                                </Select>
                                                {getschderror.yourlocation && <p className="form-error">{getschderror.yourlocation}</p>}

                                                <UsDateField
                                                    id="date"
                                                    label="When are you available?"
                                                    value={getschddate}
                                                    onChange={handleSchddate}
                                                    minDate={currentDate}
                                                />
                                                {getschderror.yourdate && <p className="form-error">{getschderror.yourdate}</p>}
                                                {errorMessage && <p className="form-error">{errorMessage}</p>}

                                                {showTime === true && (
                                                    <Select
                                                        labelId="demo-simple-select-standard-label"
                                                        id="select_time"
                                                        value={getschdtime}
                                                        onChange={
                                                            handleSchdtime
                                                        }
                                                        label="Time"
                                                        focused
                                                        variant="outlined"
                                                    >
                                                        {daysWithSlots.map(
                                                            (day, index) => (
                                                                <MenuItem
                                                                    key={index}
                                                                    value={`${day.name}: ${day.start} - ${day.end}`}
                                                                >
                                                                    {`${day.name}: ${day.start} - ${day.end}`}
                                                                </MenuItem>
                                                            )
                                                        )}
                                                    </Select>
                                                )}

                                                <div className="prefrence-action">
                                                    <div className="prefrence-action action moveUp">
                                                        {window.initData.data[0]
                                                            .google_site_key &&
                                                            window.initData
                                                                .data[0]
                                                                .google_secret_key && (
                                                                <div className="gf-grecaptcha">
                                                                    <ReCAPTCHA
                                                                        sitekey={
                                                                            window
                                                                                .initData
                                                                                .data[0]
                                                                                .google_site_key
                                                                        }
                                                                        onChange={
                                                                            handleSchlRecaptchaChange
                                                                        }
                                                                    />
                                                                    {getschderror.yourscrecaptcha && <p className="form-error">{getschderror.yourscrecaptcha}</p>}
                                                                </div>
                                                            )}
                                                        <button
                                                            type="submit"
                                                            title="Submit"
                                                            className="btn preference-btn"
                                                        >
                                                            <span>Request</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </Modal>
                            </li>
                        )}
                    </ul>
                    {notFitMessage && (
                        <span style={{ color: "red" }}>
                            {notFitMessage}
                        </span>
                    )}
                </div>
                <div className="diamond-tryon">
                    <span>
                        {formatPrice(props.productDetailsData)}
                    </span>
                    <div className="diamond-btn">
                        {getDiamondCookie === true && (
                            <button
                                type="submit"
                                title="Submit"
                                onClick={handleCompletering}
                                className="btn btn-diamond"
                            >
                                Complete Your Ring
                            </button>
                        )}

                        {getDiamondCookie === false && (
                            <button
                                type="submit"
                                title="Submit"
                                onClick={handleadddiamonds}
                                className="btn btn-diamond"
                            >
                                Add Your Diamond
                            </button>
                        )}

                        {(Number(window.initData?.data?.[0]?.display_tryon) === 1 ||
                            window.initData?.data?.[0]?.display_tryon === 'true') && (
                            <a
                                className="btn btn-tryon"
                                onClick={handlevirtual}
                                href="#"
                            >
                                Virtual Try On
                            </a>
                        )}
                    </div>
                </div>
                <div className="social-icons">
                    <ul className="social-share">
                        {(() => {
                            // Extract options from nested array structure: [[{...options...}]]
                            const jcOptionsData = props.jcOptions?.[0]?.[0];
                            
                            // Helper function to check if option is enabled (handles both boolean and string "1")
                            const isEnabled = (apiValue, fallbackValue) => {
                                if (apiValue !== undefined && apiValue !== null) {
                                    return apiValue === true || apiValue === "1";
                                }
                                return fallbackValue === "1";
                            };
                            
                            // Use jcOptions from API if available, otherwise fallback to window.initData
                            const showPinterest = isEnabled(jcOptionsData?.show_Pinterest_Share, window.initData?.data?.[0]?.show_Pinterest_Share);
                            const showTwitter = isEnabled(jcOptionsData?.show_Twitter_Share, window.initData?.data?.[0]?.show_Twitter_Share);
                            const showFacebookShare = isEnabled(jcOptionsData?.show_Facebook_Share, window.initData?.data?.[0]?.show_Facebook_Share);
                            const showFacebookLike = isEnabled(jcOptionsData?.show_Facebook_Like, window.initData?.data?.[0]?.show_Facebook_Like);
                            
                            return (
                                <>
                                    {showPinterest && (
                                        <li>
                                            <a
                                                target="_blank"
                                                href={`https://www.pinterest.com/pin/create/button/?url=${window.location.href}&media=${props.productDetailsData.mainImageURL}&description=${props.productDetailsData.description}`}
                                                className="red"
                                            >
                                                <i className="fab fa-pinterest-p"></i>
                                                <span>Save</span>
                                            </a>
                                        </li>
                                    )}
                                    {showTwitter && (
                                        <li>
                                            <a
                                                target="_blank"
                                                href={`https://twitter.com/share?ref_src=${window.location.href}`}
                                                className="sky-blue"
                                            >
                                                <i className="fab fa-twitter"></i>
                                                <span>Twitter</span>
                                            </a>
                                        </li>
                                    )}
                                    {showFacebookShare && (
                                        <li>
                                            <a
                                                target="_blank"
                                                href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                                                className="blue"
                                            >
                                                <i className="fab fa-facebook-f"></i>
                                                <span>share</span>
                                            </a>
                                        </li>
                                    )}
                                    {showFacebookLike && (
                                        <li>
                                            <a
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href={`https://www.facebook.com/plugins/like.php?href=${encodeURIComponent(window.location.href)}`}
                                                className="blue"
                                            >
                                                {/* WordPress: click-out link instead of the Facebook JS SDK (no connect.facebook.net). */}
                                                <i className="fab fa-thumbs-up"></i>
                                                <span>Like</span>
                                            </a>
                                        </li>
                                    )}
                                </>
                            );
                        })()}
                    </ul>
                </div>
            </div>

            {getTryon === "true" && (
                <>
                    <iframe
                        id="tryoniframe"
                        src={getTryonsrc}
                        allow="camera"
                        width={"100%"}
                        style={{
                            position: "fixed",
                            left: "0",
                            top: "0",
                            overflow: "hidden",
                        }}
                        height={"100%"}
                    ></iframe>
                    <style>
                        {`body{
                    overflow: hidden;
                }
                #tryoniframe{
                  z-index : 99;
                }
                `}
                    </style>
                </>
            )}
        </>
    );
};

export default ProductInformation;
