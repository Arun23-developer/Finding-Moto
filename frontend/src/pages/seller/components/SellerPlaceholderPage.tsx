import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SellerPlaceholderPageProps {
  title: string;
  description: string;
  summary: { label: string; value: string }[];
  children: ReactNode;
}

export function SellerPlaceholderPage({ title, description, summary, children }: SellerPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label} className="glass-card">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-2xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {children}
    </div>
  );
}