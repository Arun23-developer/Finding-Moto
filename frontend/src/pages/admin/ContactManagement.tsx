import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Reply, Eye } from "lucide-react";

const contacts = [
  { id: 1, name: "Mohamed Ali", email: "mohamed@email.com", subject: "Bulk order inquiry", message: "I want to place a bulk order for brake pads...", date: "Feb 18, 2026", status: "New" },
  { id: 2, name: "Fatima Shop", email: "fatima@shop.com", subject: "Registration help", message: "I'm having trouble registering my shop...", date: "Feb 18, 2026", status: "New" },
  { id: 3, name: "Omar Mechanic", email: "omar@mechanic.com", subject: "Refund request", message: "I received the wrong part and would like a refund...", date: "Feb 17, 2026", status: "In Progress" },
  { id: 4, name: "Youssef Parts", email: "youssef@parts.com", subject: "Partnership proposal", message: "We are interested in becoming a premium seller...", date: "Feb 16, 2026", status: "Replied" },
  { id: 5, name: "Karim Workshop", email: "karim@workshop.com", subject: "Technical support", message: "The product listing page is not loading properly...", date: "Feb 15, 2026", status: "Replied" },
  { id: 6, name: "Amina Auto", email: "amina@auto.com", subject: "Payment issue", message: "My payment was deducted but order shows unpaid...", date: "Feb 14, 2026", status: "Resolved" },
];

const statusStyles: Record<string, string> = {
  New: "bg-primary/15 text-primary border-primary/20",
  "In Progress": "bg-warning/15 text-warning border-warning/20",
  Replied: "bg-info/15 text-info border-info/20",
  Resolved: "bg-success/15 text-success border-success/20",
};

export default function ContactManagement() {
  const [query, setQuery] = useState("");

  const filteredContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [c.name, c.email, c.subject, c.message, c.status].some((field) => field.toLowerCase().includes(q))
    );
  }, [query]);

  const openContact = (id: number) => {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
    window.alert(`From: ${contact.name} <${contact.email}>\nSubject: ${contact.subject}\n\n${contact.message}`);
  };

  const replyTo = (id: number) => {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
    const subject = encodeURIComponent(`Re: ${contact.subject}`);
    const body = encodeURIComponent(`Hi ${contact.name},\n\nThanks for contacting Finding Moto.\n\n`);
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Contact Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage customer inquiries and messages</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Messages", value: "342" },
          { label: "New", value: "12" },
          { label: "In Progress", value: "8" },
          { label: "Resolved", value: "322" },
        ].map((s) => (
          <Card key={s.label} className="glass-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-display font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search contacts..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{contact.name}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyles[contact.status]}`}>
                      {contact.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium mt-0.5">{contact.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{contact.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{contact.email} • {contact.date}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openContact(contact.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => replyTo(contact.id)}>
                    <Reply className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
