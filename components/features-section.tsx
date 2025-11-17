import { FeaturesData } from "@/lib/site-data";
import type { FeatureItemProps } from "@/lib/types";
import Image from "next/image";
import SplitTextComp from "./ui/split-text-comp";

export default function FeaturesSection() {
  return (
    <section className="section-wrapper">
      <div className="flex flex-col">
        {FeaturesData.map((feature, index) => (
          <FeatureItem key={index} {...feature} />
        ))}
      </div>
    </section>
  );
}

const FeatureItem = (data: FeatureItemProps) => {
  return (
    <div className=" min-h-[40vh] grid md:grid-cols-2 gap-8 items-start p-8">
      <div className="flex flex-col gap-4">
        <SplitTextComp
          ScrollTriggerEnable={true}
          animationProps={{
            duration: 0.8,
            stagger: 0.1,
            rotate: 0,
            filter: "blur(4px)",
            opacity: 0,
            yPercent: 40,
            ease: "power2.inOut",
          }}
          maskType={undefined}
        >
          <h1 className=" text-2xl lg:text-4xl text-balance font-semibold font-satoshi leading-[1.3]">
            {data.title}
          </h1>
        </SplitTextComp>
        <SplitTextComp
          ScrollTriggerEnable={true}
          animationProps={{
            duration: 0.6,
            stagger: 0.1,
            delay: 0.2,
            rotate: 0,
            filter: "blur(4px)",
          }}
          variant="lines"
          maskType="lines"
        >
          <p className=" text-balance">{data.description}</p>
        </SplitTextComp>
      </div>
      <div>{/* <Image src={data.imgSrc} alt={data.imgAlt} /> */}</div>
    </div>
  );
};
