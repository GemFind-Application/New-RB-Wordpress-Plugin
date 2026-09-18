import { useNavigate } from "react-router-dom";

export default function VideoDiamondTryOn({ onClose, src, lastSegment }) {
  const navigate = useNavigate();

  window.onmessage = function (event) {
    if (event.data === "closeIframe") {
      onClose();
    }
    if (event.data?.type === "search") {
      const carat = event.data.carat;
      localStorage.removeItem("saveDiamondFiltersMined");
      localStorage.removeItem("saveAdvanceDiamondFiltersMined");
      localStorage.removeItem("saveDiamondFiltersLab");
      localStorage.removeItem("saveAdvanceDiamondFiltersLab");
      localStorage.removeItem("saveDiamondFiltersfancy");
      localStorage.removeItem("saveAdvanceDiamondFiltersFancy");
      const obj = {
        shape: [event.data.shape],
        cut: [],
        colour: [],
        clarity: [],
        intensity: [],
        carat: [parseFloat(carat - 1), parseFloat(carat + 1)],
        price: [],
        search: "",
      };

      if (lastSegment === "fancydiamonds") {
        localStorage.setItem("saveDiamondFiltersfancy", JSON.stringify(obj));
        navigate("/diamondtools/diamondtype/navlabgrown");
      } else if (lastSegment === "labcreated") {
        localStorage.setItem("saveDiamondFiltersLab", JSON.stringify(obj));
        navigate("/diamondtools/diamondtype/navlabgrown");
      } else {
        localStorage.setItem("saveDiamondFiltersMined", JSON.stringify(obj));
        navigate("/diamondtools");
      }
    }
  };

  return (
    <div className="video-popup-overlay" onClick={onClose}>
      {src !== "" && (
        <div
          className="video-popup-content"
          onClick={(e) => e.stopPropagation()}
          style={{ height: "100%", width: "100%", overflow: "hidden", padding: "2px" }}
        >
          <iframe
            title={src}
            width="100%"
            height="100%"
            src={src}
            allow="camera;microphone"
          />
        </div>
      )}
    </div>
  );
}
