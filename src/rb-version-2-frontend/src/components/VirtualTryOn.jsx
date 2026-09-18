export default function  VideoModal  ({onClose,src})  {
  
  return (
      <div className="popup-overlay" style={{width:'100%' ,height:'100%'}}>
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>×</button>
        <iframe
            title={src}       
            height={'100%'}
            width={'100%'}        
            allow={"autoplay"}       
            src={src}
        />
      </div>
      </div>
  )
}