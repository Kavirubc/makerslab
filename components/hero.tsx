import { auth } from "@/auth";

import Link from "next/link";
import BubbleUpButton from "./ui/bubble-up-button";
import OutlineButton from "./ui/outline-button";
import SplitTextComp from "./ui/split-text-comp";
import FadeInComp from "./ui/fade-in";

export default async function Hero() {
  const session = await auth();
  return (
    <section className="min-h-[calc(100vh-var(--header-height))] flex items-center justify-center bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-24">
        <div className="text-center space-y-12">
          <div className="space-y-6">
            <SplitTextComp>
              <h1 className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-9xl font-satoshi">
                Your Academic Portfolio
              </h1>
            </SplitTextComp>
            <SplitTextComp
              animationProps={{
                duration: 0.6,
                delay: 0.4,
                stagger: 0.1,
                yPercent: 100,
                rotate: 0,
              }}
              variant="lines"
              maskType="lines"
            >
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Showcase your projects. Build your portfolio. Get discovered by
                recruiters.
              </p>
            </SplitTextComp>
          </div>

          {!session ? (
            <div className="space-y-6">
              <div className="flex gap-4 justify-center">
                <FadeInComp
                  animationProps={{
                    yPercent: 40,
                    filter: "blur(4px)",
                    delay: 0.4,
                  }}
                  className=" overflow-visible"
                >
                  <Link href="/register" className="block">
                    <BubbleUpButton>Get Started</BubbleUpButton>
                  </Link>
                </FadeInComp>
                <FadeInComp
                  animationProps={{
                    delay: 0.6,
                    yPercent: 40,
                    filter: "blur(4px)",
                  }}
                  className=" overflow-visible"
                >
                  <Link href="/login" className="block">
                    <OutlineButton variant="outline">Sign In</OutlineButton>
                  </Link>
                </FadeInComp>
              </div>
              <SplitTextComp
                animationProps={{ duration: 0.4, delay: 0.6, rotate: 0 }}
                variant="lines"
                maskType="lines"
              >
                <p className="text-sm text-muted-foreground">
                  Exclusively for students with registered university email
                  addresses
                </p>
              </SplitTextComp>
            </div>
          ) : (
            <div className=" flex items-center justify-center">
              <FadeInComp
                animationProps={{
                  delay: 0.6,
                  yPercent: 40,
                  filter: "blur(4px)",
                }}
                className=" overflow-visible"
              >
                <Link href="/explore" className="block">
                  <BubbleUpButton>Explore Projects</BubbleUpButton>
                </Link>
              </FadeInComp>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
