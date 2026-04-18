import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import FeaturesSection from "@/components/FeaturesSection";
import PopularBikes from "@/components/PopularBikes";
import ServicesSection from "@/components/ServicesSection";
import MechanicsSection from "@/components/MechanicsSection";
import SparePartsSection from "@/components/SparePartsSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSlider />
    <FeaturesSection />
    <PopularBikes />
    <ServicesSection />
    <MechanicsSection />
    <SparePartsSection />
    <Footer />
  </div>
);

export default Index;
