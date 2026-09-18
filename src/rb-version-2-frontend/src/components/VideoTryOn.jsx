export default function VideoTryOn({ onClose, src }) {
  window.onmessage = function (event) {
    if (event.data === "closeIframe") {
      onClose();
    }
  };

  return (
    <div className="video-popup-overlay" onClick={onClose}>
      {src !== "" && (
        <div
          className="video-popup-content"
          onClick={(e) => e.stopPropagation()}
          style={{ height: "75%", width: "75%", overflow: "hidden" }}
        >
          <iframe
            title={src}
            width="100%"
            height="100%"
            src={src}
            allow="camera;microphone"
          />
          <button type="button" className="close--button" onClick={onClose}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
