import React, { useState, useCallback, useEffect, useContext } from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import DealerInfo from "../components/dealer-info";
import PortalPopup from "../components/portal-popup";
import SettingDetails1 from "../components/setting-details1";
import Header from '../components/Header';
import Stats from "../components/stats";
import Top1 from "../components/top1";
import Review from "../components/review";
import RingSpecificationsPopup from "../components/RingSpecificationsPopup";
import DropHintPopup from "../components/DropHintPopup";
import ScheduleViewingPopup from "../components/ScheduleViewingPopup";
import RequestInfoPopup from "../components/RequestInfoPopup";
import EmailFriendPopup from "../components/EmailFriendPopup";
import { diamondService } from '../Services';
import { BASE_URL, DEALER_ID } from '../components/api';
import Skeleton from 'react-loading-skeleton';
import AlertPopUp from "../components/AlertPopUp";
// import "react-loading-skeleton/dist/skeleton.css";
import PdpLoader from '../components/PdpLoader'
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import "./setting-page.css";
import ShowCostInCard from "../components/showCostInCard";
import SocialIcon from "../components/SocialIcon";
import Footer from "../components/Footer"
import { settingService } from '../Services';
import VideoModal from "../components/VideoModal";
import { ConfigContext } from "../components/Context"
import { utils } from "../Helpers";
import ShowError from "../components/ShowError";
import VideoTryOn from "../components/VideoTryOn";
import VideoPopup from "../components/VideoPopup";
import Settingsbreadcrumb from "../components/Settingsbreadcrumb";
import { X } from 'lucide-react';
import '../components/PopupAlert.css';
import { fetchWrapper, resolveJcVideoBase } from "../Helpers";
const SettingPage = ({ formSetting, settingNavigationData, isLabGrown, shopUrl, configAppData, setIsLabGrown, setShowLoading, setDocumentLoaded }) => {
  const dealerIdShop = useContext(ConfigContext);
  const { settingId } = useParams();
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false);
  const [showVirtualTryOnUrl, setShowVirtualTryOnUrl] = useState('');
  const [product, setProduct] = useState(null);
  const [isDealerInfoOpen, setIsDealerInfoOpen] = useState(false);
  const [isSettingDetailsOpen, setSettingDetailsOpen] = useState(false);
  const [isRingSpecsOpen, setIsRingSpecsOpen] = useState(false);
  const [isDropHintOpen, setIsDropHintOpen] = useState(false);
  const [isScheduleViewingOpen, setIsScheduleViewingOpen] = useState(false);
  const [isEmailAFriendOpen, setIsEmailAFriendOpen] = useState(false);
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [selectedMetalType, setSelectedMetalType] = useState("");
  const [selectedSideStoneQuality, setSelectedSideStoneQuality] = useState("");
  const [selectedCenterStoneSize, setSelectedCenterStoneSize] = useState("");
  const [selectedRingSize, setSelectedRingSize] = useState("");
  const [selectedDiamondType, setSelectedDiamondType] = useState(isLabGrown ? 'Mined' : 'Lab Grown');
  const [showAlertPopUp, setshowAlertPopUp] = useState(false);
  const [reviews, setReviews] = useState([]);
  //const [settingNavigation, setSettingNavigation] = useState(settingNavigationData);
  const [navigation, setNavigation] = useState("");
  const [loading, setLoading] = useState(true);
  const [uniqueCenterStoneSizes, setUniqueCenterStoneSizes] = useState([]);
  //const [socialIconSetting,setSocialIconSetting] = useState(socialIconSettingData);
  const [selectedDiamondShape, setSelectedDiamondShape] = useState("");
  const [settingIdToShow, setSettingIdToShow] = useState(settingId.substring(settingId.lastIndexOf("-") + 1));
  const [configurableProduct, setConfigurableProduct] = useState([]);
  const [selectedParam, setSelectedParam] = useState('');
  const [uniqueSideStoneQualities, setUniqueSideStoneQualities] = useState([]);
  const [uniqueDiamondShape, setUniqueDiamondShape] = useState([]);
  const [isDiamondSelectedFirst, setIsDiamondSelectedFirst] = useState(false);
  const [notFitMessage, setNotFitMessage] = useState('');
  const [isPrintInfoOpen, setIsPrintInfoOpen] = useState(false);
  const [dealerId, setDealerId] = useState(dealerIdShop);
  const [diamondNavigation, setDiamondNavigation] = useState([]);
  const [isDiamondNavLoaded, setIsDiamondNavLoaded] = useState(false);
  const imageUrl = `${getImageBaseUrl()}`;
  const settingUrl = `${import.meta.env.VITE_SETTINGS_DETAIL_PAGE}`;
  const [error, setError] = useState(null);
  const videoApiBase = resolveJcVideoBase(configAppData);
  //console.log(shopUrl+location.pathname)
  //console.log(window.location)
  //const [selectedRingSize,setSelectedRingSize]= useState('');
  useEffect(() => {

    let selecteddiamond = JSON.parse(localStorage.getItem('selectedDiamond'));
    //console.log(selecteddiamond)
    if (selecteddiamond) {

      if (selecteddiamond.diamondId && selecteddiamond.diamondId != "") {
        setIsDiamondSelectedFirst(true)
      }
    }

    fetchProductDetails(settingIdToShow);
  }, [settingIdToShow]);
  useEffect(() => {
    async function fetchDiamondNavigation() {
      try {
        const res = await diamondService.getDiamondNavigation(configAppData.dealerid);
        if (res[0]) {
          //console.log(res[0])
          setDiamondNavigation(res[0]);
        }
        setIsDiamondNavLoaded(true);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch diamond navigation. Please try again later.");
      }
    }
    //localStorage.removeItem('selectedDiamond');

    window.scrollTo(0, 0);
    fetchDiamondNavigation();
    setDocumentLoaded(true)
  }, [])
  const handleVideoIconClick = async (settingId) => {
    console.log(settingId)
    setShowVideoPopup(false)
    try {
      if (!videoApiBase) {
        return;
      }
      const res = await fetchWrapper.get(`${videoApiBase}?InventoryID=${settingId}&Type=Jewelry`);
      if (res) {
        if (res.showVideo !== false) {
          setVideoUrl(res.videoURL);
          setShowVideoPopup(true);
        } else {
          setShowVideoPopup(false);
        }
      }
    }
    catch (error) {
      console.error("Error fetching video url:", error);
      setError("Failed to fetch video data. Please try again later.");
    }
  };
  const initProductTrackingPingback = async (productDetails, currentSettingId) => {
    try {
      if (!productDetails) return;

      const ipResponse = await fetch("https://geolocation-db.com/json/");
      const ipData = await ipResponse.json();
      const userIp = ipData?.IPv4 || "";

      const productPrice = productDetails.fltPrice ?? productDetails.cost ?? "";
      console.log(productDetails)
      const trackingUrl =
        `https://apps-api.jewelcloud.com/api/RingBuilder/ProductTracking?RetailerID=${configAppData?.dealerid || ""}` +
        `&VendorID=${productDetails?.retailerInfo?.retailerID || ""}` +
        `&GFInventoryID=${currentSettingId || ""}` +
        `&URL=${encodeURIComponent(window.origin)}` +
        `&UserIPAddress=${userIp}` +
        `&price=${encodeURIComponent(productPrice)}`;

      await fetch(trackingUrl, { method: "GET" });
    } catch (error) {
      console.error("Error posting product tracking pingback:", error);
    }
  };

  const fetchProductDetails = async (settingId) => {
    try {
      setShowLoading(true)
      const res = await settingService.getSettingDetail(settingId, configAppData.dealerid, isLabGrown, configAppData.shop);
      if (res) {
        if (selectedParam != "") {
          let url = utils.getUrl(res.metalType, res.settingName, settingId, 'details')
          //setViewUrlSetting(url)
          navigate('/' + settingUrl + '/' + url);
        }
        setProduct(res);
        setConfigurableProduct(res.configurableProduct);
        let selectedSetting = res.configurableProduct.filter(item => item.gfInventoryId === settingId);

        let dimondShapeAvailable = selectedSetting.length > 0 ? res.configurableProduct.filter(item => item.metalType === res.metalType && item.diamondShape !== null) : res.configurableProduct.filter(item => item.metalType === res.metalType && item.diamondShape !== null);

        //get all settings for seelcted metal type
        let filterByMetalType = [];

        // Check if we have a valid diamond shape to filter by
        const diamondShapeToFilter = selectedSetting.length > 0 && selectedSetting[0].diamondShape && selectedSetting[0].diamondShape.trim() !== '' ?
          selectedSetting[0].diamondShape : res.centerStoneFit;

        // Check if any items in configurableProduct actually have the diamond shape we want to filter by
        const itemsWithDiamondShape = res.configurableProduct.filter(item => item.diamondShape === diamondShapeToFilter);

        if (diamondShapeToFilter && diamondShapeToFilter.trim() !== '' && itemsWithDiamondShape.length > 0) {
          filterByMetalType = res.configurableProduct.filter(item => item.metalType == res.metalType && item.diamondShape == diamondShapeToFilter);
        } else {
          filterByMetalType = res.configurableProduct.filter(item => item.metalType == res.metalType);
        }

        //sort all settings according to stone size
        let sortedarray = filterByMetalType.sort((a, b) => a.centerStoneSize - b.centerStoneSize);

        let filterBySideStoneType = [];
        //selected setting-assign centerstone, side stone,diamond shape of selected setting.
        if (selectedSetting.length > 0) {
          setSelectedMetalType(res.metalType || "");
          setSelectedCenterStoneSize(selectedSetting[0].centerStoneSize || "");
          setSelectedSideStoneQuality(selectedSetting[0]['sideStoneQuality']);
          setSelectedDiamondShape(selectedSetting[0]['diamondShape']);
          setSelectedRingSize('');
          setSelectedDiamondType(res.isLabSetting ? 'Lab Grown' : 'Mined');
        } else {
          setSelectedMetalType(res.metalType || "");
          setSelectedDiamondShape(res.centerStoneFit);
          setSelectedDiamondType(res.isLabSetting ? 'Lab Grown' : 'Mined');
        }

        if (selectedSetting.length > 0) {
          if (selectedSetting[0]['sideStoneQuality'] != null) {
            filterBySideStoneType = filterByMetalType.filter(item => item.sideStoneQuality == selectedSetting[0]['sideStoneQuality']);
          }
        }

        let sortedarrayforSideStoneQuality = filterBySideStoneType.sort((a, b) => a.centerStoneSize - b.centerStoneSize);

        //available diamond shape for selected metal and center stone size 
        const allDiamondShape = dimondShapeAvailable ? [...new Set(dimondShapeAvailable.map(item => item.diamondShape))].filter(function (e) { return e }) : [];

        if (sortedarray.length > 0) {
          const uniqueSideStoneQualityArray = [...new Set(sortedarray.map(item => item.sideStoneQuality))].filter(function (e) { return e });

          let uniqueCenterStoneSizesArray = []
          if (uniqueSideStoneQualityArray.length > 0) {
            uniqueCenterStoneSizesArray = [...new Set(sortedarrayforSideStoneQuality.map(item => item.centerStoneSize))].filter(function (e) { return e });
          } else {
            uniqueCenterStoneSizesArray = [...new Set(sortedarray.map(item => item.centerStoneSize))].filter(function (e) { return e });
          }

          setUniqueCenterStoneSizes(uniqueCenterStoneSizesArray);
          setUniqueSideStoneQualities(uniqueSideStoneQualityArray);
          setUniqueDiamondShape(allDiamondShape);
        }
        setShowLoading(false);
        initProductTrackingPingback(res, settingId);
      } else {
        navigate("/settings");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setShowLoading(false);
    }
  };

  const selectByMetalType = async (metalValue) => {
    // Close video so the first image for the new metal type is shown immediately
    setShowVideoPopup(false);
    //get all settings where metal type is selected metal type.    
    var selectedMetalType = configurableProduct.filter(item => item.metalType == metalValue);

    //to get minimum price product sort it with ceterstone size and use the product with smallest stone size
    let sortedarray = selectedMetalType.sort((a, b) => a.centerStoneSize - b.centerStoneSize);
    setSelectedParam('metalType');

    // Update side stone qualities based on the newly selected metal type
    const uniqueSideStoneQualityArray = [...new Set(sortedarray.map(item => item.sideStoneQuality))].filter(function (e) { return e });
    setUniqueSideStoneQualities(uniqueSideStoneQualityArray);

    // Reset side stone quality selection when metal type changes
    setSelectedSideStoneQuality("");

    if (sortedarray.length > 0) {
      setSettingIdToShow(sortedarray[0].gfInventoryId);
    }
  }

  const selectByCenterStoneSize = async (size) => {
    setShowVideoPopup(false);
    setNotFitMessage('')
    setSelectedParam('centerStoneSize');
    let selectedCenterStoneSizeProduct = []
    if (uniqueSideStoneQualities.length > 0) {
      selectedCenterStoneSizeProduct = configurableProduct.filter(item => item.metalType == selectedMetalType && item.diamondShape == selectedDiamondShape && item.sideStoneQuality == selectedSideStoneQuality && item.centerStoneSize == size);
    } else {
      //show all products with selected metal type and selected center stone size 
      selectedCenterStoneSizeProduct = configurableProduct.filter(item => item.metalType == selectedMetalType && item.centerStoneSize == size && item.diamondShape == selectedDiamondShape);
    }
    if (selectedCenterStoneSizeProduct.length > 0) {
      setSettingIdToShow(selectedCenterStoneSizeProduct[0].gfInventoryId);
    }
    let selecteddiamond = JSON.parse(localStorage.getItem('selectedDiamond'));
    //console.log(selecteddiamond)
    if (selecteddiamond) {

      if (selecteddiamond.diamondId && selecteddiamond.diamondId != "") {
        if (configAppData.settings_carat_ranges) {
          let caratWeight = size;
          let carat_rang = configAppData.settings_carat_ranges[caratWeight];

          let min_range = ((carat_rang[0]) ? carat_rang[0] : (size - 0.1));
          let max_range = (($carat_rang[1]) ? carat_rang[1] : (size + 0.1));
          let caratWeightDiamond = selecteddiamond.caratWeight;
          if (product.measurement !== "") {
            if (caratWeightDiamond < min_range || caratWeightDiamond > max_range) {
              setNotFitMessage("This ring will not properly fit with selected diamond.");
            }
          }

        }
      }
    }
  }
  const selectByDiamondShape = async (shape) => {
    setShowVideoPopup(false);
    //console.log(shape)
    const size = selectedCenterStoneSize;
    //console.log(shape)
    //var selectedShapeProduct = configurableProduct.filter(item => item.metalType == selectedMetalType && item.diamondShape === shape && item.centerStoneSize == size);
    // let sortedarray = selectedShapeProduct.sort((a, b) => a.centerStoneSize - b.centerStoneSize);
    //newcode

    var selectedShapeProduct = configurableProduct.filter(item => item.metalType == selectedMetalType && item.diamondShape === shape);
    setSelectedParam('diamondShape');
    //console.log(selectedShapeProduct)
    let sortedarray = selectedShapeProduct.sort((a, b) => a.centerStoneSize - b.centerStoneSize);

    if (sortedarray.length > 0) {
      setSettingIdToShow(sortedarray[0].gfInventoryId);
    }
    //setSettingIdToShow(selectedShapeProduct[0].gfInventoryId)
  }
  const selectBysideStoneQuality = async (sideStoneQuality) => {
    setShowVideoPopup(false);
    var selectedSideStoneQualityProduct = configurableProduct.filter(item => item.metalType == selectedMetalType && item.sideStoneQuality === sideStoneQuality && item.diamondShape === selectedDiamondShape);
    let sortedarray = selectedSideStoneQualityProduct.sort((a, b) => a.centerStoneSize - b.centerStoneSize);
    setSelectedParam('sideStoneQuality');
    setSettingIdToShow(sortedarray[0].gfInventoryId)
  }
  const selectRingSetting = async () => {
    if (selectedRingSize === "") {
      setshowAlertPopUp(true)
    } else {
      localStorage.setItem('selectedRing', JSON.stringify({ settingId: settingIdToShow, ringSize: selectedRingSize, ringUrl: window.location.href }));
      const selectedDiamond = JSON.parse(localStorage.getItem('selectedDiamond'));
      if (selectedDiamond && selectedDiamond.diamondId) {
        navigate("/diamondtools/completering/");
      } else {

        localStorage.removeItem('saveDiamondFiltersMined');
        localStorage.removeItem('saveAdvanceDiamondFiltersMined');
        localStorage.removeItem('saveDiamondFiltersLab');
        localStorage.removeItem('saveAdvanceDiamondFiltersLab');
        localStorage.removeItem('saveDiamondFiltersfancy');
        localStorage.removeItem('saveAdvanceDiamondFiltersFancy');
        if (selectedDiamondType != 'Mined') {
          setIsLabGrown(true)
          navigate('/diamondtools/diamondtype/navlabgrown');
        } else {
          setIsLabGrown(false)
          navigate('/diamondtools');
        }
      }
    }
  }
  const onBreadContainerClick = useCallback(() => {
    navigate("/settings");
  }, [navigate]);

  const showVirtualTryOnIframe = (stockNumber) => {
    const baseUrl = `https://cdn.camweara.com/gemfind/index_client.php?company_name=Gemfind&ringbuilder=1&skus=${stockNumber}&buynow=0`;
    const overrideCss = utils.getTryOnOverrideCssUrl();
    const url = overrideCss ? `${baseUrl}&custom_css=${encodeURIComponent(overrideCss)}` : baseUrl;
    setShowVirtualTryOn(true);
    setShowVirtualTryOnUrl(url);
  };
  // const onButtonClick = useCallback(() => {
  //   navigate("/diamond");
  // }, [navigate]);

  // const onButtonClick = useCallback(() => {
  //   navigate("/diamond");
  // }, [navigate]);

  if (!product) {
    return (
      <PdpLoader />
    );
  }

  const uniqueMetalTypes = product.configurableProduct ? [...new Set(product.configurableProduct.map(item => item.metalType))] : [];
  // const uniqueSideStoneQualities = product.configurableProduct ? [...new Set(product.configurableProduct.map(item => item.sideStoneQuality).filter(Boolean))] : [];
  //const uniqueCenterStoneSizes = product.configurableProduct ? [...new Set(product.configurableProduct.map(item => item.centerStoneSize))] : [];
  // const uniqueDiamondShape = product.configurableProduct?[...new Set(product.configurableProduct.map(item => item.diamondShape))].filter(function(e){return e}) : [];

  const images = [];
  if (product.extraImage && product.extraImage.length > 0) {
    images.push({
      original: product.mainImageURL,
      thumbnail: product.mainImageURL,
    });
    images.push(...product.extraImage.map((image) => ({
      original: image,
      thumbnail: image,
    })));
  } else if (product.mainImageURL) {
    images.push({
      original: product.mainImageURL,
      thumbnail: product.mainImageURL,
    });
  }

  const updatedConfigAppData = {
    ...configAppData,
    navStandard: configAppData.navStandard || "Mined",
    navLabGrown: configAppData.navLabGrown || "Lab Grown",
  };

  if (error) {
    return <ShowError error={error} />;
  }
  return (
    <>
      <div className="setting-page">
        <main className="main1">
          <div className="bread1">
            <div className="breadcrumb-item" onClick={onBreadContainerClick}>
              <img className="breadcrumb-separator-icon" alt="" src={`${imageUrl}` + "/vector-11.svg"} />
              <b className="back-to-all">Back to All Settings</b>
            </div>
          </div>
          <section className="bread-crumbs-container pdp_container">
            <div className="bread-crumbs pdp_content">
              <div className="pdp_image_item">
                <div className="image-container">
                  <div className="plp-image-gallery">
                    <div className="image-wrapper">
                      {showVideoPopup ? <div className="videoBox"><div className="videoWrapper"><video src={videoUrl} autoPlay loop></video></div></div> :
                        <ImageGallery key={product.settingId} items={images} showPlayButton={false} showNav={false} onErrorImageURL={imageUrl + '/no-image.jpg'} />}
                      <div
                        className="ring-items__item-video"
                        productid={product.settingId}
                        title={showVideoPopup ? "Close video" : "Play video"}
                      >
                        {showVideoPopup ? (
                          <X size={20} onClick={() => setShowVideoPopup(false)} aria-label="Close video" />
                        ) : (product.videoURL && product.videoURL !== "") ? (
                          <svg className="video-icon-setting-details" width="24" height="16" viewBox="0 0 24 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" onClick={() => handleVideoIconClick(product.settingId)}>
                            <path d="M23.7509 2.08727C23.5964 1.9957 23.4053 1.99213 23.2476 2.07813L17.741 5.08488V3.28079C17.7394 1.87732 16.6021 0.740008 15.1986 0.738419H2.54237C1.1389 0.740008 0.00158898 1.87732 0 3.28079V13.3192C0.00158898 14.7227 1.1389 15.86 2.54237 15.8616H15.1986C16.6021 15.86 17.7394 14.7227 17.741 13.3192V11.5479L23.2478 14.5546C23.4053 14.6406 23.5966 14.6373 23.7509 14.5457C23.9055 14.4539 24 14.2877 24 14.1083V2.52444C24 2.34488 23.9053 2.17883 23.7509 2.08727ZM16.7236 13.3194C16.7229 14.1616 16.0404 14.8438 15.1982 14.8448H2.54237C1.70021 14.8438 1.01794 14.1616 1.01695 13.3194V3.28079C1.01794 2.43883 1.70021 1.75636 2.54237 1.75537H15.1986C16.0406 1.75636 16.7231 2.43883 16.724 3.28079L16.7236 13.3194ZM22.9831 13.2515L17.741 10.3893V6.24345L22.9831 3.38149V13.2515Z" fill="var(--beige-00)" />
                          </svg>
                        ) : (
                          <svg className="video-icon-setting-details" width="24" height="16" viewBox="0 0 24 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" onClick={() => handleVideoIconClick(product.settingId)}>
                            <path d="M23.7509 2.08727C23.5964 1.9957 23.4053 1.99213 23.2476 2.07813L17.741 5.08488V3.28079C17.7394 1.87732 16.6021 0.740008 15.1986 0.738419H2.54237C1.1389 0.740008 0.00158898 1.87732 0 3.28079V13.3192C0.00158898 14.7227 1.1389 15.86 2.54237 15.8616H15.1986C16.6021 15.86 17.7394 14.7227 17.741 13.3192V11.5479L23.2478 14.5546C23.4053 14.6406 23.5966 14.6373 23.7509 14.5457C23.9055 14.4539 24 14.2877 24 14.1083V2.52444C24 2.34488 23.9053 2.17883 23.7509 2.08727ZM16.7236 13.3194C16.7229 14.1616 16.0404 14.8438 15.1982 14.8448H2.54237C1.70021 14.8438 1.01794 14.1616 1.01695 13.3194V3.28079C1.01794 2.43883 1.70021 1.75636 2.54237 1.75537H15.1986C16.0406 1.75636 16.7231 2.43883 16.724 3.28079L16.7236 13.3194ZM22.9831 13.2515L17.741 10.3893V6.24345L22.9831 3.38149V13.2515Z" fill="var(--beige-00)" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="note-container-parent">
                  <div className="note-container">
                    <div className="note-content">
                      <b className="note">Note:</b>
                      <div className="all-metal-color">
                        All metal color images may not be available.
                      </div>
                    </div>
                  </div>
                  {product.internalUselink &&
                    <div className="link1">
                      <div className="dealer__info">
                        <span>{`Internal Use Only: `}</span>
                        <div className="dealer-info3" onClick={() => setIsDealerInfoOpen(true)}>
                          Click Here
                          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.5 10.2001V15.9688C16.4984 16.4407 16.3102 16.8928 15.9765 17.2265C15.6428 17.5602 15.1907 17.7484 14.7188 17.7501H2.03125C1.55934 17.7484 1.10723 17.5602 0.773536 17.2265C0.439843 16.8928 0.251647 16.4407 0.25 15.9688V3.28131C0.251647 2.8094 0.439843 2.35729 0.773536 2.0236C1.10723 1.6899 1.55934 1.50171 2.03125 1.50006H7.8C7.96576 1.50006 8.12473 1.56591 8.24194 1.68312C8.35915 1.80033 8.425 1.9593 8.425 2.12506C8.425 2.29082 8.35915 2.44979 8.24194 2.567C8.12473 2.68421 7.96576 2.75006 7.8 2.75006H2.03125C1.89035 2.75006 1.75523 2.80603 1.6556 2.90566C1.55597 3.00529 1.5 3.14041 1.5 3.28131V15.9688C1.5 16.1097 1.55597 16.2448 1.6556 16.3445C1.75523 16.4441 1.89035 16.5001 2.03125 16.5001H14.7188C14.8596 16.5001 14.9948 16.4441 15.0944 16.3445C15.194 16.2448 15.25 16.1097 15.25 15.9688V10.2001C15.25 10.0343 15.3158 9.87533 15.4331 9.75812C15.5503 9.64091 15.7092 9.57506 15.875 9.57506C16.0408 9.57506 16.1997 9.64091 16.3169 9.75812C16.4342 9.87533 16.5 10.0343 16.5 10.2001ZM17.125 0.250061H12.125C11.9592 0.250061 11.8003 0.315909 11.6831 0.433119C11.5658 0.55033 11.5 0.709301 11.5 0.875061C11.5 1.04082 11.5658 1.19979 11.6831 1.317C11.8003 1.43421 11.9592 1.50006 12.125 1.50006H15.6187L8.55625 8.55631C8.49767 8.61441 8.45117 8.68354 8.41944 8.7597C8.38771 8.83586 8.37138 8.91755 8.37138 9.00006C8.37138 9.08257 8.38771 9.16426 8.41944 9.24042C8.45117 9.31658 8.49767 9.38571 8.55625 9.44381C8.61435 9.50239 8.68348 9.54889 8.75964 9.58062C8.8358 9.61235 8.91749 9.62868 9 9.62868C9.08251 9.62868 9.1642 9.61235 9.24036 9.58062C9.31652 9.54889 9.38565 9.50239 9.44375 9.44381L16.5 2.38131V5.87506C16.5 6.04082 16.5658 6.19979 16.6831 6.317C16.8003 6.43421 16.9592 6.50006 17.125 6.50006C17.2908 6.50006 17.4497 6.43421 17.5669 6.317C17.6842 6.19979 17.75 6.04082 17.75 5.87506V0.875061C17.75 0.709301 17.6842 0.55033 17.5669 0.433119C17.4497 0.315909 17.2908 0.250061 17.125 0.250061Z" fill="#4B5ADE" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
              <div className="product-info-container-wrapper pdp_info_item">
                <div className="product-info-container">
                  <div className="info-wrapper">
                    <div className="info-content">
                      <div className="id-383212322-parent">
                        <div className="id-3832123221">Id: {product.settingId ? product.settingId : ''}</div>
                        <h1 className="product--title">{product.settingName ? product.settingName : ''}</h1>
                        <div className="product-specs">
                          <b className="spec-labels12 price-label-setting">Starting At - <ShowCostInCard settingDetailForCost={product} configAppData={configAppData}></ShowCostInCard></b>
                          <div className="spec-items1">
                            <div className="spec-items-child" />
                          </div>
                          {/*
                          <div className="shipping-header">
                            <div className="ships-by">Ships by:</div>
                          </div>
                          <div className="spec-items3">
                            <b className="monday-may-13">Monday, May 13</b>
                          </div>
                          <div className="spec-items1">
                            <div className="spec-items-child" />
                          </div>*/}
                          <div className="ships2" onClick={() => setIsRingSpecsOpen(true)}>
                            <div className="shipping-header">
                              <div className="ring-specifications">Ring Details</div>
                            </div>
                            <img className="group-icon2" loading="lazy" alt="" src={`${imageUrl}` + "/group.svg"} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="enim-at-fames">
                      {product.description ? (
                        /<[^>]*>/.test(product.description) ? (
                          <div dangerouslySetInnerHTML={{ __html: product.description }} />
                        ) : (
                          product.description
                        )
                      ) : ''}
                    </div>
                    {(!uniqueDiamondShape || uniqueDiamondShape.length === 0) && (
                      <div className="can-be-set-with details-settings-compatibility">
                        <div className="can-be-set-with-title">Can be set with</div>
                        <div className="can-be-set-with-box">
                          {product.centerStoneFit &&
                            product.centerStoneFit.split(",").map((item, index) => {
                              return (
                                <React.Fragment key={`canbesetwith_${index}`}>
                                  <div className="canbesetwithspace" key={'canbesetwith_' + index}>
                                    <p className="compatible-content"><img src={`${imageUrl + "/" + "f_" + (item).toLowerCase() + ".svg"}`}></img></p>
                                    <p className="compatible-content">{item}</p>
                                  </div>
                                </React.Fragment>)
                            })}
                        </div>
                        {/* Diamond shape icons */}
                      </div>
                    )}
                    {/* FORM DETAILS */}
                    <form action="" name="setting-details-form" className="setting-details-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        console.log({
                          metalType: selectedMetalType,
                          sideStoneQuality: selectedSideStoneQuality,
                          centerStoneSize: selectedCenterStoneSize,
                          ringSize: selectedRingSize,
                          diamondType: selectedDiamondType
                        });
                      }}>
                      <div className="setting-filters-data">
                        {uniqueMetalTypes.length > 0 &&
                          <div className="filter-opened2">
                            <div className="select-metal-type">Select Metal Type</div>
                            <div className="filter-opened3">
                              {uniqueMetalTypes.map((metal, index) => (
                                <div
                                  key={index}
                                  className={`metal-type ${selectedMetalType === metal ? 'active' : ''}`}
                                  onClick={() => selectByMetalType(metal)}
                                >
                                  <div className={`metal-icon ${utils.getMetalColorClass(metal)}`}>
                                    <div className="ring"></div>
                                  </div>
                                  <span className={`metal-name ${selectedMetalType === metal ? 'selected' : ''}`}>
                                    {metal}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        }
                        {uniqueDiamondShape.length > 0 && (
                          <div className="filter-opened4">
                            <div className="select-side-stone">Select Diamond Shape</div>
                            <div className="stone-quality">
                              {uniqueDiamondShape.map((shape, index) => (
                                <div
                                  key={index}
                                  className={`range10 ${selectedDiamondShape === shape ? 'active' : ''}`}
                                  onClick={() => selectByDiamondShape(shape)}
                                >
                                  <div className="txt10">{shape}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {uniqueSideStoneQualities.length > 0 && (
                          <div className="filter-opened4">
                            <div className="select-side-stone">Select Side Stone Quality</div>
                            <div className="stone-quality">
                              {uniqueSideStoneQualities.map((quality, index) => (
                                <div
                                  key={index}
                                  className={`range10 ${selectedSideStoneQuality === quality ? 'active' : ''}`}
                                  onClick={() => selectBysideStoneQuality(quality)}
                                >
                                  <div className="txt10">{quality}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="settingoptiondetails">
                          {/*uniqueCenterStoneSizes.length > 0 && (
                          <div className="filter-opened4 center-stone-selection">
                            <div className="select-side-stone">Select Center Stone Size(Ct)</div>
                            <div className="center-stone">
                              {uniqueCenterStoneSizes.map((size, index) => (
                                <button
                                  key={index}
                                  className={`range20 ${selectedCenterStoneSize === size ? 'active' : ''}`}
                                  onClick={() => selectByCenterStoneSize(size)}
                                >
                                  <div className="txt20">{size}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )} */}
                          {uniqueCenterStoneSizes.length > 0 && (
                            <div className="filter-opened4 center-stone-selection">
                              <div className="select-side-stone">Select Center Stone Size(Ct)</div>
                              <div className="center-stone">
                                <select
                                  className="no-appearance select--outline"
                                  value={selectedCenterStoneSize}
                                  onChange={(e) => selectByCenterStoneSize(e.target.value)}
                                >
                                  {uniqueCenterStoneSizes.map((size, index) => (
                                    <option
                                      key={index}
                                      value={size}
                                      className={`range20 ${selectedCenterStoneSize === size ? 'active' : ''}`}
                                    >
                                      {size}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}

                          {/* <div className="filter-opened6">
                          <div className="select-ring-size">Select Ring Size</div>
                          <div className="from-to4">
                            {product.ringSize && product.ringSize.map((size, index) => (
                              <option
                                key={index}
                                value={size}
                                className={`range25 ${selectedRingSize === size ? 'active' : ''}`}
                              >
                                {size}
                              </option>
                            ))}
                          </div>
                        </div> */}
                          <div className="filter-opened6">
                            <div className="select-ring-size">Select Ring Size</div>
                            <select
                              className="no-appearance select--outline"
                              value={selectedRingSize}
                              onChange={(e) => setSelectedRingSize(e.target.value)}
                            >
                              <option
                                key={'ringSize0'}
                                value={''}
                                className={`range25 ${selectedRingSize === '' ? 'active' : ''}`}
                              >
                                {'Ring Size'}
                              </option>
                              {product.ringSize && product.ringSize.map((size, index) => (
                                <option
                                  key={index}
                                  value={size}
                                  className={`range25 ${selectedRingSize === size ? 'active' : ''}`}
                                >
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>

                        </div>

                      </div>

                      {configAppData.announcement_text_rbdetail && (
                        <div className="filter-opened7">
                          <div className="select-side-stone"></div>
                          <div className="diamond-type-filter">{configAppData.announcement_text_rbdetail}</div>
                        </div>
                      )}

                      {notFitMessage && (
                        <div className="filter-opened7">
                          <div className="select-side-stone"></div>
                          <div className="diamond-type-filter">{notFitMessage}</div>
                        </div>
                      )}
                    </form>
                    <div className="actions1">
                      <div className="buttons1">
                        <div className="setting-price button52_b non-clickable">
                          <b className="setting-price-label"><ShowCostInCard settingDetailForCost={product} configAppData={configAppData}></ShowCostInCard></b>
                        </div>
                        <div className="primary-buttons">
                          {isDiamondSelectedFirst == false ?
                            <button type="button" className="button52" onClick={selectRingSetting} >
                              <b className="select-485">Add Your Diamond</b>
                            </button> :
                            <button type="button" className="button52" onClick={selectRingSetting} >
                              <b className="select-485">Complete Your Ring</b>
                            </button>
                          }
                          {configAppData.display_tryon == "1" && product.tryon == true &&
                            <button type="button" className="button52" onClick={() => showVirtualTryOnIframe(utils.getskuForVirtualTryOn(product.styleNumber))}>
                              <b className="select-485">Virtual Try On</b>
                            </button>}
                        </div>
                      </div>

                      <div className="social-icons-stroke"></div>

                      <SocialIcon socialIconSetting={formSetting}></SocialIcon>
                    </div>
                  </div>
                  <Stats
                    formSetting={formSetting}
                    configAppData={configAppData}
                    emailAFriend={() => setIsEmailAFriendOpen(true)}
                    openDropHint={() => setIsDropHintOpen(true)}
                    openScheduleViewing={() => setIsScheduleViewingOpen(true)}
                    openRequestInfo={() => setIsRequestInfoOpen(true)}
                    openPrintRequest={() => setIsPrintInfoOpen(true)}
                    showPrint={false}
                  />
                </div>
              </div>
            </div>
          </section>
          {/*<section className="reviews">
            <Top1 totalReviews={reviews.length} />
            <div className="reviews1">
              {reviews.map((review, index) => (
                <Review key={index} review={review} productName={product.settingName} />
              ))}
            </div>
          </section>*/}
        </main>

      </div>
      {isDealerInfoOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.3)"
          onOutsideClick={() => setIsDealerInfoOpen(false)}
        >
          <DealerInfo
            settingId={product.settingId}
            ringurl={shopUrl + location.pathname}
            shopurl={configAppData.shop}
            isLabSetting={product.isLabSetting}
            onClose={() => setIsDealerInfoOpen(false)}
            setShowLoading={setShowLoading} />
        </PortalPopup>
      )}
      {isSettingDetailsOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.3)"
          onOutsideClick={() => setSettingDetailsOpen(false)}
        >
          <SettingDetails1 onClose={() => setSettingDetailsOpen(false)} product={product} />
        </PortalPopup>
      )}
      {isRingSpecsOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.3)"
          onOutsideClick={() => setIsRingSpecsOpen(false)}
        >
          <RingSpecificationsPopup configAppData={configAppData} onClose={() => setIsRingSpecsOpen(false)} product={product} />
        </PortalPopup>
      )}
      {isDropHintOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.3)"
          onOutsideClick={() => setIsDropHintOpen(false)}
        >
          <DropHintPopup
            settingId={product.settingId}
            ringurl={window.location.href}
            shopurl={shopUrl}
            isLabSetting={product.isLabSetting}
            configAppData={configAppData}
            onClose={() => setIsDropHintOpen(false)}
            setShowLoading={setShowLoading}
            price={product.showPrice && product.cost ? String(product.cost) : ''}
            min_carat={product.centerStoneMinCarat || ''}
            max_carat={product.centerStoneMaxCarat || ''}
            metalType={product.metalType || ''}
            styleNumber={product.styleNumber || ''}
          />
        </PortalPopup>
      )}
      {isScheduleViewingOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.3)"
          onOutsideClick={() => setIsScheduleViewingOpen(false)}
        >
          <ScheduleViewingPopup
            settingId={product.settingId}
            SettingDetails={product}
            configAppData={configAppData}
            ringurl={window.location.href}
            shopurl={shopUrl}
            isLabSetting={product.isLabSetting}
            onClose={() => setIsScheduleViewingOpen(false)}
            setShowLoading={setShowLoading}
            locations={product.addressList ? product.addressList.map(address => address.locationName) : []}
            price={product.showPrice && product.cost ? String(product.cost) : ''}
            min_carat={product.centerStoneMinCarat || ''}
            max_carat={product.centerStoneMaxCarat || ''}
            metalType={product.metalType || ''}
            styleNumber={product.styleNumber || ''}
          />
        </PortalPopup>
      )}
      {isRequestInfoOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.3)"
          onOutsideClick={() => setIsRequestInfoOpen(false)}
        >
          <RequestInfoPopup
            onClose={() => setIsRequestInfoOpen(false)}
            settingId={product.settingId}
            configAppData={configAppData}
            ringurl={window.location.href}
            shopurl={shopUrl}
            isLabSetting={product.isLabSetting}
            setShowLoading={setShowLoading}
            price={product.showPrice && product.cost ? String(product.cost) : ''}
            min_carat={product.centerStoneMinCarat || ''}
            max_carat={product.centerStoneMaxCarat || ''}
            metalType={product.metalType || ''}
            styleNumber={product.styleNumber || ''}
          />
        </PortalPopup>
      )}
      {isEmailAFriendOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.3)"
          onOutsideClick={() => setIsEmailAFriendOpen(false)}
        >
          <EmailFriendPopup
            configAppData={configAppData}
            settingId={product.settingId}
            ringurl={window.location.href}
            shopurl={shopUrl}
            isLabSetting={product.isLabSetting}
            onClose={() => setIsEmailAFriendOpen(false)}
            setShowLoading={setShowLoading}
            price={product.showPrice && product.cost ? String(product.cost) : ''}
            min_carat={product.centerStoneMinCarat || ''}
            max_carat={product.centerStoneMaxCarat || ''}
            metalType={product.metalType || ''}
            styleNumber={product.styleNumber || ''}
          />
        </PortalPopup>
      )}
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
      {isPrintInfoOpen &&
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.3)"
          onOutsideClick={() => { setShowVirtualTryOnUrl(''); setShowVirtualTryOn(false) }}>
          <VideoPrint
            src={''}
            onClose={() => { setIsPrintInfoOpen(''); }}>

          </VideoPrint></PortalPopup>
      }
      {showAlertPopUp &&
        <AlertPopUp
          title={'Select Ring Size'}
          message={'Please select Ring Size.'}
          onClose={() => { setshowAlertPopUp(false) }}>
        </AlertPopUp>
      }
    </>
  );
};

export default SettingPage;