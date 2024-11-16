"use client";

import React from "react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import companies from "@/data/companies.json";

// Define the type for the company objects
interface Company {
  name: string;
  id: number | string; // Ensure flexibility in ID type
  path: string;
}

const CompanyCarousel: React.FC = () => {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
      className="w-full py-10"
    >
      <CarouselContent className="flex gap-5 sm:gap-20 items-center">
        {companies.map(({ name, id, path }: Company) => (
          <CarouselItem key={id} className="basis-1/3 lg:basis-1/6 ">
            <Image
              src={path}
              alt={name}
              width={200}
              height={56}
              className="h-9 sm:h-14 w-auto object-contain"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default CompanyCarousel;
