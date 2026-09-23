import '@fancyapps/ui/dist/fancybox.css';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import ReCAPTCHA from 'react-google-recaptcha';
import { Loader, LoadingOverlay } from 'react-overlay-loader';
import { Modal } from 'react-responsive-modal';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { cartService, emailService } from '../../../Services';
import { formatPrice } from '../../../utils/priceUtils';
import UsDateField from '../../elements/UsDateField';
import { shopDomain } from '../../../wp/wpEnv';

function formatprice(finalprice) {
    finalprice = finalprice.toString();
    var lastThree = finalprice.substring(finalprice.length - 3);
    var otherNumbers = finalprice.substring(0, finalprice.length - 3);
    if (otherNumbers != '') lastThree = ',' + lastThree;
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
}

const CompleteRingInfo = (props) => {
    const [open, setOpen] = useState(false);
    let errors = {};
    let formIsValid = true;
    const [loaded, setLoaded] = useState(false);
    const [getTryon, setTryon] = useState('false');
    const [getTryonsrc, setTryonsrc] = useState('');
    const [isCartModalOpen, setCartModalOpen] = useState(false);
    const locationurl = useLocation();

    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);

    const currentDate = new Date().toISOString().split('T')[0];

    const [recaptchaSchlToken, setSchlRecaptchaToken] = useState('');
    const [isSchlRecaptchaVerified, setIsSchlRecaptchaVerified] = useState(false);

    const [recaptchaHintToken, setHintRecaptchaToken] = useState('');
    const [isHintRecaptchaVerified, setIsHintRecaptchaVerified] = useState(false);

    const [recaptchaEmailFrndToken, setEmailFrndRecaptchaToken] = useState('');
    const [isEmailFrndRecaptchaVerified, setIsEmailFrndRecaptchaVerified] = useState(false);

    const onOpenModal = (e) => {
        e.preventDefault();
        setOpen(true);
    };
    const onCloseModal = () => setOpen(false);
    // Check if either price is "Call for Price" or 0
    const settingCostValue = Number(props.settingDetailsData.cost);
    const diamondPriceValue = Number(props.diamondDetailsData.fltPrice);

    var isSettingCallForPrice =
        props.settingDetailsData.cost === 'Call for Price' ||
        props.settingDetailsData.cost === 'Call For Price' ||
        settingCostValue === 0 ||
        isNaN(settingCostValue);
    var isDiamondCallForPrice =
        props.diamondDetailsData.fltPrice === 'Call for Price' ||
        props.diamondDetailsData.fltPrice === 'Call For Price' ||
        diamondPriceValue === 0 ||
        isNaN(diamondPriceValue);

    var ringprice = isSettingCallForPrice ? 0 : settingCostValue.toFixed(0);
    var diamondprice = isDiamondCallForPrice ? 0 : diamondPriceValue.toFixed(0);
    var finalprice = Number(ringprice) + Number(diamondprice);

    const addressList = props.diamondDetailsData?.retailerInfo?.addressList ? props.diamondDetailsData?.retailerInfo?.addressList : [];

    const timingList = props.diamondDetailsData?.retailerInfo?.timingList ? props.diamondDetailsData?.retailerInfo?.timingList : [];

    // Extract the day names, start times, and end times
    const days = [
        {
            name: 'Sunday',
            start: timingList && timingList[0] ? timingList[0].sundayStart : 'NA',
            end: timingList && timingList[0] ? timingList[0].sundayEnd : 'NA',
        },
        {
            name: 'Monday',
            start: timingList && timingList[0] ? timingList[0].mondayStart : 'NA',
            end: timingList && timingList[0] ? timingList[0].mondayEnd : 'NA',
        },
        {
            name: 'Tuesday',
            start: timingList && timingList[0] ? timingList[0].tuesdayStart : 'NA',
            end: timingList && timingList[0] ? timingList[0].tuesdayEnd : 'NA',
        },
        {
            name: 'Wednesday',
            start: timingList && timingList[0] ? timingList[0].wednesdayStart : 'NA',
            end: timingList && timingList[0] ? timingList[0].wednesdayEnd : 'NA',
        },
        {
            name: 'Thursday',
            start: timingList && timingList[0] ? timingList[0].thursdayStart : 'NA',
            end: timingList && timingList[0] ? timingList[0].thursdayEnd : 'NA',
        },
        {
            name: 'Friday',
            start: timingList && timingList[0] ? timingList[0].fridayStart : 'NA',
            end: timingList && timingList[0] ? timingList[0].fridayEnd : 'NA',
        },
        {
            name: 'Saturday',
            start: timingList && timingList[0] ? timingList[0].saturdayStart : 'NA',
            end: timingList && timingList[0] ? timingList[0].saturdayEnd : 'NA',
        },
    ];

    // Filter days with available slots
    const daysWithSlots = days.filter((day) => day.start);

    const [missingDays, setMissingDays] = useState([]);

    useEffect(() => {
        const foundDays = daysWithSlots.map((day) => day.name);
        const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const missing = allDays.filter((day) => !foundDays.includes(day));
        setMissingDays(missing);
    }, []);

    const [openSecond, setOpenSecond] = useState(false);
    const [openThird, setOpenThird] = useState(false);
    const [openFour, setOpenFour] = useState(false);
    const [openFive, setOpenFive] = useState(false);
    const [openOne, setOpenOne] = useState(false);
    const onOpenRingSpecModal = (e) => {
        e.preventDefault();
        setOpenOne(true);
    };
    const [getsettingcookies, setsettingcookies] = useCookies(['_shopify_ringsetting']);
    const [getdiamondcookies, setdiamondcookies] = useCookies(['_shopify_diamondsetting']);
    const [diamondTypeCookie] = useCookies(['shopify_diamondtype']);
    const [getSelectedRingSize, setSelectedRingSize] = useState('');
    const [getSelectedMetalType, setSelectedMetalType] = useState('');

    const [getSelectedDiamondId, setSelectedDiamondId] = useState('');
    const [getblankvalue, setblankvalue] = useState(['']);
    const [cookies, setCookie, removeCookie] = useCookies(['cookie-name']);

    const resolveDiamondType = () => {
        const cookieValue = diamondTypeCookie?.shopify_diamondtype;
        if (cookieValue === 'labcreated' || cookieValue === 'fancydiamonds' || cookieValue === 'mined') {
            return cookieValue;
        }

        if (props.diamondDetailsData?.isLabCreated === true || props.diamondDetailsData?.isLabCreated === 'true') {
            return 'labcreated';
        }

        if (props.diamondDetailsData?.fancyColorIntensity || props.diamondDetailsData?.fancyColorMainBody) {
            return 'fancydiamonds';
        }

        return 'mined';
    };

    const handleRecaptchaChange = (response) => {
        setRecaptchaToken(response);
        setIsRecaptchaVerified(true); // Set verification status
    };

    const handleSchlRecaptchaChange = (response) => {
        setSchlRecaptchaToken(response);
        setIsSchlRecaptchaVerified(true); // Set verification status
    };

    const handleHintRecaptchaChange = (response) => {
        setHintRecaptchaToken(response);
        setIsHintRecaptchaVerified(true);
    };

    const handleEmailFrndRecaptchaChange = (response) => {
        setEmailFrndRecaptchaToken(response);
        setIsEmailFrndRecaptchaVerified(true);
    };

    const onOpenSecondModal = (e) => {
        e.preventDefault();
        setyourname('');
        setyouremail('');
        setrecipientname('');
        setrecipientemail('');
        setgiftreason('');
        sethintmessage('');
        setgiftdeadline('');
        setOpenSecond(true);
    };

    const onOpenThirdModal = (e) => {
        e.preventDefault();
        setreqname('');
        setreqemail('');
        setreqphone('');
        setreqmsg('');
        setreqcp('');
        setOpenThird(true);
    };

    const onOpenFourthModal = (e) => {
        e.preventDefault();
        setname('');
        setemail('');
        setfrndname('');
        setfrndemail('');
        setfrndmessage('');
        setOpenFour(true);
    };

    const onOpenFifthModal = (e) => {
        e.preventDefault();
        setschdname('');
        setschdemail('');
        setschdphone('');
        setschdmsg('');
        setschddate('');
        setschdtime('');
        setLocation('');
        setOpenFive(true);
    };

    useEffect(() => {
        if (getsettingcookies._shopify_ringsetting && getsettingcookies._shopify_ringsetting[0].ringsizewithdia) {
            setSelectedRingSize(getsettingcookies._shopify_ringsetting[0].ringsizewithdia);
        }

        if (getsettingcookies._shopify_ringsetting && getsettingcookies._shopify_ringsetting[0].material) {
            setSelectedMetalType(getsettingcookies._shopify_ringsetting[0].material);
        }

        if (getdiamondcookies._shopify_diamondsetting && getdiamondcookies._shopify_diamondsetting[0].diamondId) {
            setSelectedDiamondId(getdiamondcookies._shopify_diamondsetting[0].diamondId);
        }

        window.addEventListener('message', function (event) {
            if (event.data === 'closeIframe') {
                setLoaded(false);
                setTryon('false');
            }
        });
    }, []);

    //DROP HINT SUBMIT BUTTON
    const [getyourname, setyourname] = useState('');
    const [getyouremail, setyouremail] = useState('');
    const [getrecipientname, setrecipientname] = useState('');
    const [getrecipientemail, setrecipientemail] = useState('');
    const [getgiftreason, setgiftreason] = useState('');
    const [gethintmessage, sethintmessage] = useState('');
    const [getgiftdeadline, setgiftdeadline] = useState(currentDate);

    const [geterror, seterror] = useState(['']);

    const handleYourname = (event) => {
        setyourname(event.target.value);
    };
    const handleYouremail = (event) => {
        setyouremail(event.target.value);
    };
    const handleRecipientname = (event) => {
        setrecipientname(event.target.value);
    };
    const handleRecipientemail = (event) => {
        setrecipientemail(event.target.value);
    };
    const handleGiftreason = (event) => {
        setgiftreason(event.target.value);
    };
    const handleHintmessage = (event) => {
        sethintmessage(event.target.value);
    };
    const handleGiftdeadline = (event) => {
        setgiftdeadline(event.target.value);
    };

    const handledrophintSubmit = async (e) => {
        e.preventDefault();
        setLoaded(true);

        //Validation
        errors = {};
        formIsValid = true;

        //Name
        if (getyourname === '') {
            errors['yourname'] = 'Please enter your name';
            formIsValid = false;
        }
        if (getrecipientname === '') {
            errors['yourrpname'] = 'Please enter your recipient name';
            formIsValid = false;
        }

        //Email
        const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (regex.test(getyouremail) === false) {
            errors['youremail'] = 'Please enter valid email';
            formIsValid = false;
        }
        if (regex.test(getrecipientemail) === false) {
            errors['recipientemail'] = 'Please enter valid email';
            formIsValid = false;
        }

        //Reason
        if (getgiftreason === '') {
            errors['yourreason'] = 'Please enter your reason';
            formIsValid = false;
        }

        //Message
        if (gethintmessage === '') {
            errors['yourmsg'] = 'Please enter your message';
            formIsValid = false;
        }

        //Deadline
        if (getgiftdeadline === '') {
            errors['yourdeadline'] = 'Please enter your deadline';
            formIsValid = false;
        }

        if (window.initData.data[0].google_site_key && window.initData.data[0].google_secret_key) {
            if (recaptchaHintToken === '') {
                errors['yourrecaptcha'] = 'The recaptcha token field is required.';
                formIsValid = false;
            }
        }

        if (formIsValid == false) {
            console.log(errors);
            seterror(errors);
            setLoaded(false);
            return;
        }

        try {
            // Construct URLs from shopurl + paths from cookies
            const shopurl = window.initData?.data?.[0]?.shop || '';
            const ringpath = getsettingcookies._shopify_ringsetting?.[0]?.ringpath || '';
            const diamondpath = getdiamondcookies._shopify_diamondsetting?.[0]?.diamondpath || '';
            const ringUrl = ringpath ? `https://${shopurl}${ringpath}` : '';
            const diamondUrl = diamondpath ? `https://${shopurl}${diamondpath}` : '';

            const formData = {
                name: getyourname,
                email: getyouremail,
                phone_no: '',
                hint_Recipient_name: getrecipientname,
                hint_Recipient_email: getrecipientemail,
                reason_of_gift: getgiftreason,
                hint_message: gethintmessage,
                deadline: getgiftdeadline,
                settingId: props.selectedSettingId,
                diamondId: props.diamondDetailsData.diamondId,
                diamondType: resolveDiamondType(),
                isLabSetting: props.settingDetailsData.isLabSetting,
                price: props.settingDetailsData.cost ? props.settingDetailsData.cost : '',
                max_carat: props.settingDetailsData.centerStoneMaxCarat ? props.settingDetailsData.centerStoneMaxCarat : '',
                min_carat: props.settingDetailsData.centerStoneMinCarat ? props.settingDetailsData.centerStoneMinCarat : '',
                metalType: props.settingDetailsData.metalType ? props.settingDetailsData.metalType : '',
                ringUrl: ringUrl,
                diamondUrl: diamondUrl,
            };

            const result = await emailService.completeRingDropHint(formData, recaptchaHintToken);

            setOpenSecond(false);
            toast(result.message || 'Email Send Successfully');
            setLoaded(false);
            setyourname('');
            setyouremail('');
            setrecipientname('');
            setrecipientemail('');
            setgiftreason('');
            sethintmessage('');
            setgiftdeadline('');
            seterror('');
        } catch (error) {
            console.error('Drop hint error:', error);
            toast(error.message || 'Failed to send email');
            setLoaded(false);
            seterror({ general: error.message || 'Failed to send email' });
        }
    };

    //EMAIL A FRIENDS SUBMIT BUTTON
    const [getname, setname] = useState('');
    const [getemail, setemail] = useState('');
    const [getfrndname, setfrndname] = useState('');
    const [getfrndemail, setfrndemail] = useState('');
    const [getfrndmessage, setfrndmessage] = useState('');

    const [getfrnderror, setfrnderror] = useState(['']);

    const handleName = (event) => {
        setname(event.target.value);
    };
    const handleEmail = (event) => {
        setemail(event.target.value);
    };
    const handleFrndname = (event) => {
        setfrndname(event.target.value);
    };
    const handleFrndemail = (event) => {
        setfrndemail(event.target.value);
    };
    const handleFrndmessage = (event) => {
        setfrndmessage(event.target.value);
    };

    const handleemailfrndSubmit = async (e) => {
        e.preventDefault();
        setLoaded(true);

        //Validation
        errors = {};
        formIsValid = true;

        //Name
        if (getname === '') {
            errors['yourname'] = 'Please enter your name';
            formIsValid = false;
        }
        if (getfrndname === '') {
            errors['yourfrnname'] = 'Please enter your friend name';
            formIsValid = false;
        }

        //Email
        const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (regex.test(getemail) === false) {
            errors['youremail'] = 'Please enter valid email';
            formIsValid = false;
        }
        if (regex.test(getfrndemail) === false) {
            errors['youremail'] = 'Please enter valid email';
            formIsValid = false;
        }

        //Message
        if (getfrndmessage === '') {
            errors['yourmsg'] = 'Please enter your message';
            formIsValid = false;
        }

        if (window.initData.data[0].google_site_key && window.initData.data[0].google_secret_key) {
            if (recaptchaEmailFrndToken === '') {
                errors['yourfrndrecaptcha'] = 'The recaptcha token field is required.';
                formIsValid = false;
            }
        }

        if (formIsValid == false) {
            console.log(errors);
            setfrnderror(errors);
            setLoaded(false);
            return;
        }

        try {
            // Construct URLs from shopurl + paths from cookies
            const shopurl = window.initData?.data?.[0]?.shop || '';
            const ringpath = getsettingcookies._shopify_ringsetting?.[0]?.ringpath || '';
            const diamondpath = getdiamondcookies._shopify_diamondsetting?.[0]?.diamondpath || '';
            const ringUrl = ringpath ? `https://${shopurl}${ringpath}` : '';
            const diamondUrl = diamondpath ? `https://${shopurl}${diamondpath}` : '';

            const formData = {
                name: getname,
                email: getemail,
                phone_no: '',
                frnd_name: getfrndname,
                frnd_email: getfrndemail,
                frnd_message: getfrndmessage,
                settingId: props.selectedSettingId,
                diamondId: props.diamondDetailsData.diamondId,
                diamondType: resolveDiamondType(),
                isLabSetting: props.settingDetailsData.isLabSetting,
                price: props.settingDetailsData.cost ? props.settingDetailsData.cost : '',
                max_carat: props.settingDetailsData.centerStoneMaxCarat ? props.settingDetailsData.centerStoneMaxCarat : '',
                min_carat: props.settingDetailsData.centerStoneMinCarat ? props.settingDetailsData.centerStoneMinCarat : '',
                metalType: props.settingDetailsData.metalType ? props.settingDetailsData.metalType : '',
                ringUrl: ringUrl,
                diamondUrl: diamondUrl,
            };

            const result = await emailService.completeRingEmailFriend(formData, recaptchaEmailFrndToken);

            setOpenFour(false);
            toast(result.message || 'Email Send Successfully');
            setLoaded(false);
            setname('');
            setemail('');
            setfrndname('');
            setfrndemail('');
            setfrndmessage('');
            setfrnderror('');
        } catch (error) {
            console.error('Email friend error:', error);
            toast(error.message || 'Failed to send email');
            setLoaded(false);
            setfrnderror({ general: error.message || 'Failed to send email' });
        }
    };

    //REQUEST MORE INFORMATION SUBMIT BUTTON

    const [getreqname, setreqname] = useState('');
    const [getreqemail, setreqemail] = useState('');
    const [getreqphone, setreqphone] = useState('');
    const [getreqmsg, setreqmsg] = useState('');
    const [getreqcp, setreqcp] = useState('');

    const [getreqerror, setreqerror] = useState(['']);

    const handleReqname = (event) => {
        setreqname(event.target.value);
    };
    const handleReqemail = (event) => {
        setreqemail(event.target.value);
    };
    const handleReqphone = (event) => {
        setreqphone(event.target.value);
    };
    const handleReqmsg = (event) => {
        setreqmsg(event.target.value);
    };
    const handleReqcp = (event) => {
        setreqcp(event.target.value);
    };

    const handlereginfoSubmit = async (e) => {
        e.preventDefault();
        setLoaded(true);

        //Validation
        errors = {};
        formIsValid = true;

        //Name
        if (getreqname === '') {
            errors['yourname'] = 'Please enter your name';
            formIsValid = false;
        }

        //Email
        const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (regex.test(getreqemail) === false) {
            errors['reqemail'] = 'Please enter valid email';
            formIsValid = false;
        }

        //Phone no.
        var pattern = new RegExp(/^[0-9\b]+$/);
        if (!pattern.test(getreqphone)) {
            errors['yourphone'] = 'Please enter only number';
            formIsValid = false;
        } else if (getreqphone.length != 10) {
            errors['yourphone'] = 'Please enter valid phone number.';
            formIsValid = false;
        }

        //Message
        if (getreqmsg === '') {
            errors['yourmsg'] = 'Please enter your message';
            formIsValid = false;
        }

        //Contact Preference
        if (getreqcp === '') {
            errors['yourcp'] = 'Please select contact preference';
            formIsValid = false;
        }

        if (window.initData.data[0].google_site_key && window.initData.data[0].google_secret_key) {
            if (recaptchaToken === '') {
                errors['yourreqrecaptcha'] = 'The recaptcha token field is required.';
                formIsValid = false;
            }
        }

        if (formIsValid == false) {
            console.log(errors);
            setreqerror(errors);
            setLoaded(false);
            return;
        }

        try {
            // Construct URLs from shopurl + paths from cookies
            const shopurl = window.initData?.data?.[0]?.shop || '';
            const ringpath = getsettingcookies._shopify_ringsetting?.[0]?.ringpath || '';
            const diamondpath = getdiamondcookies._shopify_diamondsetting?.[0]?.diamondpath || '';
            const ringUrl = ringpath ? `https://${shopurl}${ringpath}` : '';
            const diamondUrl = diamondpath ? `https://${shopurl}${diamondpath}` : '';

            const formData = {
                name: getreqname,
                email: getreqemail,
                phone_no: getreqphone,
                req_message: getreqmsg,
                contact_preference: getreqcp,
                settingId: props.selectedSettingId,
                diamondId: props.diamondDetailsData.diamondId,
                diamondType: resolveDiamondType(),
                isLabSetting: props.settingDetailsData.isLabSetting,
                price: props.settingDetailsData.cost ? props.settingDetailsData.cost : '',
                max_carat: props.settingDetailsData.centerStoneMaxCarat ? props.settingDetailsData.centerStoneMaxCarat : '',
                min_carat: props.settingDetailsData.centerStoneMinCarat ? props.settingDetailsData.centerStoneMinCarat : '',
                metalType: props.settingDetailsData.metalType ? props.settingDetailsData.metalType : '',
                ringUrl: ringUrl,
                diamondUrl: diamondUrl,
            };

            const result = await emailService.completeRingRequestInfo(formData, recaptchaToken);

            setOpenThird(false);
            toast(result.message || 'Email Send Successfully');
            setLoaded(false);
            setreqname('');
            setreqemail('');
            setreqphone('');
            setreqmsg('');
            setreqcp('');
            setreqerror('');
        } catch (error) {
            console.error('Request info error:', error);
            toast(error.message || 'Failed to send email');
            setLoaded(false);
            setreqerror({ general: error.message || 'Failed to send email' });
        }
    };

    //SCHEDULE VIWING SUBMIT BUTTON

    const [getschdname, setschdname] = useState('');
    const [getschdemail, setschdemail] = useState('');
    const [getschdphone, setschdphone] = useState('');
    const [getschdmsg, setschdmsg] = useState('');
    const [getschddate, setschddate] = useState('');
    const [getschdtime, setschdtime] = useState('');
    const [location, setLocation] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [showTime, setShowtime] = useState(false);
    const [getschderror, setschderror] = useState(['']);

    const handleSchdname = (event) => {
        setschdname(event.target.value);
    };
    const handleSchdemail = (event) => {
        setschdemail(event.target.value);
    };
    const handleSchdphone = (event) => {
        setschdphone(event.target.value);
    };
    const handleSchdmsg = (event) => {
        setschdmsg(event.target.value);
    };
    const handleSchddate = (event) => {
        // setschddate(event.target.value);

        const selectedDate = event.target.value;
        // Parse the selected date to a JavaScript Date object
        const selectedDateObj = new Date(selectedDate);

        const selectedDay = selectedDateObj.toLocaleDateString('en-US', {
            weekday: 'long',
        });

        if (missingDays.includes(selectedDay)) {
            setErrorMessage('Slots not available on selected date');
            setShowtime(false);
            setschddate('');
        } else {
            setErrorMessage('');
            setShowtime(true);
            setschddate(selectedDate);
        }
    };

    const handleSchdtime = (event) => {
        setschdtime(event.target.value);
    };
    const handleChange = (event) => {
        setLocation(event.target.value);
    };

    const handleschdSubmit = async (e) => {
        e.preventDefault();
        setLoaded(true);

        //Validation
        errors = {};
        formIsValid = true;

        //Name
        if (getschdname === '') {
            errors['yourname'] = 'Please enter your name';
            formIsValid = false;
        }

        //Email
        const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (regex.test(getschdemail) === false) {
            errors['schdemail'] = 'Please enter valid email';
            formIsValid = false;
        }

        //Phone no.
        var pattern = new RegExp(/^[0-9\b]+$/);
        if (!pattern.test(getschdphone)) {
            errors['yourphone'] = 'Please enter only number';
            formIsValid = false;
        } else if (getschdphone.length != 10) {
            errors['yourphone'] = 'Please enter valid phone number.';
            formIsValid = false;
        }

        //Message
        if (getschdmsg === '') {
            errors['yourmsg'] = 'Please enter your message';
            formIsValid = false;
        }

        //Location
        if (location === '') {
            errors['yourlocation'] = 'Please select your location';
            formIsValid = false;
        }

        //Availibilty Date
        if (getschddate === '') {
            errors['yourdate'] = 'Please select your availibility date';
            formIsValid = false;
        }

        if (window.initData.data[0].google_site_key && window.initData.data[0].google_secret_key) {
            if (recaptchaSchlToken === '') {
                errors['yourscrecaptcha'] = 'The recaptcha token field is required.';
                formIsValid = false;
            }
        }

        if (formIsValid == false) {
            console.log(errors);
            setschderror(errors);
            setLoaded(false);
            return;
        }

        try {
            // Construct URLs from shopurl + paths from cookies
            const shopurl = window.initData?.data?.[0]?.shop || '';
            const ringpath = getsettingcookies._shopify_ringsetting?.[0]?.ringpath || '';
            const diamondpath = getdiamondcookies._shopify_diamondsetting?.[0]?.diamondpath || '';
            const ringUrl = ringpath ? `https://${shopurl}${ringpath}` : '';
            const diamondUrl = diamondpath ? `https://${shopurl}${diamondpath}` : '';

            const formData = {
                name: getschdname,
                email: getschdemail,
                phone_no: getschdphone,
                schl_message: getschdmsg,
                location: location,
                availability_date: getschddate,
                appnt_time: getschdtime,
                settingId: props.selectedSettingId,
                diamondId: props.diamondDetailsData.diamondId,
                diamondType: resolveDiamondType(),
                isLabSetting: props.settingDetailsData.isLabSetting,
                price: props.settingDetailsData.cost ? props.settingDetailsData.cost : '',
                max_carat: props.settingDetailsData.centerStoneMaxCarat ? props.settingDetailsData.centerStoneMaxCarat : '',
                min_carat: props.settingDetailsData.centerStoneMinCarat ? props.settingDetailsData.centerStoneMinCarat : '',
                metalType: props.settingDetailsData.metalType ? props.settingDetailsData.metalType : '',
                ringUrl: ringUrl,
                diamondUrl: diamondUrl,
            };

            const result = await emailService.completeRingScheduleViewing(formData, recaptchaSchlToken);

            setOpenFive(false);
            toast(result.message || 'Email Send Successfully');
            setLoaded(false);
            setschdname('');
            setschdemail('');
            setschdphone('');
            setschdmsg('');
            setschddate('');
            setschdtime('');
            setLocation('');
            setschderror('');
        } catch (error) {
            console.error('Schedule viewing error:', error);
            toast(error.message || 'Failed to send email');
            setLoaded(false);
            setschderror({ general: error.message || 'Failed to send email' });
        }
    };

    const handlevirtual = (e) => {
        e.preventDefault();
        // Get style number from cookies or props (cookies may be cleared)
        const ringSetting = getsettingcookies._shopify_ringsetting?.[0];
        const styleNumber = ringSetting?.styleNumber || props.settingDetailsData?.styleNumber || '';
        
        if (!styleNumber) {
            toast.error('Style number not found. Please refresh the page and try again.');
            return;
        }
        
        setLoaded(true);
        setTryon('true');
        setTryonsrc(`https://cdn.camweara.com/gemfind/index_client.php?company_name=Gemfind&ringbuilder=1&skus=${styleNumber}&buynow=0`);
    };

    //Add To Cart
    const handleAddToCart = async () => {
        setCartModalOpen(true);
        console.log('CompleteRingInfo: cart status modal opened');

        try {
            // Get ring setting data from cookies or props (cookies may be cleared after previous add to cart)
            const ringSetting = getsettingcookies._shopify_ringsetting?.[0];
            const settingId = ringSetting?.setting_id || props.settingDetailsData?.settingId || props.selectedSettingId;
            const diamondId = getSelectedDiamondId || props.diamondDetailsData?.diamondId;

            // Validate required data
            if (!settingId || !diamondId) {
                throw new Error('Missing required product information. Please refresh the page and try again.');
            }

            // Prepare form data as JSON object
            let formData = {
                metaltype: getSelectedMetalType || ringSetting?.material || props.settingDetailsData?.metalType || '',
                ringId: settingId,
                ringsizesettingonly: getSelectedRingSize || ringSetting?.ringsizewithdia || '',
                diamondId: diamondId,
                diamondtype: resolveDiamondType(),
                stylenumber: ringSetting?.styleNumber || props.settingDetailsData?.styleNumber || '',
                sidestonequalityvalue: ringSetting?.sideStoneQuality || props.selectedSideStone || '',
                centerstonesizevalue: ringSetting?.centerStoneSize || props.selectedCenterStone || '',
                islabsettings: ringSetting?.isLabSetting !== undefined ? ringSetting.isLabSetting : (props.settingDetailsData?.isLabSetting || false),
            };

            // WordPress: POST /completePurchase adds setting + diamond as WooCommerce line items and
            // returns { success, redirect_url } (a URL that lands in the cart).
            const data = await cartService.completePurchase(diamondId, settingId, shopDomain(), formData);
            const redirectUrl = data && (data.redirect_url || data.cart_url || data.url);
            if (!data || !data.success || !redirectUrl) {
                throw new Error((data && (data.error || data.message)) || 'Failed to add to cart');
            }

            // Clear builder cookies like the classic flow, then go to the cart (modal stays up while navigating).
            removeCookie('shopify_diamondbackvalue', { path: '/' });
            removeCookie('_wpsaveringfiltercookie', { path: '/' });
            removeCookie('_wpsavediamondfiltercookie', { path: '/' });
            removeCookie('_wpsavedcompareproductcookie', { path: '/' });
            removeCookie('_shopify_diamondsetting', { path: '/' });
            removeCookie('shopify_ringbackvalue', { path: '/' });
            removeCookie('_shopify_ringsetting', { path: '/' });
            console.log('CompleteRingInfo: redirecting to cart');
            window.location.href = redirectUrl;
        } catch (errors) {
            console.error('Add to cart error:', errors);
            setCartModalOpen(false);
            console.log('CompleteRingInfo: cart status modal closed after exception');
            toast.error(errors.response?.data?.message || errors.message || 'Failed to add to cart. Please try again.');
        }
    };

    return (
        <>
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <style>
                {`.cart-status-message p {
                    font-size: 14px !important;
                }`}
            </style>
            {/* Ring Info */}

            <div className="ring-descreption">
                <Modal
                    open={isCartModalOpen}
                    onClose={() => setCartModalOpen(false)}
                    closeOnOverlayClick={false}
                    showCloseIcon={false}
                    center
                    classNames={{
                        overlay: 'popup_Overlay',
                        modal: 'popup-form-extra-small',
                    }}
                    styles={{
                        modal: {
                            background: 'transparent',
                            boxShadow: 'none',
                            padding: '0',
                        },
                    }}
                >
                    <div className="cart-status-message" style={{ textAlign: 'center' }}>
                        <p
                            style={{
                                color: '#fff',
                                fontWeight: 700,
                                margin: 0,
                                fontSize: '14px',
                            }}
                        >
                            Please be patient, adding your item to the cart...
                        </p>
                    </div>
                </Modal>
                <div className="product-info__title">
                    <h2>{props.settingDetailsData.settingName}</h2>
                    <h4 className="ring-spacifacation">
                        <a href="#" onClick={onOpenRingSpecModal}>
                            <span>
                                <i className="far fa-edit"></i>
                            </span>
                            Ring Specification
                        </a>
                    </h4>
                    <Modal
                        open={openOne}
                        onClose={() => setOpenOne(false)}
                        center
                        classNames={{
                            overlay: 'popup_Overlay',
                            modal: 'popup_product',
                        }}
                    >
                        <div className="popup_content">
                            <p className="popup_pr">
                                This refer to different type of Metal Type to filter and select the appropriate ring as per your requirements. Look
                                for a metal type best suit of your chosen ring.
                            </p>
                            <div className="diamond-information">
                                <div className="spacification-info">
                                    <h2>SETTING DETAILS</h2>
                                </div>
                                <ul>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Setting Number</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.settingDetailsData.styleNumber}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Price</p>
                                        </div>
                                        {props.settingDetailsData.showPrice === true && (
                                            <div className="diamonds-info">
                                                <p>
                                                    {formatPrice({
                                                        cost: props.settingDetailsData.cost,
                                                        currencyFrom: props.settingDetailsData.currencyFrom,
                                                        currencySymbol: props.settingDetailsData.currencySymbol,
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                        {props.settingDetailsData.showPrice === false && (
                                            <div className="diamonds-info">
                                                <p>{'Call For Price'}</p>
                                            </div>
                                        )}
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Metal Type</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{getSelectedMetalType ? getSelectedMetalType : props.settingDetailsData.metalType}</p>
                                        </div>
                                    </li>
                                </ul>
                                <div className="spacification-info">
                                    <h2>CAN BE SET WITH</h2>
                                </div>
                                <ul>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>{props.settingDetailsData.centerStoneFit}</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>
                                                {props.settingDetailsData.centerStoneMinCarat}-{props.settingDetailsData.centerStoneMaxCarat}
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Modal>
                </div>

                {props.settingDetailsData.description !== 'NA' && (
                    <div className="product-info__descreption">
                        {/<[^>]+>/.test(props.settingDetailsData.description) ? (
                            <div dangerouslySetInnerHTML={{ __html: props.settingDetailsData.description }} />
                        ) : (
                            <p>{props.settingDetailsData.description}</p>
                        )}
                    </div>
                )}
                <div className="diaomnd-info">
                    <div className="metaltype product-dropdown">
                        <span>Metal Type</span>
                        <span className="metaldropdown">{getSelectedMetalType ? getSelectedMetalType : props.settingDetailsData.metalType}</span>
                    </div>
                    <div className="stonesize product-dropdown">
                        <span>Center Stone Size</span>
                        <span className="stonesizedropdown">
                            {props.selectedCenterStone
                                ? props.selectedCenterStone
                                : `${props.settingDetailsData.centerStoneMinCarat}-${props.settingDetailsData.centerStoneMaxCarat}`}
                        </span>
                    </div>
                    {props.selectedSideStone && (
                        <div className="sidestone product-dropdown">
                            <span>Side Stone Quality</span>
                            <span className="sidestonedropdown">{props.selectedSideStone}</span>
                        </div>
                    )}
                    <div className="ringsize product-dropdown">
                        <span>Ring Size</span>
                        <span className="ringdropdown">{getSelectedRingSize ? getSelectedRingSize : 'NA'}</span>
                    </div>
                </div>
                {props.settingDetailsData.showPrice === true && (
                    <div className="dia-ring-price">
                        Setting Price:
                        <span className="complete_setting_price">
                            {formatPrice({
                                cost: props.settingDetailsData.cost,
                                currencyFrom: props.settingDetailsData.currencyFrom,
                                currencySymbol: props.settingDetailsData.currencySymbol,
                            })}
                        </span>
                    </div>
                )}
                {props.settingDetailsData.showPrice === false && (
                    <div className="dia-ring-price">
                        Setting Price:
                        <span className="complete_setting_price">{'Call For Price'}</span>
                    </div>
                )}
            </div>
            {/* Diamond info    */}
            <div className="ring-descreption">
                <div className="product-info__title">
                    <h2>{props.diamondDetailsData.mainHeader}</h2>
                    <h4 className="ring-spacifacation">
                        <a href="#" onClick={onOpenModal}>
                            <span>
                                <i className="far fa-edit"></i>
                            </span>
                            Diamond Specification
                        </a>
                    </h4>
                    <Modal
                        open={open}
                        onClose={onCloseModal}
                        center
                        classNames={{
                            overlay: 'popup_Overlay',
                            modal: 'popup_diamond-product',
                        }}
                    >
                        <div className="popup_content">
                            <div className="diamond-information">
                                <div className="spacification-info">
                                    <h2>Diamond Details</h2>
                                </div>
                                <ul className="diamond-spacification-list">
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Stock Number</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.diamondDetailsData.stockNumber}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Price</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{formatPrice(props.diamondDetailsData)}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Price Per Carat</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>
                                                {props.diamondDetailsData.fltPrice === 'Call for Price' ? '' : window.currency}
                                                {props.diamondDetailsData.fltPrice !== 'Call for Price'
                                                    ? props.diamondDetailsData.costPerCarat.split('.')[0]
                                                    : 'Call for Price'}
                                            </p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Carat Weight</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.diamondDetailsData.caratWeight ? props.diamondDetailsData.caratWeight : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Cut</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.diamondDetailsData.cut ? props.diamondDetailsData.cut : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Clarity</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.diamondDetailsData.clarity ? props.diamondDetailsData.clarity : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Depth %</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.diamondDetailsData.depth ? props.diamondDetailsData.depth : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Table %</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.diamondDetailsData.table ? props.diamondDetailsData.table : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Polish</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.diamondDetailsData.polish ? props.diamondDetailsData.polish : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Symmetry</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.diamondDetailsData.symmetry ? props.diamondDetailsData.symmetry : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Origin</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.diamondDetailsData.origin ? props.diamondDetailsData.origin : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Girdle</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.diamondDetailsData.girdleThick ? props.diamondDetailsData.girdleThick : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Culet</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.diamondDetailsData.culet ? props.diamondDetailsData.culet : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Fluorescence</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.diamondDetailsData.fluorescence ? props.diamondDetailsData.fluorescence : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Measurement</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.diamondDetailsData.measurement ? props.diamondDetailsData.measurement : '-'}</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Modal>
                </div>
                <div className="product-info__descreption">
                    <p>{props.diamondDetailsData.subHeader}</p>
                </div>
                <div className="diamond-sku">
                    <span>SKU#</span>
                    {props.diamondDetailsData.diamondId}
                </div>
                <div className="diamond-intro-field">
                    <ul>
                        <li>
                            <strong>Report:</strong>
                            <p>{props.diamondDetailsData.certificate ? props.diamondDetailsData.certificate : 'None'}</p>
                        </li>
                        <li>
                            <strong>Cut:</strong>
                            <p>{props.diamondDetailsData.cut ? props.diamondDetailsData.cut : 'NA'}</p>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <strong>Color:</strong>
                            <p>{props.diamondDetailsData.color ? props.diamondDetailsData.color : 'NA'}</p>
                        </li>
                        <li>
                            <strong>Clarity:</strong>
                            <p>{props.diamondDetailsData.clarity ? props.diamondDetailsData.clarity : 'NA'}</p>
                        </li>
                    </ul>
                </div>
                {(() => {
                    const priceValue = Number(props.diamondDetailsData.fltPrice);
                    return props.diamondDetailsData.fltPrice !== 'Call for Price' && priceValue !== 0 && !isNaN(priceValue);
                })() && (
                    <div className="dia-ring-price">
                        Diamond Price:
                        <span className="complete_setting_price">{formatPrice(props.diamondDetailsData)}</span>
                    </div>
                )}
                <div className="product-controller diamond-product-controller">
                    <ul>
                        {(window.initData?.data?.[0]?.enable_hint === '1' || window.initData?.data?.[0]?.enable_hint === 'true') && (
                            <li>
                                <a href="javascript:;" onClick={onOpenSecondModal}>
                                    <span>
                                        <i className="fas fa-gift"></i>
                                    </span>
                                    Drop A Hint
                                </a>
                                <Modal
                                    open={openSecond}
                                    onClose={() => setOpenSecond(false)}
                                    center
                                    classNames={{
                                        overlay: 'popup_Overlay',
                                        modal: 'popup-form',
                                    }}
                                >
                                    <LoadingOverlay className="_loading_overlay_wrapper">
                                        <Loader fullPage loading={loaded} />
                                    </LoadingOverlay>

                                    <div className="Diamond-form">
                                        <div className="requested-form">
                                            <h2>Drop a hint</h2>
                                            <p>Because you deserve this.</p>
                                        </div>
                                        <form onSubmit={handledrophintSubmit} className="drop-hint-form">
                                            <div className="form-field">
                                                <TextField
                                                    id="drophint_name"
                                                    label="Your Name"
                                                    focused
                                                    variant="outlined"
                                                    value={getyourname}
                                                    onChange={handleYourname}
                                                />
                                                {geterror.yourname && <p className="form-error">{geterror.yourname}</p>}
                                                <TextField
                                                    id="drophint_email"
                                                    type="email"
                                                    label="Your E-mail"
                                                    focused
                                                    variant="outlined"
                                                    value={getyouremail}
                                                    onChange={handleYouremail}
                                                />
                                                {geterror.youremail && <p className="form-error">{geterror.youremail}</p>}
                                                <TextField
                                                    id="drophint_rec_name"
                                                    label="Hint Recipient's Name"
                                                    focused
                                                    variant="outlined"
                                                    value={getrecipientname}
                                                    onChange={handleRecipientname}
                                                />
                                                {geterror.yourrpname && <p className="form-error">{geterror.yourrpname}</p>}
                                                <TextField
                                                    id="drophint_rec_email"
                                                    type="email"
                                                    label="Hint Recipient's E-mail"
                                                    focused
                                                    variant="outlined"
                                                    value={getrecipientemail}
                                                    onChange={handleRecipientemail}
                                                />
                                                {geterror.recipientemail && <p className="form-error">{geterror.recipientemail}</p>}
                                                <TextField
                                                    id="gift_reason"
                                                    label="Reason For This Gift"
                                                    focused
                                                    variant="outlined"
                                                    value={getgiftreason}
                                                    onChange={handleGiftreason}
                                                />
                                                {geterror.yourreason && <p className="form-error">{geterror.yourreason}</p>}
                                                <TextField
                                                    id="drophint_message"
                                                    multiline
                                                    rows={3}
                                                    label="Add A Personal Message Here.."
                                                    focused
                                                    variant="outlined"
                                                    value={gethintmessage}
                                                    onChange={handleHintmessage}
                                                />
                                                {geterror.yourmsg && <p className="form-error">{geterror.yourmsg}</p>}
                                                <UsDateField
                                                    id="date"
                                                    label="Gift Deadline"
                                                    value={getgiftdeadline}
                                                    onChange={handleGiftdeadline}
                                                    minDate={currentDate}
                                                />
                                                {geterror.yourdeadline && <p className="form-error">{geterror.yourdeadline}</p>}

                                                <div className="prefrence-action">
                                                    <div className="prefrence-action action moveUp">
                                                        {window.initData.data[0].google_site_key && window.initData.data[0].google_secret_key && (
                                                            <div className="gf-grecaptcha">
                                                                <ReCAPTCHA
                                                                    sitekey={window.initData.data[0].google_site_key}
                                                                    onChange={handleHintRecaptchaChange}
                                                                />

                                                                {geterror.yourrecaptcha && <p className="form-error">{geterror.yourrecaptcha}</p>}
                                                            </div>
                                                        )}
                                                        <button type="submit" title="Submit" className="btn preference-btn">
                                                            <span>Drop Hint</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </Modal>
                            </li>
                        )}
                        {window.initData.data[0].enable_more_info === '1' && (
                            <li>
                                <a href="javascript:;" onClick={onOpenThirdModal}>
                                    <span>
                                        <i className="fas fa-info"></i>
                                    </span>
                                    Request More Info
                                </a>
                                <Modal
                                    open={openThird}
                                    onClose={() => setOpenThird(false)}
                                    center
                                    classNames={{
                                        overlay: 'popup_Overlay',
                                        modal: 'popup-form',
                                    }}
                                >
                                    <LoadingOverlay className="_loading_overlay_wrapper">
                                        <Loader fullPage loading={loaded} />
                                    </LoadingOverlay>

                                    <div className="Diamond-form--small">
                                        <div className="requested-form">
                                            <h2>Request more information</h2>
                                            <p>Our specialists will contact you.</p>
                                        </div>
                                        <form onSubmit={handlereginfoSubmit} className="request-form">
                                            <div className="form-field">
                                                <TextField
                                                    id="request_name"
                                                    label="Your Name"
                                                    variant="outlined"
                                                    value={getreqname}
                                                    onChange={handleReqname}
                                                />
                                                {getreqerror.yourname && <p className="form-error">{getreqerror.yourname}</p>}

                                                <TextField
                                                    id="request_email"
                                                    type="email"
                                                    label="Your E-mail"
                                                    variant="outlined"
                                                    value={getreqemail}
                                                    onChange={handleReqemail}
                                                />
                                                {getreqerror.youremail && <p className="form-error">{getreqerror.youremail}</p>}

                                                <TextField
                                                    id="request_phone"
                                                    label="Your Phone Number"
                                                    variant="outlined"
                                                    value={getreqphone}
                                                    onChange={handleReqphone}
                                                />
                                                {getreqerror.yourphone && <p className="form-error">{getreqerror.yourphone}</p>}

                                                <TextField
                                                    id="req_message"
                                                    multiline
                                                    rows={3}
                                                    label="Add A Personal Message Here ..."
                                                    variant="outlined"
                                                    value={getreqmsg}
                                                    onChange={handleReqmsg}
                                                />
                                                {getreqerror.yourmsg && <p className="form-error">{getreqerror.yourmsg}</p>}

                                                <div className="contact-prefrtence">
                                                    <span>Contact Preference:</span>
                                                    <div className="pref_container">
                                                        <FormControl>
                                                            <RadioGroup
                                                                aria-labelledby="demo-radio-buttons-group-label"
                                                                defaultValue="female"
                                                                name="radio-buttons-group"
                                                                value={getreqcp}
                                                                onChange={handleReqcp}
                                                            >
                                                                <FormControlLabel
                                                                    value="By Email"
                                                                    name="contact_pref"
                                                                    control={<Radio />}
                                                                    label="By Email"
                                                                />
                                                                <FormControlLabel
                                                                    value="By Phone"
                                                                    name="contact_pref"
                                                                    control={<Radio />}
                                                                    label="By Phone"
                                                                />
                                                            </RadioGroup>
                                                        </FormControl>
                                                    </div>
                                                    {getreqerror.yourcp && <p className="form-error">{getreqerror.yourcp}</p>}
                                                </div>
                                                <div className="prefrence-action">
                                                    <div className="prefrence-action action moveUp">
                                                        {window.initData.data[0].google_site_key && window.initData.data[0].google_secret_key && (
                                                            <div className="gf-grecaptcha">
                                                                <ReCAPTCHA
                                                                    sitekey={window.initData.data[0].google_site_key}
                                                                    onChange={handleRecaptchaChange}
                                                                />
                                                                {getreqerror.yourreqrecaptcha && <p className="form-error">{getreqerror.yourreqrecaptcha}</p>}
                                                            </div>
                                                        )}
                                                        <button type="submit" title="Submit" className="btn preference-btn">
                                                            <span>Request</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </Modal>
                            </li>
                        )}
                        {(window.initData?.data?.[0]?.enable_email_friend === '1' || window.initData?.data?.[0]?.enable_email_friend === 'true') && (
                            <li>
                                <a href="javascript:;" onClick={onOpenFourthModal}>
                                    <span>
                                        <i className="fas fa-envelope"></i>
                                    </span>
                                    E-Mail A Friend
                                </a>
                                <Modal
                                    open={openFour}
                                    onClose={() => setOpenFour(false)}
                                    center
                                    classNames={{
                                        overlay: 'popup_Overlay',
                                        modal: 'popup-form-extra-small',
                                    }}
                                >
                                    <LoadingOverlay className="_loading_overlay_wrapper">
                                        <Loader fullPage loading={loaded} />
                                    </LoadingOverlay>

                                    <div className="Diamond-form--small Diamond-form--xx-small">
                                        <div className="requested-form">
                                            <h2>E-mail a friend</h2>
                                        </div>
                                        <form onSubmit={handleemailfrndSubmit} className="email-form">
                                            <div className="form-field">
                                                <TextField
                                                    id="your_name"
                                                    label="Your Name"
                                                    focused
                                                    variant="outlined"
                                                    value={getname}
                                                    onChange={handleName}
                                                />
                                                {getfrnderror.yourname && <p className="form-error">{getfrnderror.yourname}</p>}

                                                <TextField
                                                    id="your_email"
                                                    type="email"
                                                    label="Your E-mail"
                                                    focused
                                                    variant="outlined"
                                                    value={getemail}
                                                    onChange={handleEmail}
                                                />
                                                {getfrnderror.youremail && <p className="form-error">{getfrnderror.youremail}</p>}

                                                <TextField
                                                    id="fri_name"
                                                    label="Your Friend's Name"
                                                    variant="outlined"
                                                    focused
                                                    value={getfrndname}
                                                    onChange={handleFrndname}
                                                />
                                                {getfrnderror.yourfrnname && <p className="form-error">{getfrnderror.yourfrnname}</p>}

                                                <TextField
                                                    id="f_email"
                                                    type="email"
                                                    label="Your Friend's E-mail"
                                                    focused
                                                    variant="outlined"
                                                    value={getfrndemail}
                                                    onChange={handleFrndemail}
                                                />
                                                {getfrnderror.youremail && <p className="form-error">{getfrnderror.youremail}</p>}

                                                <TextField
                                                    id="email-fri_message"
                                                    multiline
                                                    rows={3}
                                                    label="Add A Personal Message Here.."
                                                    focused
                                                    variant="outlined"
                                                    value={getfrndmessage}
                                                    onChange={handleFrndmessage}
                                                />

                                                {getfrnderror.yourmsg && <p className="form-error">{getfrnderror.yourmsg}</p>}

                                                <div className="prefrence-action">
                                                    <div className="prefrence-action action moveUp">
                                                        {window.initData.data[0].google_site_key && window.initData.data[0].google_secret_key && (
                                                            <div className="gf-grecaptcha">
                                                                <ReCAPTCHA
                                                                    sitekey={window.initData.data[0].google_site_key}
                                                                    onChange={handleEmailFrndRecaptchaChange}
                                                                />
                                                                {getfrnderror.yourfrndrecaptcha && <p className="form-error">{getfrnderror.yourfrndrecaptcha}</p>}
                                                            </div>
                                                        )}
                                                        <button type="submit" title="Submit" className="btn preference-btn">
                                                            <span>Send To Friend</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </Modal>
                            </li>
                        )}
                        {window.initData.data[0].enable_schedule_viewing === '1' && (
                            <li>
                                <a href="javascript:;" onClick={onOpenFifthModal}>
                                    <span>
                                        <i className="far fa-calendar-alt"></i>
                                    </span>
                                    Schedule Viewing
                                </a>
                                <Modal
                                    open={openFive}
                                    onClose={() => setOpenFive(false)}
                                    center
                                    classNames={{
                                        overlay: 'popup_Overlay',
                                        modal: 'popup-form',
                                    }}
                                >
                                    <LoadingOverlay className="_loading_overlay_wrapper">
                                        <Loader fullPage loading={loaded} />
                                    </LoadingOverlay>
                                    <div className="Diamond-form">
                                        <div className="requested-form">
                                            <h2>Schedule a viewing</h2>
                                            <p>See this item and more in our store.</p>
                                        </div>
                                        <form onSubmit={handleschdSubmit} className="schedule-form">
                                            <div className="form-field">
                                                <TextField
                                                    id="schedule_name"
                                                    label="Your Name"
                                                    variant="outlined"
                                                    value={getschdname}
                                                    onChange={handleSchdname}
                                                />
                                                {getschderror.yourname && <p className="form-error">{getschderror.yourname}</p>}

                                                <TextField
                                                    id="schedule_email"
                                                    type="email"
                                                    label="Your E-mail Address"
                                                    variant="outlined"
                                                    value={getschdemail}
                                                    onChange={handleSchdemail}
                                                />
                                                {getschderror.youremail && <p className="form-error">{getschderror.youremail}</p>}

                                                <TextField
                                                    id="schedule_num"
                                                    label="Your Phone Number"
                                                    variant="outlined"
                                                    value={getschdphone}
                                                    onChange={handleSchdphone}
                                                />
                                                {getschderror.yourphone && <p className="form-error">{getschderror.yourphone}</p>}

                                                <TextField
                                                    id="drophint_message"
                                                    multiline
                                                    rows={3}
                                                    label="Add A Personal Message Here ..."
                                                    variant="outlined"
                                                    value={getschdmsg}
                                                    onChange={handleSchdmsg}
                                                />
                                                {getschderror.yourmsg && <p className="form-error">{getschderror.yourmsg}</p>}

                                                <Select
                                                    labelId="demo-simple-select-standard-label"
                                                    id="select_schedule"
                                                    value={location}
                                                    onChange={handleChange}
                                                    label="Location"
                                                    focused
                                                    variant="outlined"
                                                >
                                                    {addressList.map((addressList, index) => (
                                                        <MenuItem key={index} value={addressList.locationName}>
                                                            {addressList.locationName}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {getschderror.yourlocation && <p className="form-error">{getschderror.yourlocation}</p>}

                                                <UsDateField
                                                    id="date"
                                                    label="When are you available?"
                                                    value={getschddate}
                                                    onChange={handleSchddate}
                                                    minDate={currentDate}
                                                />
                                                {getschderror.yourdate && <p className="form-error">{getschderror.yourdate}</p>}
                                                {errorMessage && <p className="form-error">{errorMessage}</p>}

                                                {showTime === true && (
                                                    <Select
                                                        labelId="demo-simple-select-standard-label"
                                                        id="select_time"
                                                        value={getschdtime}
                                                        onChange={handleSchdtime}
                                                        label="Time"
                                                        focused
                                                        variant="outlined"
                                                    >
                                                        {daysWithSlots.map((day, index) => (
                                                            <MenuItem key={index} value={`${day.name}: ${day.start} - ${day.end}`}>
                                                                {`${day.name}: ${day.start} - ${day.end}`}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                )}

                                                <div className="prefrence-action">
                                                    <div className="prefrence-action action moveUp">
                                                        {window.initData.data[0].google_site_key && window.initData.data[0].google_secret_key && (
                                                            <div className="gf-grecaptcha">
                                                                <ReCAPTCHA
                                                                    sitekey={window.initData.data[0].google_site_key}
                                                                    onChange={handleSchlRecaptchaChange}
                                                                />
                                                                {getschderror.yourscrecaptcha && <p className="form-error">{getschderror.yourscrecaptcha}</p>}
                                                            </div>
                                                        )}
                                                        <button type="submit" title="Submit" className="btn preference-btn">
                                                            <span>Request</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </Modal>
                            </li>
                        )}
                    </ul>
                </div>

                <div className="diamond-tryon">
                    <span>
                        {isSettingCallForPrice || isDiamondCallForPrice
                            ? ''
                            : props.diamondDetailsData.currencyFrom === 'USD'
                              ? '$'
                              : window.currency}
                        {isSettingCallForPrice || isDiamondCallForPrice ? 'Call for Price' : formatprice(finalprice)}
                    </span>

                    <div className="diamond-btn">
                        {props.settingDetailsData.rbEcommerce === true && (
                        <div className="rbEcommerce">
                            {!(isSettingCallForPrice || isDiamondCallForPrice) && (
                                <button type="submit" title="Submit" onClick={handleAddToCart} className="btn btn-diamond">
                                    Add To Cart
                                </button>
                            )}
                        </div>
                        )}
                        {window.initData.data[0].display_tryon === 1 && (
                            <a className="btn btn-tryon" onClick={handlevirtual} href="#">
                                Virtual Try On
                            </a>
                        )}
                    </div>
                </div>
            </div>
            {getTryon === 'true' && (
                <>
                    <iframe
                        id="tryoniframe"
                        src={getTryonsrc}
                        allow="camera"
                        width={'100%'}
                        style={{
                            position: 'fixed',
                            left: '0',
                            top: '0',
                            overflow: 'hidden',
                        }}
                        height={'100%'}
                    ></iframe>
                    <style>
                        {`body{
                    overflow: hidden;
                }
                #tryoniframe{
                  z-index : 99;
                }
                `}
                    </style>
                </>
            )}
        </>
    );
};

export default CompleteRingInfo;
