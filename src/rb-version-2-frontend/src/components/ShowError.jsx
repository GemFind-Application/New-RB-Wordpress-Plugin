import react,{ useState, useCallback ,useEffect} from "react";
import Header from "./Header";
import "../pages/compare.css";
const ShowError = ({error})=>{

    return   <div> 
    <div className="empty">
    <div className="no--compare-container">
          <div className="main-container" >           
            <b className="back-to-diamond no--compare">Error:{error}</b>
          </div>
        </div>
        </div>
  </div>
}
export default ShowError;