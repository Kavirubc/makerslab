import FeaturesSection from "@/components/features-section";
import Hero from "@/components/hero";

export default async function Home() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col gap-8">
      <Hero />
      <FeaturesSection />
    </main>
  );
}
