import { Truck, ShieldCheck, Headphones, RefreshCw } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Free shipping on orders over $99. Most orders delivered within 2-5 business days.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Guaranteed",
    description: "All parts are verified for authenticity and quality. 100% satisfaction guaranteed.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description: "Our team of motorcycle experts is here to help with any questions or concerns.",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "Not satisfied? Return any unused item within 30 days for a full refund.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex p-4 rounded-full bg-primary-foreground/10 mb-4">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-primary-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
