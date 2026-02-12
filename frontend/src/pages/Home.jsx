import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { HeroSection } from "../components/home/HeroSection";
import { CategoriesSection } from "../components/home/CategoriesSection";
import { TrendingProducts } from "../components/home/TrendingProducts";
import { ServicesSection } from "../components/home/ServicesSection";
import { FeaturesSection } from "../components/home/FeaturesSection";
import { CTASection } from "../components/home/CTASection";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <TrendingProducts />
        <ServicesSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
