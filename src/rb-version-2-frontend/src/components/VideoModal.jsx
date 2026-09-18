export default function  VideoModal  ({onClose,src})  {

  return (
     


<div className="video-popup-overlay" onClick={onClose}>
        <div className="video-popup-content videoIframe" onClick={(e) => e.stopPropagation()}>
          <div className="embed-responsive embed-responsive-4by3">
          <iframe className="embed-responsive-item"
            title={src}       
            height={'100%'}
            width={'100%'}        
            allow={"autoplay"}       
            src={src}
        />
          </div>
          <button className="close--button" onClick={onClose}>Close</button>
        </div>
      </div>


  )
}