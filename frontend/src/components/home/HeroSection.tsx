import { ArrowRight, CheckCircle2, Search, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

interface Stat {
  value: string;
  label: string;
}

export const HeroSection: React.FC = () => {
  const stats: Stat[] = [
    { value: "50K+", label: "Parts Listed" },
    { value: "2.5K+", label: "Garages" },
    { value: "100K+", label: "Happy Riders" },
    { value: "4.9", label: "Average Rating" },
  ];

  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-slate-100 via-white to-slate-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-20 lg:px-12">
        <div className="space-y-7">
          <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-slate-700">
            Trusted Marketplace for Motorcycle Parts
          </span>

          <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Find Genuine Parts and Verified Services in One Place
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
            Compare trusted sellers, book skilled mechanics, and keep your bike road-ready
            with transparent pricing and fast support.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 transition-none" asChild>
              <Link to="/products">
                Explore Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-slate-300 text-slate-800 transition-none" asChild>
              <Link to="/services">Book a Mechanic</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-900">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-semibold">Verified Sellers</span>
              </div>
              <p className="text-sm text-slate-600">Every seller profile is validated for quality and reliability.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-900">
                <Wrench className="h-4 w-4" />
                <span className="text-sm font-semibold">Certified Mechanics</span>
              </div>
              <p className="text-sm text-slate-600">Find nearby experts for service, repairs, and diagnostics.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Quick Search</h2>
          <p className="mt-1 text-sm text-slate-600">Search by part name, model, or compatible brand.</p>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. Brake pads for Yamaha R15"
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-2 text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <p className="text-sm font-medium">Live order tracking and secure checkout available nationwide.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
