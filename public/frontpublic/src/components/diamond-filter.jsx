import PropTypes from 'prop-types';
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { utils } from '../Helpers';
import { debounce } from 'lodash';
import './frame-component2.css';
import MultiRangeSlider from './MultiRangeSlider';
import PopupAlert from './PopupAlert';
import FilterModal from './FilterModal';
import DiscreteSegmentSlider from './DiscreteSegmentSlider';
import FilterPills from './FilterPills';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

// Close Icon Component
const CloseIcon = ({ onClick, className = "icon--close" }) => (
    <svg 
        width="21" 
        height="21" 
        viewBox="0 0 21 21" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
        className={className}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
        <path d="M10.5 0.799988C4.9871 0.799988 0.5 5.28708 0.5 10.8C0.5 16.3129 4.9871 20.8 10.5 20.8C16.0129 20.8 20.5 16.3129 20.5 10.8C20.5 5.28708 16.0129 0.799988 10.5 0.799988ZM10.5 19.5097C5.69677 19.5097 1.79032 15.6032 1.79032 10.8C1.79032 5.99676 5.69677 2.09031 10.5 2.09031C15.3032 2.09031 19.2097 5.99676 19.2097 10.8C19.2097 15.6032 15.3032 19.5097 10.5 19.5097Z" fill="var(--border-color)"/>
        <path d="M14.1484 7.1516C13.8968 6.89999 13.4871 6.89999 13.2355 7.1516L10.5 9.88708L7.76129 7.14838C7.50968 6.89676 7.1 6.89676 6.84839 7.14838C6.59677 7.39999 6.59677 7.80967 6.84839 8.06128L9.5871 10.8L6.84839 13.5387C6.59677 13.7903 6.59677 14.2 6.84839 14.4516C6.97419 14.5774 7.13871 14.6419 7.30323 14.6419C7.46774 14.6419 7.63226 14.5774 7.75807 14.4516L10.5 11.7129L13.2387 14.4516C13.3645 14.5774 13.529 14.6419 13.6935 14.6419C13.8581 14.6419 14.0226 14.5774 14.1484 14.4516C14.4 14.2 14.4 13.7903 14.1484 13.5387L11.4129 10.8L14.1516 8.06128C14.4 7.80967 14.4 7.40321 14.1484 7.1516Z" fill="var(--border-color)"/>
    </svg>
);

