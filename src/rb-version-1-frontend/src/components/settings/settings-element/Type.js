import React, { useState, useRef, useEffect } from "react";

const Type = (props) => {
  const [itemId, selectedItemId] = useState("-1");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef(null);

  const toggleActive = (id) => {
    if (props.selectedCollection !== "") {
      selectedItemId(id);
    }
    selectedItemId("-1");
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    // Check scroll buttons after a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      checkScrollButtons();
    }, 100);
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      
      return () => {
        clearTimeout(timeoutId);
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [props.typedata]);

  return (
    <>
      <style>
        {`.Type ul li:hover , .Type ul .active {
               border-bottom-color:  ${window.initData["data"][0].hover_colour};
            }
            .Type .scroll-container {
              position: relative;
              overflow: hidden;
            }
            .Type .scroll-container ul {
              display: flex;
              overflow-x: auto;
              scrollbar-width: none;
              -ms-overflow-style: none;
              scroll-behavior: smooth;
            }
            .Type .scroll-container ul::-webkit-scrollbar {
              display: none;
            }
            .Type .scroll-btn {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              background: rgba(0, 0, 0, 0.7);
              color: white;
              border: none;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              cursor: pointer;
              z-index: 10;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              transition: all 0.3s ease;
            }
            .Type .scroll-btn:hover {
              background: rgba(0, 0, 0, 0.9);
              transform: translateY(-50%) scale(1.1);
            }
            .Type .scroll-btn-left {
              left: 10px;
            }
            .Type .scroll-btn-right {
              right: 10px;
            }`}
      </style>
      <div className="scroll-container">
        {canScrollLeft && (
          <button 
            className="scroll-btn scroll-btn-left" 
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}
        <ul ref={scrollContainerRef}>
          {props.typedata.map((item) => (
            <li
              onClick={() => props.callBack(item.collectionName)}
              key={item.$id || item.collectionName || Math.random()}
              className={`type_list ${itemId === item.$id ? "active" : ""} ${
                props.selectedCollection === item.collectionName ? "active" : ""
              }`}
            >
              <div className="gf-type_box">
                <input
                  onChange={() => toggleActive(item.$id)}
                  type="radio"
                  value={item.collectionName}
                  name="ring_collection"
                  id={"ring_collection_" + item.collectionName}
                />
                <img src={item.collectionImage} alt={item.collectionImage}></img>
                <span>{item.collectionName}</span>
              </div>
            </li>
          ))}
        </ul>
        {canScrollRight && (
          <button 
            className="scroll-btn scroll-btn-right" 
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </>
  );
};

export default Type;
