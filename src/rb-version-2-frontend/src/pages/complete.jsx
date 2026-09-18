import { useState, useCallback ,useEffect} from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

import FrameComponent4 from "../components/frame-component4";
import FrameComponent3 from "../components/frame-component3";
import ProductDetails from "../components/product-details";
import "./complete.css";
import { diamondService } from "../Services";
import { settingService } from "../Services";
import ImageGallery from 'react-image-gallery';
import ShowError from "../components/ShowError";
import AlertPopUp from "../components/AlertPopUp";

const Complete = ({configAppData,formSetting,additionOptionSetting,shopUrl,isLabGrown,setShowLoading}) => {
  const navigate = useNavigate();
  const [settingId, setSettingId] = useState();
  const [diamondId, setDiamondId] = useState();
  const [settingDetail, setSettingDetail] = useState();
  const [diamondDetail, setDiamondDetail] = useState();
  const [selectedRingSize, setSelectedRingSize] = useState(7);
  const [images, setImages] = useState([]);
  const [issettingLoaded, setIssettingLoaded] = useState(false);
  const [isDiamondLoaded, setIsDiamondLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [resetTarget, setResetTarget] = useState('');
  const imageUrl = `${getImageBaseUrl()}`;
  const shopExtension = window.location.hostname === 'localhost' ? '' : `${import.meta.env.VITE_SHOP_EXTENSION}`;
 // const [isSettingAnDiamondIdLoaded, setIsSettingAnDiamondIdLoaded] = useState(false);
  const fetchDiamondDetails = async (diamondId,isLabGrown) => {
    try {
      const res = await diamondService.getDiamondDetail(diamondId,isLabGrown,configAppData.dealerid,configAppData.shop);  
      if(res) {
        setDiamondDetail(res);  
        setIsDiamondLoaded(true);
      }     
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError("Error fetching product details")
      //setShowLoading(false)
    }
  };
  const fetchSettingDetails = async (settingId) => {
    try {
      const res = await settingService.getSettingDetail(settingId,configAppData.dealerid,isLabGrown,configAppData.shop); 
      if(res) {
        setSettingDetail(res);  
        const images = [];        
        if (res.extraImage && res.extraImage.length > 0) {
          images.push({
            original: res.mainImageURL,
            thumbnail: res.mainImageURL,
          });
          images.push(...res.extraImage.map((image) => ({
            original: image,
            thumbnail: image,
          })));
        } else if (res.mainImageURL) {
          images.push({
            original: res.mainImageURL,
            thumbnail: res.mainImageURL,
          });
        }        
        setImages(images);
        setIssettingLoaded(true);
        //setShowLoading(false)
      }     
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError("Failed to fetch diamond details. Please try again later.");
      setShowLoading(false)
    }
  };
   useEffect(() => {
  
    let selectedRingSetting = JSON.parse(localStorage.getItem('selectedRing'));   
    if(selectedRingSetting) {
      
      if(selectedRingSetting.settingId &&  selectedRingSetting.settingId!=""){
        setShowLoading(true)
        setSettingId(selectedRingSetting.settingId);
        setSelectedRingSize(selectedRingSetting.ringSize);
        fetchSettingDetails(selectedRingSetting.settingId);  
        //setShowLoading(false)    
      }
    }
    let selecteddiamond = JSON.parse(localStorage.getItem('selectedDiamond'));
    if(selecteddiamond) {
      if(selecteddiamond.diamondId &&  selecteddiamond.diamondId!=""){
        setShowLoading(true)
        setDiamondId(selecteddiamond.diamondId);
        // Use stored isLabGrown from localStorage, fallback to prop if not stored
        // This ensures diamond details persist on page reload for all diamond types
        const storedIsLabGrown = selecteddiamond.isLabGrown !== undefined 
          ? selecteddiamond.isLabGrown 
          : isLabGrown;
        fetchDiamondDetails(selecteddiamond.diamondId, storedIsLabGrown);
        //setShowLoading(false)
      }
    }
    //setIsSettingAnDiamondIdLoaded(true)
  }, []); 
  useEffect(() => {
  if(issettingLoaded&&isDiamondLoaded){
    setShowLoading(false);
  }
   
    //setIsSettingAnDiamondIdLoaded(true)
  }, [issettingLoaded,isDiamondLoaded]); 
  if (error) {
    return <ShowError error={error}/>;
  }

  const handleNavigateToSettings = () => {
    // Navigate directly to settings without reset popup
    navigate(`/settings`, { replace: true });
  };

  const handleNavigateToDiamond = () => {
    // Navigate directly to diamond page without reset popup
    navigate(`/diamondtools`, { replace: true });
  };

  const handleResetConfirmation = (target) => {
    setResetTarget(target);
    setShowResetPopup(true);
  };

  const handleResetConfirm = () => {
    // Clear all pre-selected values from localStorage
    localStorage.removeItem('selectedRing');
    localStorage.removeItem('selectedDiamond');
    localStorage.removeItem('activeFilters');
    localStorage.removeItem('saveDiamondFiltersMined');
    localStorage.removeItem('saveAdvanceDiamondFiltersMined');
    localStorage.removeItem('saveDiamondFiltersLab');
    localStorage.removeItem('saveAdvanceDiamondFiltersLab');
    localStorage.removeItem('saveDiamondFiltersfancy');
    localStorage.removeItem('saveAdvanceDiamondFiltersFancy');
    localStorage.removeItem('diamondIdsToCompare');
    
    setShowResetPopup(false);
    
    // Navigate to the target page using React Router
    if (resetTarget === 'settings') {
      navigate(`/settings`, { replace: true });
    } else if (resetTarget === 'diamond') {
      navigate(`/diamondtools`, { replace: true });
    }
  };

  const handleResetCancel = () => {
    setShowResetPopup(false);
    setResetTarget('');
  };

  return (
    <div className="complete">
      <FrameComponent4 
        configAppData={configAppData}
        onNavigateToSettings={handleNavigateToSettings}
        onNavigateToDiamond={handleNavigateToDiamond}
      />
      <div className="pdp_container">
        <div className="pdp_content">
        {(settingId && diamondId) ?
        (issettingLoaded && isDiamondLoaded) &&
        <>
        <div className="pdp_image_item">
        <div className="image-container">
          <div className="plp-image-gallery">
            <div className="image-wrapper">
              <ImageGallery items={images} showPlayButton={false} showNav={false}  onErrorImageURL={imageUrl+'/no-image.jpg'}/>
            </div>               
          </div>
        </div>      
        </div>  
        <ProductDetails 
          setShowLoading={setShowLoading} 
          shopUrl={shopUrl} 
          additionOptionSetting={additionOptionSetting} 
          formSetting={formSetting} 
          settingDetail={settingDetail} 
          diamondDetail={diamondDetail} 
          ringSize={selectedRingSize} 
          configAppData={configAppData}
          onResetConfirmation={handleResetConfirmation}
        />
        </>
       :<>
        
        <div className="message-info">
            <div>Please select Ring and Diamond First</div>
        </div>
       </> 
      }
       
      </div>        
      </div>     
      
      {showResetPopup && (
        <AlertPopUp
          title="Reset"
          message="Do you really want to reset?"
          onClick={handleResetConfirm}
          onClose={handleResetCancel}
        />
      )}
    </div>
  );
};

export default Complete;
