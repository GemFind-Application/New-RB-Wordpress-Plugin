import React from 'react';
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import "./ringspecs.css"
import ShowCostInCard from './showCostInCard';
const RingSpecificationsPopup = ({ product, onClose,configAppData }) => {
  const imageUrl = `${getImageBaseUrl()}`;
  return (
    <div className="popup-overlay ring-specs-popup">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Setting Details</h2>
        <hr className='hr' />
        <div className="setting-details">
          <div className="settings_info">
            <p>Setting Number: <b>{product.styleNumber? product.styleNumber:''}</b></p>
            <p>Price: <b><ShowCostInCard settingDetailForCost={product} configAppData={configAppData}></ShowCostInCard></b></p>
            <p>Metal Type: <b>{product.metalType}</b></p>
          </div>
          {product.sideDiamondDetail && (
            <div className="side-diamond-details">
              <h3>Side Diamond Details</h3>
              <div className="diamonds_info">
                <p>Number of Diamonds: <b>{product.sideDiamondDetail.noOfDiamonds ? product.sideDiamondDetail.noOfDiamonds:'-'}</b></p>
                <p>Cut: <b>{product.sideDiamondDetail.diamondCut ? product.sideDiamondDetail.diamondCut:'-'}</b></p>
                <p>Minimum Carat Weight (ct.tw.): <b>{product.sideDiamondDetail.minimumCaratWeight ? product.sideDiamondDetail.minimumCaratWeight:'-'}</b></p>
              </div>
            </div>
          )}
           {product.sideDiamondDetail1 && (
             product.sideDiamondDetail1.map((item,index) => {
            return <div className="side-diamond-details" key={index}>
              {index===0 && <h3>Side Diamond Details</h3>}
              <div className="diamonds_info">
                <p>Number of Diamonds {index+1}: <b>{item.noOfDiamonds ? item.noOfDiamonds:'-'}</b></p>
                <p>Cut {index+1}: <b>{item.diamondCut?item.diamondCut:'-'}</b></p>
                <p>Minimum Carat Weight (ct.tw.) {index+1}: <b>{item.minimumCaratWeight?item.minimumCaratWeight:'-'}</b></p>
                <p>Diamond Quality {index+1}: <b>{item.diamondQuality?item.diamondQuality:'-'}</b></p>
                
              </div>
            </div>
             })
          )}
          <div className="can-be-set-with">
            <div class="can-be-set-with-title">Can be set with:</div>
            <div className="can-be-set-with-box">
              {product.centerStoneFit && 
              product.centerStoneFit.split(",").map((item,index) => {
                return (    
                <>   
                  <div className="canbesetwithspace" key={'canbesetwith_'+index}>
                    <p><img src={`${imageUrl+"/"+"f_"+(item).toLowerCase()+".svg"}`}></img></p>
                    <p>{item}</p>
                    <p> {product.centerStoneMinCarat?product.centerStoneMinCarat:'-'} - {product.centerStoneMaxCarat?product.centerStoneMaxCarat:'-'} </p>
                  </div>
                </>)
              })}  
            </div>
            {/* Diamond shape icons */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RingSpecificationsPopup; 