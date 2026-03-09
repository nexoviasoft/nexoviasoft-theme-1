"use client";

import { cn } from "../../utils/cn";
import { EmblaCarouselType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback } from "react";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarouselDotButtons";

import { motion } from "framer-motion";
import { containerVariants } from "../../lib/animations";

type PropType = {
  children?: React.ReactNode;
  autoplay?: boolean;
  dragFree?: boolean;
  arrowButtons?: boolean;
  dotButtons?: boolean;
  animate?: boolean;
};

const EmblaCarousel: React.FC<PropType> = ({
  children,
  autoplay = false,
  dragFree = false,
  arrowButtons = false,
  dotButtons = false,
  animate = true, // Default to true to enable consistent animation
}) => {
  const plugins = autoplay ? [Autoplay()] : [];
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { dragFree, slidesToScroll: "auto" },
    plugins,
  );

  const onNavButtonClick = useCallback((emblaApi: EmblaCarouselType) => {
    const autoplayPlugin = emblaApi?.plugins()?.autoplay;
    if (!autoplayPlugin) return;

    const resetOrStop =
      autoplayPlugin.options.stopOnInteraction === false
        ? autoplayPlugin.reset
        : autoplayPlugin.stop;

    resetOrStop();
  }, []);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi, onNavButtonClick);

  return (
    <section className="w-full m-auto relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <motion.div
          className="flex gap-4 touch-pan-y touch-pinch-zoom"
          style={{
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            MozBackfaceVisibility: "hidden",
          }}
          variants={animate ? containerVariants : undefined}
          initial={animate ? "hidden" : undefined}
          whileInView={animate ? "visible" : undefined}
          viewport={animate ? { once: true, margin: "-50px" } : undefined}
        >
          {children}
        </motion.div>
      </div>

      {arrowButtons && (
        <>
          <div className="flex items-center justify-center absolute top-0 bottom-0 sm:-left-4 left-2">
            <PrevButton
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
            />
          </div>
          <div className="flex items-center justify-center absolute top-0 bottom-0 sm:-right-4 right-2">
            <NextButton
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
            />
          </div>
        </>
      )}

      {/* Modified Dot Section to match the image style */}
      {dotButtons && (
        <div className="absolute bottom-6 left-0 right-0">
          <div className="flex justify-center items-center gap-2">
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                className="touch-manipulation cursor-pointer flex items-center justify-center focus:outline-none"
              >
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === selectedIndex
                      ? "w-8 bg-white opacity-100" // Active bar: longer and bright
                      : "w-4 bg-white opacity-40", // Inactive bars: shorter and translucent
                  )}
                />
              </DotButton>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default EmblaCarousel;
