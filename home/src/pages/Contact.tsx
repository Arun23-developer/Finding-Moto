import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Contact <span className="text-gradient">Us</span>
            </h1>
            <p className="text-muted-foreground mb-12">Have a question? We'd love to hear from you.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {[
                { key: "name", label: "Name *", type: "text", placeholder: "Your name" },
                { key: "email", label: "Email *", type: "email", placeholder: "your@email.com" },
                { key: "phone", label: "Phone", type: "tel", placeholder: "+91 9876543210" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    maxLength={field.key === "name" ? 100 : field.key === "email" ? 255 : 20}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <textarea
                  rows={5}
                  placeholder="Tell us what you need..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={1000}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity neon-glow-orange"
              >
                <Send className="h-4 w-4" /> Send Message
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "support@motomindai.com" },
                  { icon: Phone, label: "+91 98765 43210" },
                  { icon: MapPin, label: "Chennai, Tamil Nadu, India" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl overflow-hidden border border-border h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.84916296526!2d80.06892!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d3361%3A0x6e61a70b6863d433!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="MotoMind AI Location"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
