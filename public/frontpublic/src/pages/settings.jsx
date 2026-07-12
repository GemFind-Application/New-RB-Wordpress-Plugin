import React, { useState, useEffect ,useContext,useRef} from 'react';
import { useNavigate ,useLocation} from 'react-router-dom';
import Settingsbreadcrumb from "../components/Settingsbreadcrumb";
import SettingsFilterPanel from "../components/SettingsFilterPanel";
import SkeletonFilterPanel from "../components/SkeletonFilterPanel";
import ProductItems from "../components/product-items";
import PaginationPanel from "../components/pagination-panel";
import Header from '../components/Header';
import "./settings.css";
import { diamondService, settingService } from '../Services';
import PortalPopup from "../components/portal-popup";
import VideoTryOn from "../components/VideoTryOn";
import AlertPopUp from "../components/AlertPopUp";
import { ConfigContext } from "../components/Context"
import ShowError from "../components/ShowError"
import { utils } from '../Helpers'
const SkeletonProductItem = () => (
  <div className="product-item-skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-title"></div>
    <div className="skeleton-price"></div>
  </div>
);

const Settings = ({settingNavigationData,setIsLabGrown,isLabGrown,configAppData,className,setShowLoading,setDocumentLoaded}) => {
  const dealerIdShop = useContext(ConfigContext);
  const query = useQuery();  
  const collection = query.get("ring_collection") || query.get("style");
  const selectedShape = query.get("selected_shape") || query.get("shape");
  const metalType = query.get("ring_metal") || query.get("metal");
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false);
  const [showVirtualTryOnUrl, setShowVirtualTryOnUrl] = useState('');
  const [filterData, setFilterData] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); 
  const [itemsPerPage, setItemsPerPage] = useState(configAppData.products_pp?parseInt(configAppData.products_pp):12);
  const [sortOrder, setSortOrder] = useState( configAppData.sorting_order === 'cost-l-h'  ? 'Low to High' : 'High to Low');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [isProductLoaded, setIsProductLoaded] = useState(false); 
  //const [settingNavigation,setSettingNavigation] = useState(settingNavigationData);
  const [navigation, setNavigation] = useState("") ;
  const [isSettingFilterLoaded, setIsSettingFilterLoaded] = useState(false);
  const [isserachIsClicked, setIsSerachIsClicked] = useState(false) ;
  const [showAlertPopUp,setshowAlertPopUp] =useState(false);
  const [message,setMessage] =useState('');
  const [selectedDiamondShape,setSelectedDiamondShape] = useState('');
  const [selectedDiamondCarat,setSelectedDiamondCarat] = useState([]);
  const [isResetClicked,setIsResetClicked] = useState(false);
  const [doReset,setDoReset] = useState(false);
  const [dealerId,setDealerId] = useState(dealerIdShop);
  const [showFilterDetails,setShowFilterDetails] = useState('');
  const [openFilter, setOpenFilter] = useState(null);
  const [isDiamondDetailLoaded, setIsDiamondDetailLoaded] = useState(false);
  const [urlRingCollection, setUrlRingCollection] = useState(collection !== null && collection.length > 0 ? collection[0].toUpperCase() + collection.slice(1) : '');
  const [urlSelectedShape, setUrlSelectedShape] = useState(
    selectedShape !== null && selectedShape.length > 0 ? selectedShape[0].toUpperCase() + selectedShape.slice(1) : ''
  );
  const [urlMetalType, setUrlMetalType] = useState(
    metalType !== null && metalType.length > 0 ? decodeURIComponent(metalType) : ''
  );
    const location = useLocation();
  function useQuery() {
      return new URLSearchParams(useLocation().search);
    }
  let storedData = null;
  try {
    const storedFilters = localStorage.getItem('activeFilters');
    storedData = storedFilters ? JSON.parse(storedFilters) : null;
  } catch (e) {
    console.error('Error parsing stored filters:', e);
    storedData = null;
  } 
  const scrollRef = useRef(null);
  const isFetchingRef = useRef(false);
  const prevIsLabGrownRef = useRef(isLabGrown);
  const hasInitialLoadRef = useRef(false);
  
  const [activeFilters, setActiveFilters] = useState({
    collections: storedData 
      ? storedData.collections.length > 0 ? storedData.collections : []
      : urlRingCollection !== "" ? [urlRingCollection] : [],
    metalType: storedData 
      ? (storedData.metalType.length > 0 ? storedData.metalType : [])
      : urlMetalType !== "" ? [urlMetalType] : [],
    shapes: storedData
      ? (storedData.shapes.length > 0 ? storedData.shapes : [])
      : urlSelectedShape !== "" ? [urlSelectedShape] : [],
    price: storedData ? (storedData.price.length > 0 ? storedData.price : []) : [],
    search: storedData ? (storedData.search !== "" ? storedData.search : '') : ''
  });
 
  //const [searchQuery, setSearchQuery] = useState(activeFilters.search ? activeFilters.search!=""? activeFilters.search: '':'');
  const navigate = useNavigate();
  useEffect(() => {
   // setIsLabGrown(false);
    localStorage.removeItem('selectedRing');    
    window.scrollTo(0, 0);
  }, []);
  const fetchProducts = async (page, pageSize, isLab, sort, filters) => {
    setLoading(true);
    setShowLoading(true);
    setError(null);
    try {
      // Prioritize user-selected shapes from filters over selectedDiamondShape
      // If user has explicitly selected a shape in the filter panel, use that
      // Otherwise, fall back to selectedDiamondShape from Complete Your Ring page
      const shapeToUse = (filters.shapes && filters.shapes.length > 0) 
        ? filters.shapes.join(',')
        : (selectedDiamondShape != '' && selectedDiamondShape != null 
          ? selectedDiamondShape 
          : '');
      
      // Only include carat values if we have a selected diamond shape AND valid carat values
      const hasValidCarat = selectedDiamondShape != "" && selectedDiamondShape != null 
        && selectedDiamondCarat && selectedDiamondCarat.length >= 2 
        && selectedDiamondCarat[0] != null && selectedDiamondCarat[0] !== undefined
        && selectedDiamondCarat[1] != null && selectedDiamondCarat[1] !== undefined;

      const option = {
        pageNumber: page,
        pageSize: pageSize,
        searchSetting: filters.search,
        orderBy: sort === 'Low to High' ? 'cost+asc' : sort === 'High to Low' ? 'cost+desc' : 'newest',
        priceMin: filters.price[0],
        priceMax: filters.price[1],
        shape: shapeToUse,
        metalType: filters.metalType.join(','),
        style: filters.collections.join(','),
        isLabSettingsAvailable: isLab,
        CenterStoneMinCarat: hasValidCarat ? selectedDiamondCarat[0] : '',
        CenterStoneMaxCarat: hasValidCarat ? selectedDiamondCarat[1] : ''
      };

      const data = await settingService.getAllSettings(option, configAppData.dealerid);
      if (data.mountingList) {
        setProducts(data.mountingList);
        setTotalProducts(data.count);
        setIsProductLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products. Please try again later.");
    } finally {
      setLoading(false);
      setShowLoading(false);
    }
  };
  const showVirtualTryOnIframe = (stockNumber) => {
    const baseUrl = `https://cdn.camweara.com/gemfind/index_client.php?company_name=Gemfind&ringbuilder=1&skus=${stockNumber}&buynow=0`;
    const overrideCss = utils.getTryOnOverrideCssUrl();
    const url = overrideCss ? `${baseUrl}&custom_css=${encodeURIComponent(overrideCss)}` : baseUrl;
    setShowVirtualTryOn(true);
    setShowVirtualTryOnUrl(url);
  };
  const confirmReset=() =>{
    setIsResetClicked(true)
  }
  const fetchFilterData = async (isLab,filters) => {
    try {
      // Ensure shapes array exists and has values before joining
      const shapeParam = filters.shapes && filters.shapes.length > 0 ? filters.shapes.join(',') : '';
      const styleParam = filters.collections && filters.collections.length > 0 ? filters.collections.join(',') : '';
      
      let option = {         
        shape: shapeParam,
        style: styleParam,
        isLabSettingsAvailable:isLab 
      }
      const res = await settingService.getSettingFilters(option,configAppData.dealerid);  
      if(res && res.length>0)     {
        setFilterData(res[1][0]); 
        setIsSettingFilterLoaded(true);
        return res[1][0]; // Return filter data
      }   
      return null;
    }    
    catch (error) {
      console.error("Error fetching filter data:", error);
      setError("Failed to fetch filter data. Please try again later.");
      return null;
    }
  };

  useEffect(()=>{
    const fetchSelectedDiamondDetail= async(isLabGrown) =>{
      setIsDiamondDetailLoaded(false);
      let selectedDiamond = JSON.parse(localStorage.getItem('selectedDiamond'));    
      if(selectedDiamond){
        const resSelectedDiamond = await diamondService.getDiamondDetail(selectedDiamond.diamondId,isLabGrown,configAppData.dealerid,configAppData.shop);  
        const selectedCaratArray = selectedDiamond.caratDetail
          ? selectedDiamond.caratDetail.split("-")
          : [];
        setSelectedDiamondCarat(selectedCaratArray);
        if(resSelectedDiamond && resSelectedDiamond.shape) {      
         setSelectedDiamondShape(resSelectedDiamond.shape);
         // Update activeFilters with the shape using functional update to ensure latest state
         setActiveFilters(prevFilters => {
           const updatedFilters = {...prevFilters, shapes: [resSelectedDiamond.shape]};
           // Store in localStorage to persist the filter
           localStorage.setItem('activeFilters', JSON.stringify(updatedFilters));
           return updatedFilters;
         });
        }
      } else {
        // No selected diamond, clear carat values
        setSelectedDiamondCarat([]);
        setSelectedDiamondShape('');
      }
      // Note: When coming back from product-details without selectedDiamond,
      // the shape from URL is already in activeFilters.shapes and will be used in fetchProducts
      setIsSettingFilterLoaded(false);
      setIsProductLoaded(false);
      setDocumentLoaded(true);
      setIsDiamondDetailLoaded(true);
    };
    fetchSelectedDiamondDetail(isLabGrown);
  },[])
  useEffect(() => {
    // Wait for diamond detail to be loaded before making API calls to avoid duplicate calls
    // and ensure carat values are available
    if(!isDiamondDetailLoaded) {
      return;
    }
    
    // Prevent duplicate API calls when multiple dependencies change simultaneously
    if(isFetchingRef.current) {
      return;
    }
    
    // Ensure activeFilters is properly initialized before fetching
    // This handles the case when coming back from product-details with shape in URL
    if(activeFilters && (activeFilters.shapes !== undefined || activeFilters.collections !== undefined)) {
      // Only use selectedDiamondShape if user hasn't explicitly selected a shape in the filter panel
      // If activeFilters.shapes has a value, it means user has explicitly selected a shape, so use that
      // Otherwise, use selectedDiamondShape as the default
      const filtersToUse = (activeFilters.shapes && activeFilters.shapes.length > 0)
        ? activeFilters  // User has explicitly selected a shape, use it
        : (selectedDiamondShape && selectedDiamondShape !== '' 
          ? {...activeFilters, shapes: [selectedDiamondShape]}  // Use selectedDiamondShape as default
          : activeFilters);
      
      // Determine if we need to fetch filter data:
      // 1. Initial load (hasn't loaded yet)
      // 2. When isLabGrown changes (filter options might change)
      const isLabGrownChanged = prevIsLabGrownRef.current !== isLabGrown;
      const shouldFetchFilterData = !hasInitialLoadRef.current || isLabGrownChanged;
      
      isFetchingRef.current = true;
      setShowLoading(true);
      
      if(shouldFetchFilterData) {
        // Fetch filter data first, then products (for initial load or when isLabGrown changes)
        fetchFilterData(isLabGrown, filtersToUse)
          .then((filterDataResponse) => {
            // Update filters with default price range from filter API if price is empty
            let updatedFilters = {...filtersToUse};
            if (filterDataResponse && filterDataResponse.priceRange && filterDataResponse.priceRange.length > 0) {
              const defaultPriceRange = [filterDataResponse.priceRange[0].minPrice, filterDataResponse.priceRange[0].maxPrice];
              if (!updatedFilters.price || updatedFilters.price.length === 0) {
                updatedFilters.price = defaultPriceRange;
                // Update activeFilters state for future use
                setActiveFilters(prevFilters => ({
                  ...prevFilters,
                  price: defaultPriceRange
                }));
              }
            }
            return fetchProducts(currentPage, itemsPerPage, isLabGrown, sortOrder, updatedFilters);
          })
          .finally(() => {
            isFetchingRef.current = false;
            hasInitialLoadRef.current = true;
            prevIsLabGrownRef.current = isLabGrown;
          });
      } else {
        // Only fetch products when filters are applied (skip filter API call)
        // Update filters with default price range from filterData if price is empty
        let updatedFilters = {...filtersToUse};
        if (filterData && filterData.priceRange && filterData.priceRange.length > 0) {
          const defaultPriceRange = [filterData.priceRange[0].minPrice, filterData.priceRange[0].maxPrice];
          if (!updatedFilters.price || updatedFilters.price.length === 0) {
            updatedFilters.price = defaultPriceRange;
            // Update activeFilters state for future use
            setActiveFilters(prevFilters => ({
              ...prevFilters,
              price: defaultPriceRange
            }));
          }
        }
        fetchProducts(currentPage, itemsPerPage, isLabGrown, sortOrder, updatedFilters)
          .finally(() => {
            isFetchingRef.current = false;
          });
      }
    }
  }, [isLabGrown, currentPage, itemsPerPage, sortOrder, activeFilters, selectedDiamondShape, isDiamondDetailLoaded]);
  //setIsLabGrown
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    scrollRef.current.scrollIntoView();
  };

  const handleItemsPerPageChange = (number) => {
    setItemsPerPage(number);
    setCurrentPage(1);
  };

  const handleSortOrderChange = (order) => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handleLabGrownToggle = (isLab) => {
    setIsLabGrown(isLab);
    setCurrentPage(1);
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    // Auto-save filters to localStorage to persist when navigating back from details page
    localStorage.setItem('activeFilters', JSON.stringify(filters));
  };
 
  const searchSetting = event => { 
    if(event.target.value === ""){
      setIsSerachIsClicked(!isserachIsClicked);
      applyFilters({ ...activeFilters, search: event.target.value });
    }
    if(event.key==="Enter"){
      setIsSerachIsClicked(!isserachIsClicked);
      applyFilters({ ...activeFilters, search: event.target.value });
    }    
  }; 

  const resetFilters = () => {
    setActiveFilters({
      collections: [],
      metalType: [],
      shapes: [],
      price: [],
      search: ''
    });
    localStorage.removeItem('activeFilters');
    localStorage.removeItem('selectedDiamond');
    setSelectedDiamondCarat([]);
    setSelectedDiamondShape('');
    setCurrentPage(1);
  };

  const saveFilters = () => {
    localStorage.setItem('activeFilters', JSON.stringify(activeFilters));
    //alert('Filters saved successfully');
    setMessage('Filters saved successfully');
    setshowAlertPopUp(true);
  };

  if (error) {
    return <ShowError error={error}/>;
  }

  const updatedConfigAppData = {
    ...configAppData,
    navStandard: configAppData.navStandard || "Mined",
    navLabGrown: configAppData.navLabGrown || "Lab Grown",
  };

