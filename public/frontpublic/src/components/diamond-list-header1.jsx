import React, { useState ,useEffect} from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import PropTypes from "prop-types";
import DiamondExpandDetail from "./diamond-expand-details";
import "./diamond-list-header1.css";
import ShowCostInCardDiamond from "./showCostInCardDiamond";
import VideoModal from "./VideoModal";
import { diamondService } from "../Services";
import { utils } from "../Helpers";
import { useNavigate } from 'react-router-dom';
const DiamondListHeader1 = ({ className = "", diamond ,isLabGrown ,configAppData,addCompareDiamondIds,compareDiamondsId,additionOptionSetting,saveFiltersAfterDetails}) => {
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDiamondPresentInCompare, setIsDiamondPresentInCompare] = useState(false);
  const imageUrl = `${getImageBaseUrl()}`;
  const navigate = useNavigate();
  useEffect(() => {   
    // Handle both old format (array of strings) and new format (array of objects)
    const isDiamondPresent = compareDiamondsId.some(item => {
      const itemId = typeof item === 'object' ? item.diamondId : item;
      return String(itemId) === String(diamond.diamondId);
    });
    setIsDiamondPresentInCompare(isDiamondPresent);
  },[compareDiamondsId, diamond.diamondId])
  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  const handleVideoIconClick = async(e) => {
    e.stopPropagation(); 
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
  const getdiamondDetail = (e)=>{
    saveFiltersAfterDetails();
    const diamondDetailUrl= `${import.meta.env.VITE_DIAMOND_DETAIL_PAGE}`;
    navigate("/"+ diamondDetailUrl+"/"+utils.getDiamondViewUrl(diamond,isLabGrown))
  }
  return (
    <div className={`diamond-list-header ${className}`} >
      <div className="diamond-card-details">
        <div className="diamond-details4 ddl_list ddl_w400" onClick={getdiamondDetail}>
          <img className="image-icon4" alt="" src={diamond.biggerDiamondimage} />
          <div className="name2">
            <b className="princess-1001-carath3">{diamond.shape} {' '}{diamond.carat} CARAT</b>
            <b className="diamond-weight-type"><ShowCostInCardDiamond configAppData={configAppData} diamondDetail={diamond}></ShowCostInCardDiamond></b>
          </div>
        </div>
        <div className="img ddl_list ddl_w150">
          <img className="union-icon" alt="" src={diamond.biggerDiamondimage} />
          <b className="princess1">{diamond.shape && diamond.shape !== "" ? diamond.shape : '-'}</b>
        </div>
        <div className="cell ddl_list ddl_w150">
          <div className="diamond-carat-info">
            <b className="diamond-carat-value f_50">{diamond.carat && diamond.carat !== "" ? diamond.carat : '-'}</b>
            <div className="carat2">{`Carat `}</div>
          </div>
          <div className="diamond-carat-info">
            <b className="diamond-carat-value f_50">{diamond.color && diamond.color !== "" ? diamond.color : '-'}</b>
            <div className="color3">Color</div>
          </div>
        </div>
        <div className="cell ddl_list ddl_w100">
          <div className="diamond-carat-info">
            <b className="vvs11">{diamond.clarity && diamond.clarity !== "" ? diamond.clarity : '-'}</b>
            <div className="clarity7"> Clarity</div>
          </div>
          <div className="diamond-carat-info">
            <b className="very-good5">{diamond.cut && diamond.cut !== "" ? diamond.cut : '-'}</b>
            <div className="cut8">Cut</div>
          </div>
        </div>
        <div className="cell ddl_list ddl_w100">
          <div className="diamond-table-value">
            <b className="diamond-table-label f_50">{diamond.table && diamond.table !== "" ? diamond.table + "%" : '-'}</b>
            <div className="table5">Table</div>
          </div>
          <div className="diamond-table-value">
            <b className="diamond-depth-label f_50">{diamond.depth && diamond.depth !== "" ? diamond.depth + "%" : '-'}</b>
            <div className="depth4">Depth</div>
          </div>
        </div>
        <div className="cell ddl_list ddl_w150">
          <div className="diamond-carat-info">
            <b className="very-good5">{diamond.symmetry && diamond.symmetry !== "" ? diamond.symmetry : '-'}</b>
            <div className="symmetry3"> Symmetry</div>
          </div>
          <div className="diamond-carat-info">
            <b className="very-good5">{diamond.polish && diamond.polish !== "" ? diamond.polish : '-'}</b>
            <div className="polish4">{`Polish `}</div>
          </div>
        </div>
        <div className="cell ddl_list ddl_w150">
        {additionOptionSetting.show_In_House_Diamonds_Column_with_SKU===true&&
        <>
            <div className="diamond-table-value">
              <b className="diamond-card-action">{diamond.inhouse ? (diamond.inhouse === "Yes" ? "In Store Now" : "By Request") : '-'}</b>
              <div className="intensity1">Availability</div>
            </div>
            <div className="diamond-table-value">     
            </div>
        </>
        }  
        </div>
        <div className="cell4">
          <b className="diamond-measurement-value">{` `}</b>
        </div>
        <div className="cell ddl_list ddl_w250">
          <div className="diamond-table-value">
            <b className="x371x2322">{diamond.measurement && diamond.measurement !== "" ? diamond.measurement : '-'}</b>
            <div className="measurement2">Measurement</div>
          </div>
          {
            isLabGrown === "fancy" && (
              <div className="diamond-table-value">
                <b className="diamond-card-action">{diamond.fancyColorIntensity && diamond.fancyColorIntensity !== null ? diamond.fancyColorIntensity + ' -': '-'}</b>
                <div className="intensity1">Intensity</div>
              </div>                  
            )
          }
        </div>
        <div className="actions3 ddl_list ddl_w150">
        {(diamond.hasVideo)&&
          <div className="actions4 list-diamond--video"  id={diamond.diamondId}
          onClick={(e)=>handleVideoIconClick(e)}>
            <img className="video-icon" alt="" src={`${imageUrl}`+"/video.svg"} />
          </div>
        }
          <div className="actions5 compare-list--diamond">
          {isDiamondPresentInCompare ? (
                <img 
                  className="compare-icon2 compared" 
                  alt="compared" 
                  src={`${imageUrl}`+"/compared.svg"}
                  onClick={(e)=>{e.stopPropagation();addCompareDiamondIds(diamond.diamondId, isLabGrown)}}
                />
              ) : (
                <img 
                  className="compare-icon2 hide-when-filled" 
                  alt="compare" 
                  src={`${imageUrl}`+"/compare.svg" }
                  onClick={(e)=>{e.stopPropagation();addCompareDiamondIds(diamond.diamondId, isLabGrown)}}
                />
              )}           
          </div>
          <div className="button25 show--more-diamond_info" onClick={(e)=>handleToggleExpand(e)}>
            <img 
              className="button-item" 
              alt="" 
              src={isExpanded ? `${imageUrl}`+ "/inverted-2-3.svg" : `${imageUrl}`+"/vector-2-3.svg"}
            />
          </div>
        </div>
      </div>
      {/* show the DiamondExpandDetail */}
      {isExpanded && (
        <div className="diamond-expand-detail-wrapper">
          <DiamondExpandDetail  configAppData={configAppData} diamond={diamond} getdiamondDetail={getdiamondDetail} isLabGrown={isLabGrown}/>
        </div>
      )}
       {(showVideoPopup && videoUrl!="")  && (
        <VideoModal src={videoUrl} onClose={() => setShowVideoPopup(false)} />
      )}
    </div>
  );
};

DiamondListHeader1.propTypes = {
  className: PropTypes.string,
  diamond: PropTypes.object.isRequired,
};

export default DiamondListHeader1;