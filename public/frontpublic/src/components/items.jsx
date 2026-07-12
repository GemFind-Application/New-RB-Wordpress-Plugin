import React,{ useMemo,useState ,useEffect} from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./items.css";
import ShowCostInCardDiamond from "./showCostInCardDiamond";
import DiamondDetailsPopup from './DiamondItemPopup';
import VideoModal from "./VideoModal";
import { diamondService } from "../Services";
import { utils } from "../Helpers";

import { useNavigate } from 'react-router-dom';
const Items = ({ className = "",diamond ,addCompareDiamondIds,configAppData,additionOptionSetting,compareDiamondsId,isLabGrown,saveFiltersAfterDetails}) => {
const [showVideoPopup, setShowVideoPopup] = useState(false);
const [videoUrl, setVideoUrl] = useState('');
const [isDiamondPresentInCompare, setIsDiamondPresentInCompare] = useState(false);
const [showDetailsPopup, setShowDetailsPopup] = useState(false);
const [showPopupId, setShowPopupId] = useState(null);
const navigate = useNavigate();
const diamondDetailUrl= `${import.meta.env.VITE_DIAMOND_DETAIL_PAGE}`;
const imageUrl = `${getImageBaseUrl()}`;
useEffect(() => {   
  // Handle both old format (array of strings) and new format (array of objects)
  const isDiamondPresent = compareDiamondsId.some(item => {
    const itemId = typeof item === 'object' ? item.diamondId : item;
    return String(itemId) === String(diamond.diamondId);
  });
  setIsDiamondPresentInCompare(isDiamondPresent);
},[compareDiamondsId, diamond.diamondId])
  const handleVideoIconClick = async() => {
    setShowVideoPopup(false)
    try {     
      const res = await diamondService.getDiamondVideoUrl(diamond.diamondId);  
      if(res)     {
        if(res.showVideo !== false){
          setVideoUrl(res.videoURL);         
          setShowVideoPopup(true);          
        }else{
          setShowVideoPopup(false);
        }        
      }   
    }
    catch (error) {
      console.error("Error fetching filter data:", error);
      setError("Failed to fetch filter data. Please try again later.");
    }  
  };

  const toggleDetailsPopup = () => {
    //e.stopPropagation();
    setShowDetailsPopup(true);
    //setShowPopupId(id);
  };
  const hideDetailsPopup = () => {
   setShowDetailsPopup(false);
   // setShowPopupId(id);
  };

  return (
    <div className={`items ${className}`}>
      <div className="product-card">
        <div className="product-info1">
          <div className="product-name">
            <b className="princess-1001-carath5">{diamond.shape} {' '}{diamond.carat} CARAT</b>
          </div>
          <div className="actions10">
            {(diamond.hasVideo)&&
            <div className="actions11"
                 id={diamond.diamondId}
                 onClick={handleVideoIconClick}>
              <svg
                className="video-icon2" 
                width="24" 
                height="16" 
                title="video" 
                viewBox="0 0 24 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M23.7509 2.08727C23.5964 1.9957 23.4053 1.99213 23.2476 2.07813L17.741 5.08488V3.28079C17.7394 1.87732 16.6021 0.740008 15.1986 0.738419H2.54237C1.1389 0.740008 0.00158898 1.87732 0 3.28079V13.3192C0.00158898 14.7227 1.1389 15.86 2.54237 15.8616H15.1986C16.6021 15.86 17.7394 14.7227 17.741 13.3192V11.5479L23.2478 14.5546C23.4053 14.6406 23.5966 14.6373 23.7509 14.5457C23.9055 14.4539 24 14.2877 24 14.1083V2.52444C24 2.34488 23.9053 2.17883 23.7509 2.08727ZM16.7236 13.3194C16.7229 14.1616 16.0404 14.8438 15.1982 14.8448H2.54237C1.70021 14.8438 1.01794 14.1616 1.01695 13.3194V3.28079C1.01794 2.43883 1.70021 1.75636 2.54237 1.75537H15.1986C16.0406 1.75636 16.7231 2.43883 16.724 3.28079L16.7236 13.3194ZM22.9831 13.2515L17.741 10.3893V6.24345L22.9831 3.38149V13.2515Z" fill="currentColor"/>
              </svg>
            </div>
            }
            {/* Compare icons */}
            <div className="compare">
              {isDiamondPresentInCompare ? (
                <svg
                  className="compare-icon2 compared" 
                  alt="compared" 
                  onClick={()=>addCompareDiamondIds(diamond.diamondId, isLabGrown)}
                  width="40" 
                  height="41" 
                  viewBox="0 0 100 125" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M75.67932,82.87268c.39246,0,.78412-.01129,1.17273-.03375a18.99843,18.99843,0,0,0,14.564-8.23627,19.86175,19.86175,0,0,0,2.689-17.27838L78.6377,7.17523a3.09984,3.09984,0,0,0-5.92084.01074l-1.78595,5.79108L59.6015,15.65a10.98353,10.98353,0,0,0-20.57495,4.85871l-10.60406,2.502-1.14344-3.70795a3.09986,3.09986,0,0,0-5.92083.01062L5.8949,69.45166A19.86181,19.86181,0,0,0,8.584,86.73,18.99794,18.99794,0,0,0,23.1488,94.96643c.38752.02246.77918.03363,1.17188.03363q.58867,0,1.17267-.03363A18.99946,18.99946,0,0,0,40.0564,86.73a19.85921,19.85921,0,0,0,2.68982-17.27838L30.19507,28.75726l10.20349-2.40747a10.98331,10.98331,0,0,0,20.57465-4.8587l7.9071-1.86566L57.2536,57.32428a19.859,19.859,0,0,0,2.69006,17.27838,18.99872,18.99872,0,0,0,14.56507,8.23627Q75.09008,82.87262,75.67932,82.87268ZM37.01288,71.22028c.07953.258.12848.51977.19287.77972H11.43512c.06464-.26.11334-.52167.19311-.77972L24.32068,30.06537ZM50,25.99994a5,5,0,1,1,4.999-5A5.00546,5.00546,0,0,1,50,25.99994ZM62.98718,59.09277,75.65167,18.02783l.05176-.01214L88.37152,59.09277c.07977.25818.12879.51978.19342.77985H62.794C62.8584,59.61255,62.90765,59.351,62.98718,59.09277Z" fill="currentColor"/>
                </svg>
              ) : (
                <svg
                  className="compare-icon2 hide-when-filled"
                  title="compare"
                  onClick={()=>addCompareDiamondIds(diamond.diamondId, isLabGrown)}
                  width="40" 
                  height="41" 
                  viewBox="0 0 40 41" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.1244 13.6L11.8 13.6594C11.6688 13.6781 11.5563 13.7906 11.5188 13.9219L7.01875 28.7344C7 28.7719 7 28.8094 7 28.8469C7 31.5281 9.19375 33.7219 11.875 33.7219C14.5563 33.7219 16.75 31.5281 16.75 28.8469C16.75 28.8094 16.75 28.7719 16.7313 28.7344L12.3625 14.3344L12.3688 14.3332L12.1244 13.6ZM7.76875 29.2219C7.95625 31.3219 9.71875 32.9719 11.875 32.9719C14.0312 32.9719 15.7938 31.3219 15.9813 29.2219H7.76875ZM11.875 27.1594C11.0687 27.1594 10.3938 27.7219 10.225 28.4719H13.525C13.3562 27.7219 12.6813 27.1594 11.875 27.1594ZM14.275 28.4719H15.8687L11.875 15.3281L7.88125 28.4719H9.475C9.64375 27.3094 10.6562 26.4094 11.875 26.4094C13.0938 26.4094 14.0875 27.3094 14.275 28.4719Z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M29.1244 9.29998L28.8 9.35936C28.6688 9.37811 28.5563 9.49061 28.5188 9.62186L24.0188 24.4344C24 24.4719 24 24.5094 24 24.5469C24 27.2281 26.1937 29.4219 28.875 29.4219C31.5563 29.4219 33.75 27.2281 33.75 24.5469C33.75 24.5094 33.75 24.4719 33.7313 24.4344L29.3625 10.0344L29.3688 10.0332L29.1244 9.29998ZM24.7687 24.9219C24.9562 27.0219 26.7188 28.6719 28.875 28.6719C31.0312 28.6719 32.7938 27.0219 32.9813 24.9219H24.7687ZM28.875 22.8594C28.0687 22.8594 27.3938 23.4219 27.225 24.1719H30.525C30.3562 23.4219 29.6813 22.8594 28.875 22.8594ZM31.275 24.1719H32.8687L28.875 11.0281L24.8812 24.1719H26.475C26.6437 23.0094 27.6562 22.1094 28.875 22.1094C30.0938 22.1094 31.0875 23.0094 31.275 24.1719Z" fill="currentColor"/>
                  <circle cx="20.4995" cy="11.7999" r="3" transform="rotate(-15 20.4995 11.7999)" stroke="currentColor"/>
                  <path d="M12.1606 13.5169C11.8939 13.5884 11.7356 13.8626 11.8071 14.1293C11.8785 14.396 12.1527 14.5543 12.4194 14.4828L12.1606 13.5169ZM12.4194 14.4828L17.2491 13.1887L16.9903 12.2228L12.1606 13.5169L12.4194 14.4828Z" fill="currentColor"/>
                  <path d="M28.8399 10.0829C29.1066 10.0115 29.2649 9.73729 29.1935 9.47056C29.122 9.20383 28.8478 9.04554 28.5811 9.11701L28.8399 10.0829ZM24.0103 11.377L28.8399 10.0829L28.5811 9.11701L23.7514 10.4111L24.0103 11.377Z" fill="currentColor"/>
                </svg>
              )}
            </div>
            <div className="actions11 3dots" onClick={toggleDetailsPopup}>
              <svg
                className="vector-icon27" 
                title="more options" 
                width="20" 
                height="5" 
                viewBox="0 0 20 5" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 4.29999C11.1046 4.29999 12 3.40456 12 2.29999C12 1.19542 11.1046 0.299988 10 0.299988C8.89543 0.299988 8 1.19542 8 2.29999C8 3.40456 8.89543 4.29999 10 4.29999Z" fill="currentColor"/>
                <path d="M2 4.29999C3.10457 4.29999 4 3.40456 4 2.29999C4 1.19542 3.10457 0.299988 2 0.299988C0.89543 0.299988 0 1.19542 0 2.29999C0 3.40456 0.89543 4.29999 2 4.29999Z" fill="currentColor"/>
                <path d="M18 4.29999C19.1046 4.29999 20 3.40456 20 2.29999C20 1.19542 19.1046 0.299988 18 0.299988C16.8954 0.299988 16 1.19542 16 2.29999C16 3.40456 16.8954 4.29999 18 4.29999Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          {/* end diamond actions buttons */}
        </div>
        <div className="image-wrapper1">
          <div className="info-overlay">
            <img className="image-9-icon13" alt="" src={diamond.biggerDiamondimage} />
           
          </div>
        </div>
      </div>
      <div className="paction">
      <div className="down">
              <b className="empty3"><ShowCostInCardDiamond configAppData={configAppData} diamondDetail={diamond}></ShowCostInCardDiamond></b>
              <b className="vs2-excellent">{diamond.clarity}{diamond.polish && diamond.polish != '' && ', ' + diamond.polish}</b>
            </div>
            <div className="down2">
            <Link to={`/${diamondDetailUrl}/${utils.getDiamondViewUrl(diamond,isLabGrown)}`} onClick={() => saveFiltersAfterDetails()} className="diamond_item--link button40">Select - <ShowCostInCardDiamond diamondDetail={diamond} configAppData={configAppData}></ShowCostInCardDiamond></Link>
            </div>
      </div>
      {(showVideoPopup && videoUrl!="")  && (
        <VideoModal src={videoUrl} onClose={() => setShowVideoPopup(false)} />
      )}
      {showDetailsPopup && (
        <DiamondDetailsPopup 
          diamond={diamond} 
          configAppData={configAppData}
          additionOptionSetting={additionOptionSetting}
          onClose={() => hideDetailsPopup(false)} 
        />
      )}
    </div>
  );
};

Items.propTypes = {
  className: PropTypes.string,

};

export default Items;
