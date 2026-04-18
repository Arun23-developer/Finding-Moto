import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, RefreshCw, Trash2, Upload, Wrench, X } from "lucide-react";
import api from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { resolveMediaUrl } from "@/lib/imageUrl";
import { ProductsToolbar } from "../seller/components/ProductsToolbar";
import { StatusFilterBar } from "../seller/components/StatusFilterBar";

type ServiceStatus = "ENABLED" | "DISABLED";

interface MechanicService {
  _id: string;
  name?: string;
  price?: number;
  originalPrice?: number;
  active?: boolean;
  productStatus?: ServiceStatus;
  description?: string;
  duration?: string;
  category?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ServiceFormValues {
  name: string;
  actualPrice: string;
  discountPrice: string;
  category: string;
  status: ServiceStatus;
  description: string;
  images: string[];
}

type FormErrors = Partial<Record<"name" | "actualPrice" | "discountPrice", string>>;

interface AddServiceSectionProps {
  service: MechanicService | null;
  submitting: boolean;
  submitError: string;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
}

interface ServicesTableProps {
  services: MechanicService[];
  onEdit: (service: MechanicService) => void;
  onToggleVisibility: (service: MechanicService) => void;
  onDelete: (service: MechanicService) => void;
  togglingServiceId: string | null;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const SERVICE_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "ENABLED", label: "Enabled" },
  { value: "DISABLED", label: "Disabled" },
];
const CATEGORY_OPTIONS = [
  "engine_system",
  "fuel_system",
  "air_intake_system",
  "ignition_system",
  "cooling_system",
  "lubrication_system",
  "exhaust_system",
  "transmission_system",
  "starting_system",
  "charging_system",
  "electrical_system",
  "braking_system",
  "suspension_system",
  "steering_system",
  "wheel_system",
  "chassis_system",
  "body_system",
  "lighting_system",
  "safety_system",
  "accessories_system",
] as const;
const MAX_SERVICE_IMAGES = 5;
const DEFAULT_SERVICE_FORM_VALUES: ServiceFormValues = {
  name: "",
  actualPrice: "",
  discountPrice: "",
  category: CATEGORY_OPTIONS[0],
  status: "ENABLED",
  description: "",
  images: [],
};

function getServiceStatus(service: Partial<MechanicService>): ServiceStatus {
  return service.productStatus === "DISABLED" ? "DISABLED" : "ENABLED";
}

function formatCurrency(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(value);
}

function getFormValues(service: MechanicService | null): ServiceFormValues {
  return {
    name: service?.name ?? "",
    actualPrice: typeof service?.price === "number" ? String(service.price) : "",
    discountPrice: typeof service?.originalPrice === "number" ? String(service.originalPrice) : "",
    category:
      service?.category && CATEGORY_OPTIONS.includes(service.category as (typeof CATEGORY_OPTIONS)[number])
        ? service.category
        : CATEGORY_OPTIONS[0],
    status: getServiceStatus(service ?? {}),
    description: service?.description ?? "",
    images: service?.images ?? [],
  };
}

