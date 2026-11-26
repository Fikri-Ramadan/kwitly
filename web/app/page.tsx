import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";
import HowItWork from "@/components/landing/HowItWork";
import { hasSession } from "@/lib/auth/session";
import Parallax from "@/components/landing/Parallax";

export default async function Home() {
  const isAuth = await hasSession();
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar isAuth={isAuth} />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Parallax>
          <Features />
          <HowItWork />
          <Faq />
        </Parallax>
        <Footer />
      </main>
    </div>
  );
}
