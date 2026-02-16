import React from "react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import {
  Target,
  Users,
  Award,
  Heart,
  Wrench,
  Quote,
  LucideIcon,
} from "lucide-react";

interface Stat {
  value: string;
  label: string;
}

interface Value {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

const stats: Stat[] = [
  { value: "50K+", label: "Parts Listed" },
  { value: "2.5K+", label: "Partner Garages" },
  { value: "100K+", label: "Happy Riders" },
  { value: "30+", label: "Countries Served" },
];

const values: Value[] = [
  {
    icon: Target,
    title: "Quality First",
    description: "We verify every seller and part to ensure you get only genuine, high-quality products.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Built by riders, for riders. Our community shapes every feature we develop.",
  },
  {
    icon: Award,
    title: "Trust & Transparency",
    description: "Honest reviews, verified sellers, and secure transactions you can count on.",
  },
  {
    icon: Heart,
    title: "Passion for Motorcycles",
    description: "We're motorcycle enthusiasts who understand what riders truly need.",
  },
];

const team: TeamMember[] = [
  {
    name: "Marcus Rodriguez",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    bio: "15+ years in the motorcycle industry. Former racing team mechanic.",
  },
  {
    name: "Sarah Chen",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
    bio: "E-commerce expert with a passion for two wheels.",
  },
  {
    name: "James Wilson",
    role: "Lead Engineer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    bio: "Full-stack developer and weekend track day enthusiast.",
  },
  {
    name: "Emma Thompson",
    role: "Community Manager",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    bio: "Adventure rider connecting our global community of enthusiasts.",
  },
];

const testimonials: Testimonial[] = [
  {
    quote: "Finding Moto helped me find a rare part for my vintage Honda that I'd been searching for years. The seller was verified and the transaction was seamless.",
    author: "Michael T.",
    role: "Classic Bike Collector",
  },
  {
    quote: "As a garage owner, this platform has connected me with customers I never would have reached. My bookings have increased by 40%!",
    author: "David R.",
    role: "Owner, Velocity Moto Works",
  },
  {
    quote: "The community here is incredible. From finding parts to getting advice on maintenance, Finding Moto is my go-to resource.",
    author: "Lisa M.",
    role: "Daily Commuter & Weekend Rider",
  },
];

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-gradient py-20 md:py-28">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary-foreground mb-6">
                Connecting Riders with the Parts They Need
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
                Finding Moto is more than a marketplace—it's a community of passionate riders,
                trusted sellers, and certified mechanics working together to keep you on the road.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-background border-b border-border">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-accent mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-accent/10 text-accent">
                  Our Mission
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Making Motorcycle Maintenance Accessible to Everyone
                </h2>
                <p className="text-muted-foreground mb-6">
                  We believe every rider deserves access to quality parts and reliable service,
                  regardless of where they live or what they ride. That's why we built Finding Moto—to
                  break down barriers and create a seamless connection between riders, sellers, and
                  service providers.
                </p>
                <p className="text-muted-foreground">
                  From the weekend warrior restoring a classic in their garage to the professional
                  mechanic running a busy shop, we're here to support the entire motorcycle ecosystem.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
                    alt="Motorcycle workshop"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 p-4 rounded-lg bg-primary shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                      <Wrench className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-primary-foreground">Since 2020</p>
                      <p className="text-sm text-primary-foreground/70">Serving riders worldwide</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do at Finding Moto
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="p-6 rounded-xl bg-card border border-border shadow-card animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="inline-flex p-3 rounded-lg bg-accent/10 mb-4">
                    <value.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Meet Our Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Passionate riders and industry experts dedicated to building the best platform for you
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <div
                  key={member.name}
                  className="text-center p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-secondary">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-sm text-accent font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Community Says</h2>
              <p className="text-primary-foreground/70 max-w-2xl mx-auto">
                Real stories from riders and partners who've experienced Finding Moto
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.author}
                  className="p-6 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Quote className="h-8 w-8 text-accent mb-4" />
                  <p className="text-primary-foreground/90 mb-6">{testimonial.quote}</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-primary-foreground/60">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Join Our Community?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Whether you're buying parts, selling products, or offering services,
              there's a place for you at Finding Moto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="xl">
                Get Started Today
              </Button>
              <Button variant="outline" size="xl">
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
