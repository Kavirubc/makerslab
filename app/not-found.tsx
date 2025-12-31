import FadeInComp from "@/components/ui/fade-in";
import Link from "next/link";

export default function Page() {
  return (
    <main className=" container mx-auto flex items-center justify-center min-h-[calc(100vh-var(--header-height))] w-screen">
      <div className="flex flex-col items-center gap-16 xl:gap-24">
        <h1 className=" _border flex flex-col">
          <FadeInComp
            animationProps={{ filter: "blur(4px)", opacity: 0, yPercent: 40 }}
          >
            <span className=" text-[10rem] md:text-[12rem] lg:text-[24rem] font-satoshi leading-[0.9] block">
              404
            </span>
          </FadeInComp>
          <FadeInComp
            animationProps={{
              filter: "blur(4px)",
              opacity: 0,
              yPercent: 40,
              delay: 0.2,
            }}
          >
            <svg
              viewBox="0 0 320 60"
              className="w-full h-auto fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                className="font-satoshi font-medium uppercase text-[3rem] lg:text-[3vw]"
                // Adjust font size within SVG to minimize white space or adjust viewBox
                // fontSize="3.6vw"
              >
                Not Found
              </text>
            </svg>
          </FadeInComp>
        </h1>
        <FadeInComp
          animationProps={{
            filter: "blur(4px)",
            opacity: 0,
            yPercent: 40,
            delay: 0.4,
          }}
        >
          <Link href="/" className="block">
            <span className="text-xl font-semibold underline font-satoshi uppercase lg:text-4xl">
              Back to home
            </span>
          </Link>
        </FadeInComp>
      </div>
    </main>
  );
}
