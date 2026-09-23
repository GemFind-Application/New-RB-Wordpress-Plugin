import React from "react";

// Direct video files (e.g. S3 .mp4) play in a <video> element so the popup
// controls the frame; loaded in an iframe the browser wraps them in its own
// black media page. Anything else (360° viewers, embed pages) stays an iframe.
const isVideoFile = (src) =>
    /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i.test(String(src || ""));

const VideoFrame = ({ src, onLoad, style }) => {
    if (isVideoFile(src)) {
        return (
            <video
                className="modal__video-style"
                src={src}
                onLoadedData={onLoad}
                onError={onLoad}
                style={style}
                autoPlay
                muted
                loop
                playsInline
                controls
            />
        );
    }

    return (
        <iframe
            className="modal__video-style"
            onLoad={onLoad}
            width="100%"
            height="500"
            title="Video"
            src={src}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={style}
        ></iframe>
    );
};

export default VideoFrame;
