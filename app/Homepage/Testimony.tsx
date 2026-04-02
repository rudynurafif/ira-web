import React, { useState } from "react";
import Image from "next/image";
import ModalTemplate from "../_components/modal/ModalTemplate";

const videos = [
  {
    id: "NY1l8wp8xv8",
    title: "ULO IRA",
    thumbnail: "https://img.youtube.com/vi/NY1l8wp8xv8/maxresdefault.jpg",
  },
  {
    id: "MKMLiBRHYy4",
    title: "Uji Coba Modem",
    thumbnail: "https://img.youtube.com/vi/MKMLiBRHYy4/maxresdefault.jpg",
  },
  {
    id: "_blMOiGokjA",
    title: "Go Commercial",
    thumbnail: "https://img.youtube.com/vi/_blMOiGokjA/maxresdefault.jpg",
  },
];

const Testimony = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Duplikasi list untuk infinite loop effect
  const displayVideos = [...videos, ...videos, ...videos];

  return (
    <section className="relative bg-[#b31b1b] py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Section */}
          <div className="w-full lg:w-1/3 text-center lg:text-left">
            <h2 className="text-white max-sm:text-start text-4xl md:text-5xl font-medium leading-tight">
              Cerita Mereka
              <br />
              Bersama
              <br />
              <span className="font-black">Internet Rakyat</span>
            </h2>
          </div>

          {/* Video Slider Section (Infinite Scroller) */}
          <div className="w-full lg:w-2/3 overflow-hidden">
            <div className="flex gap-4 md:gap-6 animate-marquee whitespace-nowrap">
              {displayVideos.map((video, index) => (
                <div
                  key={`${video.id}-${index}`}
                  className="relative shrink-0 w-[240px] md:w-[320px] h-[340px] md:h-[450px] rounded-[30px] md:rounded-[40px] overflow-hidden border-2 md:border-4 border-white shadow-2xl group cursor-pointer"
                  onClick={() => setSelectedVideo(video.id)}
                >
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay & Play Button */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-4 md:p-6 shadow-xl transform transition-all group-hover:scale-110">
                      <svg
                        className="w-8 h-8 md:w-12 md:h-12 text-[#b31b1b] fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <ModalTemplate
          closeModal={() => setSelectedVideo(null)}
          width="max-w-4xl"
          classNameModal="p-0 bg-black overflow-hidden"
        >
          <div className="relative pt-[56.25%] w-full bg-black">
            <iframe
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${selectedVideo}?autoplay=1&mute=1&playsinline=1&enablejsapi=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </ModalTemplate>
      )}

      {/* Custom Styles for Scrolling Animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default Testimony;
