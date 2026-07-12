import React, { useState,useRef,useEffect } from 'react';
import "./hint.css"
import { emailService } from '../Services';
import ReCAPTCHA from 'react-google-recaptcha';
import { GfrbP } from './scoped/GfrbText';

const getTodayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const DropHintPopup = ({ onClose, settingId, isLabSetting, ringurl, shopurl,diamondId,diamondtype,diamondurl,configAppData , setShowLoading, price, min_carat, max_carat, metalType, styleNumber}) => {
  let formDataValue= {yourName: '',
  name: '',
  email:'',
  recipient_name: '',
  recipient_email: '',
  gift_reason: '',
  hint_message: '',
  gift_deadline: getTodayLocal(),
  islabsettings: isLabSetting, 
  shopurl: shopurl,
  
}
//console.log("ringurl=="+ringurl)
if(settingId&&settingId!==""){
    formDataValue.settingid = settingId;
    formDataValue.ringurl=ringurl;
    formDataValue.price = price || '';
    formDataValue.min_carat = min_carat || '';
    formDataValue.max_carat = max_carat || '';
    formDataValue.metalType = metalType || '';
    formDataValue.styleNumber = styleNumber || '';
}else{
    formDataValue.diamondid = diamondId;
   // formDataValue.diamondId=diamondId;
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
if(configAppData.site_key&&configAppData.site_key!==""){
  formDataValue['captcha-response']='',
  formDataValue['secret-key']=configAppData.secret_key
}
const recaptcha = useRef();
  const [formData, setFormData] = useState(formDataValue)
 
  const [errors, setErrors] = useState({});
  const [errorsFromRes, setErrorsFromRes] = useState('');
  const [hintDropped, setHintDropped] = useState(false);
  const [hintDroppedMessage, setHintDroppedMessage] = useState('');
  const todayMin = getTodayLocal();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'gift_deadline' && value && value < todayMin) {
      setErrors({ ...errors, giftDeadline: 'Gift deadline cannot be in the past' });
      return;
    }
    setFormData({ ...formData, [name]: value });
    const errorKey = name === 'gift_deadline' ? 'giftDeadline' : name;
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: '' });
    }
  };
  
  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Your name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Your email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Your email is invalid';
    }

    if (!formData.recipient_name.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }

    if (!formData.recipient_email.trim()) {
      newErrors.recipientEmail = 'Recipient email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.recipient_email)) {
      newErrors.recipientEmail = 'Recipient email is invalid';
    }

    if (!formData.gift_reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    if (!formData.hint_message.trim()) {
      newErrors.message = 'Message is required';
    }

    if (!formData.gift_deadline) {
      newErrors.giftDeadline = 'Gift deadline is required';
    } else if (formData.gift_deadline < todayMin) {
      newErrors.giftDeadline = 'Gift deadline cannot be in the past';
    }
   if(configAppData.site_key&&configAppData.site_key!==""){
    if (!formData['captcha-response']) {
      newErrors.recaptcha = 'Please verify captcha';
    }  
   }
 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  useEffect(() => {
    // setIsLabGrown(false);
    async function fetchToken(){
      if(configAppData.site_key&&configAppData.site_key!==""){
        try {  
          //.current.getValue()
          const token = await recaptcha.current.executeAsync();
         //const token = await recaptcha.current.getValue();
          formData['captcha-response'] = token;
        
        } catch (err) {  
          console.error("Error fetching captcha:", err);
          setErrors("Failed to get captcha . Please try again later.");
        }
      }
     
    }
    fetchToken()
   }, [errorsFromRes]);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
   // const token = await captchaValue.current.executeAsync();
   console.log("in formsubmit");
   console.log(formData)
    if (validateForm()) {   
     // const captchaValue = recaptcha.current
     //setFormData({...formData,'captcha-response': captchaValue})
      let formDataVal = new FormData();
      Object.keys(formData).forEach(function (key) {
        formDataVal.append(key,formData[key]);
      });    
  
      try {
        setShowLoading(true)
        
        let res;
        // Determine which API to call based on the form data
        if (formData.settingid && formData.diamondId) {
          // Complete ring - both setting and diamond
          res = await emailService.completeRingDropHint(formDataVal);
        } else if (formData.diamondid && !formData.settingid) {
          // Diamond only
          res = await emailService.diamondDropHint(formDataVal);
        } else if (formData.settingid && !formData.diamondId) {
          // Ring/Setting only
          res = await emailService.ringDropHint(formDataVal);
        }

       if(res.output.status===2){
        setShowLoading(false)
        setErrorsFromRes(res.output.msg);
        if(configAppData.site_key&&configAppData.site_key!==""){
          recaptcha.current.reset();
        }
       }
       if(res.output.status===1){
        setShowLoading(false)
        setErrorsFromRes(''); // Clear any previous error messages
        setHintDroppedMessage(res.output.msg)
        setHintDropped(true);
        if(configAppData.site_key&&configAppData.site_key!==""){
          recaptcha.current.reset();
        }
       }
       
      } catch (error) {
        setShowLoading(false)
        console.error('Error dropping hint:', error);
        // show err msgs to user
      }
    }
  };
//console.log(configAppData)
  return (
    <div className="popup-overlay drop-hint-popup">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>×</button>
        
        {!hintDropped ? (
          <>
            
              <h2>Drop A Hint</h2>
              <GfrbP>Because you deserve this.</GfrbP>            
              <hr className="hr" />

            <form onSubmit={handleSubmit}>
              {errorsFromRes!="" &&
              <div className='enter-your-password errorText'>{errorsFromRes}</div>
            
              }
              <div>
                <input name="ringurl" type="hidden" value={formData.ringurl} />
                <input name="shopurl" type="hidden" value={formData.shopurl} />
              </div>
              <div className="rb_grid rb_col2 form-group">
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
              <div className="rb_grid rb_col2 form-group">
                <input 
                  type="text" 
                  name="recipient_name" 
                  placeholder={errors.recipientName || "Hint Recipient Name"}
                  value={formData.recipient_name}
                  onChange={handleInputChange} 
                  className={errors.recipientName ? 'error' : ''}
                />
                <input 
                  type="email" 
                  name="recipient_email" 
                  placeholder={errors.recipientEmail || "Hint Recipient Email"}
                  value={formData.recipient_email}
                  onChange={handleInputChange} 
                  className={errors.recipientEmail ? 'error' : ''}
                />
              </div>
              <div className="rb_grid rb_col1 form-group">
                <input 
                  type="text" 
                  name="gift_reason" 
                  placeholder={errors.reason || "Reason for this gift"}
                  value={formData.gift_reason}
                  onChange={handleInputChange} 
                  className={errors.reason ? 'error' : ''}
                />
                <textarea 
                  name="hint_message" 
                  placeholder={errors.hint_message || "Your Message"}
                  value={formData.hint_message}
                  onChange={handleInputChange} 
                  rows={6} 
                  className={errors.message ? 'error' : ''}
                ></textarea>
              </div>          
              <div className="rb_grid rb_col2 form-group gift_deadline_box">
                
                <div className="gift-deadline twoInOne">
                <label>Gift deadline:</label>
                  <input 
                    className={`gift-deadline ${errors.giftDeadline ? 'error' : ''}`}
                    type="date" 
                    name="gift_deadline" 
                    value={formData.gift_deadline}
                    onChange={handleInputChange} 
                    min={todayMin}
                  />
                  {errors.giftDeadline && <span className="error-message">{errors.giftDeadline}</span>}
                </div>
                <button type="submit" className="button52">DROP HINT</button>
              </div>
              {configAppData.site_key && configAppData.site_key!=="" && 
              <div className="gift-deadline">
              <ReCAPTCHA  ref={recaptcha} sitekey={configAppData.site_key} size="invisible"/>
              </div>
              }
            </form>
          </>
        ) : (
          <div className="success-message">
            <h2>Hint Dropped!</h2>
            <GfrbP>&nbsp;</GfrbP>
            <GfrbP>{hintDroppedMessage}</GfrbP>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropHintPopup;