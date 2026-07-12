import React, { useState, useEffect, useRef } from 'react';
import Header from "../components/Header";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import DiamondNavigation from "../components/diamond-navigation";
import DiamondFilter from "../components/diamond-filter";
import Items from "../components/items";
import PaginationPanel from "../components/pagination-panel";
import "./diamond.css";
import SkeletonFilterPanel from "../components/SkeletonFilterPanel";
import AlertPopUp from "../components/AlertPopUp";
import List1 from "../components/list1";
import { diamondService } from '../Services';
import { settingService } from '../Services';
import Footer from '../components/Footer';
import ShowError from '../components/ShowError';
const SkeletonProductItem = () => (
  <div className="product-item-skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-title"></div>
    <div className="skeleton-price"></div>
  </div>
);
const Diamond = ({ isLabGrown, setIsLabGrown, onCompareContainerClick, compareDiamondsId, addCompareDiamondIds, configAppData, additionOptionSetting, setShowLoading, removeCompareDiamondIds }) => {
  const query = useQuery();
  const shape = query.get("shape"); // Get 'shape' query param
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isGridView, setIsGridView] = useState(configAppData.default_viewmode === 'grid' ? true : false);
  const [diamond, setDiamond] = useState([]);
  const [filterData, setFilterData] = useState(null);
  const [diamondNavigation, setDiamondNavigation] = useState([]);
  const [isDiamondNavLoaded, setIsDiamondNavLoaded] = useState(false);
  const [isDiamondFilterLoaded, setIsDiamondFilterLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDiamondLoaded, setIsDiamondLoaded] = useState(false);
  const [isserachIsClicked, setIsSerachIsClicked] = useState(false);
  const [sortOrder, setSortOrder] = useState('Size');
  const [selectedSettingShape, setSelectedSettingShape] = useState('');
  const [showAlertPopUp, setshowAlertPopUp] = useState(false);
  const [message, setMessage] = useState('');
  const [showInitialFilter, setShowInitialFilter] = useState('');
  const [isResetClicked, setIsResetClicked] = useState(false);
  const [doReset, setDoReset] = useState(false);
  const [orderDirection, setOrderDirection] = useState('ASC');
  const [selectedCaratRange, setSelectedCaratRange] = useState([]);
  const [currentLabGrown, setCurrentLabGrown] = useState(isLabGrown);
  const [isClaritySelected, setIsClaritySelected] = useState(false);
  const [isInHouseOrVirtualOrAll, setIsInHouseOrVirtualOrAll] = useState('all');
  const [showFilterDetails, setShowFilterDetails] = useState('');
  const [urlShape, setUrlShape] = useState(shape !== null?shape[0].toUpperCase() + shape.slice(1):'');
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null)
  const [selectedFilters, setSelectedFilters] = useState({
    shape: [],
    carat: [],
    cut: [],
    colour: [],
    clarity: [],
    price: [],
    intensity: [],
    search: ''
  });
  const [advancedFilters, setAdvancedFilters] = useState([]);
  useEffect(() => {
    async function fetchDiamondNavigation() {
      try {
        const res = await diamondService.getDiamondNavigation(configAppData.dealerid);
        if (res[0]) {
          setDiamondNavigation(res[0]);
        }
        setIsDiamondNavLoaded(true);
      } catch (err) {
        console.error("Error fetching diamond navigation:", err);
        setError("Failed to fetch diamond navigation. Please try again later.");
      }
    }
    localStorage.removeItem('selectedDiamond');
    window.scrollTo(0, 0);
    setIsDiamondLoaded(false);
    setIsDiamondFilterLoaded(false)
    fetchDiamondNavigation();
  }, [])

  useEffect(() => {
    
  }, [])
  
  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Force grid view on mobile
      if (mobile) {
        setIsGridView(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  const fetchDiamondFilter = async (isLab) => {
    try {
      
      let storedData = [];
      let advanceFilterStoredData = [];
      setShowLoading(true)

      if (isLabGrown === true) {
        storedData = JSON.parse(localStorage.getItem('saveDiamondFiltersLab'));
        advanceFilterStoredData = JSON.parse(localStorage.getItem('saveAdvanceDiamondFiltersLab'));
      } else if (isLabGrown === 'fancy') {
        storedData = JSON.parse(localStorage.getItem('saveDiamondFiltersfancy'));
        advanceFilterStoredData = JSON.parse(localStorage.getItem('saveAdvanceDiamondFiltersFancy'));
      } else {
        storedData = JSON.parse(localStorage.getItem('saveDiamondFiltersMined'));
        advanceFilterStoredData = JSON.parse(localStorage.getItem('saveAdvanceDiamondFiltersMined'));
      }

      // setIsDiamondFilterLoaded(false)
      let selectedRingSetting = JSON.parse(localStorage.getItem('selectedRing'));
      let selectedRingShape = '';
      let selectedCaratRangeForSetting = [];
      if (selectedRingSetting && (urlShape == "" || urlShape == null)) {
        
        const resSetting = await settingService.getSettingDetail(selectedRingSetting.settingId, configAppData.dealerid, isLab, configAppData.shop);

        if (resSetting) {
          selectedRingShape = resSetting.centerStoneFit;
          // Split comma-separated string into array and trim each shape
          const shapesArray = selectedRingShape ? selectedRingShape.split(',').map(s => s.trim()).filter(s => s !== '') : [];
          setSelectedSettingShape(shapesArray.length > 0 ? selectedRingShape : '');
          selectedCaratRangeForSetting = [resSetting.centerStoneMinCarat, resSetting.centerStoneMaxCarat];
          setSelectedCaratRange([resSetting.centerStoneMinCarat, resSetting.centerStoneMaxCarat]);
        }
      }
      if(urlShape !== "" && urlShape !== null){   
        setSelectedSettingShape(urlShape);
      }
      const res = await diamondService.getDiamondFilter({ isLabGrown: isLab == 'fancy' ? isLab : isLab == true ? true : false }, configAppData.dealerid);
      if (res) {
        if (res[0].message === 'Success') {
          setSelectedFilters({
            shape: [],
            carat: [],
            cut: [],
            colour: [],
            clarity: [],
            price: [],
            intensity: [],
            search: ''
          });
          setFilterData(res[1][0]);

          // Split comma-separated string into array for shape filter
          let shapeFilterArray = [];
          if (selectedRingShape != "") {
            shapeFilterArray = selectedRingShape.split(',').map(s => s.trim()).filter(s => s !== '');
          } else if (urlShape !== "" && urlShape !== null) {
            shapeFilterArray = [urlShape];
          } else if (storedData && storedData.shape) {
            shapeFilterArray = storedData.shape;
          }

          setSelectedFilters({
            search: storedData ? storedData.search != "" ? (storedData.search) : '' : '',
            cut: ((storedData == null || (storedData && storedData.cut.length == 0))) ? [] : storedData ? storedData.cut : [],
            shape: shapeFilterArray,
            colour: ((storedData == null || (storedData && storedData.colour.length == 0))) ? [] : storedData ? storedData.colour : [],
            intensity: ((storedData == null || (storedData && storedData.intensity.length === 0))) ?
              [] : storedData.intensity ? storedData.intensity : [],
            clarity: ((storedData == null || (storedData && storedData.clarity.length === 0))) ? [] : storedData ? storedData.clarity : [],
            price: ((storedData == null || (storedData && storedData.price.length === 0))) ? [res[1][0].priceRange[0].minPrice, res[1][0].priceRange[0].maxPrice] : storedData ? storedData.price : [],
            carat: (selectedRingShape != "" && selectedCaratRangeForSetting.length > 0) ? selectedCaratRangeForSetting : ((storedData == null || (storedData && storedData.carat.length === 0))) ? [res[1][0].caratRange[0].minCarat, res[1][0].caratRange[0].maxCarat] : storedData ? storedData.carat : [],
          });
          setAdvancedFilters({
            polish: advanceFilterStoredData ? advanceFilterStoredData.polish.length > 0 ? advanceFilterStoredData.polish : [] : [],
            depth: advanceFilterStoredData ? advanceFilterStoredData.depth.length > 0 ? advanceFilterStoredData.depth : [] : [],
            table: advanceFilterStoredData ? advanceFilterStoredData.table.length > 0 ? advanceFilterStoredData.table : [] : [],
            fluorescence: advanceFilterStoredData ? advanceFilterStoredData.fluorescence.length > 0 ? advanceFilterStoredData.fluorescence : [] : [],
            symmetry: advanceFilterStoredData ? advanceFilterStoredData.symmetry.length > 0 ? advanceFilterStoredData.symmetry : [] : [],
            certificates: advanceFilterStoredData ? advanceFilterStoredData.certificates.length > 0 ? advanceFilterStoredData.certificates : [] : [],
          });
          setIsDiamondFilterLoaded(true);
        }
      }

    } catch (err) {
      console.error("Error fetching diamond filter data:", err);
      setError("Failed to fetch diamond  filter data. Please try again later.");
    }
  }
  useEffect(() => {
    fetchDiamondFilter(isLabGrown);
    setIsClaritySelected(false);
  }, [isLabGrown, doReset]);

  const fetchDiamond = async (page, pageSize, isLab, sort, selectedFilters, advancedFilters, orderDirection) => {
    setShowLoading(true)
    if (isDiamondFilterLoaded) {
      let newselectedClarity = [];
      if (isClaritySelected === false) {
        filterData.clarityRange.map(item => {
          //if(selectedFilters.clarity.length > filterData.clarityRange){
          if (selectedFilters.clarity.includes(item.clarityId)) {
            newselectedClarity.push(item.clarityName)
          }
        })
      } else {
        newselectedClarity = selectedFilters.clarity;
      }
      //console.log(advancedFilters.certificates)
      try {
        let option = {
          pageNumber: page,
          pageSize: pageSize,
          searchDiamond: selectedFilters.search,
          shape: selectedFilters.shape.length > 0 ? selectedFilters.shape.join(',') : '',
          cut: selectedFilters.cut.length > 0 ? selectedFilters.cut.join(',') : '',
          colour: selectedFilters.colour.length > 0 ? selectedFilters.colour.join(',') : '',
          intensity: selectedFilters.intensity.length > 0 ? selectedFilters.intensity.join(',') + ',' : '',
          clarity: selectedFilters.clarity.length > 0 ? newselectedClarity.join(',') : '',
          isLabGrown: isLab === 'fancy' ? isLab : isLab === true ? true : false,
          priceMin: selectedFilters.price[0],
          priceMax: selectedFilters.price[1],
          carat: selectedFilters.carat.length > 0 ? [selectedFilters.carat[0], selectedFilters.carat[1]] : [],
          orderBy: sort,
          diamondfilter: isInHouseOrVirtualOrAll,
          orderDirection: orderDirection,
          fluorescence: advancedFilters.fluorescence.length > 0 ? advancedFilters.fluorescence.join(',') : '',
          certificates: advancedFilters.certificates.length > 0 ? advancedFilters.certificates.join(',') : '',
          symmetry: advancedFilters.symmetry.length > 0 ? advancedFilters.symmetry.join(',') : '',
          polish: advancedFilters.polish.length > 0 ? advancedFilters.polish.join(',') : '',
          table: advancedFilters.table.length > 0 ? [advancedFilters.table[0], advancedFilters.table[1]] : [],
          depth: advancedFilters.depth.length > 0 ? [advancedFilters.depth[0], advancedFilters.depth[1]] : [],
        }
        const res = await diamondService.getAllDiamond(option, configAppData.dealerid);
        if (res.diamondList) {
          setDiamond(res.diamondList);
          setTotalProducts(res.count);

          setShowLoading(false);
        }
        setIsDiamondLoaded(true);
      } catch (err) {
        console.error("Error fetching diamond  data:", error);
        setError("Failed to fetch diamond  data. Please try again later.");
        setShowLoading(false);
      }
    }
  }
  useEffect(() => {
    fetchDiamond(currentPage, itemsPerPage, isLabGrown, sortOrder, selectedFilters, advancedFilters, orderDirection);
  }, [currentPage, itemsPerPage, sortOrder, selectedFilters, advancedFilters, orderDirection, isInHouseOrVirtualOrAll]);

  const handlePageChange = (pageNumber) => {

    setCurrentPage(pageNumber);
    scrollRef.current.scrollIntoView();
  };

  const handleItemsPerPageChange = (number) => {
    setItemsPerPage(number);
    setCurrentPage(1);
  };
  const applyFilters = (filters) => {
    setSelectedFilters(filters);
    setCurrentPage(1);
  };
  const applyAdvanceFilters = (filters) => {
    console.log("step")
    setAdvancedFilters(filters);
    setCurrentPage(1);
  };
  const handleSortOrderChange = (order) => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  const searchSetting = event => {
    if (event.target.value === "") {
      setIsSerachIsClicked(!isserachIsClicked);
      applyFilters({ ...selectedFilters, search: event.target.value });
    }
    if (event.key === "Enter") {
      setIsSerachIsClicked(!isserachIsClicked);
      applyFilters({ ...selectedFilters, search: event.target.value });
    }
  };
  const confirmReset = () => {
    setIsResetClicked(true)
  }
  const resetFilters = () => {
    setUrlShape("")
    if (shape) {
      navigate(location.pathname, { replace: true });
    }
    setSelectedFilters({
      shape: [],
      cut: [],
      colour: [],
      clarity: [],
      intensity: [],
      carat: [filterData.caratRange[0].minCarat, filterData.caratRange[0].maxCarat],
      price: [filterData.priceRange[0].minPrice, filterData.priceRange[0].maxPrice],
      search: ''
    });

    setAdvancedFilters({
      polish: [],
      depth: [filterData.depthRange[0].minDepth, filterData.depthRange[0].maxDepth],
      table: [filterData.tableRange[0].minTable, filterData.tableRange[0].maxTable],
      fluorescence: [],
      symmetry: [],
      certificates: [],
    });

    localStorage.removeItem('saveDiamondFiltersMined');
    localStorage.removeItem('saveAdvanceDiamondFiltersMined');
    localStorage.removeItem('saveDiamondFiltersLab');
    localStorage.removeItem('saveAdvanceDiamondFiltersLab');
    localStorage.removeItem('saveDiamondFiltersfancy');
    localStorage.removeItem('saveAdvanceDiamondFiltersFancy');
    localStorage.removeItem('selectedRing');

    setSelectedSettingShape('')
    setSelectedCaratRange([])
    setCurrentPage(1);

    removeCompareDiamondIds(compareDiamondsId);
    localStorage.removeItem('diamondIdsToCompare');
  };

  const saveFilters = () => {
    if (isLabGrown === false) {
      localStorage.setItem('saveDiamondFiltersMined', JSON.stringify(selectedFilters));
      localStorage.setItem('saveAdvanceDiamondFiltersMined', JSON.stringify(advancedFilters));
    }
    if (isLabGrown === true) {
      localStorage.setItem('saveDiamondFiltersLab', JSON.stringify(selectedFilters));
      localStorage.setItem('saveAdvanceDiamondFiltersLab', JSON.stringify(advancedFilters));
    }
    if (isLabGrown === 'fancy') {
      localStorage.setItem('saveDiamondFiltersfancy', JSON.stringify(selectedFilters));
      localStorage.setItem('saveAdvanceDiamondFiltersFancy', JSON.stringify(advancedFilters));
    }
    setMessage('Filters saved successfully');
    setshowAlertPopUp(true);
  };
  const saveFiltersAfterDetails = () => {
    if (isLabGrown === false) {
      //console.log(selectedFilters)
      localStorage.setItem('saveDiamondFiltersMined', JSON.stringify(selectedFilters));
      localStorage.setItem('saveAdvanceDiamondFiltersMined', JSON.stringify(advancedFilters));
    }
    if (isLabGrown === true) {
      localStorage.setItem('saveDiamondFiltersLab', JSON.stringify(selectedFilters));
      localStorage.setItem('saveAdvanceDiamondFiltersLab', JSON.stringify(advancedFilters));
    }
    if (isLabGrown === 'fancy') {
      localStorage.setItem('saveDiamondFiltersfancy', JSON.stringify(selectedFilters));
      localStorage.setItem('saveAdvanceDiamondFiltersFancy', JSON.stringify(advancedFilters));
    }
    //setMessage('Filters saved successfully');
    //setshowAlertPopUp(true);
  };

  if (error) {
    return <ShowError error={error} />;
  }

  return (
    <div className="diamond">
      <DiamondNavigation diamondNavigation={diamondNavigation} setIsLabGrown={setIsLabGrown} isLabGrown={isLabGrown} configAppData={configAppData} />
      {isDiamondFilterLoaded ?
        isDiamondFilterLoaded &&
        <div ref={scrollRef}>
          <DiamondFilter

            filterData={filterData}
            selectedFilters={selectedFilters}
            isGridView={isGridView}
            setIsGridView={setIsGridView}
            applyFilters={applyFilters}
            applyAdvanceFilters={applyAdvanceFilters}
            resetFilters={resetFilters}
            confirmReset={confirmReset}
            saveFilters={saveFilters}
            totalProducts={totalProducts}
            onSortOrderChange={handleSortOrderChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            sortOrder={sortOrder}
            searchSetting={searchSetting}
            advancedFilters={advancedFilters}
            setAdvancedFilters={setAdvancedFilters}
            setSelectedFilters={setSelectedFilters}
            itemsPerPage={itemsPerPage}
            compareDiamondsId={compareDiamondsId}
            onCompareContainerClick={onCompareContainerClick}
            selectedSettingShape={selectedSettingShape}
            isLabGrown:isLabGrown
            setOrderDirection={setOrderDirection}
            orderDirection={orderDirection}
            configAppData={configAppData}
            selectedCaratRange={selectedCaratRange}
            setClaritySelected={setIsClaritySelected}
            isInHouseOrVirtualOrAll={isInHouseOrVirtualOrAll}
            setIsInHouseOrVirtualOrAll={setIsInHouseOrVirtualOrAll}
            showFilterDetails={showFilterDetails}
          /></div>
        : (
          <SkeletonFilterPanel />
        )}

      {isDiamondLoaded ? (
        <>
          {diamond.length === 0 ? (
            <div className='itemnofound'>No Diamond Found</div>
          ) : (isGridView || isMobile) ? (
            <div className="list2">
              {diamond.map(product => (
                <Items
                  configAppData={configAppData}
                  additionOptionSetting={additionOptionSetting}
                  key={product.diamondId}
                  addCompareDiamondIds={addCompareDiamondIds}
                  compareDiamondsId={compareDiamondsId}
                  isLabGrown={isLabGrown}
                  saveFiltersAfterDetails={saveFiltersAfterDetails}
                  diamond={{
                    ...product,
                    videoURL: product.videoURL || null,
                  }} />
              ))}
            </div>
          ) : (
            <List1
              configAppData={configAppData}
              additionOptionSetting={additionOptionSetting}
              compareDiamondsId={compareDiamondsId}
              isLabGrown={isLabGrown}
              addCompareDiamondIds={addCompareDiamondIds}
              saveFiltersAfterDetails={saveFiltersAfterDetails}
              diamonds={diamond.map(product => ({
                ...product,
                videoURL: product.videoURL || null,
              }))}
              onSort={(key, direction) => {
                const sortMap = {
                  'shape': 'Cut',
                  'carat': 'Size',
                  'cut': 'Cut',
                  'color': 'Color',
                  'clarity': 'ClarityID',
                  'depth': 'Depth',
                  'TableMeasure': 'TableMeasure',
                  'certificate': 'Certificate',
                  'price': 'FltPrice'
                };
                if (sortMap[key]) {
                  handleSortOrderChange(sortMap[key]);
                  setOrderDirection(direction.toUpperCase());
                }
              }}
            />
          )}
        </>
      ) : (
        <div className="list2">
          {Array(itemsPerPage).fill().map((_, index) => (
            <SkeletonProductItem key={index} />
          ))}
        </div>
      )}

      <PaginationPanel
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalProducts}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
      {showAlertPopUp && message != "" &&
        <AlertPopUp
          title={'Filter Saved'}
          message={'Filter Saved Sucessfully'}
          onClose={() => { setshowAlertPopUp(false); setMessage('') }}>
        </AlertPopUp>
      }
      {isResetClicked == true &&
        <AlertPopUp
          title={'Reset'}
          message={'Do you really want to reset?'}
          onClick={() => { setIsResetClicked(false); resetFilters(); }}
          onClose={() => { setIsResetClicked(false); setMessage('') }}>
        </AlertPopUp>
      }
    </div>
  );
};

export default Diamond;