//console.log("===="+loading + isProductLoaded)
  return (
    <div className="settings">       
      <Settingsbreadcrumb 
        configAppData={updatedConfigAppData}
        isLabGrown={isLabGrown}
        setIsLabGrown={setIsLabGrown}
        className={className}
        settingNavigation={settingNavigationData}
      />
      <div className="settingsfilter-wrapper" ref={scrollRef}>
        {filterData && isSettingFilterLoaded ? (
        
          <SettingsFilterPanel 
            filterData={filterData}
            isLabGrown={isLabGrown}
            setIsLabGrown={handleLabGrownToggle}
            totalSettings={totalProducts}
            applyFilters={applyFilters}
            sortOrder={sortOrder}
            onSortOrderChange={handleSortOrderChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            activeFilters={activeFilters}
            resetFilters={resetFilters}
            saveFilters={saveFilters}
            settingNavigation={settingNavigationData}
            searchSetting={searchSetting}   
            confirmReset={confirmReset}       
            selectedDiamondShape={selectedDiamondShape}  
            configAppData={configAppData}
            className={className}
            showFilterDetails={showFilterDetails}
            openFilter={openFilter}
            setOpenFilter={setOpenFilter}
          />  

        ) : (
          <SkeletonFilterPanel />
        )}
      </div>
      <div className="setting-product-list" >
        {!loading && isProductLoaded ? (
           products.length===0 ? <div className='no-setting-found'>No Settings Found</div> : 
           products.map(product => (
            <ProductItems 
              configAppData ={configAppData}
              filterMetalType = {activeFilters.metalType}
              key={product.settingId} 
              showVirtualTryOnIframe={showVirtualTryOnIframe}
              product={{
                ...product,
                videoURL: product.videoURL || null,
              }}
            />
          ))
        
        ) : (
          Array(itemsPerPage).fill().map((_, index) => (
            <SkeletonProductItem key={index} />
          ))
        )}
      </div>
      {(isProductLoaded && products.length>0) &&
      <PaginationPanel 
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalProducts}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
      }
      {showVirtualTryOn && showVirtualTryOnUrl !== "" && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.3)"
          overlayClassName="portalPopupOverlay--video-tryon"
          placement="Centered"
          zIndex={2147483646}
          onOutsideClick={() => {
            setShowVirtualTryOnUrl("");
            setShowVirtualTryOn(false);
          }}
        >
          <VideoTryOn
            src={showVirtualTryOnUrl}
            onClose={() => {
              setShowVirtualTryOnUrl("");
              setShowVirtualTryOn(false);
            }}
          />
        </PortalPopup>
      )}
      {showAlertPopUp && message!="" &&      
       <AlertPopUp       
       title={'Filter Saved'}
       message={'Filter Saved Sucessfully'}
       onClose={() => {setshowAlertPopUp(false) ; setMessage('')}}> 
       </AlertPopUp>
      }
      {isResetClicked==true &&      
       <AlertPopUp       
       title={'Reset'}
       message={'Do you really want to reset?'}
       onClick={() => {setIsResetClicked(false); resetFilters();setDoReset(!doReset) }}
       onClose={() => {setIsResetClicked(false);setMessage('')}}>        
       </AlertPopUp>
      }   
    </div>    
  );
};
export default Settings;