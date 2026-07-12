export default function  VideoPopup   ({ videoURL, onClose })  {

  return (
    
      <div className="video-popup-overlay" onClick={onClose}>
        <div className="video-popup-content" onClick={(e) => e.stopPropagation()}>
          <video src={videoURL} controls autoPlay>
            Your browser does not support the video tag.
          </video>
          <button className="close--button" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  
}