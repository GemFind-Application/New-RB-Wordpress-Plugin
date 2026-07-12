import React, { useState, useEffect, useRef } from 'react';
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import PropTypes from 'prop-types';
import { Search, ChevronDown, BookmarkMinus, RotateCcw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './SettingsFilterPanel.css';
import MultiRangeSlider from './MultiRangeSlider';
import FilterModal from './FilterModal';

import PopupAlert from './PopupAlert';
import { debounce } from "lodash";
import { utils } from '../Helpers';
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
const imageUrl = `${getImageBaseUrl()}`;
const FilterOption = ({ label, icon, isActive, onClick ,isCollectionisActive,selectedDiamondShape,filterType}) => (  
  <>

 {(!isActive&&isCollectionisActive && isCollectionisActive==0) ?
  <div className={`filter-option noCursor ${selectedDiamondShape ? 'active spaceInbetween' : ''}`} >
    {isActive && <X size={10} />}
    <span className="filter-img">{icon && <img src={`${imageUrl+"/"+icon}`}  alt={label} className="filter-option-icon" />}</span>
    <span className="fitler-label">{label}</span>
  </div>
  :
  <div    className={`filter-option ${isActive ? 'active' : ''}`}      onClick={onClick}>
      {isActive && <X size={10} />}
      {icon && <span class="filter-svg"><img  src={`${imageUrl+"/"+icon}`} alt={label} className="filter-option-icon" /></span>}
      <span>{label}</span>
    </div>
    }
    </>
);
const FilterOptionCollection = ({ label, icon, isActive, onClick ,isCollectionisActive,selectedDiamondShape,filterType}) => (  
  <>

 {(!isActive&&isCollectionisActive && isCollectionisActive==0) ?
  <div className={`filter-option noCursor ${selectedDiamondShape ? 'active spaceInbetween' : ''}`} >
    {isActive && <X size={10} />}
    <span className="filter-img">{icon && <img src={icon} alt={label} className="filter-option-icon" />}</span>
    <span className="fitler-label">{label}</span>
  </div>
  :
  <div    className={`filter-option ${isActive ? 'active' : ''}`}      onClick={onClick}>
      {isActive && <X size={10} />}
      {icon && <span class="filter-svg"><img  src={icon} alt={label} className="filter-option-icon" /></span>}
      <span>{label}</span>
    </div>
    }
    </>
);
const FilterOptionMetal = ({ label, icon, isActive, onClick ,isCollectionisActive,selectedDiamondShape,filterType}) => (  
  <>

<div
      key={label}
      className={`metal-type ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >{isActive && <X size={20} />}
      <div className={`metal-icon ${utils.getMetalColorClass(label)}`}>
        <div className="ring"></div>
      </div>
      <span className={`metal-name ${isActive  ? 'selected' : ''}`}>
        {label}
      </span>
    </div>
    </>
);
const SettingsFilterPanel = ({ 
  className, 
  filterData, 
  isLabGrown, 
  setIsLabGrown, 
  applyFilters, 
  totalSettings,
  sortOrder,
  onSortOrderChange,
  itemsPerPage,
  onItemsPerPageChange,
  activeFilters,
  resetFilters,
  saveFilters,
  settingNavigation,
  searchSetting  ,
  confirmReset,
  selectedDiamondShape,
  configAppData,
  showFilterDetails,
  openFilter,
  setOpenFilter
}) => {
 
  const [searchQuery, setSearchQuery] = useState(activeFilters.search ? activeFilters.search!=""? activeFilters.search: '':'');
  const [priceRange, setPriceRange] = useState(filterData.priceRange.length > 0 ?activeFilters.price.length===0 ? [filterData.priceRange[0].minPrice, filterData.priceRange[0].maxPrice]: [activeFilters.price[0], activeFilters.price[1]]:[]);
  const [availableFilter, setAvailableFilter] = useState([]);   
  // const [activePopup, setActivePopup] = useState(null);
  const imageUrl = `${getImageBaseUrl()}`;

  const [popupContent, setPopupContent] = useState(null);
  const [currencyToShow, setCurrencyToShow] = useState('$');
  const [isMobile, setIsMobile] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  
  // Scroll state for filter options container
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const filterContainerRef = useRef(null);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
   // setPriceRange(activeFilters.price || [0, 29678.00]);
    let filterAvailable = [];
    filterData.collections.length>0 && filterAvailable.push('collections');  
    filterData.metalType.length>0 && filterAvailable.push('metalType');  
    //if(filterData.showDiamondShape===true){
      filterData.shapes.length>0 && filterAvailable.push('shapes');
    //}
    setSearchQuery(activeFilters.search ? activeFilters.search!=""? activeFilters.search: '':'');
    setAvailableFilter(filterAvailable)
    
    // Open collections dropdown by default if collections are available, no filter is currently open, and NOT on mobile
    // Check window width directly to determine if mobile (< 768px)
    const isMobileView = window.innerWidth < 768;
    if (filterData.collections.length > 0 && !openFilter && !isMobileView) {
      setOpenFilter('collections');
    }
    
   // setOpenFilter(openFilter!=="" ? null : filter);
   // openFilter === filter ? null : filter
   if(configAppData.price_row_format=='left'){
        if(filterData.currencyFrom=="USD"){
          setCurrencyToShow('$')
        }else{
          setCurrencyToShow(filterData.currencySymbol+" "+ filterData.currencyFrom)
        }

   }else{
    if(filterData.currencyFrom=="USD"){
      setCurrencyToShow('$')
    }else{
      setCurrencyToShow(filterData.currencyFrom+" "+ filterData.currencySymbol)
    }
   }
    
  }, []);
  const toggleFilter = (filter) => {
    if (isMobile) {
      setActiveModal(filter);
      return;
    }
    setOpenFilter(openFilter === filter ? null : filter);
  };
 
  const toggleFilterOption = (filter, option) => {
    applyFilters({
      ...activeFilters,
      [filter]: activeFilters[filter].includes(option)
        ? activeFilters[filter].filter(item => item !== option)
        : [ option]
    });
    //console.log(openFilter)
    //setOpenFilter(openFilter === filter ? null : filter);
  };

  /*const handlePriceChange = ({ min, max }) => {
    setPriceRange([min, max]);
    applyFilters({
      ...activeFilters,
      price: [min, max]
    });
  };*/
  //console.log(configAppData
  const handlePriceChange = ({ min, max }) => {   
    console.log(min);
    console.log(max) 
    setPriceRange([min, max]);  
    applyFilters({ ...activeFilters, price: [min,max] });
    //handleDebounce({min,max});
  };

  const handleLabGrownToggle = (value) => {
    setIsLabGrown(value);
  };
  const resetCurrentFilter = (filter) => {
    if (!filter) return;
    if (filter === 'price' && filterData.priceRange.length > 0) {
      const defaultRange = [filterData.priceRange[0].minPrice, filterData.priceRange[0].maxPrice];
      setPriceRange(defaultRange);
      applyFilters({ ...activeFilters, price: defaultRange });
      return;
    }
    if (activeFilters[filter] !== undefined) {
      applyFilters({ ...activeFilters, [filter]: [] });
    }
  };
   // memoize the callback with useCallback
  // we need it since it's a dependency in useMemo below
 /* const handleSetTimeRange = (value) => {     
    applyFilters({ ...activeFilters, price: [value.min,value.max] });
  };
  const handleDebounce = useCallback(
    debounce(handleSetTimeRange, 500),
    [activeFilters],
  ); */

  // const togglePopup = (popup) => {
  //   setActivePopup(activePopup === popup ? null : popup);
  // };
  const getPopupContent = (filterType) => { 
    console.log(filterType)
    const contents = {
      shapes : '<p>A diamond’s shape is not the same as a diamond’s cut. The shape refers to the general outline of the stone, and not its light refractive qualities. Look for a shape that best suits the ring setting you have chosen, as well as the recipient’s preference and personality. Here are some of the more common shapes that '+window.location.origin+' offers:</p><div class="popup-Diamond-Table"><ol class="list-unstyled"><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/round.png" alt="round"></span><span>Round</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/asscher.png" alt="asscher"></span><span>Asscher</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/marquise.png" alt="marquise"></span><span>Marquise</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/oval.png" alt="oval"></span><span>Oval</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/cushion.png" alt="cushion"></span><span>Cushion</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/radiant.png" alt="radiant"></span><span>Radiant</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/pear-v2.png" alt="pear"></span><span>Pear</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/emerald.png" alt="emerald"></span><span>Emerald</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/heart.png" alt="heart_tn"></span><span>Heart</span></li><li><span class="popup-Dimond-Sketch"><img src="'+imageUrl+'/princess.png" alt="princess"></span><span>Princess</span></li></ol></div>',
      price: "<p>This refer to different type of Price to filter and select the appropriate ring as per your requirements. Look for best suit price of your chosen ring.</p>",
      metalType: "<p>This refer to different type of Metal Type to filter and select the appropriate ring as per your requirements. Look for a metal type best suit of your chosen ring.</p>",
      collections: "",
      mined: "<p>Formed over billions of years, natural diamonds are mined from the earth. Diamonds are the hardest mineral on earth, which makes them an ideal material for daily wear over a lifetime. Our natural diamonds are conflict-free and GIA certified.</p>",
      labgrown: "<p>Lab-grown diamonds are created in a lab by replicating the high heat and high pressure environment that causes a natural diamond to form. They are compositionally identical to natural mined diamonds (hardness, density, light refraction, etc), and the two look exactly the same. A lab-grown diamond is an attractive alternative for those seeking a product with less environmental footprint.</p>",
    };
    return contents[filterType] || "Information not available.";
  };

  // popup - use this for setting the content
  const handleInfoClick = (filterType) => {
    const content = getPopupContent(filterType);
    setPopupContent(content);
  };

  const closePopup = () => {
    setPopupContent(null);
  };

  // Scroll functions for filter options container
  const checkScrollVisibility = () => {
    if (filterContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = filterContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (filterContainerRef.current) {
      filterContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (filterContainerRef.current) {
      filterContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll visibility when openFilter changes
  useEffect(() => {
    if (openFilter) {
      // Small delay to ensure DOM is updated
      setTimeout(checkScrollVisibility, 100);
    }
  }, [openFilter]);
 
  return (
    <div className={`SettingsFilterPanel ${className}`}>

      <div className="list-header">
        <div className="settingfilter-top">
          <b className="settings-founded">{totalSettings || 0} Settings Found</b>
          <div className="settings-sort">
            <div className="settings-sort-page">
              <div className="sort-by4">Sort by:</div>
              <select className='no-appearance' value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value)}>
                <option value="Low to High">Low to High</option>
                <option value="High to Low">High to Low</option>
                <option value="Newest">Newest</option>
              </select>
            </div>
            <div className="settings-sort-page">
              <div className="show7">Show:</div>
              <select className='no-appearance' value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))}>
                <option value={8}>8 per Page</option>
                <option value={12}>12 per Page</option>
                <option value={24}>24 per Page</option>
                <option value={48}>48 per Page</option>
              </select>
            </div>
          </div>
        </div>
        <div className="filters-setting">
          <div className="mid2">
            <div className="filters9">
              <div className="filters-wrapper1">
                <div className="filters-label">Filters:</div>
              </div>
              <div className="filter-container">
              {availableFilter.map((filter) => (
                <div key={filter} className="filter-dropdown">
                  <button
                    className={`filter-button ${openFilter === filter ? 'active' : ''}`}
                    onClick={() => toggleFilter(filter)}
                  >
                    <div className="filter-label">{filter!=="metalType" ? (filter.charAt(0).toUpperCase() + filter.slice(1)):"Metal Type"}</div>
                    <ChevronDown size={16} />
                   
                  </button>
                  {(configAppData.show_filter_info === "true" || configAppData.show_filter_info == 1) && (filter === 'price' || filter === 'metalType' || filter === 'shapes') &&
                    <div className={filter === 'shapes' ? "shape-info1" : filter === 'price' ? "empty-options" : "border--round"}>
                      <b className="filter--hover-icon" onClick={(e) => {
                        e.stopPropagation();
                        handleInfoClick(filter);
                      }}>i</b>
                    </div>
                  }
                  {activeFilters[filter].length > 0 && (
                  <div className="shape-placeholder">
                          <b className="placeholder1">{activeFilters[filter].length}</b>
                        </div>  )}
                </div>
              ))}
              {filterData.priceRange.length > 0 &&
                <div className="filter-dropdown">
                  <button
                    className={`filter-button ${openFilter === 'price' ? 'active' : ''}`}
                    onClick={() => toggleFilter('price')}
                  >
                    <div className="filter-label">Price</div>
                    <ChevronDown size={16} />
                  </button>
                  {(configAppData.show_filter_info === "true" || configAppData.show_filter_info == 1) &&
                    <div className="empty-options">
                      <b className="filter--hover-icon" onClick={(e) => {
                        e.stopPropagation();
                        handleInfoClick('price');
                      }}>i</b>
                    </div>
                  }
                </div>
              }
            </div>
              {filterData.priceRange.length > 0 &&
              <div className="actions13">
                <button className="button30 relative" onClick={saveFilters} title="Save" data-position="top">
                  <BookmarkMinus size={16} />
                  <span className="hidden">Save Filters</span>
                </button>
                <button className="button31 relative" title="Reset" data-position="top" onClick={() => {
                  confirmReset();
                  setPriceRange([filterData.priceRange[0].minPrice, filterData.priceRange[0].maxPrice]);
                }}>
                  <RotateCcw size={16} />
                  <span className="hidden">Reset the Filter</span>
                </button>
              </div>
               }
            </div>
           
            <div className="search6">
              <div className="gf-search-input">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onKeyUp={(e)=>searchSetting(e)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                 // applyFilters({ ...activeFilters, search: e.target.value });
                }}
                className="search7"
              />
            </div>
          </div>
        </div>
        <div className="filters-label searchView">{showFilterDetails}</div>
      {popupContent && (
        <PopupAlert content={popupContent} onClose={closePopup} />
      )}
      </div>
      {!isMobile && openFilter && (
        <div className={`filter-options-container ${openFilter === 'price' ? 'priceFilterBox' : ''}`}>
          {/* Left scroll arrow */}
          {showLeftArrow && openFilter !== 'price' && (
            <button 
              className="scroll-arrow scroll-arrow-left" 
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          
          {/* Filter options with scrollable container */}
          <div 
            className={`filter-options-scrollable ${openFilter === 'price' ? 'price-filter-content' : ''}`}
            ref={filterContainerRef}
            onScroll={checkScrollVisibility}
          >
            {openFilter === 'collections' && filterData.collections && filterData.collections.map(collection => (
              <FilterOptionCollection
                key={collection.collectionName}
                label={collection.collectionName}              
                icon={collection.collectionImage}
                isActive={activeFilters.collections.includes(collection.collectionName)}
                onClick={() => toggleFilterOption('collections', collection.collectionName)}
                isCollectionisActive={collection.isActive}
              />
            ))}
            {openFilter === 'metalType' && filterData.metalType && filterData.metalType.length>0 && filterData.metalType.map(metal => (
              <FilterOptionMetal
                key={metal.metalType}
                label={metal.metalType}
                isActive={activeFilters.metalType.includes(metal.metalType)}
                onClick={() => toggleFilterOption('metalType', metal.metalType)}
              />
            ))}
            {(openFilter === 'shapes' && filterData.shapes ) && filterData.shapes.map(shape => (
              <FilterOption
                key={shape.shapeName}
                label={shape.shapeName}
                icon={"f_"+(shape.shapeName).toLowerCase()+".svg"}
                isActive={activeFilters.shapes.includes(shape.shapeName)}
                onClick={() => toggleFilterOption('shapes', shape.shapeName)}
                selectedDiamondShape={selectedDiamondShape}
                filterType={'shapes'}
              />
            ))}
            {openFilter === 'price' && (
              <div className="filter-options">
                <MultiRangeSlider
                  min={parseFloat(filterData.priceRange[0].minPrice)}
                  max={parseFloat(filterData.priceRange[0].maxPrice)}
                  onChange={handlePriceChange}
                  value={priceRange}
                  step={'stepby1'}
                  currencyToShow = {currencyToShow}
                  currencyPosition={configAppData.price_row_format}
                />
              </div>
            )}
          </div>
          
          {/* Right scroll arrow */}
          {showRightArrow && openFilter !== 'price' && (
            <button 
              className="scroll-arrow scroll-arrow-right" 
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
        
      )}
      {isMobile && activeModal && (
        <FilterModal
          isOpen
          title={activeModal === 'metalType' ? 'Metal Type' : activeModal.charAt(0).toUpperCase() + activeModal.slice(1)}
          onClose={() => setActiveModal(null)}
          onApply={() => setActiveModal(null)}
          onReset={() => resetCurrentFilter(activeModal)}
        >
          <div className={`filter-options-container ${activeModal === 'price' ? 'priceFilterBox' : ''}`}>
            {activeModal === 'collections' && filterData.collections && filterData.collections.map(collection => (
              <FilterOptionCollection
                key={collection.collectionName}
                label={collection.collectionName}              
                icon={collection.collectionImage}
                isActive={activeFilters.collections.includes(collection.collectionName)}
                onClick={() => toggleFilterOption('collections', collection.collectionName)}
                isCollectionisActive={collection.isActive}
              />
            ))}
            {activeModal === 'metalType' && filterData.metalType && filterData.metalType.length>0 && filterData.metalType.map(metal => (
              <FilterOptionMetal
                key={metal.metalType}
                label={metal.metalType}
                isActive={activeFilters.metalType.includes(metal.metalType)}
                onClick={() => toggleFilterOption('metalType', metal.metalType)}
              />
            ))}
            {(activeModal === 'shapes' && filterData.shapes ) && filterData.shapes.map(shape => (
              <FilterOption
                key={shape.shapeName}
                label={shape.shapeName}
                icon={"f_"+(shape.shapeName).toLowerCase()+".svg"}
                isActive={activeFilters.shapes.includes(shape.shapeName)}
                onClick={() => toggleFilterOption('shapes', shape.shapeName)}
                selectedDiamondShape={selectedDiamondShape}
                filterType={'shapes'}
              />
            ))}
            {activeModal === 'price' && filterData.priceRange.length > 0 && (
              <div className="filter-options price-filter-content">
                <MultiRangeSlider
                  min={parseFloat(filterData.priceRange[0].minPrice)}
                  max={parseFloat(filterData.priceRange[0].maxPrice)}
                  onChange={handlePriceChange}
                  value={priceRange}
                  step={'stepby1'}
                  currencyToShow={currencyToShow}
                  currencyPosition={configAppData.price_row_format}
                />
              </div>
            )}
          </div>
        </FilterModal>
      )}
      <div className="filters-label searchView">{showFilterDetails}</div>
    </div>
  );
};

SettingsFilterPanel.propTypes = {
  className: PropTypes.string,
  filterData: PropTypes.shape({
    collections: PropTypes.array,
    metalType: PropTypes.array,
    shapes: PropTypes.array,
    priceRange: PropTypes.array,
    totalCount: PropTypes.number
  }),
  isLabGrown: PropTypes.bool.isRequired,
  setIsLabGrown: PropTypes.func.isRequired,
  totalSettings: PropTypes.number.isRequired,
  applyFilters: PropTypes.func.isRequired,
  sortOrder: PropTypes.string.isRequired,
  onSortOrderChange: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
  activeFilters: PropTypes.object.isRequired,
  resetFilters: PropTypes.func.isRequired,
  saveFilters: PropTypes.func.isRequired
};

export default SettingsFilterPanel;