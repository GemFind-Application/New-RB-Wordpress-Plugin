import PropTypes from 'prop-types';
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { utils, downloadCompleteRingPdf } from '../Helpers';
import DropHintPopup from '../components/DropHintPopup';
import EmailFriendPopup from '../components/EmailFriendPopup';
import RequestInfoPopup from '../components/RequestInfoPopup';
import RingSpecificationsPopup from '../components/RingSpecificationsPopup';
import ScheduleViewingPopup from '../components/ScheduleViewingPopup';
import VideoTryOn from '../components/VideoTryOn';
import DiamondSpecificationDetail from '../components/diamond-specification-details';
import Stats from '../components/stats';
import ShowTotalPrice from './ShowTotalPrice';
import PortalPopup from './portal-popup';
import './product-details.css';
import ShowCostInCard from './showCostInCard';
import ShowCostInCardDiamond from './showCostInCardDiamond';
import CartSuccessModal from './CartSuccessModal';
import { cartService } from '../Services';
const ProductDetails = ({
    className = '',
    shopUrl,
    settingDetail,
    diamondDetail,
    ringSize,
    configAppData,
    formSetting,
    additionOptionSetting,
    setShowLoading,
    onResetConfirmation,
}) => {
    const getDiamondType = (diamond) => {
        if (!diamond) {
            return 'mined';
        }
        if (diamond.isLabCreated === true || diamond.isLabCreated === 'true') {
            return 'labcreated';
        }
        if (
            diamond.isfancy === true ||
            diamond.isfancy === 'true' ||
            (diamond.fancyColorIntensity && diamond.fancyColorIntensity !== '') ||
            (diamond.fancyColor && diamond.fancyColor !== '')
        ) {
            return 'fancydiamonds';
        }
        return 'mined';
    };

    const shouldShowPriceFlag = (flag) => !(flag === false || flag === 'false');

    const isValidPrice = (price) => {
        if (price === null || price === undefined) {
            return false;
        }

        if (typeof price === 'string') {
            const trimmed = price.trim();
            if (trimmed === '' || trimmed === '0') {
                return false;
            }
            if (trimmed.toLowerCase().includes('call for price')) {
                return false;
            }
            price = trimmed;
        }

        const numPrice = Number(price);
        return !Number.isNaN(numPrice) && numPrice > 0;
    };

    const diamondType = getDiamondType(diamondDetail);

    const [isSettingDetailsOpen, setSettingDetailsOpen] = useState(false);
    const [isDiamondDetailsOpen, setDiamondDetailsOpen] = useState(false);
    const [showVirtualTryOn, setShowVirtualTryOn] = useState(false);
    const [showVirtualTryOnUrl, setShowVirtualTryOnUrl] = useState('');
    const [isHintOpen, setHintOpen] = useState(false);
    const [isScheduleOpen, setScheduleOpen] = useState(false);
    const navigate = useNavigate();
    const [isDropHintOpen, setIsDropHintOpen] = useState(false);
    const [isScheduleViewingOpen, setIsScheduleViewingOpen] = useState(false);
    const [isEmailAFriendOpen, setIsEmailAFriendOpen] = useState(false);
    const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
    const [ringUrl, setRingUrl] = useState('');
    const [diamondUrl, setDiamondUrl] = useState('');
    const imageUrl = `${getImageBaseUrl()}`;
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showCartSuccessModal, setShowCartSuccessModal] = useState(false);
    const [addedProductName, setAddedProductName] = useState('');
    const openSettingDetails = useCallback(() => {
        setSettingDetailsOpen(true);
    }, []);

    const closeSettingDetails = useCallback(() => {
        setSettingDetailsOpen(false);
    }, []);

    const openDiamondDetails = useCallback(() => {
        setDiamondDetailsOpen(true);
    }, []);

    const closeDiamondDetails = useCallback(() => {
        setDiamondDetailsOpen(false);
    }, []);

    const openHint = useCallback(() => {
        setHintOpen(true);
    }, []);

    const closeHint = useCallback(() => {
        setHintOpen(false);
    }, []);

    const openSchedule = useCallback(() => {
        setScheduleOpen(true);
    }, []);

    const closeSchedule = useCallback(() => {
        setScheduleOpen(false);
    }, []);

    const emailAFriend = useCallback(() => {
        setRequestInfoOpen(true);
    }, []);

    const closeemailAFriend = useCallback(() => {
        setRequestInfoOpen(false);
    }, []);

    const openRequestInfo = useCallback(() => {
        setRequestInfoOpen(true);
    }, []);

    const closeRequestInfo = useCallback(() => {
        setRequestInfoOpen(false);
    }, []);

    // Print complete ring: setting + diamond PDF download.
    const handlePrintDetails = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setShowLoading(true);

        const diamondType = getDiamondType(diamondDetail);
        const sideStoneQuality = Array.isArray(settingDetail.sideStoneQuality)
            ? settingDetail.sideStoneQuality[0]
            : settingDetail.sideStoneQuality;

        try {
            await downloadCompleteRingPdf(
                shopUrl,
                settingDetail.settingId,
                diamondDetail.diamondId,
                diamondType,
                {
                    isLabSettings: settingDetail.isLabSetting ? 1 : 0,
                    ringSize,
                    metalType: settingDetail.metalType,
                    sideStoneQuality,
                    centerStoneMin: settingDetail.centerStoneMinCarat,
                    centerStoneMax: settingDetail.centerStoneMaxCarat,
                    styleNumber: settingDetail.styleNumber,
                }
            );
        } catch (error) {
            console.error('Error downloading complete ring PDF:', error);
        } finally {
            setShowLoading(false);
        }
    };

    const addToCart = async (diamondDetail, settingDetail) => {
        setIsAddingToCart(true);
        setShowLoading(true);

        try {
            const ringOptions = {
                metaltype: settingDetail.metalType,
                ringId: settingDetail.settingId,
                ringsizesettingonly: ringSize,
                diamondId: diamondDetail.diamondId,
                diamondtype: diamondType,
                diamondpath: diamondUrl,
                ringpath: ringUrl,
                stylenumber: settingDetail.styleNumber,
                sidestonequalityvalue: settingDetail.sideStoneQuality[0],
                centerstonesizevalue:
                    settingDetail.centerStoneMinCarat != '' ? settingDetail.centerStoneMinCarat + '-' + settingDetail.centerStoneMaxCarat : '',
                islabsettings: settingDetail.isLabSetting,
            };

            const result = await cartService.addCompleteRingToCart({
                diamondDetail,
                settingDetail,
                configAppData,
                isLabGrown: diamondType,
                ringOptions,
            });

            localStorage.removeItem('selectedDiamond');
            localStorage.removeItem('selectedRing');

            if (result.mode === 'woocommerce') {
                cartService.redirectToCartUrl(result.cartUrl);
                return;
            }

            setAddedProductName(result.productTitle || 'Your items');
            setShowCartSuccessModal(true);
            setShowLoading(false);
            setIsAddingToCart(false);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setShowLoading(false);
            setIsAddingToCart(false);
            alert(typeof error === 'string' ? error : 'Failed to add items to cart. Please try again.');
        }
    };
    const changeSetting = () => {
        // Navigate directly to settings listing page (not detail page)
        navigate('/settings');
    };
    const changeDiamond = () => {
        // Navigate directly to diamond page without reset popup or clearing selection
        navigate('/diamondtools');
    };
    useEffect(() => {
        const selectedRingSetting = JSON.parse(localStorage.getItem('selectedRing'));
        const selectedDiamond = JSON.parse(localStorage.getItem('selectedDiamond'));
        if (selectedRingSetting && selectedRingSetting.ringUrl) {
            setRingUrl(selectedRingSetting.ringUrl);
        }
        if (selectedDiamond && selectedDiamond.diamondUrl) {
            setDiamondUrl(selectedDiamond.diamondUrl);
        }
    }, []);

    const showVirtualTryOnIframe = (stockNumber) => {
        const baseUrl = `https://cdn.camweara.com/gemfind/index_client.php?company_name=Gemfind&ringbuilder=1&skus=${stockNumber}&buynow=0`;
        const overrideCss = utils.getTryOnOverrideCssUrl();
        const url = overrideCss ? `${baseUrl}&custom_css=${encodeURIComponent(overrideCss)}` : baseUrl;
        setShowVirtualTryOn(true);
        setShowVirtualTryOnUrl(url);
    };

    return (
        <>
            <div className={`product-details1 ${className}`}>
                <div className="h15">
                    <div className="completed-content-parent">
                        <div className="completed-content">
                            <b className="completed">Completed</b>
                        </div>
                        <div className="engagement-ring-parent">
                            <b className="engagement-ring">{settingDetail.settingName ? settingDetail.settingName : ''}</b>
                            <div className="wrapper2">
                                <div className="carat-weight-labels">
                                    <div className="the-total-carat">The total carat weight:</div>
                                </div>
                                <div className="carat-weight-labels1">
                                    <b className="ct1"> {diamondDetail.caratWeight ? diamondDetail.caratWeight + 'ct' : '-'} </b>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="stats-parent">
                    <div className="stats10">
                        <div className="stats-elements">
                            <div className="ring-size">Ring Size:</div>
                            <b className="stats-values">{ringSize}</b>
                        </div>
                        <div className="stats-elements">
                            <div className="metal-type2">Metal Type:</div>
                            <b className="k-rose-gold">{settingDetail.metalType != '' ? settingDetail.metalType : ''}</b>
                        </div>
                        {settingDetail.sideStoneQuality != '' && (
                            <div className="stats-elements2">
                                <div className="side-stone-quality">Side Stone Quality:</div>
                                <b className="i1h1">{settingDetail.sideStoneQuality != '' ? settingDetail.sideStoneQuality[0] : ''}</b>
                            </div>
                        )}

                        <div className="stats-elements">
                            <div className="center-stone-sizect">Center Stone Size(Ct.):</div>
                            <b className="b21">
                                {settingDetail.centerStoneMinCarat != ''
                                    ? settingDetail.centerStoneMinCarat + '-' + settingDetail.centerStoneMaxCarat
                                    : ''}
                            </b>
                        </div>
                    </div>
                    <div className="number3">
                        <div className="detail-elements">
                            <span className="fi-8467779-icon3">
                                <svg width="24" height="25" viewBox="0 0 24 25" fill="var(--backgroundtext)" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M21.2557 11.6636C20.8049 4.27636 3.19199 4.28009 2.74427 11.6637C2.95987 15.2196 7.25008 17.1649 11.9999 17.2414C16.7528 17.164 21.0369 15.2216 21.2557 11.6636ZM12 6.94308C16.647 6.95004 20.4406 9.06328 20.3943 11.7114C17.2157 7.45829 6.78163 7.46057 3.60574 11.7115C3.55899 9.06334 7.3533 6.95 12 6.94308ZM12 16.3842C8.11346 16.3842 4.84457 14.8906 3.89094 12.8725C4.87029 10.8255 8.22968 9.35484 12 9.35484C15.7703 9.35484 19.1297 10.8255 20.1091 12.8725C19.1554 14.8906 15.8865 16.3842 12 16.3842Z"
                                        fill="var(--backgroundtext)"
                                    />
                                    <path
                                        d="M12 4C5.38309 4 0 7.91678 0 12.7311C0.620679 24.3046 23.3829 24.2994 24 12.731C24 7.91678 18.6169 4 12 4ZM12 20.605C5.85582 20.605 0.857143 17.0729 0.857143 12.7311C1.43357 2.29355 22.5699 2.29844 23.1429 12.7312C23.1429 17.0729 18.1442 20.605 12 20.605Z"
                                        fill="var(--backgroundtext)"
                                    />
                                </svg>
                            </span>
                            <div className="div63">
                                <div className="div64">
                                    <div className="div65">
                                        <div className="payment-info">
                                            <b className="complete-ring-title">{settingDetail.settingName ? settingDetail.settingName : ''}</b>
                                            <div className="id-3832123223">Id: {settingDetail.settingId ? settingDetail.settingId : ''}</div>
                                        </div>
                                        <b className="b22">
                                            <ShowCostInCard settingDetailForCost={settingDetail} configAppData={configAppData}>
                                                {' '}
                                            </ShowCostInCard>
                                        </b>
                                    </div>
                                    <div className="this-14k-white">
                                        {settingDetail.description ? (
                                            /<[^>]*>/.test(settingDetail.description) ? (
                                                <div dangerouslySetInnerHTML={{ __html: settingDetail.description }} />
                                            ) : (
                                                settingDetail.description
                                            )
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                </div>
                                <div className="edit">
                                    <b className="change-setting" onClick={() => changeSetting()}>
                                        Change Setting
                                    </b>
                                    <img className="edit-child" alt="" src={`${imageUrl}` + '/sort-show-icons.svg'} />
                                </div>
                            </div>
                            <span className="info-icon" onClick={openSettingDetails}>
                                <svg width="40" height="41" viewBox="0 0 40 41" fill="var(--backgroundtext)" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M21.6044 25.2091C21.359 25.2319 21.1127 25.1766 20.9007 25.0509C20.7458 24.8919 20.6716 24.6711 20.6989 24.4509C20.7046 24.2675 20.7265 24.085 20.7644 23.9054C20.801 23.6995 20.8483 23.4956 20.9062 23.2945L21.5498 21.0799C21.6162 20.8614 21.66 20.6366 21.6807 20.409C21.6807 20.1636 21.7134 19.9945 21.7134 19.8963C21.7271 19.4588 21.5403 19.039 21.2062 18.7563C20.7951 18.4407 20.2832 18.2856 19.7662 18.3199C19.3956 18.3255 19.0279 18.3862 18.6752 18.4999C18.2898 18.6199 17.8843 18.7636 17.4589 18.9309L17.2734 19.6509C17.3989 19.6072 17.5516 19.5581 17.7262 19.5036C17.8927 19.4543 18.0653 19.4285 18.2389 19.4272C18.4824 19.4008 18.7276 19.4606 18.9316 19.5963C19.0702 19.7616 19.1352 19.9764 19.1116 20.1909C19.111 20.3743 19.0909 20.5571 19.0516 20.7363C19.0134 20.9272 18.9643 21.129 18.9043 21.3417L18.2552 23.5672C18.2029 23.774 18.1611 23.9834 18.1298 24.1945C18.1043 24.3752 18.0915 24.5574 18.0916 24.7399C18.0889 25.1804 18.2903 25.5973 18.637 25.869C19.0544 26.1895 19.5736 26.3483 20.0988 26.3163C20.4687 26.3239 20.8373 26.2704 21.1898 26.1581C21.4988 26.0526 21.9116 25.9017 22.428 25.7053L22.6025 25.0181C22.4626 25.0761 22.3186 25.1235 22.1716 25.1599C21.9857 25.2023 21.7948 25.2188 21.6044 25.2091Z"
                                        fill="var(--backgroundtext)"
                                    />
                                    <path
                                        d="M22.2846 14.7091C21.9877 14.4364 21.5966 14.2898 21.1936 14.3C20.7909 14.2909 20.4002 14.4374 20.1027 14.7091C19.5575 15.1792 19.4966 16.0024 19.9668 16.5477C20.0087 16.5963 20.0541 16.6417 20.1027 16.6836C20.7239 17.2392 21.6634 17.2392 22.2845 16.6836C22.8298 16.2088 22.8869 15.382 22.4121 14.8367C22.3726 14.7913 22.33 14.7486 22.2846 14.7091Z"
                                        fill="var(--backgroundtext)"
                                    />
                                    <path
                                        d="M20 8.29999C13.3726 8.29999 8 13.6726 8 20.3C8 26.9274 13.3726 32.3 20 32.3C26.6274 32.3 32 26.9274 32 20.3C32 13.6726 26.6274 8.29999 20 8.29999ZM20 31.2091C13.9751 31.2091 9.09092 26.3249 9.09092 20.3C9.09092 14.2751 13.9751 9.39091 20 9.39091C26.0249 9.39091 30.9091 14.2751 30.9091 20.3C30.9091 26.3249 26.0249 31.2091 20 31.2091Z"
                                        fill="var(--backgroundtext)"
                                    />
                                </svg>
                            </span>
                        </div>
                        <div className="detail-elements1">
                            <span className="fi-127911891">
                                <svg width="24" height="25" viewBox="0 0 24 25" fill="var(--backgroundtext)" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 22.1876C11.9495 22.1875 11.8996 22.1763 11.8539 22.1548C11.8082 22.1332 11.7678 22.1018 11.7357 22.0628L0.078428 7.92324C0.0370959 7.87309 0.0108679 7.81223 0.00280099 7.74774C-0.00526593 7.68326 0.00516042 7.61781 0.0328648 7.55902C0.0605692 7.50024 0.104411 7.45053 0.15928 7.41571C0.214149 7.38088 0.277785 7.36237 0.342773 7.36232H23.6572C23.7222 7.36237 23.7859 7.38088 23.8407 7.41571C23.8956 7.45053 23.9394 7.50024 23.9671 7.55902C23.9948 7.61781 24.0053 7.68326 23.9972 7.74774C23.9891 7.81223 23.9629 7.87309 23.9216 7.92324L12.2643 22.0628C12.2322 22.1018 12.1918 22.1332 12.1461 22.1548C12.1004 22.1763 12.0505 22.1875 12 22.1876ZM1.06998 8.04804L12 21.3057L22.93 8.04804H1.06998Z"
                                        fill="var(--backgroundtext)"
                                    />
                                    <path
                                        d="M12 22.1876C11.9319 22.1876 11.8653 22.1673 11.8088 22.1293C11.7522 22.0913 11.7083 22.0374 11.6825 21.9743L5.90361 7.83513C5.88235 7.78306 5.87423 7.72656 5.87996 7.67061C5.88569 7.61466 5.90509 7.56098 5.93646 7.5143C5.96783 7.46761 6.0102 7.42937 6.05984 7.40292C6.10948 7.37648 6.16486 7.36266 6.2211 7.36267H17.7789C17.8351 7.36266 17.8905 7.37648 17.9402 7.40292C17.9898 7.42937 18.0322 7.46761 18.0635 7.5143C18.0949 7.56098 18.1143 7.61466 18.12 7.67061C18.1258 7.72656 18.1176 7.78306 18.0964 7.83513L12.3175 21.9743C12.2917 22.0374 12.2478 22.0913 12.1912 22.1293C12.1347 22.1673 12.0681 22.1876 12 22.1876ZM6.73162 8.04804L12 20.9396L17.2684 8.04804H6.73162Z"
                                        fill="var(--backgroundtext)"
                                    />
                                    <path
                                        d="M23.6572 8.04804H0.342773C0.280113 8.04803 0.218656 8.03084 0.165078 7.99835C0.111501 7.96586 0.0678511 7.91931 0.0388718 7.86375C0.00989249 7.8082 -0.0033083 7.74576 0.000703602 7.68323C0.0047155 7.6207 0.0257867 7.56047 0.0616279 7.50907L3.80565 2.14674C3.83724 2.10145 3.87929 2.06446 3.92824 2.03891C3.97719 2.01336 4.03158 2.00001 4.0868 2H19.9132C19.9684 2.00001 20.0228 2.01336 20.0718 2.03891C20.1207 2.06446 20.1628 2.10145 20.1943 2.14674L23.9384 7.50907C23.9742 7.56047 23.9953 7.6207 23.9993 7.68323C24.0033 7.74576 23.9901 7.8082 23.9611 7.86375C23.9321 7.91931 23.8885 7.96586 23.8349 7.99835C23.7813 8.03084 23.7199 8.04803 23.6572 8.04804ZM1.00038 7.36233H22.9996L19.7346 2.68572H4.26543L1.00038 7.36233Z"
                                        fill="var(--backgroundtext)"
                                    />
                                    <path
                                        d="M17.7789 8.04804H6.2211C6.16339 8.04783 6.10666 8.03304 6.05619 8.00507C6.00571 7.97709 5.96311 7.93682 5.93234 7.888C5.90157 7.83917 5.88362 7.78337 5.88015 7.72576C5.87669 7.66815 5.88783 7.6106 5.91253 7.55844L8.45449 2.19612C8.48218 2.13764 8.52585 2.0882 8.58045 2.05349C8.63506 2.01879 8.69836 2.00024 8.76306 2H15.2369C15.3016 2.00024 15.3649 2.01879 15.4195 2.05349C15.4741 2.0882 15.5178 2.13764 15.5455 2.19612L18.0875 7.55844C18.1122 7.6106 18.1233 7.66815 18.1198 7.72576C18.1164 7.78337 18.0984 7.83917 18.0677 7.888C18.0369 7.93682 17.9943 7.97709 17.9438 8.00507C17.8933 8.03304 17.8366 8.04783 17.7789 8.04804ZM6.76316 7.36233H17.2368L15.0202 2.68572H8.97975L6.76316 7.36233Z"
                                        fill="var(--backgroundtext)"
                                    />
                                </svg>
                            </span>
                            <div className="div67">
                                <div className="div64">
                                    <div className="div69">
                                        <div className="payment-info">
                                            <b className="complete-ring-title">
                                                {diamondDetail.shape != '' ? diamondDetail.shape : ''}{' '}
                                                {diamondDetail.caratWeight != '' ? diamondDetail.caratWeight : ''} {'CARAT'}
                                            </b>
                                            <div className="id-3832123223">
                                                {'SKU#:'}{' '}
                                                {additionOptionSetting.show_In_House_Diamonds_First
                                                    ? diamondDetail.stockNumber
                                                    : diamondDetail.diamondId}
                                            </div>
                                        </div>
                                        <b className="b23">
                                            <ShowCostInCardDiamond
                                                diamondDetail={diamondDetail}
                                                configAppData={configAppData}
                                            ></ShowCostInCardDiamond>
                                        </b>
                                    </div>
                                    <div className="this-excellent-cut">{diamondDetail.subHeader != '' ? diamondDetail.subHeader : ''}</div>
                                    <div className="stats11">
                                        <div className="stats-elements">
                                            <div className="report">Report:</div>
                                            <b className="gia1">{diamondDetail.certificate != '' ? diamondDetail.certificate : '-'}</b>
                                        </div>
                                        <div className="stats-elements">
                                            <div className="cut6">Cut:</div>
                                            <b className="excellent4">{diamondDetail.cut != '' ? diamondDetail.cut : 'NA'}</b>
                                        </div>
                                        <div className="stats-elements">
                                            <div className="color2">Color:</div>
                                            <b className="stats-values">{diamondDetail.color != '' ? diamondDetail.color : '-'}</b>
                                        </div>
                                        <div className="stats-elements">
                                            <div className="clarity4">Clarity:</div>
                                            <b className="i13">{diamondDetail.clarity != '' ? diamondDetail.clarity : '-'}</b>
                                        </div>
                                        {additionOptionSetting.show_In_House_Diamonds_Column_with_SKU && (
                                            <div className="stats-elements">
                                                <div className="clarity4">In House:</div>
                                                <b className="i13">
                                                    {diamondDetail.txtinhouse && diamondDetail.txtinhouse === true ? diamondDetail.txtinhouse : '-'}
                                                </b>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="edit1">
                                    <b className="change-diamond" onClick={() => changeDiamond()}>
                                        Change Diamond
                                    </b>
                                    <img className="edit-child" alt="" src={`${imageUrl}` + '/sort-show-icons.svg'} />
                                </div>
                            </div>
                            <span className="info-icon" onClick={openDiamondDetails}>
                                <svg width="40" height="41" viewBox="0 0 40 41" fill="var(--backgroundtext)" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M21.6044 25.2091C21.359 25.2319 21.1127 25.1766 20.9007 25.0509C20.7458 24.8919 20.6716 24.6711 20.6989 24.4509C20.7046 24.2675 20.7265 24.085 20.7644 23.9054C20.801 23.6995 20.8483 23.4956 20.9062 23.2945L21.5498 21.0799C21.6162 20.8614 21.66 20.6366 21.6807 20.409C21.6807 20.1636 21.7134 19.9945 21.7134 19.8963C21.7271 19.4588 21.5403 19.039 21.2062 18.7563C20.7951 18.4407 20.2832 18.2856 19.7662 18.3199C19.3956 18.3255 19.0279 18.3862 18.6752 18.4999C18.2898 18.6199 17.8843 18.7636 17.4589 18.9309L17.2734 19.6509C17.3989 19.6072 17.5516 19.5581 17.7262 19.5036C17.8927 19.4543 18.0653 19.4285 18.2389 19.4272C18.4824 19.4008 18.7276 19.4606 18.9316 19.5963C19.0702 19.7616 19.1352 19.9764 19.1116 20.1909C19.111 20.3743 19.0909 20.5571 19.0516 20.7363C19.0134 20.9272 18.9643 21.129 18.9043 21.3417L18.2552 23.5672C18.2029 23.774 18.1611 23.9834 18.1298 24.1945C18.1043 24.3752 18.0915 24.5574 18.0916 24.7399C18.0889 25.1804 18.2903 25.5973 18.637 25.869C19.0544 26.1895 19.5736 26.3483 20.0988 26.3163C20.4687 26.3239 20.8373 26.2704 21.1898 26.1581C21.4988 26.0526 21.9116 25.9017 22.428 25.7053L22.6025 25.0181C22.4626 25.0761 22.3186 25.1235 22.1716 25.1599C21.9857 25.2023 21.7948 25.2188 21.6044 25.2091Z"
                                        fill="var(--backgroundtext)"
                                    />
                                    <path
                                        d="M22.2846 14.7091C21.9877 14.4364 21.5966 14.2898 21.1936 14.3C20.7909 14.2909 20.4002 14.4374 20.1027 14.7091C19.5575 15.1792 19.4966 16.0024 19.9668 16.5477C20.0087 16.5963 20.0541 16.6417 20.1027 16.6836C20.7239 17.2392 21.6634 17.2392 22.2845 16.6836C22.8298 16.2088 22.8869 15.382 22.4121 14.8367C22.3726 14.7913 22.33 14.7486 22.2846 14.7091Z"
                                        fill="var(--backgroundtext)"
                                    />
                                    <path
                                        d="M20 8.29999C13.3726 8.29999 8 13.6726 8 20.3C8 26.9274 13.3726 32.3 20 32.3C26.6274 32.3 32 26.9274 32 20.3C32 13.6726 26.6274 8.29999 20 8.29999ZM20 31.2091C13.9751 31.2091 9.09092 26.3249 9.09092 20.3C9.09092 14.2751 13.9751 9.39091 20 9.39091C26.0249 9.39091 30.9091 14.2751 30.9091 20.3C30.9091 26.3249 26.0249 31.2091 20 31.2091Z"
                                        fill="var(--backgroundtext)"
                                    />
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
                {/*<div className="payment-content-wrapper">
          <div className="payment-content">
            <div className="div74">
              <div className="payment-info">
                <b className="the-total-carat">Flexible Payment Options:</b>
                <div className="interest-free-payments-of-container">
                  <span>{`3 Interest-Free Payments of `}</span>
                  <b>$951.67</b>
                </div>
              </div>
            </div>
          </div>
        </div>*/}
                <div className="payment-options">
                    {shouldShowPriceFlag(settingDetail.showPrice) &&
                        shouldShowPriceFlag(diamondDetail.showPrice) &&
                        isValidPrice(settingDetail.cost) &&
                        isValidPrice(diamondDetail.fltPrice) && (
                            <div className="button52_b non-clickable complete-ring-total-price">
                                <b className="add-to-cart">
                                    <ShowTotalPrice
                                        configAppData={configAppData}
                                        settingDetailForCost={settingDetail}
                                        diamondDetail={diamondDetail}
                                    ></ShowTotalPrice>
                                </b>
                            </div>
                        )}
                    <div className="cart-buttons">
                        {settingDetail.rbEcommerce &&
                            diamondDetail.dsEcommerce &&
                            shouldShowPriceFlag(settingDetail.showPrice) &&
                            shouldShowPriceFlag(diamondDetail.showPrice) &&
                            isValidPrice(settingDetail.cost) &&
                            isValidPrice(diamondDetail.fltPrice) && (
                                <div className="button52" onClick={() => addToCart(diamondDetail, settingDetail)}>
                                    <b className="add-to-cart">Add to Cart</b>
                                </div>
                            )}
                        {configAppData.display_tryon == '1' && (
                            <button
                                className="button52_b"
                                onClick={() => showVirtualTryOnIframe(utils.getskuForVirtualTryOn(settingDetail.styleNumber))}
                            >
                                <b>Virtual Try On</b>
                            </button>
                        )}
                    </div>
                    <Stats
                        formSetting={formSetting}
                        configAppData={configAppData}
                        emailAFriend={() => setIsEmailAFriendOpen(true)}
                        openDropHint={() => setIsDropHintOpen(true)}
                        openScheduleViewing={() => setIsScheduleViewingOpen(true)}
                        openRequestInfo={() => setIsRequestInfoOpen(true)}
                        openPrintRequest={handlePrintDetails}
                        diamondContent=""
                        showPrint={true}
                    />
                </div>
            </div>
            {isSettingDetailsOpen && (
                <PortalPopup overlayColor="rgba(113, 113, 113, 0.3)" placement="Centered" onOutsideClick={() => setSettingDetailsOpen(false)}>
                    <RingSpecificationsPopup configAppData={configAppData} onClose={() => setSettingDetailsOpen(false)} product={settingDetail} />
                </PortalPopup>
            )}
            {isDiamondDetailsOpen && (
                <PortalPopup overlayColor="rgba(113, 113, 113, 0.3)" placement="Centered" onOutsideClick={closeDiamondDetails}>
                    <DiamondSpecificationDetail
                        additionOptionSetting={additionOptionSetting}
                        diamond={diamondDetail}
                        configAppData={configAppData}
                        onClose={closeDiamondDetails}
                    />
                </PortalPopup>
            )}
            {showVirtualTryOn && showVirtualTryOnUrl !== '' && (
                <PortalPopup
                    overlayColor="rgba(0, 0, 0, 0.3)"
                    overlayClassName="portalPopupOverlay--video-tryon"
                    placement="Centered"
                    zIndex={2147483646}
                    onOutsideClick={() => {
                        setShowVirtualTryOnUrl('');
                        setShowVirtualTryOn(false);
                    }}
                >
                    <VideoTryOn
                        src={showVirtualTryOnUrl}
                        onClose={() => {
                            setShowVirtualTryOnUrl('');
                            setShowVirtualTryOn(false);
                        }}
                    />
                </PortalPopup>
            )}
            {isDropHintOpen && (
                <PortalPopup overlayColor="rgba(113, 113, 113, 0.3)" placement="Centered" onOutsideClick={closeHint}>
                    <DropHintPopup
                        settingId={settingDetail.settingId}
                        diamondId={diamondDetail.diamondId}
                        diamondtype={diamondType}
                        diamondurl={diamondUrl}
                        ringurl={ringUrl}
                        shopurl={shopUrl}
                        configAppData={configAppData}
                        isLabSetting={settingDetail.isLabSetting}
                        price={settingDetail.showPrice && settingDetail.cost ? String(settingDetail.cost) : ''}
                        min_carat={settingDetail.centerStoneMinCarat || ''}
                        max_carat={settingDetail.centerStoneMaxCarat || ''}
                        metalType={settingDetail.metalType || ''}
                        onClose={() => setIsDropHintOpen(false)}
                        setShowLoading={setShowLoading}
                    />
                </PortalPopup>
            )}
            {isScheduleViewingOpen && (
                <PortalPopup overlayColor="rgba(113, 113, 113, 0.3)" placement="Centered" onOutsideClick={closeSchedule}>
                    <ScheduleViewingPopup
                        settingId={settingDetail.settingId}
                        diamondId={diamondDetail.diamondId}
                        diamondtype={diamondType}
                        diamondurl={diamondUrl}
                        configAppData={configAppData}
                        ringurl={ringUrl}
                        diamondDetail={diamondDetail}
                        SettingDetails={settingDetail}
                        shopurl={shopUrl}
                        isLabSetting={settingDetail.isLabSetting}
                        price={settingDetail.showPrice && settingDetail.cost ? String(settingDetail.cost) : ''}
                        min_carat={settingDetail.centerStoneMinCarat || ''}
                        max_carat={settingDetail.centerStoneMaxCarat || ''}
                        metalType={settingDetail.metalType || ''}
                        onClose={() => setIsScheduleViewingOpen(false)}
                        setShowLoading={setShowLoading}
                        locations={settingDetail.addressList ? settingDetail.addressList.map((address) => address.locationName) : []}
                    />
                </PortalPopup>
            )}
            {isRequestInfoOpen && (
                <PortalPopup overlayColor="rgba(113, 113, 113, 0.3)" placement="Centered" onOutsideClick={closeRequestInfo}>
                    <RequestInfoPopup
                        onClose={() => setIsRequestInfoOpen(false)}
                        settingId={settingDetail.settingId}
                        diamondId={diamondDetail.diamondId}
                        diamondtype={diamondType}
                        diamondurl={diamondUrl}
                        ringurl={ringUrl}
                        shopurl={shopUrl}
                        isLabSetting={settingDetail.isLabSetting}
                        price={settingDetail.showPrice && settingDetail.cost ? String(settingDetail.cost) : ''}
                        min_carat={settingDetail.centerStoneMinCarat || ''}
                        max_carat={settingDetail.centerStoneMaxCarat || ''}
                        metalType={settingDetail.metalType || ''}
                        setShowLoading={setShowLoading}
                        configAppData={configAppData}
                    />
                </PortalPopup>
            )}
            {isEmailAFriendOpen && (
                <PortalPopup overlayColor="rgba(113, 113, 113, 0.3)" placement="Centered" onOutsideClick={closeemailAFriend}>
                    <EmailFriendPopup
                        settingId={settingDetail.settingId}
                        diamondId={diamondDetail.diamondId}
                        diamondtype={diamondType}
                        diamondurl={diamondUrl}
                        ringurl={ringUrl}
                        setShowLoading={setShowLoading}
                        shopurl={shopUrl}
                        isLabSetting={settingDetail.isLabSetting}
                        price={settingDetail.showPrice && settingDetail.cost ? String(settingDetail.cost) : ''}
                        min_carat={settingDetail.centerStoneMinCarat || ''}
                        max_carat={settingDetail.centerStoneMaxCarat || ''}
                        metalType={settingDetail.metalType || ''}
                        onClose={() => setIsEmailAFriendOpen(false)}
                        configAppData={configAppData}
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

ProductDetails.propTypes = {
    className: PropTypes.string,
    shopUrl: PropTypes.string,
    settingDetail: PropTypes.object,
    diamondDetail: PropTypes.object,
    ringSize: PropTypes.number,
    configAppData: PropTypes.object,
    formSetting: PropTypes.object,
    additionOptionSetting: PropTypes.object,
    setShowLoading: PropTypes.func,
    onResetConfirmation: PropTypes.func,
};

export default ProductDetails;