function AddServiceSection({
  service,
  submitting,
  submitError,
  onSubmit,
}: AddServiceSectionProps) {
  const [form, setForm] = useState<ServiceFormValues>(DEFAULT_SERVICE_FORM_VALUES);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(getFormValues(service));
    setImageError("");
    setErrors({});
  }, [service]);

  const validateField = (field: keyof ServiceFormValues, rawValue: string, nextForm: ServiceFormValues): string => {
    const trimmedValue = rawValue.trim();

    if (field === "name" && trimmedValue && !/[^\d]/.test(trimmedValue)) {
      return "Name cannot be only numbers";
    }

    if (field === "actualPrice" && trimmedValue && Number(trimmedValue) < 0) {
      return "Actual price cannot be negative";
    }

    if (field === "discountPrice") {
      if (trimmedValue && Number(trimmedValue) < 0) {
        return "Discount price cannot be negative";
      }
      if (
        trimmedValue &&
        nextForm.actualPrice.trim() &&
        !Number.isNaN(Number(trimmedValue)) &&
        !Number.isNaN(Number(nextForm.actualPrice)) &&
        Number(trimmedValue) > Number(nextForm.actualPrice)
      ) {
        return "Discount price cannot be greater than actual price";
      }
    }

    return "";
  };

  const handleChange = (field: keyof ServiceFormValues, value: string) => {
    setForm((current) => {
      const nextForm = { ...current, [field]: value };
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };

        if (field === "actualPrice") {
          nextErrors.actualPrice = validateField("actualPrice", value, nextForm);
          nextErrors.discountPrice = validateField("discountPrice", nextForm.discountPrice, nextForm);
        } else if (field === "discountPrice") {
          nextErrors.discountPrice = validateField("discountPrice", value, nextForm);
        } else if (field === "name") {
          nextErrors.name = validateField("name", value, nextForm);
        }

        return nextErrors;
      });
      return nextForm;
    });
  };

  const handleRemoveImage = (index: number) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
    setImageError("");
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const remainingSlots = MAX_SERVICE_IMAGES - form.images.length;
    if (remainingSlots <= 0) {
      setImageError("Maximum 5 photos allowed");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    const shouldWarn = files.length > remainingSlots;

    try {
      const uploadedUrls: string[] = [];
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("image", file);
        const { data } = await api.post("/products/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (data?.success && data?.data?.url) uploadedUrls.push(data.data.url);
      }

      if (uploadedUrls.length > 0) {
        setForm((current) => ({
          ...current,
          images: [...current.images, ...uploadedUrls].slice(0, MAX_SERVICE_IMAGES),
        }));
      }

      setImageError(shouldWarn ? "Maximum 5 photos allowed" : "");
    } catch {
      setImageError("Unable to upload photo right now");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {
      name: validateField("name", form.name, form),
      actualPrice: validateField("actualPrice", form.actualPrice, form),
      discountPrice: validateField("discountPrice", form.discountPrice, form),
    };

    setErrors(nextErrors);

    if (form.images.length > MAX_SERVICE_IMAGES) {
      setImageError("Maximum 5 photos allowed");
      return;
    }

    if (Object.values(nextErrors).some(Boolean)) return;

    await onSubmit(form);
    if (!service) setForm(DEFAULT_SERVICE_FORM_VALUES);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">{service ? "Edit Service" : "Add Service"}</h2>
          <p className="text-sm text-muted-foreground">
            {service ? "Update the selected service and save your changes." : "Create a new service listing using the existing mechanic flow."}
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Label className="mb-2 block">Service Images</Label>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          {form.images.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {form.images.map((img, index) => (
                <div key={`${img}-${index}`} className="group relative h-20 w-20 overflow-hidden rounded-lg border">
                  <img src={resolveMediaUrl(img, "https://placehold.co/80x80?text=Item")} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center hover:bg-muted/20"
          >
            <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium">Upload service images</span>
            <span className="text-xs text-muted-foreground">PNG, JPG up to 5 images.</span>
          </button>
          {imageError ? <p className="mt-2 text-sm text-destructive">{imageError}</p> : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="service-name">Service Name</Label>
            <Input id="service-name" value={form.name} onChange={(event) => handleChange("name", event.target.value)} placeholder="Enter service name" />
            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-actual-price">Actual Price</Label>
            <Input id="service-actual-price" type="number" value={form.actualPrice} onChange={(event) => handleChange("actualPrice", event.target.value)} placeholder="0.00" />
            {errors.actualPrice ? <p className="text-sm text-destructive">{errors.actualPrice}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-discount-price">Discount Price</Label>
            <Input id="service-discount-price" type="number" value={form.discountPrice} onChange={(event) => handleChange("discountPrice", event.target.value)} placeholder="0.00" />
            {errors.discountPrice ? <p className="text-sm text-destructive">{errors.discountPrice}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-category">Category</Label>
            <select
              id="service-category"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-status">Buyer Visibility</Label>
            <select
              id="service-status"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ServiceStatus }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="ENABLED">Enabled</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="service-description">Description</Label>
            <Textarea id="service-description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the service..." rows={5} />
          </div>
        </div>

        {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wrench className="h-4 w-4" />
            <span>
              {service
                ? "Editing the selected services"
                : "New service will appear in Manage Products after save"}
            </span>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : service ? "Save Changes" : "Add Service"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ServicesTable({ services, onEdit, onToggleVisibility, onDelete, togglingServiceId }: ServicesTableProps) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service Name</TableHead>
            <TableHead>Actual Price</TableHead>
            <TableHead>Buyer Visibility</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/20">
                    {service.images?.[0] ? (
                      <img src={resolveMediaUrl(service.images[0], "https://placehold.co/80x80?text=Item")} alt={service.name ?? "Service"} className="h-full w-full object-cover" />
                    ) : (
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{service.name || "N/A"}</p>
                    <p className="truncate text-xs text-muted-foreground">{service.category || "N/A"}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{formatCurrency(service.price)}</TableCell>
              <TableCell>
                <Badge variant="outline">{getServiceStatus(service) === "ENABLED" ? "Enabled" : "Disabled"}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(service)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={togglingServiceId === service._id}
                    onClick={() => onToggleVisibility(service)}
                  >
                    {getServiceStatus(service) === "DISABLED" ? "Enable" : "Disable"}
                  </Button>
                  <Button type="button" variant="outline" size="icon" onClick={() => onDelete(service)} aria-label="Delete service" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function MechanicServices() {
  const [services, setServices] = useState<MechanicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [togglingServiceId, setTogglingServiceId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<MechanicService | null>(null);
  const [deleteService, setDeleteService] = useState<MechanicService | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearchQuery(searchInput.trim().toLowerCase());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let ignore = false;
    const fetchServices = async () => {
      try {
        setError("");
        setLoading(true);
        const { data } = await api.get("/mechanic/services");
        if (ignore) return;
        setServices(Array.isArray(data?.data) ? data.data : []);
      } catch {
        if (ignore) return;
        setServices([]);
        setError("Failed to load services.");
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };
    fetchServices();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const counts = useMemo(
    () => ({
      all: services.length,
      ENABLED: services.filter((service) => getServiceStatus(service) === "ENABLED").length,
      DISABLED: services.filter((service) => getServiceStatus(service) === "DISABLED").length,
    }),
    [services],
  );

  const filteredServices = useMemo(
    () =>
      services.filter((service) => {
        const matchesStatus = statusFilter === "all" || getServiceStatus(service) === statusFilter;
        const matchesSearch =
          !searchQuery ||
          (service.name || "").toLowerCase().includes(searchQuery) ||
          (service.category || "").toLowerCase().includes(searchQuery);
        return matchesStatus && matchesSearch;
      }),
    [searchQuery, services, statusFilter],
  );

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  const pageMeta = useMemo(() => {
    const total = filteredServices.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, pages);
    return { page: safePage, limit: pageSize, total, pages };
  }, [filteredServices.length, page, pageSize]);

  const paginatedServices = useMemo(() => {
    const start = (pageMeta.page - 1) * pageMeta.limit;
    return filteredServices.slice(start, start + pageMeta.limit);
  }, [filteredServices, pageMeta.limit, pageMeta.page]);

  const handleRefresh = () => {
    setRefreshing(true);
    setReloadKey((current) => current + 1);
  };

  const handleOpenAdd = () => {
    setSubmitError("");
    setEditingService(null);
    setIsAddOpen(true);
  };

  const handleSubmit = async (values: ServiceFormValues) => {
    const payload = {
      name: values.name.trim(),
      price: Number(values.actualPrice),
      originalPrice: values.discountPrice.trim() ? Number(values.discountPrice) : undefined,
      active: values.status === "ENABLED",
      productStatus: values.status,
      category: values.category,
      description: values.description.trim(),
      images: values.images ?? [],
      duration: editingService?.duration ?? "General",
    };

    if (!payload.name || Number.isNaN(payload.price)) {
      setSubmitError("Service name and price are required.");
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      if (editingService?._id) {
        await api.put(`/mechanic/services/${editingService._id}`, payload);
      } else {
        await api.post("/mechanic/services", payload);
      }
      setEditingService(null);
      setIsAddOpen(false);
      setRefreshing(true);
      setReloadKey((current) => current + 1);
    } catch {
      setSubmitError("Unable to save the service right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteService?._id) {
      setDeleteService(null);
      return;
    }

    setError("");
    try {
      await api.delete(`/mechanic/services/${deleteService._id}`);
      setServices((current) => current.filter((item) => item._id !== deleteService._id));
      if (editingService?._id === deleteService._id) {
        setEditingService(null);
        setIsAddOpen(false);
      }
      setDeleteService(null);
    } catch {
      setError("Unable to delete service.");
      setDeleteService(null);
    }
  };

  const handleToggleVisibility = async (service: MechanicService) => {
    if (!service._id) return;

    setError("");
    setTogglingServiceId(service._id);

    try {
      const nextStatus = getServiceStatus(service) === "DISABLED" ? "ENABLED" : "DISABLED";
      await api.put(`/mechanic/services/${service._id}`, {
        productStatus: nextStatus,
        active: nextStatus === "ENABLED",
      });
      setServices((current) =>
        current.map((item) =>
          item._id === service._id
            ? { ...item, productStatus: nextStatus, active: nextStatus === "ENABLED" }
            : item,
        ),
      );
      if (editingService?._id === service._id) {
        setEditingService((current) =>
          current
            ? { ...current, productStatus: nextStatus, active: nextStatus === "ENABLED" }
            : current,
        );
      }
    } catch {
      setError("Unable to update service visibility.");
    } finally {
      setTogglingServiceId(null);
    }
  };

  const renderLoadingState = () => (
    <Card className="glass-card">
      <CardContent className="space-y-4 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Services</h1>
        <p className="text-sm text-muted-foreground">Manage your mechanic service catalog with search, filters, and service details.</p>
      </div>

      <ProductsToolbar search={searchInput} onSearchChange={setSearchInput} onAddProduct={handleOpenAdd} addLabel="Add Service" searchPlaceholder="Search by service name" />

      <div className="flex flex-col gap-4">
        <StatusFilterBar activeFilter={statusFilter} counts={counts} onChange={setStatusFilter} options={SERVICE_STATUS_OPTIONS} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Total visible services: {pageMeta.total}</span>
            <span>|</span>
            <span>Page {pageMeta.page} of {pageMeta.pages}</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" onClick={handleRefresh} disabled={refreshing || loading}>
              <RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Refresh
            </Button>
            <select
              value={String(pageSize)}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-[140px]"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? renderLoadingState() : null}

      {!loading && error ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
          <p className="font-medium">{error}</p>
          <Button type="button" variant="outline" className="mt-3" onClick={handleRefresh}>
            Retry
          </Button>
        </div>
      ) : null}

      {!loading && !error && pageMeta.total === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground">
            <Wrench className="h-10 w-10" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">No services found</p>
              <p className="text-sm">Adjust your filters or add a new service to get started.</p>
            </div>
            <Button type="button" onClick={handleOpenAdd}>Add Service</Button>
          </CardContent>
        </Card>
      ) : null}

      {!loading && !error && pageMeta.total > 0 ? (
        <div className="space-y-4">
          <ServicesTable
            services={paginatedServices}
            onEdit={setEditingService}
            onToggleVisibility={handleToggleVisibility}
            onDelete={setDeleteService}
            togglingServiceId={togglingServiceId}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(pageMeta.page - 1) * pageMeta.limit + 1}-{Math.min(pageMeta.page * pageMeta.limit, pageMeta.total)} of {pageMeta.total} services
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={pageMeta.page <= 1}>Previous</Button>
              <Button type="button" variant="outline" onClick={() => setPage((current) => Math.min(pageMeta.pages, current + 1))} disabled={pageMeta.page >= pageMeta.pages}>Next</Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog
        open={isAddOpen || Boolean(editingService)}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingService(null);
            setSubmitError("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>{editingService ? "Edit Service" : "Add Service"}</DialogTitle>
            <DialogDescription>
              {editingService
                ? "Update the selected mechanic service."
                : "Create a new mechanic service."}
            </DialogDescription>
          </DialogHeader>
          <AddServiceSection service={editingService} submitting={submitting} submitError={submitError} onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteService)} onOpenChange={(open) => { if (!open) setDeleteService(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>Are you sure you want to delete this service?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteService(null)}>No</Button>
            <Button type="button" onClick={handleDelete}>Yes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
