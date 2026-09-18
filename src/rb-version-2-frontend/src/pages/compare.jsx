import { useCallback ,useEffect,useState} from "react";
import { getImageBaseUrl } from "../utils/imageBaseUrl";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import FrameComponent5 from "../components/frame-component5";
import V from "../components/v";
import TableColumns from "../components/table-columns";
import "./compare.css";
import { diamondService } from "../Services";
import { remove } from "lodash";
import ShowError from "../components/ShowError";
const Compare = ({compareDiamondsId,removeCompareDiamondIds,configAppData,isLabGrown,setShowLoading}) => {
  
  const [isAllDiamondDetailsLoaded, setIsAllDiamondDetailsLoaded] = useState(false);
  const [allDiamondDetailsToCompare, setAllDiamondDetailsToCompare] = useState([]);
  const [showAllParam, setShowAllParam] = useState(true);
  const [error, setError] = useState(null); 
  const navigate = useNavigate();
  const imageUrl = `${getImageBaseUrl()}`;
  const fetchDiamondDetails = async (compareDiamondsId) => {
    try {
        setShowLoading(true)
        
        // Helper function to normalize compare items to object format and extract diamondId and diamondType
        const normalizeItem = (item) => {
          if (typeof item === 'string' || typeof item === 'number') {
            // Old format: just ID, default to mined (false)
            return { diamondId: String(item), diamondType: false };
          }
          // New format: object with diamondId and diamondType
          return {
            diamondId: String(item.diamondId || item),
            diamondType: item.diamondType !== undefined ? item.diamondType : false
          };
        };
        
        // Normalize all items and create promises with correct diamondType for each
        const normalizedItems = compareDiamondsId.map(normalizeItem);
        const promises = normalizedItems.map((item) => 
          diamondService.getDiamondDetail(item.diamondId, item.diamondType, configAppData.dealerid, configAppData.shop)
        );
        
        const diamondDataData = await Promise.all(promises);            
        if(diamondDataData){
          setAllDiamondDetailsToCompare(diamondDataData)
          setIsAllDiamondDetailsLoaded(true)
          setShowLoading(false)
        }         
    } catch (error) {
        console.error("Error fetching diamond details:", error);
        setError("Failed to fetch diamond details. Please try again later.");
    }
  };
  useEffect(() => {    
    window.scrollTo(0, 0);
    localStorage.setItem('diamondIdsToCompare',JSON.stringify(compareDiamondsId))
    fetchDiamondDetails(compareDiamondsId);
  }, [compareDiamondsId]);
  const onBreadContainerClick = useCallback(() => {
    navigate("/diamondtools");
  }, [navigate]);
  if (error) {
    return <ShowError error={error}/>;
  }
  return (
    <div className="compare">
      {isAllDiamondDetailsLoaded &&
      <main className="empty">
        <div className="bread-wrapper">
          <div className="bread" onClick={onBreadContainerClick}>
            <div className="bread-inner">
              <img className="frame-child" alt="" src={`${imageUrl}`+"/vector-11.svg"} />
            </div>
            <b className="back-to-diamond backlink">Back to Diamond List</b>
          </div>
        </div>
        <FrameComponent5 
            setShowAllParam={setShowAllParam} 
            showAllParam={showAllParam}
            compareDiamondsId={compareDiamondsId}
            removeCompareDiamondIds={removeCompareDiamondIds}
            />
        {allDiamondDetailsToCompare.length>0 ?
        <>
        <section className="compareView">
        <section className="table-up">
          {allDiamondDetailsToCompare.map(item=>{
             return  <V
              configAppData={configAppData}
              key={item.diamondId}
              diamond={item}
              removeCompareDiamondIds={removeCompareDiamondIds}              
            />
          })
        }         
        </section>
        <section className="results1">       
          <TableColumns
          showAllParam={showAllParam}
           configAppData={configAppData}
            diamond={allDiamondDetailsToCompare}   
          />    
        </section>
        </section>
        </>:(
        <div className="no--compare-container">
          <div className="main-container" >           
            <b className="back-to-diamond no--compare">Please select Diamonds To compare</b>
          </div>
        </div>         
        )
        }
      </main>
      }    
    </div>
  );
};

export default Compare;
