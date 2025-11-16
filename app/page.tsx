import Hero from "@/components/hero";

export default async function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center ">
      <Hero />
    </div>
  );
}
