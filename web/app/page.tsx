import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";
import HowItWork from "@/components/landing/HowItWork";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Features />
        <HowItWork />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