const DiamondFilter = ({
    className = '',
    onItemsPerPageChange,
    advancedFilters,
    setAdvancedFilters,
    setSelectedFilters,
    selectedFilters,
    setIsGridView,
    saveFilters,
    confirmReset,
    resetFilters,
    isGridView,
    totalProducts,
    applyFilters,
    filterData,
    onSortOrderChange,
    sortOrder,
    searchSetting,
    itemsPerPage,
    applyAdvanceFilters,
    onCompareContainerClick,
    compareDiamondsId,
    selectedSettingShape,
    isLabGrown,
    setOrderDirection,
    orderDirection,
    configAppData,
    selectedCaratRange,
    setClaritySelected,
    isInHouseOrVirtualOrAll,
    setIsInHouseOrVirtualOrAll,
    showFilterDetails,
    urlShape,
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = useQuery();
    const shapeOfUrl = query.get('shape'); // Get 'shape' query param
    function useQuery() {
        return new URLSearchParams(useLocation().search);
    }

    const [activeDropdown, setActiveDropdown] = useState(null);
    const [activePopup, setActivePopup] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [priceRange, setPriceRange] = useState(
        selectedFilters.price.length === 0
            ? [filterData.priceRange[0].minPrice, filterData.priceRange[0].maxPrice]
            : [selectedFilters.price[0], selectedFilters.price[1]],
    );
    const [caratRange, setCaratRange] = useState(
        selectedFilters.carat.length === 0
            ? [filterData.caratRange[0].minCarat, filterData.caratRange[0].maxCarat]
            : [selectedFilters.carat[0], selectedFilters.carat[1]],
    );
    const [depthRange, setDepthRange] = useState(
        advancedFilters.depth.length === 0
            ? [filterData.depthRange[0].minDepth, filterData.depthRange[0].maxDepth]
            : [advancedFilters.depth[0], advancedFilters.depth[1]],
    );
    const [tableRange, setTableRange] = useState(
        advancedFilters.table.length === 0
            ? [filterData.tableRange[0].minTable, filterData.tableRange[0].maxTable]
            : [advancedFilters.table[0], advancedFilters.table[1]],
    );
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [sortBy, setSortBy] = useState('Clarity');
    const imageUrl = `${getImageBaseUrl()}`;
    const [popupContent, setPopupContent] = useState(null);
    const [availableFilter, setAvailableFilter] = useState(['shape', 'price', 'carat', 'cut', 'colour', 'clarity']);
    const [searchQuery, setSearchQuery] = useState(selectedFilters.search ? (selectedFilters.search != '' ? selectedFilters.search : '') : '');
    const [currencyToShow, setCurrencyToShow] = useState('$');
    
    // Temporary filter states that will be applied when Apply Filter button is clicked
    const [tempSelectedFilters, setTempSelectedFilters] = useState(selectedFilters);
    const [tempAdvancedFilters, setTempAdvancedFilters] = useState(advancedFilters);
    
    // MUI slider values for mobile filters
    const [muiPriceValue, setMuiPriceValue] = useState([0, 0]);
    const [muiCaratValue, setMuiCaratValue] = useState([0, 0]);
    const [muiDepthValue, setMuiDepthValue] = useState([0, 0]);
    const [muiTableValue, setMuiTableValue] = useState([0, 0]);
    
    // Discrete slider values for mobile filters
    const [muiCutValue, setMuiCutValue] = useState([0, 0]);
    const [muiClarityValue, setMuiClarityValue] = useState([0, 0]);
    const [muiColorValue, setMuiColorValue] = useState([0, 0]);
    const [muiFluorescenceValue, setMuiFluorescenceValue] = useState([0, 0]);
    const [muiSymmetryValue, setMuiSymmetryValue] = useState([0, 0]);
    const [muiPolishValue, setMuiPolishValue] = useState([0, 0]);
    const [muiIntensityValue, setMuiIntensityValue] = useState([0, 0]);
    
    // Local state for input fields (as strings to allow clearing)
    const [priceInputValues, setPriceInputValues] = useState({ min: '', max: '' });
    const [caratInputValues, setCaratInputValues] = useState({ min: '', max: '' });
    const [depthInputValues, setDepthInputValues] = useState({ min: '', max: '' });
    const [tableInputValues, setTableInputValues] = useState({ min: '', max: '' });
    
    // Request cancellation tracking for mobile auto-apply
    const abortControllerRef = useRef(null);
    const requestIdRef = useRef(0);
    
    // Track last applied filter values to avoid duplicate API calls
    const lastAppliedFiltersRef = useRef(null);
    const lastAppliedAdvancedFiltersRef = useRef(null);
    // Reset activeDropdown when switching between regular color and fancy color filters
    useEffect(() => {
        if (filterData.diamondColorRange && activeDropdown === 'colour') {
            setActiveDropdown(null);
        } else if (!filterData.diamondColorRange && activeDropdown === 'diamondColorRange') {
            setActiveDropdown(null);
        }
    }, [filterData.diamondColorRange, activeDropdown]);
    
    // Close any open dropdowns/modals that are no longer available when switching tabs
    useEffect(() => {
        // Only close main filters (those in availableFilter), not advanced filters
        const advancedFilterTypes = ['depth', 'table', 'fluorescence', 'symmetry', 'polish', 'certificates'];
        
        if (activeDropdown && !availableFilter.includes(activeDropdown) && !advancedFilterTypes.includes(activeDropdown)) {
            setActiveDropdown(null);
        }
        if (activeModal && !availableFilter.includes(activeModal) && !advancedFilterTypes.includes(activeModal)) {
            setActiveModal(null);
        }
    }, [availableFilter, activeDropdown, activeModal]);
    
    useEffect(() => {
        if (filterData.diamondColorRange) {
            setAvailableFilter(['shape', 'price', 'carat', 'diamondColorRange', 'intensity', 'clarity']);
        } else {
            setAvailableFilter(['shape', 'price', 'carat', 'cut', 'colour', 'clarity']);
        }
        if (configAppData.price_row_format == 'left') {
            if (filterData.currencyFrom == 'USD') {
                setCurrencyToShow(filterData.currencySymbol || '$');
            } else {
                setCurrencyToShow(filterData.currencyFrom + ' ' + (filterData.currencySymbol || '$'));
            }
        } else {
            if (filterData.currencyFrom == 'USD') {
                setCurrencyToShow(filterData.currencySymbol || '$');
            } else {
                setCurrencyToShow(filterData.currencyFrom + ' ' + (filterData.currencySymbol || '$'));
            }
        }
        setPriceRange(
            selectedFilters.price.length === 0
                ? [filterData.priceRange[0].minPrice, filterData.priceRange[0].maxPrice]
                : [selectedFilters.price[0], selectedFilters.price[1]],
        );
        setCaratRange(
            selectedFilters.carat.length === 0
                ? [filterData.caratRange[0].minCarat, filterData.caratRange[0].maxCarat]
                : [selectedFilters.carat[0], selectedFilters.carat[1]],
        );
        setDepthRange(
            advancedFilters.depth.length === 0
                ? [filterData.depthRange[0].minDepth, filterData.depthRange[0].maxDepth]
                : [advancedFilters.depth[0], advancedFilters.depth[1]],
        );
        setTableRange(
            advancedFilters.table.length === 0
                ? [filterData.tableRange[0].minTable, filterData.tableRange[0].maxTable]
                : [advancedFilters.table[0], advancedFilters.table[1]],
        );
    }, [selectedFilters, filterData, selectedCaratRange]);
    
    // Helper functions for diamondColorRange expanded slider
    const buildExpandedMarks = (optionsArray, labelKey) => {
        if (!optionsArray || optionsArray.length === 0) {
            return [];
        }

        const marks = [];
        optionsArray.forEach((option, index) => {
            marks.push({
                value: index * 2,
                label: labelKey ? option[labelKey] : option,
            });

            if (index < optionsArray.length - 1) {
                marks.push({
                    value: index * 2 + 1,
                    label: "",
                });
            }
        });

        return marks;
    };

    const normalizeExpandedRange = (range, maxValue) => {
        if (!Array.isArray(range) || range.length !== 2) {
            return [0, maxValue];
        }

        const [min, max] = range;
        const clampedMin = Math.max(0, Math.min(min, maxValue));
        const clampedMax = Math.max(0, Math.min(max, maxValue));

        if (clampedMin > clampedMax) {
            return [clampedMax, clampedMin];
        }

        return [clampedMin, clampedMax];
    };

    const getExpandedRangeFromFilterValues = (filterValues, optionsArray, valueSelector = (option) => option) => {
        if (!optionsArray || optionsArray.length === 0) {
            return [0, 0];
        }

        if (!filterValues || filterValues.length === 0) {
            const lastIndex = optionsArray.length - 1;
            return [0, lastIndex * 2];
        }

        const indices = filterValues
            .map((selectedValue) => {
                return optionsArray.findIndex((option) => {
                    const optionValue = valueSelector(option);
                    return String(optionValue) === String(selectedValue);
                });
            })
            .filter((idx) => idx !== -1);

        if (indices.length === 0) {
            const lastIndex = optionsArray.length - 1;
            return [0, lastIndex * 2];
        }

        const minIdx = Math.min(...indices);
        const maxIdx = Math.max(...indices);
        return [minIdx * 2, maxIdx * 2];
    };

    const mapExpandedRangeToFilterValues = (expandedRange, optionsArray, valueSelector = (option) => option) => {
        if (!optionsArray || optionsArray.length === 0 || !Array.isArray(expandedRange) || expandedRange.length !== 2) {
            return [];
        }

        const [min, max] = expandedRange;
        const actualMin = Math.floor(Math.max(0, min) / 2);
        const actualMax = Math.floor(Math.max(0, max) / 2);

        const clampedMin = Math.min(actualMin, optionsArray.length - 1);
        const clampedMax = Math.min(actualMax, optionsArray.length - 1);

        return optionsArray.slice(clampedMin, clampedMax + 1).map((option) => valueSelector(option));
    };
    
    // Build marks for diamondColorRange
    const diamondColorMarks = useMemo(
        () => buildExpandedMarks(filterData.diamondColorRange || [], "diamondColorName"),
        [filterData.diamondColorRange]
    );
    
    // Mobile slider data for DiscreteSegmentSlider - MUST be defined before useEffect that uses them
    const mobileCutSliderData = useMemo(() => {
        if (!filterData.cutRange || filterData.cutRange.length === 0) {
            return [];
        }
        return [...filterData.cutRange];
    }, [filterData.cutRange]);

    const mobileColorSliderData = useMemo(() => {
        if (!filterData.colorRange || filterData.colorRange.length === 0) {
            return [];
        }
        return [...filterData.colorRange];
    }, [filterData.colorRange]);

    const mobileClaritySliderData = useMemo(() => {
        if (!filterData.clarityRange || filterData.clarityRange.length === 0) {
            return [];
        }
        return [...filterData.clarityRange];
    }, [filterData.clarityRange]);

    const mobileFluorescenceSliderData = useMemo(() => {
        if (!filterData.fluorescenceRange || filterData.fluorescenceRange.length === 0) {
            return [];
        }
        return [...filterData.fluorescenceRange];
    }, [filterData.fluorescenceRange]);

    const mobileSymmetrySliderData = useMemo(() => {
        if (!filterData.symmetryRange || filterData.symmetryRange.length === 0) {
            return [];
        }
        return [...filterData.symmetryRange];
    }, [filterData.symmetryRange]);

    const mobilePolishSliderData = useMemo(() => {
        if (!filterData.polishRange || filterData.polishRange.length === 0) {
            return [];
        }
        return [...filterData.polishRange];
    }, [filterData.polishRange]);

    const mobileDiamondColorSliderData = useMemo(() => {
        if (!filterData.diamondColorRange || filterData.diamondColorRange.length === 0) {
            return [];
        }
        return [...filterData.diamondColorRange];
    }, [filterData.diamondColorRange]);

    const mobileIntensitySliderData = useMemo(() => {
        if (!filterData.intensity || filterData.intensity.length === 0) {
            return [];
        }
        return [...filterData.intensity];
    }, [filterData.intensity]);
    
    // Helper function to convert filter array to slider range indices - MUST be defined before useEffect that uses it
    const getSliderRangeFromFilterArrayGeneric = (filterArray, mobileSliderData, idKey) => {
        if (!filterArray || filterArray.length === 0 || !mobileSliderData || mobileSliderData.length === 0) {
            return [0, mobileSliderData.length - 1];
        }
        
        const indices = filterArray.map(selectedId => {
            return mobileSliderData.findIndex(item => String(item[idKey]) === String(selectedId));
        }).filter(idx => idx !== -1);
        
        if (indices.length === 0) {
            return [0, mobileSliderData.length - 1];
        }
        
        const minIdx = Math.min(...indices);
        const maxIdx = Math.max(...indices);
        
        return [minIdx, maxIdx];
    };
    
    // Helper function to convert slider range indices to filter array - MUST be defined before useEffect that uses it
    const getFilterArrayFromSliderRangeGeneric = (sliderRange, mobileSliderData, actualRange, idKey, nameKey) => {
        if (!mobileSliderData || mobileSliderData.length === 0 || !actualRange || actualRange.length === 0) {
            return [];
        }
        
        const [minIdx, maxIdx] = sliderRange;
        
        // Get the items from mobileSliderData for the selected range
        const selectedMobileItems = mobileSliderData.slice(minIdx, maxIdx + 1);
        
        // Extract IDs directly from the API data
        const selectedIds = selectedMobileItems.map(item => item[idKey]);
        
        // Filter actualRange to get only the valid IDs
        return actualRange
            .filter(item => selectedIds.includes(item[idKey]))
            .map(item => item[idKey]);
    };
    
    // Sync MUI slider values when modals open
    useEffect(() => {
        if (isMobile && activeModal === "price") {
            setMuiPriceValue(priceRange);
            setPriceInputValues({ min: priceRange[0].toString(), max: priceRange[1].toString() });
        } else if (isMobile && activeModal === "carat") {
            setMuiCaratValue(caratRange);
            setCaratInputValues({ min: caratRange[0].toString(), max: caratRange[1].toString() });
        } else if (isMobile && activeModal === "depth") {
            setMuiDepthValue(depthRange);
            setDepthInputValues({ min: depthRange[0].toString(), max: depthRange[1].toString() });
        } else if (isMobile && activeModal === "table") {
            setMuiTableValue(tableRange);
            setTableInputValues({ min: tableRange[0].toString(), max: tableRange[1].toString() });
        } else if (isMobile && activeModal === "cut" && filterData.cutRange && mobileCutSliderData.length > 0) {
            const range = getSliderRangeFromFilterArrayGeneric(
                tempSelectedFilters.cut,
                mobileCutSliderData,
                "cutId"
            );
            setMuiCutValue(range);
        } else if (isMobile && activeModal === "clarity" && filterData.clarityRange && mobileClaritySliderData.length > 0) {
            const range = getSliderRangeFromFilterArrayGeneric(
                tempSelectedFilters.clarity,
                mobileClaritySliderData,
                "clarityId"
            );
            setMuiClarityValue(range);
        } else if (isMobile && activeModal === "colour" && filterData.colorRange && mobileColorSliderData.length > 0) {
            const range = getSliderRangeFromFilterArrayGeneric(
                tempSelectedFilters.colour,
                mobileColorSliderData,
                "colorId"
            );
            setMuiColorValue(range);
        } else if (isMobile && activeModal === "diamondColorRange" && filterData.diamondColorRange && mobileDiamondColorSliderData.length > 0) {
            // For diamondColorRange, values are stored as color names in tempSelectedFilters.colour
            const indices = tempSelectedFilters.colour.map(selectedValue => {
                return mobileDiamondColorSliderData.findIndex(item => 
                    String(item.diamondColorName) === String(selectedValue)
                );
            }).filter(idx => idx !== -1);
            
            if (indices.length === 0) {
                setMuiColorValue([0, mobileDiamondColorSliderData.length - 1]);
            } else {
                const minIdx = Math.min(...indices);
                const maxIdx = Math.max(...indices);
                setMuiColorValue([minIdx, maxIdx]);
            }
        } else if (isMobile && activeModal === "intensity" && filterData.intensity && mobileIntensitySliderData.length > 0) {
            const range = getSliderRangeFromFilterArrayGeneric(
                tempSelectedFilters.intensity,
                mobileIntensitySliderData,
                "intensityName"
            );
            setMuiIntensityValue(range);
        } else if (isMobile && activeModal === "fluorescence" && filterData.fluorescenceRange && mobileFluorescenceSliderData.length > 0) {
            const range = getSliderRangeFromFilterArrayGeneric(
                tempAdvancedFilters.fluorescence,
                mobileFluorescenceSliderData,
                "fluorescenceId"
            );
            setMuiFluorescenceValue(range);
        } else if (isMobile && activeModal === "symmetry" && filterData.symmetryRange && mobileSymmetrySliderData.length > 0) {
            const range = getSliderRangeFromFilterArrayGeneric(
                tempAdvancedFilters.symmetry,
                mobileSymmetrySliderData,
                "symmetryId"
            );
            setMuiSymmetryValue(range);
        } else if (isMobile && activeModal === "polish" && filterData.polishRange && mobilePolishSliderData.length > 0) {
            const range = getSliderRangeFromFilterArrayGeneric(
                tempAdvancedFilters.polish,
                mobilePolishSliderData,
                "polishId"
            );
            setMuiPolishValue(range);
        }
    }, [activeModal, isMobile, priceRange, caratRange, depthRange, tableRange, tempSelectedFilters, tempAdvancedFilters, filterData, mobileCutSliderData, mobileClaritySliderData, mobileColorSliderData, mobileDiamondColorSliderData, mobileIntensitySliderData, mobileFluorescenceSliderData, mobileSymmetrySliderData, mobilePolishSliderData, diamondColorMarks]);
    
    // Sync input values when slider values change (from dragging)
    useEffect(() => {
        if (isMobile && activeModal === "price") {
            setPriceInputValues({ min: muiPriceValue[0].toString(), max: muiPriceValue[1].toString() });
        }
    }, [muiPriceValue, isMobile, activeModal]);

    useEffect(() => {
        if (isMobile && activeModal === "carat") {
            setCaratInputValues({ min: muiCaratValue[0].toString(), max: muiCaratValue[1].toString() });
        }
    }, [muiCaratValue, isMobile, activeModal]);

    useEffect(() => {
        if (isMobile && activeModal === "depth") {
            setDepthInputValues({ min: muiDepthValue[0].toString(), max: muiDepthValue[1].toString() });
        }
    }, [muiDepthValue, isMobile, activeModal]);

    useEffect(() => {
        if (isMobile && activeModal === "table") {
            setTableInputValues({ min: muiTableValue[0].toString(), max: muiTableValue[1].toString() });
        }
    }, [muiTableValue, isMobile, activeModal]);
    
    useEffect(() => {
        setActiveDropdown(shapeOfUrl !== '' && shapeOfUrl !== undefined && shapeOfUrl !== null ? 'shape' : '');
    }, []);
    
    // Mobile detection
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    
    // Sync temporary states with actual states when they change
    useEffect(() => {
        setTempSelectedFilters(selectedFilters);
        lastAppliedFiltersRef.current = JSON.stringify(selectedFilters);
    }, [selectedFilters]);
    
    useEffect(() => {
        setTempAdvancedFilters(advancedFilters);
        lastAppliedAdvancedFiltersRef.current = JSON.stringify(advancedFilters);
    }, [advancedFilters]);

    const onTableContainerClick = useCallback(() => {
        setIsGridView(false);
    }, [navigate]);
    const onGridContainerClick = useCallback(() => {
        setIsGridView(true);
    }, [navigate]);
    
    // Debounced auto-apply function for mobile filters
    const debouncedApplyFilters = useMemo(() => {
        return debounce((filters, requestId) => {
            // Cancel previous request if it exists
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            
            // Only apply if this is still the latest request
            if (requestId === requestIdRef.current) {
                // Store the filters that are being applied
                lastAppliedFiltersRef.current = JSON.stringify(filters);
                applyFilters(filters);
                setSelectedFilters(filters);
            }
        }, 100); // 100ms debounce delay
    }, [applyFilters, setSelectedFilters]);
    
    // Debounced auto-apply function for advanced filters
    const debouncedApplyAdvancedFilters = useMemo(() => {
        return debounce((filters, requestId) => {
            // Cancel previous request if it exists
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            
            // Only apply if this is still the latest request
            if (requestId === requestIdRef.current) {
                // Store the filters that are being applied
                lastAppliedAdvancedFiltersRef.current = JSON.stringify(filters);
                applyAdvanceFilters(filters);
                setAdvancedFilters(filters);
            }
        }, 100); // 100ms debounce delay
    }, [applyAdvanceFilters, setAdvancedFilters]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Cancel any pending requests
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            // Cancel debounced functions
            debouncedApplyFilters.cancel();
            debouncedApplyAdvancedFilters.cancel();
        };
    }, [debouncedApplyFilters, debouncedApplyAdvancedFilters]);
    
    const toggleDropdown = (dropdown) => {
        if (isMobile) {
            setActiveModal(activeModal === dropdown ? null : dropdown);
            return;
        }
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    const togglePopup = (popup) => {
        setActivePopup(activePopup === popup ? null : popup);
    };
    //console.log(activePopup)
    const handlePriceChange = ({ min, max }) => {
        setPriceRange([min, max]);
        // Filters will be applied only when Apply Filter button is clicked on desktop
        // On mobile, auto-apply with debouncing
        if (isMobile && activeModal === 'price') {
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyFilters({
                ...tempSelectedFilters,
                price: [min, max]
            }, currentRequestId);
        } else if (!isMobile) {
            applyFilters((prev) => ({
                ...prev,
                ['price']: [min, max],
            }));
        }
    };
    const handleCaratChange = ({ min, max }) => {
        setCaratRange([min, max]);
        // Filters will be applied only when Apply Filter button is clicked on desktop
        // On mobile, auto-apply with debouncing
        if (isMobile && activeModal === 'carat') {
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyFilters({
                ...tempSelectedFilters,
                carat: [min, max]
            }, currentRequestId);
        } else if (!isMobile) {
            applyFilters((prev) => ({
                ...prev,
                ['carat']: [min, max],
            }));
        }
    };
    const handleTableChange = ({ min, max }) => {
        setTableRange([min, max]);
        // Advanced filters will be applied only when Apply Filter button is clicked on desktop
        // On mobile, auto-apply with debouncing
        if (isMobile && activeModal === 'table') {
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyAdvancedFilters({
                ...tempAdvancedFilters,
                table: [min, max]
            }, currentRequestId);
        } else if (!isMobile) {
            applyAdvanceFilters((prev) => ({
                ...prev,
                ['table']: [min, max],
            }));
        }
    };
    const handleDepthChange = ({ min, max }) => {
        setDepthRange([min, max]);
        // Advanced filters will be applied only when Apply Filter button is clicked on desktop
        // On mobile, auto-apply with debouncing
        if (isMobile && activeModal === 'depth') {
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyAdvancedFilters({
                ...tempAdvancedFilters,
                depth: [min, max]
            }, currentRequestId);
        } else if (!isMobile) {
            applyAdvanceFilters((prev) => ({
                ...prev,
                ['depth']: [min, max],
            }));
        }
    };
    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        setActiveDropdown(null);
    };
    // memoize the callback with useCallback
    // we need it since it's a dependency in useMemo below
    const handleSetTimeRange = (value) => {
        applyFilters({ ...selectedFilters, price: [value.min, value.max] });
    };
    const handleSetCaratRange = (value) => {
        applyFilters({ ...selectedFilters, carat: [value.min, value.max] });
    };
    const handleSetTableRange = (value) => {
        applyAdvanceFilters({ ...advancedFilters, table: [value.min, value.max] });
    };
    const handleSetDepthRange = (value) => {
        applyAdvanceFilters({ ...advancedFilters, depth: [value.min, value.max] });
    };

    // popup - use this for setting the content
    const handleInfoClick = (filterType) => {
        const content = getPopupContent(filterType);
        setPopupContent(content);
    };
    const closePopup = () => {
        setPopupContent(null);
    };
    const handleFilterChange = (filterType, value) => {
        if (filterType === 'clarity') {
            setClaritySelected(true);
        }
        
        setTempSelectedFilters((prev) => {
            const currentValues = Array.isArray(prev[filterType]) ? prev[filterType] : [];
            const index = currentValues.findIndex((item) => String(item) === String(value));
            const nextValues = index !== -1
                ? [...currentValues.slice(0, index), ...currentValues.slice(index + 1)]
                : [...currentValues, value];
            const updatedFilters = {
                ...prev,
                [filterType]: nextValues,
            };
            
            // Auto-apply with debouncing for mobile filters
            if (isMobile && activeModal) {
                requestIdRef.current += 1;
                const currentRequestId = requestIdRef.current;
                debouncedApplyFilters(updatedFilters, currentRequestId);
            } else {
                // Desktop: apply immediately
                applyFilters(updatedFilters);
            }
            
            return updatedFilters;
        });
    };

    const handleAdvancedFilterChange = (filterType, value) => {
        setTempAdvancedFilters((prev) => {
            const currentValues = Array.isArray(prev[filterType]) ? prev[filterType] : [];
            const index = currentValues.findIndex((item) => String(item) === String(value));
            const nextValues = index !== -1
                ? [...currentValues.slice(0, index), ...currentValues.slice(index + 1)]
                : [...currentValues, value];
            const updatedFilters = {
                ...prev,
                [filterType]: nextValues,
            };
            
            // Auto-apply with debouncing for mobile filters
            if (isMobile && activeModal) {
                requestIdRef.current += 1;
                const currentRequestId = requestIdRef.current;
                debouncedApplyAdvancedFilters(updatedFilters, currentRequestId);
            } else {
                // Desktop: apply immediately
                setAdvancedFilters(updatedFilters);
            }
            
            return updatedFilters;
        });
    };

    const applyAdvancedFilters = () => {
        setShowAdvancedFilters(false);
        // Logic for advanced filters data query
    };

    const isFilterApplied = (filterType) => {
        if (filterType === 'price') {
            //return priceRange[0] > mockPriceData.minPrice || priceRange[1] < mockPriceData.maxPrice;
        }
        //console.log(selectedFilters[filterType].length)
        return selectedFilters[filterType] && selectedFilters[filterType].length > 0;
    };
    // POpup content of filters
    const getPopupContent = (filterType) => {
        console.log(filterType);
        // const contents = {
        //   intensity:'The main color, and if there is a secondary color, together define the color tone, however the strength of color is defined by the intensity level. The intensity level can be anywhere from a very soft shade to a very strong shade, and the stronger the shade the more valuable the diamond.',
        //   shape : '<p>A diamond’s shape is not the same as a diamond’s cut. The shape refers to the general outline of the stone, and not its light refractive qualities. Look for a shape that best suits the ring setting you have chosen, as well as the recipient’s preference and personality. Here are some of the more common shapes that <a href="'+window.location.origin+'">Our site</a> offers:</p><div class="popup-Diamond-Table"><ol class="list-unstyled"><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/f_round.svg" alt="round"></span><span>Round</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/f_asscher.svg" alt="asscher"></span><span>Asscher</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/f_marquise.svg" alt="marquise"></span><span>Marquise</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/f_oval.svg" alt="oval"></span><span>Oval</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/f_cushion.svg" alt="cushion"></span><span>Cushion</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/f_radiant.svg" alt="radiant"></span><span>Radiant</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/f_pear.svg" alt="pear"></span><span>Pear</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/f_emerald.svg" alt="emerald"></span><span>Emerald</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/f_heart.svg" alt="heart_tn"></span><span>Heart</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/f_princess.svg" alt="princess"></span><span>Princess</span></li></ol></div>',
        //   price: "This refer to different type of Price to filter and select the appropriate ring as per your requirements. Look for a best suit Price of your chosen ring.",
        //   colour: '<p>The color scale measures the degree of colorlessness in a diamond. D is the highest and most  colorless grade, but also the most expensive. To get the most value for your budget, look for an eye colorless stone. For most diamonds, this is in the F-H range.</p><img src="'+imageUrl+'/color.jpg" alt="Color">',
        //   carat: '<p>Carat is a unit of measurement to determine a diamond’s weight. Typically, a higher carat weight means a larger looking diamond, but that is not always the case. Look for the mm measurements of the diamond to determine its visible size.</p><img src="'+imageUrl+'/carat.jpg" alt="Carat">',
        //   cut: '<p>Not to be confused with shape, a diamond’s cut rating tells you how well its proportions interact with light. By evaluating the angles and proportions of the diamond, the cut grade is designed to tell you how sparkly and brilliant your stone is. Cut grading is usually not available for fancy shapes (any shape that is not round), because the mathematical formula that determines light return becomes less reliable when different length to width ratios are factored in.</p>',
        //   diamondColorRange: '<p>The color scale measures the degree of colorlessness in a diamond. D is the highest and most  colorless grade, but also the most expensive. To get the most value for your budget, look for an eye colorless stone. For most diamonds, this is in the F-H range.</p><img src="'+imageUrl+'/color.jpg" alt="Color">',
        //   clarity: "<p>A diamond’s clarity refers to the tiny traces of natural elements that are trapped inside the stone. 99% of diamonds contain inclusions or flaws. You do not need a flawless diamond - they are very rare and expensive - but you want to look for one that is perfect to the naked eye. Depending on the shape of the diamond, the sweet spot for clarity is usually between VVS2 to SI1.</p>",
        //   polish: "<p>Polish describes how smooth the surface of a diamond is. Aim for an Excellent or Very Good polish rating.</p>",
        //   depth: "<p>Depth percentage is the height of the diamond measured from the culet to the table, divided by the width of the diamond. The lower the depth %, the larger the diamond will appear (given the same weight), but if this number is too low then the brilliance of the diamond will be sacrificed. The depth percentage is one of the elements that determines the Cut grading.  </p>",
        //   table: "<p>Table percentage is the width of a diamond’s largest facet (the table) divided by its overall width. It tells you how big the “face” of a diamond is.</p>",
        //   fluorescence: "<p>Fluorescence tells you how a diamond responds to ultraviolet light - does it glow under a black light? Diamonds with no fluorescence are generally priced higher on the market, but it is rare for fluorescence to have any visual impact on the diamond; some fluorescence can even enhance the look of the stone.  '+shopname+' recommends searching for diamonds with none to medium fluorescence, and keeping open the option of strong fluorescence for additional value.</p>",
        //   symmetry: "<p>Symmetry describes how symmetrical the diamond is cut all the way around, which is a contributing factor to a diamond’s sparkle and brilliance. Aim for an Excellent or Very Good symmetry rating for round brilliant shapes, and Excellent to Good for fancy shapes.</p>",
        //   certificates: "Diamond certificates are reports created by professional gemologists that verify a diamond's characteristics.",
        // };
        const contents = {
            intensity:
                'The main color, and if there is a secondary color, together define the color tone, however the strength of color is defined by the intensity level. The intensity level can be anywhere from a very soft shade to a very strong shade, and the stronger the shade the more valuable the diamond.',
            shape:
                '<p>Select the overall outline of the diamond, from timeless rounds to more distinctive shapes like oval, emerald, or pear. Shape defines the diamond’s character and plays a big role in its visual appeal.</p><div class="popup-Diamond-Table"><ol class="list-unstyled"><li><span class="popup-Dimond-Sketch"><img src="' +
                imageUrl +
                '/f_round.svg" alt="round"></span><span>Round</span></li><li><span class="popup-Dimond-Sketch"><img src="' +
                imageUrl +
                '/f_asscher.svg" alt="asscher"></span><span>Asscher</span></li><li><span class="popup-Dimond-Sketch"><img src="' +
                imageUrl +
                '/f_marquise.svg" alt="marquise"></span><span>Marquise</span></li><li><span class="popup-Dimond-Sketch"><img src="' +
                imageUrl +
                '/f_oval.svg" alt="oval"></span><span>Oval</span></li><li><span class="popup-Dimond-Sketch"><img src="' +
                imageUrl +
                '/f_cushion.svg" alt="cushion"></span><span>Cushion</span></li><li><span class="popup-Dimond-Sketch"><img src="' +
                imageUrl +
                '/f_radiant.svg" alt="radiant"></span><span>Radiant</span></li><li><span class="popup-Dimond-Sketch"><img src="' +
                imageUrl +
                '/f_pear.svg" alt="pear"></span><span>Pear</span></li><li><span class="popup-Dimond-Sketch"><img src="' +
                imageUrl +
                '/f_emerald.svg" alt="emerald"></span><span>Emerald</span></li><li><span class="popup-Dimond-Sketch"><img src="' +
                imageUrl +
                '/f_heart.svg" alt="heart_tn"></span><span>Heart</span></li><li><span class="popup-Dimond-Sketch"><img src="' +
                imageUrl +
                '/f_princess.svg" alt="princess"></span><span>Princess</span></li></ol></div>',
            price: 'Set your preferred price range to find diamonds that fit your budget. Prices are influenced by carat, cut, clarity, and color — so adjusting those filters may affect what you see here.',
            colour:
                '<p>The color scale measures the degree of colorlessness in a diamond. D is the highest and most  colorless grade, but also the most expensive. To get the most value for your budget, look for an eye-colorless stone. For most diamonds, this is in the F-H range.</p><img src="' +
                imageUrl +
                '/color.jpg" alt="Color">',
            carat:
                '<p>Carat is a unit of measurement to determine a diamond’s weight. Typically, a higher carat weight means a larger looking diamond, but that is not always the case. Look for the mm measurements of the diamond to determine its visible size.</p><img src="' +
                imageUrl +
                '/carat.jpg" alt="Carat">',
            cut: '<p>Not to be confused with shape, a diamond’s cut rating tells you how well its proportions interact with light. By evaluating the angles and proportions of the diamond, the cut grade is designed to tell you how sparkly and brilliant your stone is. Cut grading is usually not available for fancy shapes (any shape that is not round), because the mathematical formula that determines light return becomes less reliable when different length to width ratios are factored in.</p>',
            diamondColorRange:
                '<p>The color scale measures the degree of colorlessness in a diamond. D is the highest and most  colorless grade, but also the most expensive. To get the most value for your budget, look for an eye colorless stone. For most diamonds, this is in the F-H range.</p><img src="' +
                imageUrl +
                '/color.jpg" alt="Color">',
            clarity:
                '<p>Clarity refers to the tiny natural inclusions — or internal characteristics — found in nearly all diamonds. While flawless diamonds are extremely rare and expensive, most buyers look for stones that appear clean to the naked eye. For many shapes, the sweet spot is typically between VVS2 and SI1, where inclusions are minimal but value is strong.</p>',
            polish: '<p>Polish refers to how smooth and flawless the diamond’s surface is after cutting. It affects how light reflects off the stone. Look for a rating of Excellent or Very Good for optimal sparkle.</p>',
            depth: '<p>Depth percentage measures how tall the diamond is from top to bottom, relative to its width. A lower depth can make the diamond look larger for its carat weight, but too shallow may reduce brilliance. Depth is one factor used to determine Cut grade.</p>',
            table: '<p>Table percentage measures the size of the diamond’s top facet (the table) relative to its total width. It affects how much light enters the diamond and influences both brilliance and visual style.</p>',
            fluorescence:
                '<p>Fluorescence describes how a diamond reacts to ultraviolet (UV) light — some diamonds emit a soft glow, usually blue. While diamonds with no fluorescence often command higher prices, faint to medium fluorescence typically has little to no visible effect. In some cases, it can even enhance the diamond’s appearance. Strong fluorescence may offer additional value if the diamond still looks visually appealing.</p>',
            symmetry:
                '<p>Symmetry refers to how precisely the diamond’s facets are aligned and balanced. Better symmetry helps light reflect evenly, enhancing sparkle and brilliance. For round diamonds, look for Excellent or Very Good; for fancy shapes, Excellent to Good is ideal.</p>',
            certificates:
                '<p>A diamond certificate, also called a grading report, is an independent evaluation of the diamond’s quality. It confirms key attributes like carat weight, color, clarity, and cut. Look for certificates from respected labs such as GIA or AGS to ensure accuracy and consistency.</p>',
        };
        return contents[filterType] || 'Information not available.';
    };
    const resetThisFilter = (filter) => {
        // console.log(filter)
        if (filter === 'clarity') {
            const updatedFilters = { ...selectedFilters, [filter]: [] };
            setSelectedFilters(updatedFilters);
            applyFilters(updatedFilters);
        }
        if (filter === 'colour') {
            const updatedFilters = { ...selectedFilters, [filter]: [] };
            setSelectedFilters(updatedFilters);
            applyFilters(updatedFilters);
        }
        if (filter === 'diamondColorRange') {
            // diamondColorRange uses the colour property
            const updatedFilters = { ...selectedFilters, colour: [] };
            setSelectedFilters(updatedFilters);
            applyFilters(updatedFilters);
        }
        if (filter === 'cut') {
            const updatedFilters = { ...selectedFilters, [filter]: [] };
            setSelectedFilters(updatedFilters);
            applyFilters(updatedFilters);
        }
        if (filter === 'shape') {
            const updatedFilters = { ...selectedFilters, [filter]: [] };
            setSelectedFilters(updatedFilters);
            applyFilters(updatedFilters);
        }
        if (filter === 'price') {
            const updatedFilters = { ...selectedFilters, [filter]: [filterData.priceRange[0].minPrice, filterData.priceRange[0].maxPrice] };
            setSelectedFilters(updatedFilters);
            applyFilters(updatedFilters);
        }
        if (filter === 'carat') {
            const updatedFilters = { ...selectedFilters, [filter]: [filterData.caratRange[0].minCarat, filterData.caratRange[0].maxCarat] };
            setSelectedFilters(updatedFilters);
            applyFilters(updatedFilters);
        }
        if (filter === 'intensity') {
            const updatedFilters = { ...selectedFilters, [filter]: [] };
            setSelectedFilters(updatedFilters);
            applyFilters(updatedFilters);
        }
    };
    
    // Helper function to format filter value for display in filter buttons
    const getFilterDisplayValue = (filterType) => {
        if (filterType === "shape") {
            if (selectedFilters.shape && selectedFilters.shape.length > 0) {
                if (selectedFilters.shape.length === 1) {
                    return `(${selectedFilters.shape[0]})`;
                }
                return `(${selectedFilters.shape.length})`;
            }
            return "";
        }
        
        if (filterType === "cut") {
            if (selectedFilters.cut && selectedFilters.cut.length > 0 && filterData.cutRange) {
                const selectedCuts = filterData.cutRange
                    .filter(cut => selectedFilters.cut.includes(cut.cutId))
                    .map(cut => {
                        // Map cut names to abbreviations
                        const name = cut.cutName.toLowerCase();
                        if (name.includes("true hearts")) return "TH";
                        if (name.includes("excellent")) return "EX";
                        if (name.includes("very good")) return "VG";
                        if (name.includes("good")) return "GD";
                        return cut.cutName;
                    });
                
                if (selectedCuts.length === 1) {
                    return `(${selectedCuts[0]})`;
                } else if (selectedCuts.length > 1) {
                    return `(${selectedCuts[0]} - ${selectedCuts[selectedCuts.length - 1]})`;
                }
            }
            return "";
        }
        
        if (filterType === "colour" || filterType === "diamondColorRange") {
            if (selectedFilters.colour && selectedFilters.colour.length > 0) {
                let colorRange = filterData.colorRange || filterData.diamondColorRange;
                if (!colorRange) return "";
                
                const selectedColors = colorRange
                    .filter(color => {
                        if (filterData.colorRange) {
                            return selectedFilters.colour.includes(String(color.colorId));
                        } else {
                            // For diamondColorRange, use color name (proper case)
                            return selectedFilters.colour.includes(color.diamondColorName);
                        }
                    })
                    .map(color => filterData.colorRange ? color.colorName : color.diamondColorName);
                
                if (selectedColors.length === 1) {
                    return `(${selectedColors[0]})`;
                } else if (selectedColors.length > 1) {
                    return `(${selectedColors[0]} - ${selectedColors[selectedColors.length - 1]})`;
                }
            }
            return "";
        }
        
        if (filterType === "clarity") {
            if (selectedFilters.clarity && selectedFilters.clarity.length > 0 && filterData.clarityRange) {
                const selectedClarities = filterData.clarityRange
                    .filter(clarity => selectedFilters.clarity.includes(clarity.clarityId))
                    .map(clarity => clarity.clarityName);
                
                if (selectedClarities.length === 1) {
                    return `(${selectedClarities[0]})`;
                } else if (selectedClarities.length > 1) {
                    return `(${selectedClarities[0]} - ${selectedClarities[selectedClarities.length - 1]})`;
                }
            }
            return "";
        }
        
        if (filterType === "price") {
            if (selectedFilters.price && selectedFilters.price.length === 2 && filterData.priceRange && filterData.priceRange.length > 0) {
                const [min, max] = selectedFilters.price;
                const minPrice = parseFloat(min);
                const maxPrice = parseFloat(max);
                
                const formatPrice = (price) => {
                    if (price >= 1000) {
                        return `$${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k`;
                    }
                    return `$${price.toLocaleString()}`;
                };
                return `(${formatPrice(minPrice)} - ${formatPrice(maxPrice)})`;
            }
            return "";
        }
        
        if (filterType === "carat") {
            if (selectedFilters.carat && selectedFilters.carat.length === 2 && filterData.caratRange && filterData.caratRange.length > 0) {
                const [min, max] = selectedFilters.carat;
                const minCarat = parseFloat(min);
                const maxCarat = parseFloat(max);
                return `(${minCarat} - ${maxCarat})`;
            }
            return "";
        }
        
        // Advanced filters
        if (filterType === "depth") {
            // Check both applied filters and temp filters (for pending changes)
            const depthValue = advancedFilters.depth && advancedFilters.depth.length === 2 
                ? advancedFilters.depth 
                : (tempAdvancedFilters.depth && tempAdvancedFilters.depth.length === 2 
                    ? tempAdvancedFilters.depth 
                    : null);
            
            if (depthValue) {
                const [min, max] = depthValue;
                // Round to integers (no decimals)
                const minInt = Math.round(parseFloat(min));
                const maxInt = Math.round(parseFloat(max));
                return `(${minInt}% - ${maxInt}%)`;
            }
            return "";
        }
        
        if (filterType === "table") {
            // Check both applied filters and temp filters (for pending changes)
            const tableValue = advancedFilters.table && advancedFilters.table.length === 2 
                ? advancedFilters.table 
                : (tempAdvancedFilters.table && tempAdvancedFilters.table.length === 2 
                    ? tempAdvancedFilters.table 
                    : null);
            
            if (tableValue) {
                const [min, max] = tableValue;
                // Round to integers (no decimals)
                const minInt = Math.round(parseFloat(min));
                const maxInt = Math.round(parseFloat(max));
                return `(${minInt}% - ${maxInt}%)`;
            }
            return "";
        }
        
        if (filterType === "polish") {
            // Check both applied filters and temp filters (for pending changes)
            const polishValues = (advancedFilters.polish && advancedFilters.polish.length > 0) 
                ? advancedFilters.polish 
                : ((tempAdvancedFilters.polish && tempAdvancedFilters.polish.length > 0) 
                    ? tempAdvancedFilters.polish 
                    : []);
            
            if (polishValues.length > 0 && filterData.polishRange) {
                const selectedPolishes = filterData.polishRange
                    .filter(polish => polishValues.includes(polish.polishId))
                    .map(polish => {
                        const name = polish.polishName.toLowerCase();
                        if (name.includes("excellent")) return "EX";
                        if (name.includes("very good")) return "VG";
                        if (name.includes("good")) return "GD";
                        return polish.polishName;
                    });
                
                if (selectedPolishes.length === 1) {
                    return `(${selectedPolishes[0]})`;
                } else if (selectedPolishes.length > 1) {
                    return `(${selectedPolishes[0]} - ${selectedPolishes[selectedPolishes.length - 1]})`;
                }
            }
            return "";
        }
        
        if (filterType === "symmetry") {
            // Check both applied filters and temp filters (for pending changes)
            const symmetryValues = (advancedFilters.symmetry && advancedFilters.symmetry.length > 0) 
                ? advancedFilters.symmetry 
                : ((tempAdvancedFilters.symmetry && tempAdvancedFilters.symmetry.length > 0) 
                    ? tempAdvancedFilters.symmetry 
                    : []);
            
            if (symmetryValues.length > 0 && filterData.symmetryRange) {
                const selectedSymmetries = filterData.symmetryRange
                    .filter(symmetry => symmetryValues.includes(symmetry.symmetryId))
                    .map(symmetry => {
                        const name = symmetry.symmteryName.toLowerCase();
                        if (name.includes("excellent")) return "EX";
                        if (name.includes("very good")) return "VG";
                        if (name.includes("good")) return "GD";
                        return symmetry.symmteryName;
                    });
                
                if (selectedSymmetries.length === 1) {
                    return `(${selectedSymmetries[0]})`;
                } else if (selectedSymmetries.length > 1) {
                    return `(${selectedSymmetries[0]} - ${selectedSymmetries[selectedSymmetries.length - 1]})`;
                }
            }
            return "";
        }
        
        if (filterType === "fluorescence") {
            // Check both applied filters and temp filters (for pending changes)
            const fluorescenceValues = (advancedFilters.fluorescence && advancedFilters.fluorescence.length > 0) 
                ? advancedFilters.fluorescence 
                : ((tempAdvancedFilters.fluorescence && tempAdvancedFilters.fluorescence.length > 0) 
                    ? tempAdvancedFilters.fluorescence 
                    : []);
            
            if (fluorescenceValues.length > 0 && filterData.fluorescenceRange) {
                const selectedFluorescences = filterData.fluorescenceRange
                    .filter(fluorescence => fluorescenceValues.includes(fluorescence.fluorescenceId))
                    .map(fluorescence => fluorescence.fluorescenceName);
                
                if (selectedFluorescences.length === 1) {
                    return `(${selectedFluorescences[0]})`;
                } else if (selectedFluorescences.length > 1) {
                    return `(${selectedFluorescences[0]} - ${selectedFluorescences[selectedFluorescences.length - 1]})`;
                }
            }
            return "";
        }
        
        if (filterType === "certificates") {
            // Check both applied filters and temp filters (for pending changes)
            const certificateValues = (advancedFilters.certificates && advancedFilters.certificates.length > 0) 
                ? advancedFilters.certificates 
                : ((tempAdvancedFilters.certificates && tempAdvancedFilters.certificates.length > 0) 
                    ? tempAdvancedFilters.certificates 
                    : []);
            
            // if (certificateValues.length > 0) {
            //     if (certificateValues.length === 1) {
            //         return `(${certificateValues[0]})`;
            //     } else {
            //         return `(${certificateValues.join(", ")})`;
            //     }
            // }
            return "";
        }
        
        return "";
    };
    
    // Reset only the current modal's filter
    const resetCurrentModalFilter = (filter) => {
        if (filter === "clarity") {
            const updatedFilters = {
                ...tempSelectedFilters,
                clarity: [],
            };
            setTempSelectedFilters(updatedFilters);
            if (filterData.clarityRange && filterData.clarityRange.length > 0 && mobileClaritySliderData.length > 0) {
                setMuiClarityValue([0, mobileClaritySliderData.length - 1]);
            }
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyFilters(updatedFilters, currentRequestId);
        } else if (filter === "colour") {
            const updatedFilters = {
                ...tempSelectedFilters,
                colour: [],
            };
            setTempSelectedFilters(updatedFilters);
            if (filterData.colorRange && filterData.colorRange.length > 0 && mobileColorSliderData.length > 0) {
                setMuiColorValue([0, mobileColorSliderData.length - 1]);
            }
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyFilters(updatedFilters, currentRequestId);
        } else if (filter === "diamondColorRange") {
            const updatedFilters = {
                ...tempSelectedFilters,
                colour: [],
            };
            setTempSelectedFilters(updatedFilters);
            if (filterData.diamondColorRange && filterData.diamondColorRange.length > 0 && mobileDiamondColorSliderData.length > 0) {
                setMuiColorValue([0, mobileDiamondColorSliderData.length - 1]);
            }
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyFilters(updatedFilters, currentRequestId);
        } else if (filter === "intensity") {
            const updatedFilters = {
                ...tempSelectedFilters,
                intensity: [],
            };
            setTempSelectedFilters(updatedFilters);
            if (mobileIntensitySliderData && mobileIntensitySliderData.length > 0) {
                const lastIndex = mobileIntensitySliderData.length - 1;
                setMuiIntensityValue([0, lastIndex]);
            }
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyFilters(updatedFilters, currentRequestId);
        } else if (filter === "cut") {
            const updatedFilters = { ...tempSelectedFilters, cut: [] };
            setTempSelectedFilters(updatedFilters);
            if (mobileCutSliderData && mobileCutSliderData.length > 0) {
                const lastIndex = mobileCutSliderData.length - 1;
                setMuiCutValue([0, lastIndex]);
            }
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyFilters(updatedFilters, currentRequestId);
        } else if (filter === "shape") {
            const updatedFilters = { ...tempSelectedFilters, shape: [] };
            setTempSelectedFilters(updatedFilters);
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyFilters(updatedFilters, currentRequestId);
        } else if (filter === "price") {
            const defaultPrice = [
                filterData.priceRange[0].minPrice,
                filterData.priceRange[0].maxPrice,
            ];
            setPriceRange(defaultPrice);
            setMuiPriceValue([parseFloat(defaultPrice[0]), parseFloat(defaultPrice[1])]);
            setPriceInputValues({ min: defaultPrice[0].toString(), max: defaultPrice[1].toString() });
            const updatedFilters = {
                ...tempSelectedFilters,
                price: defaultPrice,
            };
            setTempSelectedFilters(updatedFilters);
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyFilters(updatedFilters, currentRequestId);
        } else if (filter === "carat") {
            const defaultCarat = [
                filterData.caratRange[0].minCarat,
                filterData.caratRange[0].maxCarat,
            ];
            setCaratRange(defaultCarat);
            setMuiCaratValue([parseFloat(defaultCarat[0]), parseFloat(defaultCarat[1])]);
            setCaratInputValues({ min: defaultCarat[0].toString(), max: defaultCarat[1].toString() });
            const updatedFilters = {
                ...tempSelectedFilters,
                carat: defaultCarat,
            };
            setTempSelectedFilters(updatedFilters);
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyFilters(updatedFilters, currentRequestId);
        } else if (filter === "depth") {
            const defaultDepth = [
                filterData.depthRange[0].minDepth,
                filterData.depthRange[0].maxDepth,
            ];
            setDepthRange(defaultDepth);
            setMuiDepthValue([parseFloat(defaultDepth[0]), parseFloat(defaultDepth[1])]);
            setDepthInputValues({ min: defaultDepth[0].toString(), max: defaultDepth[1].toString() });
            const updatedFilters = {
                ...tempAdvancedFilters,
                depth: defaultDepth,
            };
            setTempAdvancedFilters(updatedFilters);
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyAdvancedFilters(updatedFilters, currentRequestId);
        } else if (filter === "table") {
            const defaultTable = [
                filterData.tableRange[0].minTable,
                filterData.tableRange[0].maxTable,
            ];
            setTableRange(defaultTable);
            setMuiTableValue([parseFloat(defaultTable[0]), parseFloat(defaultTable[1])]);
            setTableInputValues({ min: defaultTable[0].toString(), max: defaultTable[1].toString() });
            const updatedFilters = {
                ...tempAdvancedFilters,
                table: defaultTable,
            };
            setTempAdvancedFilters(updatedFilters);
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyAdvancedFilters(updatedFilters, currentRequestId);
        } else if (filter === "fluorescence") {
            const updatedFilters = {
                ...tempAdvancedFilters,
                fluorescence: [],
            };
            setTempAdvancedFilters(updatedFilters);
            if (filterData.fluorescenceRange && filterData.fluorescenceRange.length > 0 && mobileFluorescenceSliderData.length > 0) {
                setMuiFluorescenceValue([0, mobileFluorescenceSliderData.length - 1]);
            }
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyAdvancedFilters(updatedFilters, currentRequestId);
        } else if (filter === "symmetry") {
            const updatedFilters = {
                ...tempAdvancedFilters,
                symmetry: [],
            };
            setTempAdvancedFilters(updatedFilters);
            if (filterData.symmetryRange && filterData.symmetryRange.length > 0 && mobileSymmetrySliderData.length > 0) {
                setMuiSymmetryValue([0, mobileSymmetrySliderData.length - 1]);
            }
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyAdvancedFilters(updatedFilters, currentRequestId);
        } else if (filter === "polish") {
            const updatedFilters = {
                ...tempAdvancedFilters,
                polish: [],
            };
            setTempAdvancedFilters(updatedFilters);
            if (filterData.polishRange && filterData.polishRange.length > 0 && mobilePolishSliderData.length > 0) {
                setMuiPolishValue([0, mobilePolishSliderData.length - 1]);
            }
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyAdvancedFilters(updatedFilters, currentRequestId);
        } else if (filter === "certificates") {
            const updatedFilters = {
                ...tempAdvancedFilters,
                certificates: [],
            };
            setTempAdvancedFilters(updatedFilters);
            // Apply the reset immediately
            requestIdRef.current += 1;
            const currentRequestId = requestIdRef.current;
            debouncedApplyAdvancedFilters(updatedFilters, currentRequestId);
        }
    };
    return (
        <div className={`diamond-inner ${className}`}>
            <div className="frame-parent9">
                <div className="top-group">
                    <div className="top14">
                        <div className="compare--diamond-header">
                            <b className="diamonds-founded2">
                                {' '}
                                {/* set diamond found here */} {utils.numberWithCommas(totalProducts)} Diamonds Found
                            </b>
                            <div className="comp2" onClick={onCompareContainerClick}>
                                <div className="compare-diamonds3">Compare Diamonds</div>
                                <div className="empty-button">
                                    <b className="placeholder totoal--settings">{compareDiamondsId.length}</b>
                                </div>
                            </div>
                        </div>
                        <div className="settings-sort">
                            <div className="settings-sort-page view_sde">
                                <div className="sort-by4">View:</div>
                                <select
                                    className="no-appearance"
                                    value={isInHouseOrVirtualOrAll}
                                    onChange={(e) => setIsInHouseOrVirtualOrAll(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    <option value="in-house">In Store Now</option>
                                    <option value="virtual">By Request</option>
                                </select>
                            </div>
                            <div className="settings-sort-page sortby_sde">
                                <div className="sort-by4">Sort by:</div>
                                <select className="no-appearance" value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value)}>
                                    <option value="Cut">Shape</option>
                                    <option value="Size">Carat</option>
                                    <option value="Color">Color</option>
                                    {isLabGrown === 'fancy' && <option value="FancyColorIntensity">Intensity'</option>}
                                    <option value="ClarityID">Clarity</option>
                                    <option value="CutGrade">Cut</option>
                                    <option value="Depth">Depth</option>
                                    <option value="TableMeasure">Table</option>
                                    <option value="Polish">Polish</option>
                                    <option value="Symmetry">Symmetry</option>
                                    <option value="Measurements">Measurement</option>
                                    <option value="Certificate">Certificate</option>
                                    <option value="FltPrice">Price</option>
                                </select>
                                <div className="sortOrder">
                                    {orderDirection === 'ASC' && (
                                        <a onClick={() => setOrderDirection('DESC')}>
                                            <img title="DESC" className={'imgDescAsc'} src={`${imageUrl}` + '/downarrow_dir.png'}></img>
                                        </a>
                                    )}
                                    {orderDirection === 'DESC' && (
                                        <a onClick={() => setOrderDirection('ASC')}>
                                            <img className={'imgDescAsc'} title="ASC" src={`${imageUrl}` + '/uparrow_dir.png'} />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="settings-sort-page show_sde">
                                <div className="show7">Show:</div>
                                <select className="no-appearance" value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))}>
                                    <option value={8}>8 per Page</option>
                                    <option value={12}>12 per Page</option>
                                    <option value={24}>24 per Page</option>
                                    <option value={48}>48 per Page</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="filters-wrapper">
                        <div className="mid1">
                            <div className="diamond-filters">
                                <div className="filter3445">
                                    <div className="filters-frame">
                                        <div className="filters7">Filters:</div>
                                    </div>
                                    <div className="filters8">
                                        {availableFilter.map((filter) => (
                                            <div key={filter} className={`filter--val${activeDropdown === filter ? ' filter--val-open' : ''}`} onClick={() => toggleDropdown(filter)}>
                                                <div className={filter === 'shape' ? 'shape-option' : ''}>
                                                    <div
                                                        className={
                                                            filter === 'shape'
                                                                ? 'shape5 diamondfilterShape'
                                                                : filter === 'price'
                                                                  ? 'price23 diamondfilterShape'
                                                                  : filter === 'carat'
                                                                    ? 'carat4 diamondfilterShape'
                                                                    : filter === 'cut'
                                                                      ? 'cut10 diamondfilterShape'
                                                                      : filter === 'colour'
                                                                        ? 'filters7 diamondfilterShape'
                                                                        : 'clarity10 diamondfilterShape'
                                                        }
                                                    >
                                                        {activeDropdown === filter && (
                                                            <CloseIcon
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    resetThisFilter(filter);
                                                                }}
                                                            />
                                                        )}
                                                        <span>
                                                            {filter !== 'diamondColorRange'
                                                                ? filter === 'colour'
                                                                    ? 'Color'
                                                                    : filter.charAt(0).toUpperCase() + filter.slice(1)
                                                                : 'color'.charAt(0).toUpperCase() + 'color'.slice(1)}
                                                            {(isMobile || filter === 'price' || filter === 'carat') && getFilterDisplayValue(filter)}
                                                        </span>
                                                        <img className="show-inner" alt="" src={`${imageUrl}` + '/vector-21.svg'} />
                                                    </div>
                                                </div>

                                                {filter === 'shape' && selectedFilters.shape.length > 0 && (
                                                    <div className="shape-placeholder">
                                                        <b className="placeholder1">{selectedFilters.shape.length}</b>
                                                    </div>
                                                )}
                                                {filter === 'cut' && selectedFilters.cut.length > 0 && (
                                                    <div className="shape-placeholder">
                                                        <b className="placeholder1">{selectedFilters.cut.length}</b>
                                                    </div>
                                                )}
                                                {filter === 'colour' && filterData.colorRange && (
                                                    <div className="shape-placeholder">
                                                        <b className="placeholder1">{selectedFilters.colour.length}</b>
                                                    </div>
                                                )}
                                                {filter === 'diamondColorRange' && (
                                                    <div className="shape-placeholder">
                                                        <b className="placeholder1">{selectedFilters.colour.length}</b>
                                                    </div>
                                                )}
                                                {filter === 'intensity' && selectedFilters.intensity && (
                                                    <div className="shape-placeholder">
                                                        <b className="placeholder1">{selectedFilters.intensity.length}</b>
                                                    </div>
                                                )}
                                                {filter === 'clarity' && (
                                                    <div className="shape-placeholder">
                                                        <b className="placeholder1">{selectedFilters.clarity.length}</b>
                                                    </div>
                                                )}
                                                {configAppData.show_filter_info === 'true' || configAppData.show_filter_info == 1 && (
                                                    <div
                                                        className={
                                                            filter === 'shape'
                                                                ? 'shape-info1'
                                                                : filter === 'price'
                                                                  ? 'empty-options'
                                                                  : 'border--round'
                                                        }
                                                    >
                                                        <b
                                                            className="filter--hover-icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                togglePopup(filter);
                                                                handleInfoClick(filter);
                                                            }}
                                                        >
                                                            i
                                                        </b>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <div className="filter--reset">
                                            <div className="actions-child">
                                                <div className="frame-child5" />
                                            </div>
                                            <div className="diamond-save-reset">
                                                <div className="save--filter">
                                                    <button type="button" className="save--diamond_filter relative" data-position="top" onClick={saveFilters}>
                                                        <img
                                                            className="icons3"
                                                            width="14"
                                                            height="15"
                                                            alt="save--diamond_filter"
                                                            src={`${imageUrl}` + '/vector-4.svg'}
                                                        />
                                                        <span className="hidden">Save Filters</span>
                                                    </button>
                                                </div>
                                                <div className="reset--filter">
                                                    <button type="button" className="reset--diamond_filter relative" data-position="top" onClick={confirmReset}>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="lucide lucide-rotate-ccw"
                                                        >
                                                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                                            <path d="M3 3v5h5"></path>
                                                        </svg>
                                                        <span className="hidden">Reset the Filter</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="div103">
                                    <div className="search4 search-products">
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14.2049 14.2522L10.9496 10.9969C11.9487 9.8576 12.5 8.41597 12.5 6.88651C12.5 5.21699 11.8498 3.64757 10.6694 2.46715C9.48893 1.28673 7.91952 0.636505 6.25 0.636505C4.58049 0.636505 3.01107 1.28673 1.83065 2.46715C0.650228 3.64757 0 5.21699 0 6.88651C0 8.55602 0.650228 10.1254 1.83065 11.3059C3.01107 12.4863 4.58049 13.1365 6.25 13.1365C7.77947 13.1365 9.22109 12.5852 10.3604 11.5861L13.6157 14.8414C13.6971 14.9228 13.8037 14.9635 13.9103 14.9635C14.0169 14.9635 14.1235 14.9228 14.2049 14.8414C14.3677 14.6787 14.3677 14.415 14.2049 14.2522ZM2.41984 10.7167C1.39689 9.69351 0.833333 8.33324 0.833333 6.88651C0.833333 5.43977 1.39689 4.0795 2.41984 3.05635C3.44299 2.0334 4.80326 1.46984 6.25 1.46984C7.69674 1.46984 9.05701 2.0334 10.0802 3.05635C11.1031 4.0795 11.6667 5.43977 11.6667 6.88651C11.6667 8.33324 11.1031 9.69351 10.0802 10.7167C9.05701 11.7396 7.69674 12.3032 6.25 12.3032C4.80326 12.3032 3.44299 11.7396 2.41984 10.7167Z"
                                                fill="var(--backgroundtext)"
                                            />
                                        </svg>
                                        <input
                                            type="text"
                                            onKeyUp={(e) => searchSetting(e)}
                                            placeholder="Search..."
                                            className="search5"
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                // applyFilters({ ...activeFilters, search: e.target.value });
                                            }}
                                        />
                                    </div>
                                    {!isMobile && (
                                        <div className="view3 product--view">
                                            <div className={isGridView ? 'grid3' : 'table7'} onClick={onGridContainerClick}>
                                                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        fill-rule="evenodd"
                                                        clip-rule="evenodd"
                                                        d="M2 3.20013V8.80002C2 9.02093 2.17908 9.20001 2.39999 9.20001H7.99988C8.22079 9.20001 8.39987 9.02093 8.39987 8.80002V3.20013C8.39987 2.97922 8.22079 2.80014 7.99988 2.80014H2.39999C2.17908 2.80014 2 2.97922 2 3.20013ZM2.79998 3.60012H7.59989V8.40003H2.79998V3.60012ZM11.5998 3.20013V8.80002C11.5998 9.02093 11.7789 9.20001 11.9998 9.20001H17.5997C17.8206 9.20001 17.9997 9.02093 17.9997 8.80002V3.20013C17.9997 2.97922 17.8206 2.80014 17.5997 2.80014H11.9998C11.7789 2.80014 11.5998 2.97922 11.5998 3.20013ZM12.3998 3.60012H17.1997V8.40003H12.3998V3.60012ZM2 12.7999V18.3998C2 18.6207 2.17908 18.7998 2.39999 18.7998H7.99988C8.22079 18.7998 8.39987 18.6207 8.39987 18.3998V12.7999C8.39987 12.579 8.22079 12.3999 7.99988 12.3999H2.39999C2.17908 12.3999 2 12.579 2 12.7999ZM2.79998 13.1999H7.59989V17.9998H2.79998V13.1999ZM11.5998 12.7999V18.3998C11.5998 18.6207 11.7789 18.7998 11.9998 18.7998H17.5997C17.8206 18.7998 17.9997 18.6207 17.9997 18.3998V12.7999C17.9997 12.579 17.8206 12.3999 17.5997 12.3999H11.9998C11.7789 12.3999 11.5998 12.579 11.5998 12.7999ZM12.3998 13.1999H17.1997V17.9998H12.3998V13.1999Z"
                                                        fill="var(--accent)"
                                                    />
                                                </svg>
                                                <b className="grid-view2">Grid View</b>
                                            </div>
                                            <div className={!isGridView ? 'grid3' : 'table7'} onClick={onTableContainerClick}>
                                                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        fill-rule="evenodd"
                                                        clip-rule="evenodd"
                                                        d="M5.4609 6.4C5.4609 6.17909 5.63998 6 5.8609 6H17.1009C17.3219 6 17.5009 6.17909 17.5009 6.4C17.5009 6.62091 17.3219 6.8 17.1009 6.8H5.8609C5.63998 6.8 5.4609 6.62091 5.4609 6.4Z"
                                                        fill="var(--accent)"
                                                    />
                                                    <path
                                                        fill-rule="evenodd"
                                                        clip-rule="evenodd"
                                                        d="M5.4609 10.4C5.4609 10.1791 5.63998 10 5.8609 10H17.1009C17.3219 10 17.5009 10.1791 17.5009 10.4C17.5009 10.6209 17.3219 10.8 17.1009 10.8H5.8609C5.63998 10.8 5.4609 10.6209 5.4609 10.4Z"
                                                        fill="var(--accent)"
                                                    />
                                                    <path
                                                        fill-rule="evenodd"
                                                        clip-rule="evenodd"
                                                        d="M5.4609 14.4C5.4609 14.1791 5.63998 14 5.8609 14H17.1009C17.3219 14 17.5009 14.1791 17.5009 14.4C17.5009 14.6209 17.3219 14.8 17.1009 14.8H5.8609C5.63998 14.8 5.4609 14.6209 5.4609 14.4Z"
                                                        fill="var(--accent)"
                                                    />
                                                    <path
                                                        fill-rule="evenodd"
                                                        clip-rule="evenodd"
                                                        d="M2.46094 6.4C2.46094 6.17909 2.64002 6 2.86094 6H3.42094C3.64185 6 3.82094 6.17909 3.82094 6.4C3.82094 6.62091 3.64185 6.8 3.42094 6.8H2.86094C2.64002 6.8 2.46094 6.62091 2.46094 6.4Z"
                                                        fill="var(--accent)"
                                                    />
                                                    <path
                                                        fill-rule="evenodd"
                                                        clip-rule="evenodd"
                                                        d="M2.46094 10.4C2.46094 10.1791 2.64002 10 2.86094 10H3.42094C3.64185 10 3.82094 10.1791 3.82094 10.4C3.82094 10.6209 3.64185 10.8 3.42094 10.8H2.86094C2.64002 10.8 2.46094 10.6209 2.46094 10.4Z"
                                                        fill="var(--accent)"
                                                    />
                                                    <path
                                                        fill-rule="evenodd"
                                                        clip-rule="evenodd"
                                                        d="M2.46094 14.4C2.46094 14.1791 2.64002 14 2.86094 14H3.42094C3.64185 14 3.82094 14.1791 3.82094 14.4C3.82094 14.6209 3.64185 14.8 3.42094 14.8H2.86094C2.64002 14.8 2.46094 14.6209 2.46094 14.4Z"
                                                        fill="var(--accent)"
                                                    />
                                                </svg>
                                                <b className="table-view2">Table View</b>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {popupContent && <PopupAlert content={popupContent} onClose={closePopup} />}
                        {!isMobile && activeDropdown && (
                            <>
                                {((activeDropdown === 'cut') ||
                                    (activeDropdown === 'colour') ||
                                    (activeDropdown === 'diamondColorRange') ||
                                    (activeDropdown === 'clarity')) && (
                                    <div className="">
                                        <h4 style={{ margin: "0px" }}>
                                            {(activeDropdown === 'colour' || activeDropdown === 'diamondColorRange')
                                                ? "Color :"
                                                : activeDropdown.charAt(0).toUpperCase() + activeDropdown.slice(1) + " :"}
                                        </h4>
                                    </div>
                                )}
                                <div
                                    className={`filter-options-container ${activeDropdown === 'price' || activeDropdown === 'carat' ? 'priceFilterBox' : ''} ${activeDropdown === 'cut' || activeDropdown === 'clarity' || activeDropdown === 'colour' || activeDropdown === 'diamondColorRange' ? 'cutClarityColor' : ''} `}
                                >
                                    {activeDropdown === 'shape' &&
                                        filterData.shapes.map((shape) => (
                                            <div
                                                onClick={() => handleFilterChange('shape', shape.shapeName)}
                                                className={`dfilter-option ${selectedFilters.shape.includes(shape.shapeName) ? 'active--item' : ''}`}
                                                key={shape.shapeName}
                                            >
                                                <span class="filter-svg">
                                                    <img
                                                        alt={shape.shapeName}
                                                        className="filter-option-icon"
                                                        src={`${imageUrl + '/' + 'f_' + shape.shapeName.toLowerCase() + '.svg'}`}
                                                    ></img>
                                                </span>
                                                <span className="option--btn">{shape.shapeName}</span>
                                            </div>
                                        ))}
                                    <div className="dropdown-content">
                                        {activeDropdown === 'sort' &&
                                            ['Price', 'Carat', 'Cut', 'Clarity'].map((option) => (
                                                <div className="dropdown-btns" key={option}>
                                                    <button
                                                        className={`option--btn ${sortBy === option ? 'active--item' : ''}`}
                                                        onClick={() => handleSortChange(option)}
                                                    >
                                                        {option}
                                                    </button>
                                                </div>
                                            ))}
                                        {activeDropdown === 'price' && (
                                            <div className="filter-options">
                                                <MultiRangeSlider
                                                    min={parseFloat(filterData.priceRange[0].minPrice)}
                                                    max={parseFloat(filterData.priceRange[0].maxPrice)}
                                                    onChange={handlePriceChange}
                                                    value={priceRange}
                                                    isPrice={true}
                                                    step={1}
                                                    currencyToShow={currencyToShow}
                                                    currencyPosition={configAppData.price_row_format}
                                                />
                                            </div>
                                        )}
                                        {activeDropdown === 'carat' && (
                                            <div className="filter-options">
                                                <MultiRangeSlider
                                                    min={parseFloat(
                                                        selectedCaratRange.length > 0 ? selectedCaratRange[0] : filterData.caratRange[0].minCarat,
                                                    )}
                                                    max={parseFloat(
                                                        selectedCaratRange.length > 0 ? selectedCaratRange[1] : filterData.caratRange[0].maxCarat,
                                                    )}
                                                    onChange={handleCaratChange}
                                                    value={caratRange}
                                                    isPrice={false}
                                                    step={0}
                                                />
                                            </div>
                                        )}
                                        {activeDropdown === 'cut' && filterData.cutRange && filterData.cutRange.length > 0 && (
                                            <>
                                                {filterData.cutRange.map((cut) => (
                                                    <div className="dropdown-btns" key={cut.cutId}>
                                                        <button
                                                            className={`option--btn ${selectedFilters.cut.includes(cut.cutId) ? 'active--item' : ''}`}
                                                            onClick={() => handleFilterChange('cut', cut.cutId)}
                                                        >
                                                            {cut.cutName}
                                                        </button>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                        {activeDropdown === 'colour' &&
                                            filterData.colorRange &&
                                            filterData.colorRange.length > 0 &&
                                            filterData.colorRange.map((colour) => (
                                                <div className="dropdown-btns" key={colour.colorId}>
                                                    <button
                                                        className={`option--btn ${selectedFilters.colour.includes(colour.colorId) ? 'active--item' : ''}`}
                                                        onClick={() => handleFilterChange('colour', colour.colorId)}
                                                    >
                                                        {colour.colorName}
                                                    </button>
                                                </div>
                                            ))}
                                        {activeDropdown === 'diamondColorRange' &&
                                            filterData.diamondColorRange &&
                                            filterData.diamondColorRange.length > 0 &&
                                            filterData.diamondColorRange.map((colour) => (
                                                <div className="dropdown-btns" key={colour.diamondColorName}>
                                                    <button
                                                        className={`option--btn ${selectedFilters.colour.includes(colour.diamondColorName) ? 'active--item' : ''}`}
                                                        onClick={() => handleFilterChange('colour', colour.diamondColorName)}
                                                    >
                                                        {colour.diamondColorName}
                                                    </button>
                                                </div>
                                            ))}
                                        {activeDropdown === 'intensity' &&
                                            filterData.intensity &&
                                            filterData.intensity.length > 0 &&
                                            filterData.intensity.map((intensity) => (
                                                <div className="dropdown-btns" key={intensity.intensityName}>
                                                    <button
                                                        className={`option--btn ${selectedFilters.intensity.includes(intensity.intensityName) ? 'active--item' : ''}`}
                                                        onClick={() => handleFilterChange('intensity', intensity.intensityName)}
                                                    >
                                                        {intensity.intensityName}
                                                    </button>
                                                </div>
                                            ))}
                                        {activeDropdown === 'clarity' &&
                                            filterData.clarityRange &&
                                            filterData.clarityRange.length > 0 &&
                                            filterData.clarityRange.map((clarity) => (
                                                <div className="dropdown-btns" key={clarity.clarityId}>
                                                    <button
                                                        className={`option--btn ${selectedFilters.clarity.includes(clarity.clarityId) ? 'active--item' : ''}`}
                                                        onClick={() => handleFilterChange('clarity', clarity.clarityId)}
                                                    >
                                                        {clarity.clarityName}
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </>
                        )}
                        {isMobile && activeModal && (
                            <FilterModal
                                isOpen
                                onClose={() => {
                                    // Flush any pending debounced calls to ensure latest changes are applied
                                    debouncedApplyFilters.flush();
                                    debouncedApplyAdvancedFilters.flush();
                                    
                                    // Simply close the modal - filters are already applied via debounced auto-apply
                                    setActiveModal(null);
                                }}
                                title={
                                    activeModal === 'colour' ? 'Color' : 
                                    activeModal === 'diamondColorRange' ? 'Color' :
                                    activeModal?.charAt(0).toUpperCase() + activeModal?.slice(1)
                                }
                                applyButtonText={`View Results (${utils.numberWithCommas(totalProducts)})`}
                                onApply={() => {
                                    // Flush any pending debounced calls to ensure latest changes are applied
                                    debouncedApplyFilters.flush();
                                    debouncedApplyAdvancedFilters.flush();
                                    
                                    // Simply close the modal - filters are already applied via debounced auto-apply
                                    setActiveModal(null);
                                }}
                                onReset={() => {
                                    // Reset only the current modal's filter
                                    resetCurrentModalFilter(activeModal);
                                }}
                            >
                                <div
                                    className={`filter-options-container ${
                                        activeModal === "shape"
                                            ? "shapediv"
                                            : ""
                                    }${
                                        activeModal === "price" ||
                                        activeModal === "carat"
                                            ? "priceFilterBox"
                                            : ""
                                    } ${
                                        activeModal === "cut" ||
                                        activeModal === "clarity" ||
                                        activeModal === "colour"
                                            ? "cutClarityColor"
                                            : ""
                                    }  `}
                                >
                                    {activeModal === "shape" &&
                                        filterData.shapes.map((shape) => (
                                            <div
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "shape",
                                                        shape.shapeName
                                                    )
                                                }
                                                className={`dfilter-option ${
                                                    tempSelectedFilters.shape.includes(
                                                        shape.shapeName
                                                    )
                                                        ? "active--item"
                                                        : ""
                                                }`}
                                                key={
                                                    shape.shapeName
                                                }
                                            >
                                                <span class="filter-svg">
                                                    <img
                                                        alt={
                                                            shape.shapeName
                                                        }
                                                        className="filter-option-icon"
                                                        src={`${
                                                            imageUrl +
                                                            "/" +
                                                            "f_" +
                                                            shape.shapeName.toLowerCase() +
                                                            ".svg"
                                                        }`}
                                                    ></img>
                                                </span>
                                                <span className="option--btn">
                                                    {
                                                        shape.shapeName
                                                    }
                                                </span>
                                            </div>
                                        ))}
                                    {activeModal === "price" && (
                                        <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                                            <Box sx={{ width: 300 }}>
                                                {(() => {
                                                    const min = parseFloat(filterData.priceRange[0].minPrice);
                                                    const max = parseFloat(filterData.priceRange[0].maxPrice);
                                                    return (
                                                        <div className="gf_container price_slider_box">
                                                            <Slider
                                                                getAriaLabel={() => 'Price range'}
                                                                value={muiPriceValue}
                                                                onChange={(event, newValue) => {
                                                                    setMuiPriceValue(newValue);
                                                                    setPriceRange(newValue);
                                                                    // Auto-apply with debouncing for mobile
                                                                    requestIdRef.current += 1;
                                                                    const currentRequestId = requestIdRef.current;
                                                                    debouncedApplyFilters({
                                                                        ...tempSelectedFilters,
                                                                        price: newValue
                                                                    }, currentRequestId);
                                                                }}
                                                                valueLabelDisplay="auto"
                                                                min={min}
                                                                max={max}
                                                                step={1}
                                                                sx={{
                                                                    color: 'var(--slider-color)',
                                                                    '& .MuiSlider-thumb': {
                                                                        backgroundColor: 'var(--slider-color)',
                                                                        border: '1px solid var(--border-color)'
                                                                    },
                                                                    '& .MuiSlider-track': {
                                                                        backgroundColor: 'var(--slider-color)'
                                                                    },
                                                                    '& .MuiSlider-rail': {
                                                                        backgroundColor: '#d1c1ba'
                                                                    }
                                                                }}
                                                            />
                                                            <div className="sliderValues">
                                                                <div className="sliderValues1">
                                                                    <span className={configAppData.price_row_format==="left"?"currencySymbolleft":"currencySymbol"}>{currencyToShow}</span>
                                                                    <input
                                                                        className="slider__left-value"
                                                                        type="number"
                                                                        value={priceInputValues.min}
                                                                        min={min}
                                                                        max={muiPriceValue[1]}
                                                                        step={1}
                                                                        onChange={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            setPriceInputValues(prev => ({ ...prev, min: inputValue }));
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            const numValue = parseFloat(inputValue);
                                                                            if (isNaN(numValue) || inputValue === '') {
                                                                                setPriceInputValues(prev => ({ ...prev, min: muiPriceValue[0].toString() }));
                                                                            } else {
                                                                                const clamped = Math.max(min, Math.min(numValue, muiPriceValue[1]));
                                                                                const newValue = [clamped, muiPriceValue[1]];
                                                                                setMuiPriceValue(newValue);
                                                                                setPriceRange(newValue);
                                                                                setPriceInputValues(prev => ({ ...prev, min: clamped.toString() }));
                                                                                requestIdRef.current += 1;
                                                                                const currentRequestId = requestIdRef.current;
                                                                                debouncedApplyFilters({
                                                                                    ...tempSelectedFilters,
                                                                                    price: newValue
                                                                                }, currentRequestId);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="sliderValues2">
                                                                    <span style={{right:'100px'}} className={(configAppData.price_row_format==="left" && filterData.currencyFrom!="USD")?"currencySymbolleft":"currencySymbol"}>{currencyToShow}</span>
                                                                    <input
                                                                        className="slider__right-value"
                                                                        type="number"
                                                                        value={priceInputValues.max}
                                                                        min={muiPriceValue[0]}
                                                                        max={max}
                                                                        step={1}
                                                                        style={{right:'0px'}}
                                                                        onChange={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            setPriceInputValues(prev => ({ ...prev, max: inputValue }));
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            const numValue = parseFloat(inputValue);
                                                                            if (isNaN(numValue) || inputValue === '') {
                                                                                setPriceInputValues(prev => ({ ...prev, max: muiPriceValue[1].toString() }));
                                                                            } else {
                                                                                const clamped = Math.max(muiPriceValue[0], Math.min(numValue, max));
                                                                                const newValue = [muiPriceValue[0], clamped];
                                                                                setMuiPriceValue(newValue);
                                                                                setPriceRange(newValue);
                                                                                setPriceInputValues(prev => ({ ...prev, max: clamped.toString() }));
                                                                                requestIdRef.current += 1;
                                                                                const currentRequestId = requestIdRef.current;
                                                                                debouncedApplyFilters({
                                                                                    ...tempSelectedFilters,
                                                                                    price: newValue
                                                                                }, currentRequestId);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </Box>
                                        </div>
                                    )}
                                    {activeModal === "carat" && (
                                        <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                                            <Box sx={{ width: 300 }}>
                                                {(() => {
                                                    const min = parseFloat(selectedCaratRange.length > 0 ? selectedCaratRange[0] : filterData.caratRange[0].minCarat);
                                                    const max = parseFloat(selectedCaratRange.length > 0 ? selectedCaratRange[1] : filterData.caratRange[0].maxCarat);
                                                    return (
                                                        <>
                                                            <Slider
                                                                getAriaLabel={() => 'Carat range'}
                                                                value={muiCaratValue}
                                                                onChange={(event, newValue) => {
                                                                    setMuiCaratValue(newValue);
                                                                    setCaratRange(newValue);
                                                                    requestIdRef.current += 1;
                                                                    const currentRequestId = requestIdRef.current;
                                                                    debouncedApplyFilters({
                                                                        ...tempSelectedFilters,
                                                                        carat: newValue
                                                                    }, currentRequestId);
                                                                }}
                                                                valueLabelDisplay="auto"
                                                                min={min}
                                                                max={max}
                                                                step={0.01}
                                                                sx={{
                                                                    color: 'var(--slider-color)',
                                                                    '& .MuiSlider-thumb': {
                                                                        backgroundColor: 'var(--slider-color)',
                                                                        border: '1px solid var(--border-color)'
                                                                    },
                                                                    '& .MuiSlider-track': {
                                                                        backgroundColor: 'var(--slider-color)'
                                                                    },
                                                                    '& .MuiSlider-rail': {
                                                                        backgroundColor: '#d1c1ba'
                                                                    }
                                                                }}
                                                            />
                                                            <div className="sliderValues">
                                                                <div className="sliderValues1">
                                                                    <input
                                                                        className="slider__left-value"
                                                                        type="number"
                                                                        value={caratInputValues.min}
                                                                        min={min}
                                                                        max={muiCaratValue[1]}
                                                                        step={0.01}
                                                                        style={{left:'0px'}}
                                                                        onChange={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            setCaratInputValues(prev => ({ ...prev, min: inputValue }));
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            const numValue = parseFloat(inputValue);
                                                                            if (isNaN(numValue) || inputValue === '') {
                                                                                setCaratInputValues(prev => ({ ...prev, min: muiCaratValue[0].toString() }));
                                                                            } else {
                                                                                const clamped = Math.max(min, Math.min(numValue, muiCaratValue[1]));
                                                                                const newValue = [clamped, muiCaratValue[1]];
                                                                                setMuiCaratValue(newValue);
                                                                                setCaratRange(newValue);
                                                                                setCaratInputValues(prev => ({ ...prev, min: clamped.toString() }));
                                                                                requestIdRef.current += 1;
                                                                                const currentRequestId = requestIdRef.current;
                                                                                debouncedApplyFilters({
                                                                                    ...tempSelectedFilters,
                                                                                    carat: newValue
                                                                                }, currentRequestId);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="sliderValues2">
                                                                    <input
                                                                        className="slider__right-value"
                                                                        type="number"
                                                                        value={caratInputValues.max}
                                                                        min={muiCaratValue[0]}
                                                                        max={max}
                                                                        step={0.01}
                                                                        style={{right:'0px'}}
                                                                        onChange={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            setCaratInputValues(prev => ({ ...prev, max: inputValue }));
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            const numValue = parseFloat(inputValue);
                                                                            if (isNaN(numValue) || inputValue === '') {
                                                                                setCaratInputValues(prev => ({ ...prev, max: muiCaratValue[1].toString() }));
                                                                            } else {
                                                                                const clamped = Math.max(muiCaratValue[0], Math.min(numValue, max));
                                                                                const newValue = [muiCaratValue[0], clamped];
                                                                                setMuiCaratValue(newValue);
                                                                                setCaratRange(newValue);
                                                                                setCaratInputValues(prev => ({ ...prev, max: clamped.toString() }));
                                                                                requestIdRef.current += 1;
                                                                                const currentRequestId = requestIdRef.current;
                                                                                debouncedApplyFilters({
                                                                                    ...tempSelectedFilters,
                                                                                    carat: newValue
                                                                                }, currentRequestId);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </Box>
                                        </div>
                                    )}
                                    {activeModal === "cut" &&
                                        mobileCutSliderData &&
                                        mobileCutSliderData.length > 0 && (
                                            <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                                                <div style={{ width: '90%', maxWidth: 400 }}>
                                                    <DiscreteSegmentSlider
                                                        segments={mobileCutSliderData.map(cut => ({
                                                            label: cut.cutName,
                                                            value: cut.cutId
                                                        }))}
                                                        value={muiCutValue}
                                                        excludeLast={false}
                                                        onChange={(newValue) => {
                                                            setMuiCutValue(newValue);
                                                            const selectedIds = getFilterArrayFromSliderRangeGeneric(
                                                                newValue,
                                                                mobileCutSliderData,
                                                                filterData.cutRange,
                                                                "cutId",
                                                                "cutName"
                                                            );
                                                            const updatedFilters = {
                                                                ...tempSelectedFilters,
                                                                cut: selectedIds,
                                                            };
                                                            setTempSelectedFilters(updatedFilters);
                                                            requestIdRef.current += 1;
                                                            const currentRequestId = requestIdRef.current;
                                                            debouncedApplyFilters(updatedFilters, currentRequestId);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    {activeModal === "colour" &&
                                        mobileColorSliderData &&
                                        mobileColorSliderData.length > 0 && (
                                            <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                                                <div style={{ width: '90%', maxWidth: 400 }}>
                                                    <DiscreteSegmentSlider
                                                        segments={mobileColorSliderData.map(color => ({
                                                            label: color.colorName,
                                                            value: color.colorId
                                                        }))}
                                                        value={muiColorValue}
                                                        excludeLast={false}
                                                        onChange={(newValue) => {
                                                            setMuiColorValue(newValue);
                                                            const selectedIds = getFilterArrayFromSliderRangeGeneric(
                                                                newValue,
                                                                mobileColorSliderData,
                                                                filterData.colorRange,
                                                                "colorId",
                                                                "colorName"
                                                            );
                                                            const updatedFilters = {
                                                                ...tempSelectedFilters,
                                                                colour: selectedIds,
                                                            };
                                                            setTempSelectedFilters(updatedFilters);
                                                            requestIdRef.current += 1;
                                                            const currentRequestId = requestIdRef.current;
                                                            debouncedApplyFilters(updatedFilters, currentRequestId);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    {activeModal === "diamondColorRange" &&
                                        mobileDiamondColorSliderData &&
                                        mobileDiamondColorSliderData.length > 0 && (
                                            <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                                                <div style={{ width: '90%', maxWidth: 400 }}>
                                                    <DiscreteSegmentSlider
                                                        segments={mobileDiamondColorSliderData.map(color => ({
                                                            label: color.diamondColorName,
                                                            value: color.diamondColorName
                                                        }))}
                                                        value={muiColorValue}
                                                        excludeLast={false}
                                                        onChange={(newValue) => {
                                                            setMuiColorValue(newValue);
                                                            const [minIdx, maxIdx] = newValue;
                                                            const selectedValues = mobileDiamondColorSliderData
                                                                .slice(minIdx, maxIdx + 1)
                                                                .map(color => color.diamondColorName);
                                                            const updatedFilters = {
                                                                ...tempSelectedFilters,
                                                                colour: selectedValues,
                                                            };
                                                            setTempSelectedFilters(updatedFilters);
                                                            requestIdRef.current += 1;
                                                            const currentRequestId = requestIdRef.current;
                                                            debouncedApplyFilters(updatedFilters, currentRequestId);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    {activeModal === "intensity" &&
                                        mobileIntensitySliderData &&
                                        mobileIntensitySliderData.length > 0 && (
                                            <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                                                <div style={{ width: '90%', maxWidth: 400 }}>
                                                    <DiscreteSegmentSlider
                                                        segments={mobileIntensitySliderData.map(intensity => ({
                                                            label: intensity.intensityName,
                                                            value: intensity.intensityName
                                                        }))}
                                                        value={muiIntensityValue}
                                                        excludeLast={false}
                                                        onChange={(newValue) => {
                                                            setMuiIntensityValue(newValue);
                                                            const selectedValues = getFilterArrayFromSliderRangeGeneric(
                                                                newValue,
                                                                mobileIntensitySliderData,
                                                                filterData.intensity,
                                                                "intensityName",
                                                                "intensityName"
                                                            );
                                                            const updatedFilters = {
                                                                ...tempSelectedFilters,
                                                                intensity: selectedValues,
                                                            };
                                                            setTempSelectedFilters(updatedFilters);
                                                            requestIdRef.current += 1;
                                                            const currentRequestId = requestIdRef.current;
                                                            debouncedApplyFilters(updatedFilters, currentRequestId);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    {activeModal === "clarity" &&
                                        mobileClaritySliderData &&
                                        mobileClaritySliderData.length > 0 && (
                                            <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                                                <div style={{ width: '90%', maxWidth: 400 }}>
                                                    <DiscreteSegmentSlider
                                                        segments={mobileClaritySliderData.map(clarity => ({
                                                            label: clarity.clarityName,
                                                            value: clarity.clarityId
                                                        }))}
                                                        value={muiClarityValue}
                                                        excludeLast={false}
                                                        onChange={(newValue) => {
                                                            setMuiClarityValue(newValue);
                                                            setClaritySelected(true);
                                                            const selectedIds = getFilterArrayFromSliderRangeGeneric(
                                                                newValue,
                                                                mobileClaritySliderData,
                                                                filterData.clarityRange,
                                                                "clarityId",
                                                                "clarityName"
                                                            );
                                                            const updatedFilters = {
                                                                ...tempSelectedFilters,
                                                                clarity: selectedIds,
                                                            };
                                                            setTempSelectedFilters(updatedFilters);
                                                            requestIdRef.current += 1;
                                                            const currentRequestId = requestIdRef.current;
                                                            debouncedApplyFilters(updatedFilters, currentRequestId);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    {/* Advanced filter modals for mobile */}
                                    {activeModal === "depth" && (
                                        <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                                            <Box sx={{ width: 300 }}>
                                                {(() => {
                                                    const min = parseFloat(filterData.depthRange[0].minDepth);
                                                    const max = parseFloat(filterData.depthRange[0].maxDepth);
                                                    return (
                                                        <>
                                                            <Slider
                                                                getAriaLabel={() => 'Depth range'}
                                                                value={muiDepthValue}
                                                                onChange={(event, newValue) => {
                                                                    setMuiDepthValue(newValue);
                                                                    setDepthRange(newValue);
                                                                    // Auto-apply with debouncing for mobile
                                                                    requestIdRef.current += 1;
                                                                    const currentRequestId = requestIdRef.current;
                                                                    debouncedApplyAdvancedFilters({
                                                                        ...tempAdvancedFilters,
                                                                        depth: newValue
                                                                    }, currentRequestId);
                                                                }}
                                                                valueLabelDisplay="auto"
                                                                valueLabelFormat={(value) => `${value}%`}
                                                                min={min}
                                                                max={max}
                                                                step={1}
                                                                sx={{
                                                                    color: 'var(--slider-color)',
                                                                    '& .MuiSlider-thumb': {
                                                                        backgroundColor: 'var(--slider-color)',
                                                                        border: '1px solid var(--border-color)'
                                                                    },
                                                                    '& .MuiSlider-track': {
                                                                        backgroundColor: 'var(--slider-color)'
                                                                    },
                                                                    '& .MuiSlider-rail': {
                                                                        backgroundColor: '#d1c1ba'
                                                                    }
                                                                }}
                                                            />
                                                            <div className="sliderValues">
                                                                <div className="sliderValues1">
                                                                    <input
                                                                        className="slider__left-value"
                                                                        type="number"
                                                                        value={depthInputValues.min}
                                                                        min={min}
                                                                        max={muiDepthValue[1]}
                                                                        step={1}
                                                                        style={{left:'0px'}}
                                                                        onChange={(e) => {
                                                                            // Allow any input value - no validation during typing
                                                                            const inputValue = e.target.value;
                                                                            setDepthInputValues(prev => ({ ...prev, min: inputValue }));
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            const numValue = parseFloat(inputValue);
                                                                            if (isNaN(numValue) || inputValue === '') {
                                                                                // Reset to current slider value if invalid or empty
                                                                                setDepthInputValues(prev => ({ ...prev, min: muiDepthValue[0].toString() }));
                                                                            } else {
                                                                                // Validate and clamp only on blur
                                                                                const clamped = Math.max(min, Math.min(numValue, muiDepthValue[1]));
                                                                                const newValue = [clamped, muiDepthValue[1]];
                                                                                setMuiDepthValue(newValue);
                                                                                setDepthRange(newValue);
                                                                                setDepthInputValues(prev => ({ ...prev, min: clamped.toString() }));
                                                                                // Auto-apply with debouncing for mobile
                                                                                requestIdRef.current += 1;
                                                                                const currentRequestId = requestIdRef.current;
                                                                                debouncedApplyAdvancedFilters({
                                                                                    ...tempAdvancedFilters,
                                                                                    depth: newValue
                                                                                }, currentRequestId);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <span style={{marginLeft: '5px'}}>%</span>
                                                                </div>
                                                                <div className="sliderValues2">
                                                                    <input
                                                                        className="slider__right-value"
                                                                        type="number"
                                                                        value={depthInputValues.max}
                                                                        min={muiDepthValue[0]}
                                                                        max={max}
                                                                        step={1}
                                                                        style={{right:'0px'}}
                                                                        onChange={(e) => {
                                                                            // Allow any input value - no validation during typing
                                                                            const inputValue = e.target.value;
                                                                            setDepthInputValues(prev => ({ ...prev, max: inputValue }));
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            const numValue = parseFloat(inputValue);
                                                                            if (isNaN(numValue) || inputValue === '') {
                                                                                // Reset to current slider value if invalid or empty
                                                                                setDepthInputValues(prev => ({ ...prev, max: muiDepthValue[1].toString() }));
                                                                            } else {
                                                                                // Validate and clamp only on blur
                                                                                const clamped = Math.max(muiDepthValue[0], Math.min(numValue, max));
                                                                                const newValue = [muiDepthValue[0], clamped];
                                                                                setMuiDepthValue(newValue);
                                                                                setDepthRange(newValue);
                                                                                setDepthInputValues(prev => ({ ...prev, max: clamped.toString() }));
                                                                                // Auto-apply with debouncing for mobile
                                                                                requestIdRef.current += 1;
                                                                                const currentRequestId = requestIdRef.current;
                                                                                debouncedApplyAdvancedFilters({
                                                                                    ...tempAdvancedFilters,
                                                                                    depth: newValue
                                                                                }, currentRequestId);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <span style={{marginRight: '5px'}}>%</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </Box>
                                        </div>
                                    )}
                                    {activeModal === "table" && (
                                        <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                                            <Box sx={{ width: 300 }}>
                                                {(() => {
                                                    const min = parseFloat(filterData.tableRange[0].minTable);
                                                    const max = parseFloat(filterData.tableRange[0].maxTable);
                                                    return (
                                                        <>
                                                            <Slider
                                                                getAriaLabel={() => 'Table range'}
                                                                value={muiTableValue}
                                                                onChange={(event, newValue) => {
                                                                    setMuiTableValue(newValue);
                                                                    setTableRange(newValue);
                                                                    // Auto-apply with debouncing for mobile
                                                                    requestIdRef.current += 1;
                                                                    const currentRequestId = requestIdRef.current;
                                                                    debouncedApplyAdvancedFilters({
                                                                        ...tempAdvancedFilters,
                                                                        table: newValue
                                                                    }, currentRequestId);
                                                                }}
                                                                valueLabelDisplay="auto"
                                                                valueLabelFormat={(value) => `${value}%`}
                                                                min={min}
                                                                max={max}
                                                                step={1}
                                                                sx={{
                                                                    color: 'var(--slider-color)',
                                                                    '& .MuiSlider-thumb': {
                                                                        backgroundColor: 'var(--slider-color)',
                                                                        border: '1px solid var(--border-color)'
                                                                    },
                                                                    '& .MuiSlider-track': {
                                                                        backgroundColor: 'var(--slider-color)'
                                                                    },
                                                                    '& .MuiSlider-rail': {
                                                                        backgroundColor: '#d1c1ba'
                                                                    }
                                                                }}
                                                            />
                                                            <div className="sliderValues">
                                                                <div className="sliderValues1">
                                                                    <input
                                                                        className="slider__left-value"
                                                                        type="number"
                                                                        value={tableInputValues.min}
                                                                        min={min}
                                                                        max={muiTableValue[1]}
                                                                        step={1}
                                                                        style={{left:'0px'}}
                                                                        onChange={(e) => {
                                                                            // Allow any input value - no validation during typing
                                                                            const inputValue = e.target.value;
                                                                            setTableInputValues(prev => ({ ...prev, min: inputValue }));
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            const numValue = parseFloat(inputValue);
                                                                            if (isNaN(numValue) || inputValue === '') {
                                                                                // Reset to current slider value if invalid or empty
                                                                                setTableInputValues(prev => ({ ...prev, min: muiTableValue[0].toString() }));
                                                                            } else {
                                                                                // Validate and clamp only on blur
                                                                                const clamped = Math.max(min, Math.min(numValue, muiTableValue[1]));
                                                                                const newValue = [clamped, muiTableValue[1]];
                                                                                setMuiTableValue(newValue);
                                                                                setTableRange(newValue);
                                                                                setTableInputValues(prev => ({ ...prev, min: clamped.toString() }));
                                                                                // Auto-apply with debouncing for mobile
                                                                                requestIdRef.current += 1;
                                                                                const currentRequestId = requestIdRef.current;
                                                                                debouncedApplyAdvancedFilters({
                                                                                    ...tempAdvancedFilters,
                                                                                    table: newValue
                                                                                }, currentRequestId);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <span style={{marginLeft: '5px'}}>%</span>
                                                                </div>
                                                                <div className="sliderValues2">
                                                                    <input
                                                                        className="slider__right-value"
                                                                        type="number"
                                                                        value={tableInputValues.max}
                                                                        min={muiTableValue[0]}
                                                                        max={max}
                                                                        step={1}
                                                                        style={{right:'0px'}}
                                                                        onChange={(e) => {
                                                                            // Allow any input value - no validation during typing
                                                                            const inputValue = e.target.value;
                                                                            setTableInputValues(prev => ({ ...prev, max: inputValue }));
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            const numValue = parseFloat(inputValue);
                                                                            if (isNaN(numValue) || inputValue === '') {
                                                                                // Reset to current slider value if invalid or empty
                                                                                setTableInputValues(prev => ({ ...prev, max: muiTableValue[1].toString() }));
                                                                            } else {
                                                                                // Validate and clamp only on blur
                                                                                const clamped = Math.max(muiTableValue[0], Math.min(numValue, max));
                                                                                const newValue = [muiTableValue[0], clamped];
                                                                                setMuiTableValue(newValue);
                                                                                setTableRange(newValue);
                                                                                setTableInputValues(prev => ({ ...prev, max: clamped.toString() }));
                                                                                // Auto-apply with debouncing for mobile
                                                                                requestIdRef.current += 1;
                                                                                const currentRequestId = requestIdRef.current;
                                                                                debouncedApplyAdvancedFilters({
                                                                                    ...tempAdvancedFilters,
                                                                                    table: newValue
                                                                                }, currentRequestId);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <span style={{marginRight: '5px'}}>%</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </Box>
                                        </div>
                                    )}
                                    {activeModal === "fluorescence" && mobileFluorescenceSliderData && mobileFluorescenceSliderData.length > 0 && (
                                        <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                                            <div style={{ width: '90%', maxWidth: 400 }}>
                                                <DiscreteSegmentSlider
                                                    segments={mobileFluorescenceSliderData.map(fluorescence => ({
                                                        label: fluorescence.fluorescenceName,
                                                        value: fluorescence.fluorescenceId
                                                    }))}
                                                    value={muiFluorescenceValue}
                                                    excludeLast={true}
                                                    onChange={(newValue) => {
                                                        setMuiFluorescenceValue(newValue);
                                                        const selectedIds = getFilterArrayFromSliderRangeGeneric(
                                                            newValue,
                                                            mobileFluorescenceSliderData,
                                                            filterData.fluorescenceRange,
                                                            "fluorescenceId",
                                                            "fluorescenceName"
                                                        );
                                                        const updatedFilters = {
                                                            ...tempAdvancedFilters,
                                                            fluorescence: selectedIds,
                                                        };
                                                        setTempAdvancedFilters(updatedFilters);
                                                        // Auto-apply with debouncing for mobile
                                                        requestIdRef.current += 1;
                                                        const currentRequestId = requestIdRef.current;
                                                        debouncedApplyAdvancedFilters(updatedFilters, currentRequestId);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {activeModal === "symmetry" && mobileSymmetrySliderData && mobileSymmetrySliderData.length > 0 && (
                                        <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                                            <div style={{ width: '90%', maxWidth: 400 }}>
                                                <DiscreteSegmentSlider
                                                    segments={mobileSymmetrySliderData.map(symmetry => ({
                                                        label: symmetry.symmteryName,
                                                        value: symmetry.symmetryId
                                                    }))}
                                                    value={muiSymmetryValue}
                                                    excludeLast={true}
                                                    onChange={(newValue) => {
                                                        setMuiSymmetryValue(newValue);
                                                        const selectedIds = getFilterArrayFromSliderRangeGeneric(
                                                            newValue,
                                                            mobileSymmetrySliderData,
                                                            filterData.symmetryRange,
                                                            "symmetryId",
                                                            "symmteryName"
                                                        );
                                                        const updatedFilters = {
                                                            ...tempAdvancedFilters,
                                                            symmetry: selectedIds,
                                                        };
                                                        setTempAdvancedFilters(updatedFilters);
                                                        // Auto-apply with debouncing for mobile
                                                        requestIdRef.current += 1;
                                                        const currentRequestId = requestIdRef.current;
                                                        debouncedApplyAdvancedFilters(updatedFilters, currentRequestId);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {activeModal === "polish" && mobilePolishSliderData && mobilePolishSliderData.length > 0 && (
                                        <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
                                            <div style={{ width: '90%', maxWidth: 400 }}>
                                                <DiscreteSegmentSlider
                                                    segments={mobilePolishSliderData.map(polish => ({
                                                        label: polish.polishName,
                                                        value: polish.polishId
                                                    }))}
                                                    value={muiPolishValue}
                                                    excludeLast={true}
                                                    onChange={(newValue) => {
                                                        setMuiPolishValue(newValue);
                                                        const selectedIds = getFilterArrayFromSliderRangeGeneric(
                                                            newValue,
                                                            mobilePolishSliderData,
                                                            filterData.polishRange,
                                                            "polishId",
                                                            "polishName"
                                                        );
                                                        const updatedFilters = {
                                                            ...tempAdvancedFilters,
                                                            polish: selectedIds,
                                                        };
                                                        setTempAdvancedFilters(updatedFilters);
                                                        // Auto-apply with debouncing for mobile
                                                        requestIdRef.current += 1;
                                                        const currentRequestId = requestIdRef.current;
                                                        debouncedApplyAdvancedFilters(updatedFilters, currentRequestId);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {activeModal === "certificates" && filterData.certificateRange && filterData.certificateRange.length > 0 && (
                                        <FilterPills
                                            options={filterData.certificateRange.map(item => ({
                                                ...item,
                                                displayName: item.certificateName,
                                                value: item.certificateName
                                            }))}
                                            selectedValues={tempAdvancedFilters.certificates}
                                            onSelect={(value) => handleAdvancedFilterChange("certificates", value)}
                                            labelKey="displayName"
                                            valueKey="value"
                                        />
                                    )}
                                </div>
                            </FilterModal>
                        )}
                    </div>
                </div>

                {/* Advanced filters for diamond */}
                <div className="advances1">
                    <div className="advances2" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                        <b className="advanced-filters2">Advanced Filters</b>
                        <div className="adv-child">
                            <img className="frame-child6" alt="" src={`${imageUrl}` + '/vector-24.svg'} />
                        </div>
                    </div>
                </div>
                {/* Advanced filter buttons for mobile view */}
                {isMobile && showAdvancedFilters && (
                    <div className="filters-wrapper">
                        <div className="mid1">
                            <div className="diamond-filters">
                                <div className="filter3445">
                                    <div className="filters8">
                                        <div
                                            className="filter--val"
                                            onClick={() => toggleDropdown("depth")}
                                        >
                                            <div>
                                                <div className="diamondfilterShape">
                                                    {activeModal === "depth" && 
                                                        <CloseIcon onClick={(e) => {
                                                            e.stopPropagation();
                                                            resetCurrentModalFilter("depth");
                                                        }} />
                                                    }
                                                    <span>Depth{getFilterDisplayValue("depth")}</span>
                                                    <img
                                                        className="show-inner"
                                                        alt=""
                                                        src={`${imageUrl}` + "/vector-21.svg"}
                                                    />
                                                </div>
                                            </div>
                                            {advancedFilters.depth.length > 0 && (
                                                <div className="shape-placeholder">
                                                    <b className="placeholder1">1</b>
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className="filter--val"
                                            onClick={() => toggleDropdown("table")}
                                        >
                                            <div>
                                                <div className="diamondfilterShape">
                                                    {activeModal === "table" && 
                                                        <CloseIcon onClick={(e) => {
                                                            e.stopPropagation();
                                                            resetCurrentModalFilter("table");
                                                        }} />
                                                    }
                                                    <span>Table{getFilterDisplayValue("table")}</span>
                                                    <img
                                                        className="show-inner"
                                                        alt=""
                                                        src={`${imageUrl}` + "/vector-21.svg"}
                                                    />
                                                </div>
                                            </div>
                                            {advancedFilters.table.length > 0 && (
                                                <div className="shape-placeholder">
                                                    <b className="placeholder1">1</b>
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className="filter--val"
                                            onClick={() => toggleDropdown("fluorescence")}
                                        >
                                            <div>
                                                <div className="diamondfilterShape">
                                                    {activeModal === "fluorescence" && 
                                                        <CloseIcon onClick={(e) => {
                                                            e.stopPropagation();
                                                            resetCurrentModalFilter("fluorescence");
                                                        }} />
                                                    }
                                                    <span>Fluorescence{getFilterDisplayValue("fluorescence")}</span>
                                                    <img
                                                        className="show-inner"
                                                        alt=""
                                                        src={`${imageUrl}` + "/vector-21.svg"}
                                                    />
                                                </div>
                                            </div>
                                            {tempAdvancedFilters.fluorescence.length > 0 && (
                                                <div className="shape-placeholder">
                                                    <b className="placeholder1">{tempAdvancedFilters.fluorescence.length}</b>
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className="filter--val"
                                            onClick={() => toggleDropdown("symmetry")}
                                        >
                                            <div>
                                                <div className="diamondfilterShape">
                                                    {activeModal === "symmetry" && 
                                                        <CloseIcon onClick={(e) => {
                                                            e.stopPropagation();
                                                            resetCurrentModalFilter("symmetry");
                                                        }} />
                                                    }
                                                    <span>Symmetry{getFilterDisplayValue("symmetry")}</span>
                                                    <img
                                                        className="show-inner"
                                                        alt=""
                                                        src={`${imageUrl}` + "/vector-21.svg"}
                                                    />
                                                </div>
                                            </div>
                                            {tempAdvancedFilters.symmetry.length > 0 && (
                                                <div className="shape-placeholder">
                                                    <b className="placeholder1">{tempAdvancedFilters.symmetry.length}</b>
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className="filter--val"
                                            onClick={() => toggleDropdown("polish")}
                                        >
                                            <div>
                                                <div className="diamondfilterShape">
                                                    {activeModal === "polish" && 
                                                        <CloseIcon onClick={(e) => {
                                                            e.stopPropagation();
                                                            resetCurrentModalFilter("polish");
                                                        }} />
                                                    }
                                                    <span>Polish{getFilterDisplayValue("polish")}</span>
                                                    <img
                                                        className="show-inner"
                                                        alt=""
                                                        src={`${imageUrl}` + "/vector-21.svg"}
                                                    />
                                                </div>
                                            </div>
                                            {tempAdvancedFilters.polish.length > 0 && (
                                                <div className="shape-placeholder">
                                                    <b className="placeholder1">{tempAdvancedFilters.polish.length}</b>
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className="filter--val"
                                            onClick={() => toggleDropdown("certificates")}
                                        >
                                            <div>
                                                <div className="diamondfilterShape">
                                                    {activeModal === "certificates" && 
                                                        <CloseIcon onClick={(e) => {
                                                            e.stopPropagation();
                                                            resetCurrentModalFilter("certificates");
                                                        }} />
                                                    }
                                                    <span>Certificates{getFilterDisplayValue("certificates")}</span>
                                                    <img
                                                        className="show-inner"
                                                        alt=""
                                                        src={`${imageUrl}` + "/vector-21.svg"}
                                                    />
                                                </div>
                                            </div>
                                            {tempAdvancedFilters.certificates.length > 0 && (
                                                <div className="shape-placeholder">
                                                    <b className="placeholder1">{tempAdvancedFilters.certificates.length}</b>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showAdvancedFilters && !isMobile && (
                    <div className="advanced-filters-content">
                        <div className="filter--content_dropdown">
                            <div className="flex-advanced-filter">
                                <div className="advanced--price-sliders">
                                    <div className="advanced-filter-group">
                                        <h4>
                                            Depth{' '}
                                            <span class="border--round">
                                                <b
                                                    class="filter--hover-icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleInfoClick('depth');
                                                    }}
                                                >
                                                    i
                                                </b>
                                            </span>
                                        </h4>
                                        <MultiRangeSlider
                                            min={parseFloat(filterData.depthRange[0].minDepth)}
                                            max={parseFloat(filterData.depthRange[0].maxDepth)}
                                            onChange={handleDepthChange}
                                            value={depthRange}
                                            isPrice={false}
                                            showPercent={true}
                                            step={1}
                                        />
                                    </div>

                                    <div className="advanced-filter-group">
                                        <h4>
                                            Table{' '}
                                            <span class="border--round">
                                                <b
                                                    class="filter--hover-icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleInfoClick('table');
                                                    }}
                                                >
                                                    i
                                                </b>
                                            </span>
                                        </h4>
                                        <MultiRangeSlider
                                            min={parseFloat(filterData.tableRange[0].minTable)}
                                            max={parseFloat(filterData.tableRange[0].maxTable)}
                                            onChange={handleTableChange}
                                            value={tableRange}
                                            isPrice={false}
                                            showPercent={true}
                                            step={1}
                                        />
                                    </div>
                                </div>
                                <div className="advanced-filter-group">
                                    <h4>
                                        Polish{' '}
                                        <span class="border--round">
                                            <b
                                                class="filter--hover-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleInfoClick('polish');
                                                }}
                                            >
                                                i
                                            </b>
                                        </span>
                                    </h4>
                                    <div className="group-inner">
                                        {filterData.polishRange.map((polish) => (
                                            <div className="dropdown-btns" key={polish.polishId}>
                                                <button
                                                    className={`option--btn ${advancedFilters.polish.includes(polish.polishId) ? 'active--item' : ''}`}
                                                    onClick={() => handleAdvancedFilterChange('polish', polish.polishId)}
                                                >
                                                    {polish.polishName}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-advanced-filter">
                                <div className="advanced-filter-group">
                                    <h4>
                                        Symmetry{' '}
                                        <span class="border--round">
                                            <b
                                                class="filter--hover-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleInfoClick('symmetry');
                                                }}
                                            >
                                                i
                                            </b>
                                        </span>
                                    </h4>
                                    <div className="group-inner">
                                        {filterData.symmetryRange.map((symmetry) => (
                                            <div className="dropdown-btns" key={symmetry.symmetryId}>
                                                <button
                                                    className={`option--btn ${advancedFilters.symmetry.includes(symmetry.symmetryId) ? 'active--item' : ''}`}
                                                    onClick={() => handleAdvancedFilterChange('symmetry', symmetry.symmetryId)}
                                                >
                                                    {symmetry.symmteryName}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="advanced-filter-group">
                                    <h4>
                                        Fluorescence{' '}
                                        <span class="border--round">
                                            <b
                                                class="filter--hover-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleInfoClick('fluorescence');
                                                }}
                                            >
                                                i
                                            </b>
                                        </span>
                                    </h4>
                                    <div className="group-inner">
                                        {filterData.fluorescenceRange.map((fluorescence) => (
                                            <div className="dropdown-btns" key={fluorescence.fluorescenceId}>
                                                <button
                                                    className={`option--btn ${advancedFilters.fluorescence.includes(fluorescence.fluorescenceId) ? 'active--item' : ''}`}
                                                    onClick={() => handleAdvancedFilterChange('fluorescence', fluorescence.fluorescenceId)}
                                                >
                                                    {fluorescence.fluorescenceName}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-advanced-filter certi-full-width">
                                <div className="advanced-filter-group">
                                    <h4>
                                        Certificates{' '}
                                        <span class="border--round">
                                            <b
                                                class="filter--hover-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleInfoClick('certificates');
                                                }}
                                            >
                                                i
                                            </b>
                                        </span>
                                    </h4>
                                    <div className="group-inner">
                                        {filterData.certificateRange.map((certificate) => (
                                            <div className="dropdown-btns" key={certificate.certificateId}>
                                                <button
                                                    className={`option--btn ${advancedFilters.certificates.includes(certificate.certificateName) ? 'active--item' : ''}`}
                                                    onClick={() => handleAdvancedFilterChange('certificates', certificate.certificateName)}
                                                >
                                                    {certificate.certificateName}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

DiamondFilter.propTypes = {
    className: PropTypes.string,
};

export default DiamondFilter;
