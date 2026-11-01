import BreakingNews from "@/components/BreakingNews";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Welcome from "@/components/Welcome";
import ServiceTimes from "@/components/ServiceTimes";
import About from "@/components/About";
import Events from "@/components/Events";
import Pastors from "@/components/Pastors";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AnnouncementPopup from "@/components/AnnouncementPopup";

export default function Home() {
  return (
    <>
      <AnnouncementPopup />
      <BreakingNews />
      <Navbar />
      <Hero />
      <Welcome />
      <ServiceTimes />
      <About />
      <Events />
      <Pastors />
      <Contact />
      <Footer />
    </>
  );
}
