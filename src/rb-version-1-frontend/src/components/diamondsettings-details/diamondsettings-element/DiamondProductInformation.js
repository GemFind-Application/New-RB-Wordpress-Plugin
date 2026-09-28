import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Loader, LoadingOverlay } from 'react-overlay-loader';
import { Modal } from 'react-responsive-modal';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { cartService, emailService } from '../../../Services';
// import ReactFBLike from "react-fb-like";
// import InputLabel from "@mui/material/InputLabel";
import ReCAPTCHA from 'react-google-recaptcha';
import { formatPrice } from '../../../utils/priceUtils';
import UsDateField from '../../elements/UsDateField';
import { RB_BASE, apiUrl, nonceQuery, shopDomain } from '../../../wp/wpEnv';

// import { useNavigate } from "react-router-dom";

function formatprice(finalprice) {
    finalprice = finalprice.toString();
    var lastThree = finalprice.substring(finalprice.length - 3);
    var otherNumbers = finalprice.substring(0, finalprice.length - 3);
    if (otherNumbers != '') lastThree = ',' + lastThree;
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
}

const DiamondProductInformation = (props) => {
    const [open, setOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [cookies, setCookie] = useCookies(['_shopify_diamondsetting']);
    const [getsettingcookies, setsettingcookies] = useCookies(['_shopify_ringsetting']);
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [recaptchaReqToken, setReqRecaptchaToken] = useState('');
    const [isReqRecaptchaVerified, setIsReqRecaptchaVerified] = useState(false);

    const [recaptchaEmailFrndToken, setEmailFrndRecaptchaToken] = useState('');
    const [isEmailFrndRecaptchaVerified, setIsEmailFrndRecaptchaVerified] = useState(false);

    const [recaptchaSchlToken, setSchlRecaptchaToken] = useState('');
    const [isSchlRecaptchaVerified, setIsSchlRecaptchaVerified] = useState(false);

    const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);
    const [getDiamondCookie, setDiamondCookie] = useState(false);
    const [getsettingcookie, setsettingcookie] = useState(false);
    const currentDate = new Date().toISOString().split('T')[0];

    const navigate = useNavigate();
    let errors = {};
    let formIsValid = true;
    const locationurl = useLocation();

    // Helper function to get diamond type with fallback
    // Prioritizes props and product data, then falls back to URL pathname
    const getDiamondType = () => {
        // First try to use the prop (most reliable if provided)
        if (props.diamondType) {
            return props.diamondType;
        }

        // Check if there's an isLabGrown prop (similar to version 2)
        if (props.isLabGrown === true) {
            return 'labcreated';
        }
        if (props.isLabGrown === 'fancy') {
            return 'fancydiamonds';
        }

        // Fallback: derive from product data
        if (props.productDetailsData?.isLabCreated === true || 
            props.productDetailsData?.isLabCreated === 'true' ||
            props.productDetailsData?.isLabCreated === 1) {
            return 'labcreated';
        }
        if (props.productDetailsData?.fancyColorIntensity || 
            props.productDetailsData?.fancyColorMainBody ||
            props.productDetailsData?.isfancy === true ||
            props.productDetailsData?.isfancy === 'true') {
            return 'fancydiamonds';
        }

        // Fallback: derive from URL pathname
        const pathname = locationurl.pathname.toLowerCase();
        if (pathname.includes('/labcreated') || 
            pathname.includes('lab-created') || 
            pathname.includes('/labgrown') ||
            pathname.includes('lab-grown')) {
            return 'labcreated';
        }
        if (pathname.includes('/fancydiamonds') || 
            pathname.includes('fancy-diamonds') ||
            pathname.includes('/fancy')) {
            return 'fancydiamonds';
        }
        if (pathname.includes('/mined')) {
            return 'mined';
        }

        // Default to mined if nothing else matches
        return 'mined';
    };

    const onOpenModal = (e) => {
        e.preventDefault();
        setOpen(true);
    };
    const onCloseModal = () => setOpen(false);
    const [openSecond, setOpenSecond] = useState(false);
    const [openThird, setOpenThird] = useState(false);
    const [openFour, setOpenFour] = useState(false);
    const [openFive, setOpenFive] = useState(false);
    const [openSix, setOpenSix] = useState(false);
    const [isCartModalOpen, setCartModalOpen] = useState(false);

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

    const onclickpopup = (e) => {
        e.preventDefault();
    };

    const handleCompletering = (e) => {
        e.preventDefault();
        var diamondData = [];
        var data = {};

        data.diamondId = props.productDetailsData.diamondId;
        data.centerStone = props.productDetailsData.shape;
        data.carat = props.productDetailsData.caratWeight;
        data.centerstonemincarat = Number(props.productDetailsData.caratWeight) - 0.1;
        data.centerstonemaxcarat = Number(props.productDetailsData.caratWeight) + 0.1;
        data.isLabCreated = props.productDetailsData.isLabCreated;
        data.diamondpath = locationurl.pathname;
        diamondData.push(data);
        setCookie('_shopify_diamondsetting', JSON.stringify(diamondData), {
            path: '/',
            maxAge: 604800,
        });
        navigate(`${RB_BASE}/completering`);
    };

    const handleSettings = (e) => {
        e.preventDefault();
        var diamondData = [];
        var data = {};

        data.diamondId = props.productDetailsData.diamondId;
        data.centerStone = props.productDetailsData.shape;
        data.carat = props.productDetailsData.caratWeight;
        data.centerstonemincarat = Number(props.productDetailsData.caratWeight) - 0.1;
        data.centerstonemaxcarat = Number(props.productDetailsData.caratWeight) + 0.1;
        data.isLabCreated = props.productDetailsData.isLabCreated;
        data.diamondpath = locationurl.pathname;
        diamondData.push(data);
        setCookie('_shopify_diamondsetting', JSON.stringify(diamondData), {
            path: '/',
            maxAge: 604800,
        });

        if (window.initData.data[0].is_api === 'false') {
            window.location.href = '/collections/ringbuilder-settings';
        } else {
            const isLab = props.productDetailsData.isLabCreated;
            if (isLab === true || isLab === "true") {
                navigate(`${RB_BASE}/labgrownsettings`);
            } else {
                navigate(`${RB_BASE}/settings`);
            }
        }
    };

    const handleRecaptchaChange = (response) => {
        setRecaptchaToken(response);
        setIsRecaptchaVerified(true); // Set verification status
    };

    const handleReqRecaptchaChange = (response) => {
        setReqRecaptchaToken(response);
        setIsReqRecaptchaVerified(true); // Set verification status
    };

    const handleEmailFrndRecaptchaChange = (response) => {
        setEmailFrndRecaptchaToken(response);
        setIsEmailFrndRecaptchaVerified(true); // Set verification status
    };

    const handleSchlRecaptchaChange = (response) => {
        setSchlRecaptchaToken(response);
        setIsSchlRecaptchaVerified(true); // Set verification status
    };

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

    const addressList = props.productDetailsData?.retailerInfo?.addressList || [];

    const timingList = props.productDetailsData?.retailerInfo?.timingList || [];

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

    const handledrophintSubmit = async (e) => {
        e.preventDefault();
        setLoaded(true);

        //Validation

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
            if (recaptchaToken === '') {
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
            const formData = {
                name: getyourname,
                email: getyouremail,
                phone_no: '',
                hint_Recipient_name: getrecipientname,
                hint_Recipient_email: getrecipientemail,
                reason_of_gift: getgiftreason,
                hint_message: gethintmessage,
                deadline: getgiftdeadline,
                diamondId: props.productDetailsData.diamondId,
                diamondType: getDiamondType(),
            };

            const result = await emailService.diamondDropHint(formData, recaptchaToken);

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

        //Name
        if (getreqname === '') {
            errors['yourname'] = 'Please enter your name';
            formIsValid = false;
        }

        //Email
        const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (regex.test(getreqemail) === false) {
            errors['youremail'] = 'Please enter valid email';
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
            if (recaptchaReqToken === '') {
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
            const formData = {
                name: getreqname,
                email: getreqemail,
                phone_no: getreqphone,
                message: getreqmsg,
                contact_preference: getreqcp,
                diamondId: props.productDetailsData.diamondId,
                diamondType: getDiamondType(),
            };

            const result = await emailService.diamondRequestInfo(formData, recaptchaReqToken);

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
            const formData = {
                name: getname,
                email: getemail,
                phone_no: '',
                frnd_name: getfrndname,
                frnd_email: getfrndemail,
                frnd_message: getfrndmessage,
                diamondId: props.productDetailsData.diamondId,
                diamondType: getDiamondType(),
            };

            const result = await emailService.diamondEmailFriend(formData, recaptchaEmailFrndToken);

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
    const [getblankvalue, setblankvalue] = useState(['']);

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

        //Name
        if (getschdname === '') {
            errors['yourname'] = 'Please enter your name';
            formIsValid = false;
        }

        //Email
        const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (regex.test(getschdemail) === false) {
            errors['youremail'] = 'Please enter valid email';
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
            const formData = {
                name: getschdname,
                email: getschdemail,
                phone_no: getschdphone,
                schl_message: getschdmsg,
                location: location,
                availability_date: getschddate,
                appnt_time: getschdtime,
                diamondId: props.productDetailsData.diamondId,
                diamondType: getDiamondType(),
            };

            const result = await emailService.diamondScheduleViewing(formData, recaptchaSchlToken);

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

    //Add To Cart - use proxy for backend (same-origin), then Shopify Cart API on current origin with 422 retry
    const handleAddToCart = async (e) => {
        e.preventDefault();
        setCartModalOpen(true);
        console.log('DiamondProductInformation: cart status modal opened');

        try {
            // WordPress: POST /addToCart creates/updates the WooCommerce product for this stone and
            // returns { success, cart_url } (a URL that lands in the cart). list_type/diamond_type let the
            // API resolve fancy / lab-grown stones.
            const response = await cartService.addDiamondToCart(
                props.productDetailsData.diamondId,
                getDiamondType(),
                shopDomain()
            );
            const cartUrl = typeof response === 'string' ? response : response && (response.cart_url || response.url);
            if (!cartUrl) {
                throw new Error((response && (response.error || response.message)) || 'Failed to add to cart');
            }
            console.log('DiamondProductInformation: redirecting to cart');
            window.location.href = cartUrl;
        } catch (error) {
            console.error('Add to cart error:', error);
            setCartModalOpen(false);
            console.log('DiamondProductInformation: cart status modal closed after exception');
            toast.error(error.response?.data?.message || error.message || 'Failed to add to cart');
        }
    };

    //Print API
    const handlePrintDetails = (e) => {
        e.preventDefault();

        // WordPress REST route; a plain <a download> cannot send X-WP-Nonce, so pass _wpnonce.
        const url = nonceQuery(
            apiUrl('/printDiamond/' + window.initData.data[0].shop + '/' + props.productDetailsData.diamondId + '/' + props.diamondType)
        );

        // Create a temporary link to trigger PDF download
        const link = document.createElement('a');
        link.href = url;
        link.download = `Diamond-${props.productDetailsData.diamondId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (cookies._shopify_diamondsetting && cookies._shopify_diamondsetting[0].diamondId) {
            setDiamondCookie(true);
        }
        if (getsettingcookies._shopify_ringsetting && getsettingcookies._shopify_ringsetting[0].setting_id) {
            setsettingcookie(true);
        }
    });

    return (
        <>
            <ToastContainer
                limit={1}
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
                    <h2>{props.productDetailsData.mainHeader}</h2>
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
                            modal: 'popup_diamond-product gf-spec-popup',
                        }}
                    >
                        <div className="popup_content">
                            {/* <p className='popup_pr'>This refer to different type of Metal Type to filter and select the appropriate ring as per your requirements. Look for a metal type best suit of your chosen ring.</p> */}
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
                                            <p>{props.productDetailsData.stockNumber ? props.productDetailsData.stockNumber : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Price</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{formatPrice(props.productDetailsData)}</p>
                                        </div>
                                    </li>
                                    {/* <li>
                                        <div className="diamonds-details-title">
                                            <p>Price Per Carat</p>
                                        </div>
                                        <div className="diamonds-info"></div>
                                    </li> */}
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Carat Weight</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.productDetailsData.caratWeight ? props.productDetailsData.caratWeight : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Cut</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.productDetailsData.cut ? props.productDetailsData.cut : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Clarity</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.productDetailsData.clarity ? props.productDetailsData.clarity : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Depth %</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.productDetailsData.depth ? props.productDetailsData.depth : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Table %</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.productDetailsData.table ? props.productDetailsData.table : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Polish</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.productDetailsData.polish ? props.productDetailsData.polish : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Symmetry</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.productDetailsData.symmetry ? props.productDetailsData.symmetry : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Origin</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.productDetailsData.origin ? props.productDetailsData.origin : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Girdle</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.productDetailsData.gridle ? props.productDetailsData.gridle : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Culet</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.productDetailsData.culet ? props.productDetailsData.culet : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Fluorescence</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.productDetailsData.fluorescence ? props.productDetailsData.fluorescence : '-'}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="diamonds-details-title">
                                            <p>Measurement</p>
                                        </div>
                                        <div className="diamonds-info">
                                            <p>{props.productDetailsData.measurement ? props.productDetailsData.measurement : '-'}</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Modal>
                </div>
                <div className="product-info__descreption">
                    {props.productDetailsData.subHeader && /<[^>]+>/.test(props.productDetailsData.subHeader) ? (
                        <div dangerouslySetInnerHTML={{ __html: props.productDetailsData.subHeader }} />
                    ) : (
                        <p>{props.productDetailsData.subHeader}</p>
                    )}
                </div>
                <div className="diamond-intro-field">
                    <ul>
                        <li>
                            <strong>Report:</strong>
                            {props.productDetailsData.certificate !== '' && <p>{props.productDetailsData.certificate}</p>}
                            {props.productDetailsData.certificate === '' && <p>None</p>}
                        </li>
                        <li>
                            <strong>Cut:</strong>
                            {props.productDetailsData.cut !== '' && <p>{props.productDetailsData?.cut || 'N/A'}</p>}
                            {props.productDetailsData.cut === '' && <p>NA</p>}
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <strong>Color:</strong>
                            <p>{props.productDetailsData.color ? props.productDetailsData.color : 'NA'}</p>
                        </li>
                        <li>
                            <strong>Clarity:</strong>
                            <p>{props.productDetailsData.clarity ? props.productDetailsData.clarity : 'NA'}</p>
                        </li>
                    </ul>
                </div>
                <div className="product-controller">
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
                                                {geterror.youremail && <p className="form-error">{geterror.youremail}</p>}
                                                <TextField
                                                    id="dgift_reason"
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
                                                                    onChange={handleRecaptchaChange}
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
                        {(window.initData?.data?.[0]?.enable_more_info === '1' || window.initData?.data?.[0]?.enable_more_info === 'true') && (
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
                                                    focused
                                                    variant="outlined"
                                                    value={getreqname}
                                                    onChange={handleReqname}
                                                />
                                                {getreqerror.yourname && <p className="form-error">{getreqerror.yourname}</p>}

                                                <TextField
                                                    id="request_email"
                                                    type="email"
                                                    label="Your E-mail"
                                                    focused
                                                    variant="outlined"
                                                    value={getreqemail}
                                                    onChange={handleReqemail}
                                                />
                                                {getreqerror.youremail && <p className="form-error">{getreqerror.youremail}</p>}

                                                <TextField
                                                    id="request_phone"
                                                    label="Your Phone Number"
                                                    focused
                                                    variant="outlined"
                                                    value={getreqphone}
                                                    onChange={handleReqphone}
                                                />
                                                {getreqerror.yourphone && <p className="form-error">{getreqerror.yourphone}</p>}

                                                <TextField
                                                    id="req_message"
                                                    multiline
                                                    rows={3}
                                                    label="Add A Personal Message Here.."
                                                    focused
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
                                                                    onChange={handleReqRecaptchaChange}
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
                        {(window.initData?.data?.[0]?.enable_print === '1' || window.initData?.data?.[0]?.enable_print === 'true') && (
                            <li>
                                <a href="javascript:;" onClick={handlePrintDetails}>
                                    <span>
                                        <i className="fas fa-print"></i>
                                    </span>
                                    Print Details
                                </a>
                            </li>
                        )}

                        {(window.initData?.data?.[0]?.enable_schedule_viewing === '1' ||
                            window.initData?.data?.[0]?.enable_schedule_viewing === 'true') && (
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
                                                    focused
                                                    variant="outlined"
                                                    value={getschdname}
                                                    onChange={handleSchdname}
                                                />
                                                {getschderror.yourname && <p className="form-error">{getschderror.yourname}</p>}

                                                <TextField
                                                    id="schedule_email"
                                                    type="email"
                                                    label="Your E-mail Address"
                                                    focused
                                                    variant="outlined"
                                                    value={getschdemail}
                                                    onChange={handleSchdemail}
                                                />
                                                {getschderror.youremail && <p className="form-error">{getschderror.youremail}</p>}

                                                <TextField
                                                    id="schedule_num"
                                                    label="Your Phone Number"
                                                    focused
                                                    variant="outlined"
                                                    value={getschdphone}
                                                    onChange={handleSchdphone}
                                                />
                                                {getschderror.yourphone && <p className="form-error">{getschderror.yourphone}</p>}

                                                <TextField
                                                    id="drophint_message"
                                                    multiline
                                                    rows={3}
                                                    label="Add A Personal Message Here.."
                                                    focused
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
                {window.initData.data[0].announcement_text_rbdetail !== '' && window.initData.data[0].announcement_text_rbdetail !== null && (
                    <div className="gf-diamond-details-text">
                        <span>{window.initData.data[0].announcement_text_rbdetail}</span>
                    </div>
                )}
                <div className="diamond-tryon">
                    <span>{formatPrice(props.productDetailsData)}</span>

                    <div className="diamond-btn">
                        {props.productDetailsData.dsEcommerce === true &&
                            (Number(window.initData?.data?.[0]?.buySingleDiamond) === 1 ||
                                window.initData?.data?.[0]?.buySingleDiamond === 'true') && (
                                <div>
                                    {(() => {
                                        const priceValue = Number(props.productDetailsData.fltPrice);
                                        return props.productDetailsData.fltPrice !== 'Call for Price' && priceValue !== 0 && !isNaN(priceValue);
                                    })() && (
                                        <button type="submit" title="Submit" onClick={handleAddToCart} className="btn btn-diamond">
                                            Add To Cart
                                        </button>
                                    )}
                                </div>
                            )}
                        {getsettingcookie === false && (
                            <button type="submit" title="Submit" onClick={handleSettings} className="btn btn-tryon">
                                Add Your Setting
                            </button>
                        )}

                        {getsettingcookie === true && (
                            <button type="submit" title="Submit" onClick={handleCompletering} className="btn btn-tryon">
                                Complete Your Ring
                            </button>
                        )}
                    </div>
                </div>
                <div className="social-icons">
                    <ul className="social-share">
                        {(() => {
                            // Extract options from nested array structure: [[{...options...}]]
                            const jcOptionsData = props.jcOptions?.[0]?.[0];

                            // Helper function to check if option is enabled (handles both boolean and string "1")
                            const isEnabled = (apiValue, fallbackValue) => {
                                if (apiValue !== undefined && apiValue !== null) {
                                    return apiValue === true || apiValue === '1';
                                }
                                return fallbackValue === '1';
                            };

                            // Use jcOptions from API if available, otherwise fallback to window.initData
                            const showPinterest = isEnabled(jcOptionsData?.show_Pinterest_Share, window.initData?.data?.[0]?.show_Pinterest_Share);
                            const showTwitter = isEnabled(jcOptionsData?.show_Twitter_Share, window.initData?.data?.[0]?.show_Twitter_Share);
                            const showFacebookShare = isEnabled(jcOptionsData?.show_Facebook_Share, window.initData?.data?.[0]?.show_Facebook_Share);
                            const showFacebookLike = isEnabled(jcOptionsData?.show_Facebook_Like, window.initData?.data?.[0]?.show_Facebook_Like);
                            return (
                                <>
                                    {showPinterest && (
                                        <li>
                                            <a
                                                target="_blank"
                                                href={`https://www.pinterest.com/pin/create/button/?url=${window.location.href}&media=${props.productDetailsData.mainImageURL}&description=${props.productDetailsData.description}`}
                                                className="red"
                                            >
                                                <i className="fab fa-pinterest-p"></i>
                                                <span>Save</span>
                                            </a>
                                        </li>
                                    )}
                                    {showTwitter && (
                                        <li>
                                            <a
                                                target="_blank"
                                                href={`https://twitter.com/share?ref_src=${window.location.href}`}
                                                className="sky-blue"
                                            >
                                                <i className="fab fa-twitter"></i>
                                                <span>Twitter</span>
                                            </a>
                                        </li>
                                    )}
                                    {showFacebookShare && (
                                        <li>
                                            <a
                                                target="_blank"
                                                href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                                                className="blue"
                                            >
                                                <i className="fab fa-facebook-f"></i>
                                                <span>share</span>
                                            </a>
                                        </li>
                                    )}
                                    {showFacebookLike && (
                                        <li>
                                            <a
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href={`https://www.facebook.com/plugins/like.php?href=${encodeURIComponent(window.location.href)}`}
                                                className="blue"
                                            >
                                                {/* WordPress: click-out link instead of the Facebook JS SDK (no connect.facebook.net). */}
                                                <i className="fab fa-thumbs-up"></i>
                                                <span>Like</span>
                                            </a>
                                        </li>
                                    )}
                                </>
                            );
                        })()}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default DiamondProductInformation;
