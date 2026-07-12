import React, { useState, useRef ,useEffect} from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import PropTypes from "prop-types";
import "./product-items.css";
import { Link } from "react-router-dom";
import ShowCostInCard from "./showCostInCard";
import { fetchWrapper, utils, resolveJcVideoBase } from "../Helpers";
import { X } from 'lucide-react';
import './PopupAlert.css';
import VideoPopup from "./VideoPopup";
import { useNavigate } from "react-router-dom";
const SkeletonProductItem = () => (
  
  <div className="skeleton">
    <div className="ring-items__header skeleton-header">
      <div className="skeleton-title"></div>
      <div className="ring-items__wrapper">
        <div className="skeleton-icon"></div>
        <div className="skeleton-icon"></div>
      </div>
    </div>
    <div className="list-items-down-content-wrapper">
      <div className="list-items-down-content">
        <div className="skeleton-image"></div>
        <div className="product-footer">
          <div className="skeleton-price"></div>
          <div className="skeleton-button"></div>
        </div>
        <div className="btn__outer">
          <div className="skeleton-link"></div>
        </div>
      </div>
    </div>
  </div>
);

const ProductItems = ({ product, className = "", isLoading = false, onClick ,showVirtualTryOnIframe,filterMetalType,configAppData}) => {
  const navigate = useNavigate();
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const videoRef = useRef(null);
  const popupVideoRef = useRef(null);
  const [viewUrlSetting, setViewUrlSetting] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [countImg,setCountImg]=useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  
  const [imageToShowasMain, setImageToShowasMain] = useState(product.imageUrl);
  const settingUrl = `${import.meta.env.VITE_SETTINGS_DETAIL_PAGE}`;
  const imageUrl = `${getImageBaseUrl()}`;
  const [defaultImg,setdefaultImg]=useState(imageUrl+'/no-image.jpg');
  const [imagetoshow,setImagetoshow]=useState(product.imageUrl);
  const videoApiBase = resolveJcVideoBase(configAppData);
  //console.log(defaultImg)
  if (isLoading) {
    return <SkeletonProductItem />;
  }
  const handleVideoIconClick = async(settingId) => {
    setShowVideoPopup(false);
    setIsVideoLoading(true);
    try {     
      if (!videoApiBase) {
        setIsVideoLoading(false);
        return;
      }
      const res = await fetchWrapper.get(`${videoApiBase}?InventoryID=${settingId}&Type=Jewelry`);
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
      console.error("Error fetching video url:", error);
      setIsVideoLoading(false);
      setShowVideoPopup(false);
    }  
  };
 const closeVideo=(mainImage)=>{
  setImageToShowasMain(mainImage);         
  setShowVideoPopup(false);
  setIsVideoLoading(true);
  setVideoUrl('');
 }
 
 const handleVideoLoaded = () => {
   setIsVideoLoading(false);
 };
 
 const handleVideoError = () => {
   setIsVideoLoading(false);
   console.error("Error loading video");
 };
  useEffect(() => {    
    if(product.metalTypes.length > 0){
      let metalTypeForUrl = filterMetalType.length >0? filterMetalType[0] : product.metalTypes[0].metalType;    
      let url = utils.getUrl(metalTypeForUrl,product.name,product.priceSettingId)
      setViewUrlSetting(url)
    }else{
     let metalTypeForUrl ='n-a';    
      let url = utils.getUrl(metalTypeForUrl,product.name,product.priceSettingId)
      setViewUrlSetting(url)
    }
  
  }, []);

  const handleImageHover = () => {
    if (product.videoURL && videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleImageLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };
  const openDetailPage =(url)=>{
    navigate(url);
  }
  const showNewImage=(item)=>{
    const requestOptions = {
      method: 'GET', 
    }
    fetch(item,requestOptions)
    .then(function (response) {
      if(response.status==200)
      {
        setImageToShowasMain(item);
      }else{
        setImageToShowasMain(imageUrl+"/no-image1.jpg");
      }
      // The API call was successful!
      //return response.text();
    }).then(function (html) {      
      // Convert the HTML string into a document object
     // var parser = new DOMParser();
     // var doc = parser.parseFromString(html, 'text/html');
    //console.log(doc)
    //setDiamondContent(html)
    }).catch(function (err) {
      // There was an error
      console.warn('Something went wrong.', err);
    });
    //console.log(imagetoshow)
    //console.log(t);
    
  }

  return (
    <div className={`ring__items product-items ${className}`} >
      <div className="ring-items__header">
        <h2 className="product-title" onClick={()=>openDetailPage(`/${settingUrl}/${viewUrlSetting}`)}>{utils.truncateString(product.name)}</h2>
        <div className="ring-items__wrapper">
          <div 
            className="ring-items__item-video" 
            productid={product.settingId}
            
          >
            {(product.videoURL&&product.videoURL!="") && 
            showVideoPopup ?
            <X size={20} onClick={()=>closeVideo(product.imageUrl)}/>
           
          :<svg className="video-icon-product-items" width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={()=>handleVideoIconClick(product.settingId)}>
            <path d="M23.7509 2.08727C23.5964 1.9957 23.4053 1.99213 23.2476 2.07813L17.741 5.08488V3.28079C17.7394 1.87732 16.6021 0.740008 15.1986 0.738419H2.54237C1.1389 0.740008 0.00158898 1.87732 0 3.28079V13.3192C0.00158898 14.7227 1.1389 15.86 2.54237 15.8616H15.1986C16.6021 15.86 17.7394 14.7227 17.741 13.3192V11.5479L23.2478 14.5546C23.4053 14.6406 23.5966 14.6373 23.7509 14.5457C23.9055 14.4539 24 14.2877 24 14.1083V2.52444C24 2.34488 23.9053 2.17883 23.7509 2.08727ZM16.7236 13.3194C16.7229 14.1616 16.0404 14.8438 15.1982 14.8448H2.54237C1.70021 14.8438 1.01794 14.1616 1.01695 13.3194V3.28079C1.01794 2.43883 1.70021 1.75636 2.54237 1.75537H15.1986C16.0406 1.75636 16.7231 2.43883 16.724 3.28079L16.7236 13.3194ZM22.9831 13.2515L17.741 10.3893V6.24345L22.9831 3.38149V13.2515Z"/>
          </svg>
          }

          </div>
          <div className="ring-items__item-wishlist no-display" productid={product.settingId}>
            {/*<img className="heart-icon" alt="" src="/heart1.svg" />*/}
          </div>
        </div>
      </div>
      <div className="list-items-down-content-wrapper">
        <div className="list-items-down-content">
          <div 
            className="productImage"
            onMouseEnter={handleImageHover}
            onMouseLeave={handleImageLeave}
          >{showVideoPopup? <div className={`videoWrapper ${isVideoLoading ? 'video-loading' : 'video-loaded'}`}>
            <video 
              ref={popupVideoRef}
              src={videoUrl}  
              autoPlay 
              loop
              onLoadedData={handleVideoLoaded}
              onCanPlay={handleVideoLoaded}
              onError={handleVideoError}
            >
              Your browser does not support the video tag.
            </video>
          </div>:
           
            <img className="image-9-icon15" alt={product.name} src={imageToShowasMain}   onClick={()=>openDetailPage(`/${settingUrl}/${viewUrlSetting}`)}/>
            }
          </div>
          <div className="thumbnailBox">
          <ul className="itemHoverImage">
              <li><img loadig="lazy" src={product.imageUrl} alt="" height="75" width="75" 
               onMouseEnter={()=>showNewImage(product.imageUrl)}/></li>
              {
                product.extraImage &&
                product.extraImage.length >0 &&
                product.extraImage.map((item,index)=>{
                  if(index<=2 ){
                    return  <li><img loadig="lazy" 
                    src={item} 
                    alt="" 
                    height="75" 
                    width="75"  
                    onMouseEnter={()=>{showNewImage(item)}}  
                    onMouseLeave={()=>showNewImage(product.imageUrl)}
                    
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src=imageUrl+"/no-image.jpg";
                    
                      //currentTarget.onMouseEnter=null; 
                      //setImageToShowasMain(imageUrl+"/no-image.jpg")
                    }}
                    
                   /></li>
                  }
                 
                })

              }
             
            </ul>
          </div>
          <div className="paction">
            <div className="down">
            {product.showPrice && (
              <b className="empty3 settings-product-price"> <ShowCostInCard settingDetailForCost={product} configAppData={configAppData}></ShowCostInCard> <span className="settings-only">(Setting Only)</span></b>
            )}
            {configAppData.display_tryon == "1" &&
           <button className="virtual-try-on1" onClick={()=>showVirtualTryOnIframe(utils.getskuForVirtualTryOn(product.stockNumber))}>Virtual Try On</button>
            }
            </div>
            <div className="down2">
            <Link to={`/${settingUrl}/${viewUrlSetting}`} className="diamond_item--link button40">View Details</Link>
            {configAppData.display_tryon == "1" &&
           <button className="button40_b" onClick={()=>showVirtualTryOnIframe(utils.getskuForVirtualTryOn(product.stockNumber))}>Virtual Try On</button>
            }
            </div>
          </div>
        </div>
      </div>
    
    </div>
  );
};

ProductItems.propTypes = {
  product: PropTypes.shape({
    settingId: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    cost: PropTypes.number.isRequired,
    currencySymbol: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    videoURL: PropTypes.string,
    showPrice: PropTypes.bool.isRequired
  }).isRequired,
  className: PropTypes.string,
};

export default ProductItems;
