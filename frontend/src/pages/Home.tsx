import React from 'react';
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { HeroSection } from "../components/home/HeroSection";
import { CategoriesSection } from "../components/home/CategoriesSection";
import { TrendingProducts } from "../components/home/TrendingProducts";
import { ServicesSection } from "../components/home/ServicesSection";
import { FeaturesSection } from "../components/home/FeaturesSection";
import { CTASection } from "../components/home/CTASection";

const Home: React.FC = () => {
  return (
    <div className="page-shell">
      <Header />
      <main className="page-main">
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
