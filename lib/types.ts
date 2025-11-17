import { StaticImageData } from "next/image";

export interface FeatureItemProps {
  title: string;
  description: string;
  imgSrc: StaticImageData | string;
  imgAlt: string;
}
