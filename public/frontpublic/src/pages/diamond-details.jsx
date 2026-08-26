import { useState, useCallback, useEffect } from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DealerInfo from "../components/dealer-info";
import PortalPopup from "../components/portal-popup";
import DiamondSpecificationDetail from "../components/diamond-specification-details";
import ImageGallery from 'react-image-gallery';
import MeasurementItems from "../components/measurement-items";
import Stats from "../components/stats";
import "./diamond-page.css";
import { cartService, diamondService } from "../Services";
import VideoDiamondTryOn from "../components/VideoDiamondTryOn";
//import PortalPopup from "./portal-popup";
import Header from "../components/Header";
import ShowCostInCardDiamond from "../components/showCostInCardDiamond";
import SocialIcon from "../components/SocialIcon";
import { utils, downloadDiamondPdf, downloadCertificatePdf } from "../Helpers";
import DropHintPopup from "../components/DropHintPopup";
import ScheduleViewingPopup from "../components/ScheduleViewingPopup";
import RequestInfoPopup from "../components/RequestInfoPopup";
import EmailFriendPopup from "../components/EmailFriendPopup";
import { settingService } from '../Services';
import ShowError from "../components/ShowError";
import CartSuccessModal from "../components/CartSuccessModal";

const DiamondPage = ({ formSetting, configAppData, additionOptionSetting, shopUrl, isLabGrown, setShowLoading }) => {

  // Helper function to determine diamond type
  // Prioritizes isLabGrown prop (used to fetch the diamond) as it's the most reliable source
  // Falls back to API response if prop is not available
  const getDiamondType = (diamondDetail) => {
    // Primary source: isLabGrown prop (most reliable since it's what we used to fetch the diamond)
    if (isLabGrown === true) {
      return 'labcreated';
    }

    if (isLabGrown === 'fancy') {
      return 'fancydiamonds';
    }

    // Fallback to API response if isLabGrown is false/undefined and diamondDetail is available
    if (diamondDetail) {
      if (diamondDetail.isLabCreated === true || diamondDetail.isLabCreated === 'true') {
        return 'labcreated';
      }

      if (
        diamondDetail.isfancy === true ||
        diamondDetail.isfancy === 'true' ||
        (diamondDetail.fancyColorIntensity && diamondDetail.fancyColorIntensity !== '') ||
        (diamondDetail.fancyColor && diamondDetail.fancyColor !== '')
      ) {
        return 'fancydiamonds';
      }
    }

    // Default to mined
    return 'mined';
  };

  const { diamondId } = useParams();
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false);
  const [showVirtualTryOnUrl, setShowVirtualTryOnUrl] = useState('');
  const [notFitMessage, setNotFitMessage] = useState([]);
  const [diamondDetail, setDiamondDetail] = useState({});
  const [isDiamondDetailLoaded, setIsAllDiamondDetailsLoaded] = useState(false);
  const [isDealerInfoOpen, setIsDealerInfoOpen] = useState(false);
  const [isDiamondDetailsOpen, setDiamondDetailsOpen] = useState(false);
  const [isSettingSelected, setIsSettingSelected] = useState(false);
  const [isDropHintOpen, setIsDropHintOpen] = useState(false);
  const [isScheduleViewingOpen, setIsScheduleViewingOpen] = useState(false);
  const [isEmailAFriendOpen, setIsEmailAFriendOpen] = useState(false);
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [diamondIdToShow, setDiamondIdToShow] = useState(() => utils.getDiamondIdFromSlug(diamondId));
  const [videoUrl, setVideoUrl] = useState('')
  const [images, setImages] = useState([]);
  const [showVideoPopup, setShowVideoPopup] = useState(false)
  const imageUrl = `${getImageBaseUrl()}`;
  const [error, setError] = useState(null);
  const [diamondContent, setDiamondContent] = useState('');
  const diamondDetailUrl = `${import.meta.env.VITE_DIAMOND_DETAIL_PAGE}`;
  const location = useLocation();
  const pathname = location.pathname;
  const lastSegment = pathname.substring(pathname.lastIndexOf('/') + 1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showCartSuccessModal, setShowCartSuccessModal] = useState(false);
  const [addedProductName, setAddedProductName] = useState('');
  const handleVideoIconClick = async (diamondId) => {
    //setShowVideoPopup(false)
    try {
      const res = await diamondService.getDiamondVideoUrl(diamondId);
      if (res) {
        if (res.showVideo !== false) {
          setVideoUrl(res.videoURL);
          //setShowVideoPopup(true);          
        } else {
          //setShowVideoPopup(false);
        }
      }
    }
    catch (error) {
      console.error("Error fetching filter data:", error);
      setError("Failed to fetch video data. Please try again later.");
    }
  };
  const navigate = useNavigate();
  const showVirtualTryOnIframe = (shape, caratweight) => {
    const url = `https://cdn.camweara.com/camweara_diamond/?company_name=gemfind&carat=${caratweight}&dshape=${shape}`;
    setShowVirtualTryOn(true);
    setShowVirtualTryOnUrl(url);
  };
  const initDiamondTrackingPingback = async (productDetails, currentDiamondId) => {
    try {
      if (!productDetails) return;

      const ipResponse = await fetch("https://geolocation-db.com/json/");
      const ipData = await ipResponse.json();
      const userIp = ipData?.IPv4 || "";

      const productPrice = productDetails.fltPrice ?? productDetails.cost ?? "";

      const trackingUrl =
        `https://apps-api.jewelcloud.com/api/DiamondLink/DiamondTracking?RetailerID=${configAppData?.dealerid || ""}` +
        `&VendorID=${productDetails?.retailerInfo?.retailerID || ""}` +
        `&DInventoryID=${currentDiamondId || ""}` +
        `&URL=${encodeURIComponent(window.origin)}` +
        `&UsersIPAddress=${userIp}` +
        `&Price=${encodeURIComponent(productPrice)}`;

      await fetch(trackingUrl, { method: "GET" });
    } catch (error) {
      console.error("Error posting diamond tracking pingback:", error);
    }
  };

  const fetchProductDetails = async (diamondId, isLabGrown) => {
    try {
      setShowLoading(true)
      setNotFitMessage("");
      // console.log("====="+isLabGrown)
      const res = await diamondService.getDiamondDetail(diamondId, isLabGrown, configAppData.dealerid, configAppData.shop);
      if (res) {
        setDiamondDetail(res);
        setIsAllDiamondDetailsLoaded(true);
        setShowLoading(false);
        handleVideoIconClick(diamondIdToShow)
        initDiamondTrackingPingback(res, diamondId);

        if (res.diamondId) {

          let selectedRingSetting = JSON.parse(localStorage.getItem('selectedRing'));
          if (selectedRingSetting) {
            if (selectedRingSetting.settingId && selectedRingSetting.settingId != "") {
              const resSetting = await settingService.getSettingDetail(selectedRingSetting.settingId, configAppData.dealerid, isLabGrown, configAppData.shop);

              if (resSetting) {

                let caratMax = "";
                let caratMin = "";
                if (resSetting.centerStoneMinCarat > '0.00') {
                  let tempCaratMin = (resSetting.centerStoneMinCarat * 10) / 100;
                  caratMin = (resSetting.centerStoneMinCarat - tempCaratMin);
                } else {
                  caratMin = res.caratWeight;
                }

                if (resSetting.centerStoneMaxCarat > '0.00') {
                  let tempCaratMin = (resSetting.centerStoneMaxCarat * 10) / 100;
                  caratMax = (resSetting.centerStoneMaxCarat - tempCaratMin);
                } else {
                  caratMax = resSetting.centerStoneMaxCarat;
                }
                if (res.measurement == "") {
                  if (res.caratWeight > caratMax || res.caratWeight < caratMin) {
                    setNotFitMessage("This ring will not properly fit with selected diamond.");
                  }
                }
              }
            }
          }
        }
      } else {
        navigate("/diamondtools");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError("Failed to fetch diamond data. Please try again later.");
      setShowLoading(false);
    }
  };
  // Print API — direct PDF download (no preview / print dialog).
  const handlePrintDetails = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowLoading(true);

    const diamondType = getDiamondType(diamondDetail);

    try {
      await downloadDiamondPdf(shopUrl, diamondDetail.diamondId, diamondType);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setShowLoading(false);
    }
  };

  useEffect(() => {
    const id = utils.getDiamondIdFromSlug(diamondId);
    setDiamondIdToShow(id);
    setIsAllDiamondDetailsLoaded(false);
    setDiamondDetail({});
    window.scrollTo(0, 0);
    fetchProductDetails(id, isLabGrown);
  }, [diamondId, isLabGrown]);
  // No automatic print-content fetch on load; download happens on click
  useEffect(() => {
    const images = [];
    if (diamondDetail.image2 && diamondDetail.image2 != '') {
      images.push({
        original: diamondDetail.image2,
        thumbnail: diamondDetail.image2,
      });
      images.push({
        original: diamondDetail.image1,
        thumbnail: diamondDetail.image1,
      }
      );
      videoUrl !== "" &&
        images.push({
          embedUrl: videoUrl,
          original: imageUrl + '/360-view.png',
          thumbnail: imageUrl + '/360-view.png',
          renderItem: renderVideo.bind(this),
        })
    } else if (diamondDetail.image1) {
      images.push({
        original: diamondDetail.image1,
        thumbnail: diamondDetail.image1,
      });
      images.push({
        original: diamondDetail.image1,
        thumbnail: diamondDetail.image1,
      }
      );
      videoUrl !== "" &&
        images.push({
          embedUrl: videoUrl,
          original: imageUrl + '/360-view.png',
          thumbnail: imageUrl + '/360-view.png',
          renderItem: renderVideo.bind(this),
        })
    }
    setImages(images);
  }, [diamondDetail, videoUrl]);
  useEffect(() => {
    let selectedRingSetting = JSON.parse(localStorage.getItem('selectedRing'));
    if (selectedRingSetting) {
      if (selectedRingSetting.settingId && selectedRingSetting.settingId != "") {
        setIsSettingSelected(true)
      }
    }

  }, [diamondId]);
  const onBreadContainerClick = useCallback(() => {
    navigate("/diamondtools");
  }, [navigate]);
  const renderVideo = (item) => {
    return (
      <div className="video-popup-content embed-responsive" >
        <iframe
          className="embed-responsive-4by3"
          title={item.embedUrl}
          height={'100%'}
          width={'100%'}
          allow={"autoplay"}
          src={item.embedUrl}
        />
      </div>
    )
  };
  const openDealerInfo = useCallback(() => {
    setIsDealerInfoOpen(true);
  }, []);

  const closeDealerInfo = useCallback(() => {
    setIsDealerInfoOpen(false);
  }, []);

  const openDiamondDetails = useCallback(() => {
    setDiamondDetailsOpen(true);
  }, []);

  const closeDiamondDetails = useCallback(() => {
    setDiamondDetailsOpen(false);
  }, []);
  const closeHint = useCallback(() => {
    setHintOpen(false);
  }, []);
  const closeSchedule = useCallback(() => {
    setScheduleOpen(false);
  }, []);
  const closeemailAFriend = useCallback(() => {
    setRequestInfoOpen(false);
  }, []);
  const closeRequestInfo = useCallback(() => {
    setRequestInfoOpen(false);
  }, []);
  const onButtonContainerClick = (diamondDetail) => {
    let isJsonString = utils.isJsonString(configAppData.settings_carat_ranges);
    //console.log(convertStringToArray)
    if (configAppData.settings_carat_ranges && isJsonString) {
      let caratWeight = diamondDetail.caratWeight;
      let convertStringToArray = JSON.parse(configAppData.settings_carat_ranges);

      let appConfigWeight = convertStringToArray[caratWeight];
      localStorage.setItem('selectedDiamond', JSON.stringify({ diamondId: diamondIdToShow, caratDetail: appConfigWeight, diamondUrl: window.location.href, isLabGrown: isLabGrown }));
    } else {
      let appConfigWeight = (Number(diamondDetail.caratWeight) - 0.1).toFixed(2) + "-" + (Number(diamondDetail.caratWeight) + 0.1).toFixed(2);
      //console.log(appConfigWeight)
      localStorage.setItem('selectedDiamond', JSON.stringify({ diamondId: diamondIdToShow, caratDetail: appConfigWeight, diamondUrl: window.location.href, isLabGrown: isLabGrown }));
    }
    // localStorage.setItem('selectedDiamond', JSON.stringify({diamondId:diamondIdToShow}));
    navigate("/diamondtools/completering");
  };
  //console.log(window.location.hostname + "/"+ diamondDetailUrl + location.pathname)
  const selectSetting = (diamondDetail) => {
    if (configAppData.settings_carat_ranges) {
      let caratWeight = diamondDetail.caratWeight;
      let appConfigWeight = configAppData.settings_carat_ranges[caratWeight];
      localStorage.setItem('selectedDiamond', JSON.stringify({ diamondId: diamondIdToShow, caratDetail: appConfigWeight, caratWeight: caratWeight, diamondUrl: window.location.href, isLabGrown: isLabGrown }));
    } else {
      let caratWeight = diamondDetail.caratWeight;
      let appConfigWeight = (Number(diamondDetail.caratWeight) - 0.1).toFixed(2) + "-" + (Number(diamondDetail.caratWeight) + 0.1).toFixed(2);
      //console.log(appConfigWeight)
      localStorage.setItem('selectedDiamond', JSON.stringify({ diamondId: diamondIdToShow, caratDetail: appConfigWeight, caratWeight: caratWeight, diamondUrl: window.location.href, isLabGrown: isLabGrown }));
    }
    navigate("/settings");
  }
  const addToCart = async (diamondDetail) => {
    setIsAddingToCart(true);
    setShowLoading(true);

    try {
      const result = await cartService.addDiamondToCart({
        diamondDetail,
        configAppData,
        isLabGrown,
      });

      if (result.mode === 'woocommerce') {
        cartService.redirectToCartUrl(result.cartUrl);
        return;
      }

      setAddedProductName(result.productTitle || diamondDetail.mainHeader || 'Product');
      setShowCartSuccessModal(true);
      setShowLoading(false);
      setIsAddingToCart(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setShowLoading(false);
      setIsAddingToCart(false);
      alert(typeof error === 'string' ? error : 'Failed to add item to cart. Please try again.');
    }
  }
  const handleCertificateDownload = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!diamondDetail?.certificateUrl) {
      alert('Certificate is not available. Please contact retailer.');
      return;
    }

    setShowLoading(true);
    const diamondType = getDiamondType(diamondDetail);

    try {
      await downloadCertificatePdf(shopUrl, diamondDetail.diamondId, diamondType, {
        filename: `Certificate-${diamondDetail.diamondId}.pdf`,
        certificateUrl: diamondDetail.certificateUrl,
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert(error?.message || 'Failed to download certificate. Please try again later.');
    } finally {
      setShowLoading(false);
    }
  };

  if (error) {
    return <ShowError error={error} />;
  }
  return (
    <>
      <div className="diamond-page">
        <main className="main main1">
          <div className="bread1">
            <div className="breadcrumb-item" onClick={onBreadContainerClick}>
              <img
                className="breadcrumb-separator-icon"
                loading="lazy"
                alt=""
                src={`${imageUrl}` + "/vector-11.svg"}
              />
              <b className="back-to-all">Back to All Diamonds</b>
            </div>
          </div>
          <section className="product pdp_container">
            <div className="product-details pdp_content">
              <div className="product-info pdp_image_item">
                <div className="image-container">
                  <div className="plp-image-gallery">
                    <div className="image-wrapper">
                      <ImageGallery items={images} autoPlay={false} showPlayButton={false} showNav={false} onErrorImageURL={imageUrl + '/no-image.jpg'} />
                    </div>
                  </div>
                </div>
                {diamondDetail.internalUselink &&
                  <div className="note-container-parent">
                    <div className="link1">
                      <div className="dealer__info">
                        <span>{`Internal Use Only: `}</span>
                        <div className="dealer-info3" onClick={() => setIsDealerInfoOpen(true)}>
                          Dealer Info
                          <svg width="14" height="14" style={{ marginLeft: '5px', marginTop: '3px' }} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.5 10.2001V15.9688C16.4984 16.4407 16.3102 16.8928 15.9765 17.2265C15.6428 17.5602 15.1907 17.7484 14.7188 17.7501H2.03125C1.55934 17.7484 1.10723 17.5602 0.773536 17.2265C0.439843 16.8928 0.251647 16.4407 0.25 15.9688V3.28131C0.251647 2.8094 0.439843 2.35729 0.773536 2.0236C1.10723 1.6899 1.55934 1.50171 2.03125 1.50006H7.8C7.96576 1.50006 8.12473 1.56591 8.24194 1.68312C8.35915 1.80033 8.425 1.9593 8.425 2.12506C8.425 2.29082 8.35915 2.44979 8.24194 2.567C8.12473 2.68421 7.96576 2.75006 7.8 2.75006H2.03125C1.89035 2.75006 1.75523 2.80603 1.6556 2.90566C1.55597 3.00529 1.5 3.14041 1.5 3.28131V15.9688C1.5 16.1097 1.55597 16.2448 1.6556 16.3445C1.75523 16.4441 1.89035 16.5001 2.03125 16.5001H14.7188C14.8596 16.5001 14.9948 16.4441 15.0944 16.3445C15.194 16.2448 15.25 16.1097 15.25 15.9688V10.2001C15.25 10.0343 15.3158 9.87533 15.4331 9.75812C15.5503 9.64091 15.7092 9.57506 15.875 9.57506C16.0408 9.57506 16.1997 9.64091 16.3169 9.75812C16.4342 9.87533 16.5 10.0343 16.5 10.2001ZM17.125 0.250061H12.125C11.9592 0.250061 11.8003 0.315909 11.6831 0.433119C11.5658 0.55033 11.5 0.709301 11.5 0.875061C11.5 1.04082 11.5658 1.19979 11.6831 1.317C11.8003 1.43421 11.9592 1.50006 12.125 1.50006H15.6187L8.55625 8.55631C8.49767 8.61441 8.45117 8.68354 8.41944 8.7597C8.38771 8.83586 8.37138 8.91755 8.37138 9.00006C8.37138 9.08257 8.38771 9.16426 8.41944 9.24042C8.45117 9.31658 8.49767 9.38571 8.55625 9.44381C8.61435 9.50239 8.68348 9.54889 8.75964 9.58062C8.8358 9.61235 8.91749 9.62868 9 9.62868C9.08251 9.62868 9.1642 9.61235 9.24036 9.58062C9.31652 9.54889 9.38565 9.50239 9.44375 9.44381L16.5 2.38131V5.87506C16.5 6.04082 16.5658 6.19979 16.6831 6.317C16.8003 6.43421 16.9592 6.50006 17.125 6.50006C17.2908 6.50006 17.4497 6.43421 17.5669 6.317C17.6842 6.19979 17.75 6.04082 17.75 5.87506V0.875061C17.75 0.709301 17.6842 0.55033 17.5669 0.433119C17.4497 0.315909 17.2908 0.250061 17.125 0.250061Z" fill="var(--backgroundtext)" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                }

              </div>
              <div className="specifications pdp_info_item">
                <div className="specs-container">
                  <div className="specs-content">
                    <div className="specs-details">
                      {diamondDetail.stockNumber !== "" &&
                        <div className="id-3832123221">{(additionOptionSetting.show_In_House_Diamonds_First) ?
                          "Stock Number: " + diamondDetail.stockNumber :
                          "SKU#: " + diamondDetail.diamondId}</div>}
                      <h1 className="product--title">
                        {/* {diamondDetail.shape} {' '}{diamondDetail.caratWeight} CARAT */}
                        {diamondDetail.mainHeader}
                      </h1>
                      <div className="specs-header">
                        <div className="header-items">
                          <span className="header-labels price-label">
                            <ShowCostInCardDiamond configAppData={configAppData} diamondDetail={diamondDetail} />
                          </span>
                        </div>
                        <div className="header-items1">
                          <div className="header-items-child" />
                        </div>
                        <div
                          className="ships diamond-details-link"
                          role="button"
                          tabIndex={0}
                          onClick={openDiamondDetails}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openDiamondDetails();
                            }
                          }}
                        >
                          <span className="back-to-all">Diamond Details</span>
                          <img
                            className="dd102d7"
                            loading="lazy"
                            alt=""
                            width="16"
                            height="16"
                            src={`${imageUrl}/group.svg`}
                          />
                        </div>
                        <div className="header-items1">
                          <div className="header-items-child" />
                        </div>

                        <div className="header-items3">

                          {(additionOptionSetting.show_Certificate_in_Diamond_Search && diamondDetail.certificateIconUrl != "") &&
                            <div className="diamond-grading-report"><a onClick={handleCertificateDownload} className={'diamondGradingReport'}>Diamond Grading Report: <span>View</span></a>
                            </div>
                          }
                        </div>

                      </div>
                    </div>
                    {(additionOptionSetting.show_Certificate_in_Diamond_Search && diamondDetail.certificateIconUrl != "") &&
                      <div className="certification">
                        <img
                          className="sertif-icon"
                          loading="lazy"
                          alt=""
                          src={diamondDetail.certificateIconUrl}
                        />
                        {diamondDetail.certificateUrl ?
                          <b className="this-i-color">
                            {diamondDetail.subHeader}
                          </b> :
                          <b className="this-i-color">Not available, please contact retailer.</b>
                        }
                      </div>
                    }
                  </div>
                  <div className="stats5">
                    <div className="summary-items">
                      <div className="shape1 si_label">Shape:</div>
                      <b className="princess si_value">{utils.displaySpecValue(diamondDetail.shape)}</b>
                    </div>
                    <div className="summary-items">
                      <div className="cut3 si_label">Cut:</div>
                      <b className="very-good2 si_value">{utils.displaySpecValue(diamondDetail.cut)}</b>
                    </div>
                    <div className="summary-items">
                      <div className="clarity2 si_label">Polish :</div>
                      <b className="very-good2 si_value">{utils.displaySpecValue(diamondDetail.polish)}</b>
                    </div>
                    <div className="summary-items">
                      <div className="symmetry2 si_label">Symmetry:</div>
                      <b className="very-good2 si_value">{utils.displaySpecValue(diamondDetail.symmetry)}</b>
                    </div>
                    <div className="summary-items">
                      <div className="intensity si_label">Intensity:</div>
                      <b className="b12 si_value">{utils.displaySpecValue(diamondDetail.fancyColorIntensity)}</b>
                    </div>
                  </div>
                  <div className="number2">
                    <MeasurementItems
                      fi8467779={`${imageUrl}` + "/fi-8467779.svg"}
                      measurementSubValues={diamondDetail.caratWeight && diamondDetail.caratWeight != "" ? diamondDetail.caratWeight : '-'}
                      depth="Carat"
                    />
                    <MeasurementItems
                      fi8467779={`${imageUrl}` + "/fi-12791189.svg"}
                      measurementSubValues={diamondDetail.clarity && diamondDetail.clarity != "" ? diamondDetail.clarity : '-'}
                      depth="Clarity"
                      propFlex="0.2357"
                    />
                    <MeasurementItems
                      fi8467779={`${imageUrl}` + "/fi-8052211.svg"}
                      measurementSubValues={diamondDetail.color && diamondDetail.color != "" ? diamondDetail.color : '-'}
                      depth="Color"
                      propFlex="1"
                    />

                  </div>
                  {configAppData.diamond_details_textarea &&
                    <div className="filter-opened7">
                      <div className="empty1">{configAppData.diamond_details_textarea}</div>
                    </div>
                  }
                  {notFitMessage && <div className="diamond-type-filter">{notFitMessage}</div>}
                </div>
                <div className="actions">
                  <div className="buttons">
                    <div className="button52_b non-clickable">
                      <b className="select-363440"><ShowCostInCardDiamond configAppData={configAppData} diamondDetail={diamondDetail}></ShowCostInCardDiamond></b>
                    </div>
                    <div className="primary-buttons">
                      {isSettingSelected === true ?
                        <div className="button52" onClick={() => onButtonContainerClick(diamondDetail)}>
                          <b className="select-363440">Complete Your Ring</b>
                        </div> :
                        <div className="button52" onClick={() => selectSetting(diamondDetail)}>
                          <b className="select-363440">Add Your Setting</b>
                        </div>}
                      {(() => {
                        return Number(configAppData?.buySingleDiamond) === 1;
                      })() && (
                          <div className="button52" onClick={() => addToCart(diamondDetail)}>
                            <b className="select-363440">Add To Cart</b>
                          </div>
                        )}
                      {utils.isDisplayTryOnEnabled(configAppData) &&
                        <div className="button52" onClick={() => showVirtualTryOnIframe(diamondDetail.shape, diamondDetail.caratWeight)}>
                          <b className="select-363440">Virtual Try On </b>
                        </div>
                      }
                    </div>

                    {/*<button className="button-fav">
                        <img className="heart-icon" alt="" src="/heart.svg" />
                        <b className="add-to-favorites">Add to Favorites</b>
                      </button>*/}
                  </div>
                  <SocialIcon socialIconSetting={formSetting}></SocialIcon>
                </div>
                <Stats
                  formSetting={formSetting}
                  configAppData={configAppData}
                  emailAFriend={() => setIsEmailAFriendOpen(true)}
                  openDropHint={() => setIsDropHintOpen(true)}
                  openScheduleViewing={() => setIsScheduleViewingOpen(true)}
                  openRequestInfo={() => setIsRequestInfoOpen(true)}
                  openPrintRequest={handlePrintDetails}
                  diamondContent={diamondContent}
                  showPrint={true} />
              </div>
            </div>
          </section>
        </main>
      </div>
      {isDealerInfoOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeDealerInfo}
        >
          <DealerInfo onClose={closeDealerInfo}
            shopurl={shopUrl}
            setShowLoading={setShowLoading}
            diamondId={diamondDetail.diamondId}
            diamondtype={diamondDetail.isLabCreated === true ? 'labcreated' : ''} />
        </PortalPopup>
      )}
      {isDiamondDetailsOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeDiamondDetails}
        >
          <DiamondSpecificationDetail
            additionOptionSetting={additionOptionSetting}
            diamond={diamondDetail}
            configAppData={configAppData}
            onClose={closeDiamondDetails} />
        </PortalPopup>
      )}
      {isDropHintOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeHint}
        >
          <DropHintPopup
            diamondId={diamondDetail.diamondId}
            diamondurl={window.location.href}
            shopurl={shopUrl}
            configAppData={configAppData}
            diamondtype={getDiamondType(diamondDetail)}
            onClose={() => setIsDropHintOpen(false)}
            setShowLoading={setShowLoading} />
        </PortalPopup>
      )}
      {isScheduleViewingOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeSchedule}
        >
          <ScheduleViewingPopup
            diamondId={diamondDetail.diamondId}
            diamondurl={window.location.href}
            shopurl={shopUrl}
            configAppData={configAppData}
            diamondDetail={diamondDetail}
            diamondtype={getDiamondType(diamondDetail)}
            onClose={() => setIsScheduleViewingOpen(false)}
            setShowLoading={setShowLoading}
            locations={diamondDetail.retailerInfo ? diamondDetail.retailerInfo.addressList.map(address => address.locationName) : []}
          />
        </PortalPopup>
      )}

      {isRequestInfoOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeRequestInfo}
        >
          <RequestInfoPopup
            configAppData={configAppData}
            onClose={() => setIsRequestInfoOpen(false)}
            diamondId={diamondDetail.diamondId}
            diamondurl={window.location.href}
            shopurl={shopUrl}
            setShowLoading={setShowLoading}
            diamondtype={getDiamondType(diamondDetail)}
          />
        </PortalPopup>

      )}
      {isEmailAFriendOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeemailAFriend}
        >
          <EmailFriendPopup
            configAppData={configAppData}
            setShowLoading={setShowLoading}
            diamondId={diamondDetail.diamondId}
            diamondurl={window.location.href}
            shopurl={shopUrl}
            diamondtype={getDiamondType(diamondDetail)}
            onClose={() => setIsEmailAFriendOpen(false)} />
        </PortalPopup>
      )}
      {showVirtualTryOn && showVirtualTryOnUrl !== "" && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.3)"
          placement="Centered"
          zIndex={2147483646}
          onOutsideClick={() => {
            setShowVirtualTryOnUrl("");
            setShowVirtualTryOn(false);
          }}
        >
          <VideoDiamondTryOn
            lastSegment={lastSegment}
            src={showVirtualTryOnUrl}
            onClose={() => {
              setShowVirtualTryOnUrl("");
              setShowVirtualTryOn(false);
            }}
          />
        </PortalPopup>
      )}

      {showCartSuccessModal && (
        <CartSuccessModal
          productName={addedProductName}
          onClose={() => setShowCartSuccessModal(false)}
          onContinueShopping={() => {
            setShowCartSuccessModal(false);
            window.location.href = window.location.origin + '/apps/ringbuilder/settings';
          }}
          onGoToCart={() => {
            window.location.href = `${window.location.origin}${(window.Shopify?.routes?.root ?? '/')}cart`;
          }}
        />
      )}

    </>
  );
};

export default DiamondPage;
