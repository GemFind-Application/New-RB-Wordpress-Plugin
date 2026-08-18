import React, { useState,useEffect ,useRef} from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./ScheduleViewingPopup.css";
import { emailService } from '../Services';
import SettingDetails1 from './setting-details1';
import ReCAPTCHA from 'react-google-recaptcha';
import { GfrbP } from './scoped/GfrbText';
const ScheduleViewingPopup = ({ onClose, locations, settingId, isLabSetting, ringurl, shopurl ,diamondId,diamondtype,diamondurl,diamondDetail,SettingDetails,configAppData, setShowLoading, price, min_carat, max_carat, metalType, styleNumber}) => {
  let formDataValue= {
    name: '',
    email: '',
    phone: '',
    hint_message: '',
    avail_date: null,
    location: '',
    appnt_time:null,
    isLabSetting: isLabSetting,   
    shopurl: shopurl,
   
  }
  if(configAppData.site_key&&configAppData.site_key!==""){
    formDataValue['captcha-response']='',
    formDataValue['secret-key']=configAppData.secret_key
  }
  if(settingId&&settingId!==""){
    formDataValue.settingid = settingId;
    formDataValue.ringurl=ringurl;
    formDataValue.price = price || '';
    formDataValue.setting_price = price || '';
    formDataValue.min_carat = min_carat || '';
    formDataValue.max_carat = max_carat || '';
    formDataValue.metalType = metalType || '';
    formDataValue.styleNumber = styleNumber || '';
  }else{
    formDataValue.diamondid = diamondId;
    formDataValue.diamondtype = diamondtype;
    formDataValue.diamondurl = diamondurl;
  }
  if(settingId&&settingId!==""&&diamondId&&diamondId!=""){
    formDataValue.completering='completering';
  //  formDataValue.diamondid = diamondId;
    formDataValue.diamondId=diamondId;
    formDataValue.diamondtype = diamondtype;
    formDataValue.diamondurl = diamondurl;
  }
  const [formData, setFormData] = useState(formDataValue);

  const [errors, setErrors] = useState({});
  const [ScheduleViewing, setScheduleViewing] = useState(false);
  const [scheduleViewingMessage,setScheduleViewingMessage]= useState('');
  const [errorsFromRes, setErrorsFromRes] = useState('');
  const [timearray, setTimeArray] = useState([]);
  const [availableTimeArray, setAvailableTimeArray] = useState([]);
  const recaptcha = useRef();
  useEffect(() => {
    setAvailableTimeArray([])
    if(settingId&&settingId!==""){
      if( SettingDetails.addressList){
        const locationIdObject = SettingDetails.addressList.filter(item=>item.locationName===formData.location); 
        
        if(locationIdObject.length > 0){
          const timedetail = SettingDetails.timingList && Array.isArray(SettingDetails.timingList) 
            ? SettingDetails.timingList.filter(item=>item.locationID==locationIdObject[0].locationID)
            : [];
          setTimeArray(timedetail)
          setFormData({...formData,avail_date:null,appnt_time:null})
        } else {
          setTimeArray([])
          setFormData({...formData,avail_date:null,appnt_time:null})
        }
      } else {
        setTimeArray([])
        setFormData({...formData,avail_date:null,appnt_time:null})
      }
    }else{
      if( diamondDetail?.retailerInfo?.addressList){
        const locationIdObject = diamondDetail.retailerInfo.addressList.filter(item=>item.locationName===formData.location); 
         //console.log(locationIdObject.length)
         if(locationIdObject.length!=0) {
          if(locationIdObject.length > 0){
            const timedetail = diamondDetail.retailerInfo.timingList && Array.isArray(diamondDetail.retailerInfo.timingList)
              ? diamondDetail.retailerInfo.timingList.filter(item=>item.locationID==locationIdObject[0].locationID)
              : [];
            setTimeArray(timedetail)
            setFormData({...formData,avail_date:null,appnt_time:null})
          }
         }else{
          setTimeArray([])
          setFormData({...formData,avail_date:null,appnt_time:null})
          //setErrors({ ...errors, ['location']: 'Please selcet location first' });
          //document.getElementsByName('location');

         }
       
      } else {
        setTimeArray([])
        setFormData({...formData,avail_date:null,appnt_time:null})
      }
    }
   
  }, [formData.location]);
  
  // Fetch reCAPTCHA token on mount
  useEffect(() => {
    async function fetchToken(){
      if(configAppData.site_key && configAppData.site_key !== "" && recaptcha.current){
        try {      
          const token = await recaptcha.current.executeAsync();
          setFormData(prev => ({ ...prev, 'captcha-response': token }));      
        } catch (err) {  
          console.error("Error fetching captcha:", err);
          // Don't set error on mount, just log it
        }
      }
    }
    fetchToken();
  }, [configAppData.site_key]);
  
  // Fetch reCAPTCHA token when errors occur (to reset and get new token)
  useEffect(() => {
    async function fetchToken(){
      if(configAppData.site_key && configAppData.site_key !== "" && recaptcha.current && errorsFromRes){
        try {      
          const token = await recaptcha.current.executeAsync();
          setFormData(prev => ({ ...prev, 'captcha-response': token }));      
        } catch (err) {  
          console.error("Error fetching captcha:", err);
        }
      }
    }
    if(errorsFromRes) {
      fetchToken();
    }
  }, [errorsFromRes]);
   const checklocation = () =>{

    if(formData.location===""){
      
    }
   }
  const handleInputChange = (e) => {
   
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
   
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  const convertTime12to24 = (time12h) => {
   // console.log(time12h)
    const [time, modifier] = time12h.split(' ');
  
    let [hours, minutes] = time.split(':');
  
    if (hours === '12') {
      hours = '00';
    }
  
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
  
    return `${hours}:${minutes!==undefined ?minutes:'00'}`;
  }

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {hour: '2-digit', minute: '2-digit'});
  }
  
  const handleDateChange = (date) => {
    if(formData.location==""){
     (document.getElementsByName('location')[0].focus());
     setErrors({ ...errors, ['location']: 'Please select location first' });
    }else{    
    const start = new Date(date);
    const end = new Date(date);
    const isStoreClose = ('storeClosed'+start.toLocaleString('en-US', { weekday: 'short' }));
    
    // Check if timearray exists, has elements, and the first element has the required properties
    if(timearray.length > 0 && timearray[0] && timearray[0][isStoreClose] !== undefined && timearray[0][isStoreClose] === ""){     
      const dayArray = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
      const dayKey = dayArray[date.getDay()];
      const startKey = dayKey + 'Start';
      const endKey = dayKey + 'End';
      
      // Check if the timing properties exist before accessing them
      if(timearray[0][startKey] && timearray[0][endKey]) {
        let startDay = convertTime12to24(timearray[0][startKey]);
        let endDay = convertTime12to24(timearray[0][endKey]);
        let startDayArray = (startDay.split(':'));
        let endDayArray = (endDay.split(':')); 
        start.setHours(startDayArray[0],startDayArray[1],0);
        end.setHours(endDayArray[0],endDayArray[1],0);
        let availableTime = [];
        while (start <= end) {
          availableTime.push((start.toLocaleString('en-US', {hour: '2-digit', minute: '2-digit'})));
          start.setMinutes(start.getMinutes() + 30);
        }
        if(availableTime.length > 0) {
          setAvailableTimeArray(availableTime)
          setFormData({ ...formData, avail_date: date, appnt_time: availableTime[0]});   
        } else {
          setAvailableTimeArray([])
          setFormData({ ...formData, avail_date: date, appnt_time: null}); 
        }
      } else {
        // No timing data available for this day
        setAvailableTimeArray([])
        setFormData({ ...formData, avail_date: date, appnt_time: null}); 
      }
    }else{
      // No timing list available or store is closed
      setAvailableTimeArray([])
      setFormData({ ...formData, avail_date: null, appnt_time: null}); 
    }
   
   // setFormData({ ...formData, avail_date: date});   
   // setFormData({ ...formData, appnt_time: date.toLocaleTimeString() });
    if (errors.preference) {
      setErrors({ ...errors, preference: '' });
    }}
  };

  const validateForm = (dataToValidate = formData) => {
    let newErrors = {};

    if (!dataToValidate.name.trim()) newErrors.name = 'Name is required';
    if (!dataToValidate.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(dataToValidate.email)) newErrors.email = 'Email is invalid';
    if (!dataToValidate.phone.trim()) newErrors.phoneNumber = 'Phone number is required';
    else if (!/^\d{10}$/.test(dataToValidate.phone.replace(/\D/g, ''))) newErrors.phoneNumber = 'Phone number is invalid';
    if (!dataToValidate.hint_message.trim()) newErrors.message = 'Message is required';
    // Only require date if timing list is available
    if (timearray.length > 0 && !dataToValidate.avail_date) {
      newErrors.preference = 'Please select a date';
    }
    if (!dataToValidate.location) newErrors.location = 'Please select a location';
    if(configAppData.site_key&&configAppData.site_key!==""){
      if (!dataToValidate['captcha-response']) {
        newErrors.recaptcha = 'Please verify captcha';
      }  
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let dataToSubmit = { ...formData };
    
    // Fetch reCAPTCHA token before validation if reCAPTCHA is enabled and token is missing
    if(configAppData.site_key && configAppData.site_key !== "" && recaptcha.current && !dataToSubmit['captcha-response']){
      try {
        const token = await recaptcha.current.executeAsync();
        dataToSubmit['captcha-response'] = token;
        setFormData(prev => ({ ...prev, 'captcha-response': token }));
      } catch (err) {
        console.error("Error fetching captcha:", err);
        setErrorsFromRes("Failed to get captcha. Please try again later.");
        return;
      }
    }
    
    if (validateForm(dataToSubmit)) {
      submitForm(dataToSubmit);
    }
  };
  
  const submitForm = async (dataToSubmit = formData) => {
    // Build a plain object, preserving null values for date/time fields
    let formDataVal = {};
    Object.keys(dataToSubmit).forEach(function (key) {
      let value = dataToSubmit[key];
      // Preserve null values for avail_date and appnt_time, convert other nulls to empty string
      if (value === null) {
        if (key === 'avail_date' || key === 'appnt_time') {
          formDataVal[key] = null;
        } else {
          formDataVal[key] = '';
        }
      } else {
        formDataVal[key] = value;
      }
    });
    
    try {
      setShowLoading(true);
      
      let res;
      // Determine which API to call based on the form data
      if (dataToSubmit.settingid && dataToSubmit.diamondId) {
        // Complete ring - both setting and diamond
        res = await emailService.completeRingScheduleViewing(formDataVal);
      } else if (dataToSubmit.diamondid && !dataToSubmit.settingid) {
        // Diamond only
        res = await emailService.diamondScheduleViewing(formDataVal);
      } else if (dataToSubmit.settingid && !dataToSubmit.diamondId) {
        // Ring/Setting only
        res = await emailService.ringScheduleViewing(formDataVal);
      }

      if(res.output.status===2){
        setErrorsFromRes(res.output.msg);        
        setShowLoading(false);
        if(configAppData.site_key&&configAppData.site_key!==""){
          recaptcha.current.reset();
        }
      }
      if(res.output.status===1){
        setErrorsFromRes(''); // Clear any previous error messages
        setScheduleViewingMessage(res.output.msg)
        setScheduleViewing(true);
      
        setShowLoading(false);
        if(configAppData.site_key&&configAppData.site_key!==""){
          recaptcha.current.reset();
        }
      }
    } catch (error) {
      setShowLoading(false);
      console.error('Error scheduling viewing:', error);
    }
  };
  return (
    <div className="popup-overlay requestInfopopup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>×</button>
        {!ScheduleViewing ? (
        <>
        <h2>Schedule Viewing</h2> 
        <GfrbP>See this item & more in our store.</GfrbP>
        <hr className="hr" />
        {errorsFromRes!="" &&            
          <div className='enter-your-password errorText'>{errorsFromRes}</div>            
        }
        <form onSubmit={handleSubmit}>
          <div className="rb_grid rb_col2 form-group basic_info">
            <input 
              type="text" 
              name="name" 
              placeholder={errors.name || "Your Name"}
              value={formData.name}
              onChange={handleInputChange} 
              className={errors.name ? 'error' : ''}
            />
            <input 
              type="email" 
              name="email" 
              placeholder={errors.email || "Your Email"}
              value={formData.email}
              onChange={handleInputChange} 
              className={errors.email ? 'error' : ''}
            />
          </div>
          <div className="rb_grid rb_col1 form-group phone_info">
            <input 
              type="tel" 
              name="phone" 
              placeholder={errors.phoneNumber || "Your Phone Number"}
              value={formData.phone}
              onChange={handleInputChange} 
              className={errors.phoneNumber ? 'error' : ''}
            />
          </div>
          <div className="rb_grid rb_col1 form-group message_info">
            <textarea 
              name="hint_message" 
              placeholder={errors.message || "Your Message"}
              value={formData.hint_message}
              onChange={handleInputChange} 
              className={errors.message ? 'error' : ''}
            ></textarea>
          </div>
          <div className="request_infocta">
            <div className="rb_grid rb_col2 form-group select_location">
                <div className="flex-col">
                  <div className="preference_val twoInOne">
                  <label for="location">&nbsp; {errors.location && <span className="error-message">{errors.location}</span>}</label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={errors.location ? 'error' : 'no-appearance select--outline'}
                      placeholder='Select Location'
                    >
                      <option value="">Select a location</option>
                      {locations.map((location, index) => (
                        <option key={index} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {timearray.length > 0 && (
                <div className="availability schduleb">
                <label>When are you available?</label>
                <div className="preferences">
                  <div className="preference_val">
                    <DatePicker 
                      selected={formData.avail_date}
                      onChange={handleDateChange}
                      placeholderText="00.00.0000"
                      className={errors.preference ? 'error' : ''}
                      dateFormat="MM/dd/yyyy"
                      minDate={new Date()}
                                         
                    />
                  </div>
                </div>
              </div>
              )}
              </div>
              
              {
               
               (availableTimeArray.length > 0) &&
               <div className="rb_grid rb_col1 form-group flex flex-cta">
                 <div className="preference_val">
                   <select
                     name="appnt_time"
                     value={formData.appnt_time}
                     onChange={(e)=>{handleInputChange(e)}}
                     className={errors.appnt_time ? 'error' : 'no-appearance select--outline'}
                     placeholder='Select Time'
                   >                      
                     {availableTimeArray.map((time, index) => (
                       <option key={index} value={time}>{time}</option>
                     ))}
                   </select>
                 </div>
                 </div>
                 }

            <div className="rb_grid rb_col1 form-group flex flex-cta">
               <div className="flex message_info">
                  {configAppData.site_key && configAppData.site_key!=="" && 
                    <div className="gift-deadline">
                    <ReCAPTCHA  ref={recaptcha} size="invisible" sitekey={configAppData.site_key} />
                    </div>
                  }
              </div>
              <button type="submit" className="button52">Request</button>
            </div>
          </div>
        </form>
        </>
        ) : (
          <div className="success-message">
            <h2>Request Sent!</h2>
            <GfrbP>&nbsp;</GfrbP>
            <GfrbP>{scheduleViewingMessage}</GfrbP>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleViewingPopup;