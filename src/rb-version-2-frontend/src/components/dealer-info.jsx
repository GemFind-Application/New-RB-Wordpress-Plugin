import React, { useState } from 'react';
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import PropTypes from "prop-types";
import "./dealer-info.css";
import { settingService } from '../Services';

const DealerInfo = ({ className = "", onClose, settingId, isLabSetting, shopurl, diamondId, diamondtype ,setShowLoading}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorsFromRes, setErrorsFromRes] = useState('');
  const [dealerInfoAuthMessage, setDealerInfoAuthMessage] = useState('');
  const [dealerInfo, setDealerInfo] = useState({});
  const imageUrl = `${getImageBaseUrl()}`;
  const validatePassword = (password) => {
    return password.length >= 4;
  };

  const handleSubmit = async () => {
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (!validatePassword(password)) {      
      setError('Password must be at least 4 characters long');
      return;
    }

    setError('');
    try {
      let formData = {};
      let page = "";

      if (diamondId !== "" && diamondId !== undefined) {
        formData = {
          password: password,
          diamondId: diamondId,
          diamondtype: diamondtype,
          shopurl: window.location.host
        }
        page = "diamond";
      } else {
        formData = {
          password: password,
          settingId: settingId,
          isLabSetting: isLabSetting,
          shopurl: window.location.host
        }
        page = "setting";
      }
      setErrorsFromRes("");
      let formDataVal = new FormData();
      Object.keys(formData).forEach(function (key) {
        formDataVal.append(key, formData[key]);
      });
      setShowLoading(true)
      const res = await settingService.validateDealerPassword(formDataVal, page);
      if(res){
        if (res.output.status === 2) {
          setError(res.output.msg);
        }
        if (res.output.status === 1) {
          setDealerInfoAuthMessage(res.output.msg);
          setDealerInfo(res.output.dealerInfo);
          setIsSuccess(true);
        }
      }else{

        if (res === null || res==="") {
          //setDealerInfoAuthMessage(res.output.msg);
          //setDealerInfo(res.output.dealerInfo);
          //setIsSuccess(true);
          setError("Something went wrong pls try again later");
        }
      }
     
      setShowLoading(false)
    } catch (error) {
      setShowLoading(false)
      console.error('Error Dealer Info:', error);
      setErrorsFromRes('An error occurred. Please try again.');
    }
  };
//console.log(error)
  return (
    <div className={`dealer-info popup-overlay ${className}`}>
      <section className="popup-content">
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="top3">
          {error !== "" &&
            <div className='enter-your-password errorText'>{error}</div>
          }
          {!isSuccess ? (
            <>
              <div className="h11 d-flex flex-col">
                <h2>Dealer Info</h2>
                <p className="enter-your-password">Enter your password to continue</p>
              </div>
              <hr className='hr' />
              <div className="rb_grid rb_col2 form-group">
                <div className="drop4">
                  <input
                    className={`your-gemfind-password ${error ? 'error' : ''}`}
                    name="dealer-password"
                    placeholder={error || "Your GemFind Password"}
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                  />
                </div>
                <button className="button4" onClick={handleSubmit}>
                  <b className="submit dealer_info">Submit</b>
                </button>
              </div>
            </>
          ) : (
            <div className="success-message vendorInfo">
              <h2>Vendor Info</h2>
              
              <section className="content3">
              <div className="top3">              
                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                    Dealer Name:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.retailerName&&dealerInfo.retailerName!==""?dealerInfo.retailerName:'NA'}
                  </div>
                </div>
                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                  Dealer Company:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.retailerCompany&&dealerInfo.retailerCompany!==""?dealerInfo.retailerCompany:'NA'}
                  </div>
                </div>
                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                  Dealer City/State:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.retailerCity&&dealerInfo.retailerCity!==""?dealerInfo.retailerCity:'NA'}
                  </div>
                </div>
                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                  Dealer Contact No.:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.retailerContactNo&&dealerInfo.retailerContactNo!==""?dealerInfo.retailerContactNo:'NA'}
                  </div>
                </div>
                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                  Dealer Email:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.retailerEmail&&dealerInfo.retailerEmail!==""?dealerInfo.retailerEmail:'NA'}
                  </div>
                </div>
                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                  Dealer Lot number of the item:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.retailerLotNo&&dealerInfo.retailerLotNo!==""?dealerInfo.retailerLotNo:'NA'}
                  </div>
                </div>
                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                  Dealer Stock number of the item:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.retailerStockNo&&dealerInfo.retailerStockNo!==""?dealerInfo.retailerStockNo:'NA'}
                  </div>
                </div>
                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                  Wholesale Price:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.wholesalePrice&&dealerInfo.wholesalePrice!==""?dealerInfo.wholesalePrice:'NA'}
                  </div>
                </div>

                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                  Third Party:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.thirdParty&&dealerInfo.thirdParty!==""?dealerInfo.thirdParty:'NA'}
                  </div>
                </div>            
                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                  Diamond Id:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.diamondID&&dealerInfo.diamondID!==""?dealerInfo.diamondID:'NA'}
                  </div>
                </div>
                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                  Seller Name:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.sellerName&&dealerInfo.sellerName!==""?dealerInfo.sellerName:'NA'}
                  </div>
                </div>
                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                  Seller Address:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.sellerAddress&&dealerInfo.sellerAddress!==""?dealerInfo.sellerAddress:'NA'}
                  </div>
                </div>
                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                  Dealer Fax:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.retailerFax&&dealerInfo.retailerFax!==""?dealerInfo.retailerFax:'NA'}
                  </div>
                </div>
                <div className="h11 dealerinfores" >
                  <div className="enter-your-password dealerinfo-label">
                  Dealer Address:
                  </div>             
                  <div className="enter-your-password">
                    {dealerInfo.retailerAddress&&dealerInfo.retailerAddress!==""?dealerInfo.retailerAddress:'NA'} 
                  </div>
                </div>
              </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

DealerInfo.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  isLabSetting: PropTypes.bool,
  shopurl: PropTypes.string,
  diamondId: PropTypes.string,
  diamondtype: PropTypes.string
};

export default DealerInfo;