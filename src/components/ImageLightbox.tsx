import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const isVideoFile = (url: string) => {
  const ext = url.split(".").pop()?.toLowerCase() || "";
  return ["mp4", "mov", "webm", "avi"].includes(ext);
};

const ImageLightbox = ({ images, initialIndex, onClose }: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(initialIndex, images.length - 1))
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
      if (e.key === "ArrowRight") setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  const prev = () => setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));

  const handleFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
    else if ((v as HTMLVideoElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
      (v as HTMLVideoElement & { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
    } else if ((v as HTMLVideoElement & { mozRequestFullScreen?: () => void }).mozRequestFullScreen) {
      (v as HTMLVideoElement & { mozRequestFullScreen: () => void }).mozRequestFullScreen();
    }
  };

  const current = images[currentIndex];
  const isVideo = isVideoFile(current);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors z-20"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm z-20 pointer-events-none">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Media */}
      <div
        className="relative flex items-center justify-center"
        style={{ maxWidth: "90vw", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <div className="relative">
            <video
              ref={videoRef}
              src={current}
              controls
              autoPlay
              controlsList="nodownload"
              playsInline
              className="rounded-lg"
              style={{ maxWidth: "88vw", maxHeight: "84vh", display: "block" }}
            />
            <button
              onClick={handleFullscreen}
              className="absolute top-2 right-2 w-8 h-8 rounded-md bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              title="Tam ekran"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <img
            src={current}
            alt=""
            className="rounded-lg"
            style={{ maxWidth: "88vw", maxHeight: "84vh", objectFit: "contain", display: "block" }}
          />
        )}
      </div>

      {/* Dot nav */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === currentIndex ? "bg-white" : "bg-white/35"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
