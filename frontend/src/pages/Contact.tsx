import React, { useState } from "react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  LucideIcon,
} from "lucide-react";

interface ContactMethod {
  icon: LucideIcon;
  title: string;
  description: string;
  value: string;
  href: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const contactMethods: ContactMethod[] = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Get a response within 24 hours",
    value: "contact@findingmoto.com",
    href: "mailto:contact@findingmoto.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Mon-Fri from 8am to 6pm PST",
    value: "+1 (234) 567-890",
    href: "tel:+1234567890",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Come say hello at our office",
    value: "2847 Sunset Blvd, Los Angeles, CA 90026",
    href: "#",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Available during business hours",
    value: "Start a conversation",
    href: "#",
  },
];

const faqs: FAQ[] = [
  {
    question: "How do I list my parts for sale?",
    answer: "Simply create a seller account, verify your identity, and start listing your parts. Our intuitive dashboard guides you through adding photos, descriptions, and setting competitive prices.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for larger orders. All transactions are secured with industry-standard encryption.",
  },
  {
    question: "How does the garage booking system work?",
    answer: "Browse verified garages in your area, check their availability and services, and book directly through our platform. You'll receive confirmation and reminders, and can manage your appointments from your dashboard.",
  },
  {
    question: "What's your return policy?",
    answer: "We offer a 30-day return policy for unused items in original packaging. Simply initiate a return through your order history, and we'll provide a prepaid shipping label.",
  },
  {
    question: "How do you verify sellers and garages?",
    answer: "All sellers undergo identity verification and business validation. Garages must provide proof of certification and insurance. We also monitor reviews and ratings to maintain quality standards.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes! We ship to over 30 countries worldwide. International shipping rates and delivery times vary by destination. Check our shipping calculator at checkout for exact costs.",
  },
];

const subjects: string[] = [
  "General Inquiry",
  "Order Support",
  "Seller Questions",
  "Garage Partnership",
  "Technical Issue",
  "Press & Media",
  "Other",
];

const Contact: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="page-shell">
      <Header />
      <main className="page-main">
        {/* Hero Section */}
        <section className="page-hero">
          <div className="container">
            <div className="page-hero-content">
              <h1 className="page-hero-title">
                Get in Touch
              </h1>
              <p className="page-hero-text">
                Have questions? We'd love to hear from you. Our team is ready to help
                with any inquiries about parts, services, or partnerships.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="section-band-divider">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <a
                  key={method.title}
                  href={method.href}
                  className="panel-card-interactive p-6 hover:border-accent animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="panel-icon">
                    <method.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                  <p className="text-sm font-medium text-accent">{method.value}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="section-band">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="form-label">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="form-label">
                        Email Address
                      </label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="form-label">
                      Subject
                    </label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, subject: e.target.value })}
                      className="form-select"
                      required
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="form-label">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, message: e.target.value })}
                      className="form-textarea"
                      required
                    />
                  </div>
                  <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Map / Info */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Office</h2>
                <div className="panel-card overflow-hidden bg-secondary h-64 mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Interactive map coming soon</p>
                  </div>
                </div>
                <div className="panel-card p-6">
                  <h3 className="font-semibold text-foreground mb-4">Business Hours</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monday - Friday</span>
                      <span className="font-medium text-foreground">8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saturday</span>
                      <span className="font-medium text-foreground">9:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunday</span>
                      <span className="font-medium text-foreground">Closed</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>All times are in Pacific Standard Time (PST)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="section-band-muted">
          <div className="container">
            <div className="section-heading">
              <div className="panel-icon-round">
                <HelpCircle className="h-8 w-8 text-accent" />
              </div>
              <h2 className="section-title">
                Frequently Asked Questions
              </h2>
              <p className="section-copy">
                Find quick answers to common questions about Finding Moto
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="panel-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6 pt-0 animate-fade-in">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
