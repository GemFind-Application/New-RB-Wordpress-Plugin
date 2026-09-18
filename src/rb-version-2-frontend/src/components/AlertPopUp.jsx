import React, { useState, useCallback, useEffect } from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import "../pages/settings.css";
import PortalPopup from "../components/portal-popup";
import { GfrbP } from "./scoped/GfrbText";
export default function  AlertPopUp  ({onClose,message,title,onClick})  {  
  const imageUrl = `${getImageBaseUrl()}`;
   /* useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 2000);})*/
    return (
        <PortalPopup
        overlayColor="rgba(113, 113, 113, 0.3)"
          
      >
         {message!=="" ?
        <div className="popup-overlay drop-hint-popup resetPopup">
          <div className="popup-content">
           
           
            <button  onClick={onClose} className="close-button" >×</button>   
            <div className="success-message">
              <h2>{title}</h2>
              <GfrbP className="text-left">{message}</GfrbP>
                {title==='Reset'&& <button onClick={onClick}>Reset</button> }          
            </div>
          </div>
        </div>
        :<div className="popup-overlay drop-hint-popup loaderpopup" style={{overflow:'hidden'}}>
          <div className="popup-content" style={{overflow:'hidden'}}><div><img src={imageUrl+'/diamond.gif'} className="loader"/></div></div></div>}
     </PortalPopup>
    )
  }
  <style>
 
  </style>