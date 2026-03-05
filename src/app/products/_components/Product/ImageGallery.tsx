"use client";
import { cn } from "../../../../utils/cn";
import Image from "next/image";
import { useState } from "react";

interface ImageItem {
  name: string;
  url: string;
}
interface ImageGalleryProps {
  images: ImageItem[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full aspect-square md:aspect-[4/3] overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
        <Image
          src={images[currentImage]?.url}
          alt="Product Image"
          fill
          className="object-contain p-2"
          priority
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {images?.map((item, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg border bg-gray-50 transition-all",
              currentImage === index
                ? "border-black ring-1 ring-black"
                : "border-gray-200 hover:border-gray-400"
            )}
          >
            <Image
              src={item?.url}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-contain p-1"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
