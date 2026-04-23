"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  createVendorApplication,
  getVendorApplicationStatus,
  updateVendorApplication,
} from "@/lib/api";

type ExistingVendorApplication = {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  setupComplete?: boolean;
  ownerName?: string;
  businessEmail?: string;
  phone?: string;
  shopName?: string;
  tradeLicenseNo?: string | null;
  address?: string;
  city?: string | null;
  area?: string | null;
  specialties?: string[];
  courierPickup?: boolean;
  inShopRepair?: boolean;
  spareParts?: boolean;
  notes?: string | null;
};

const emptyVendorApplicationForm = {
  ownerName: "",
  businessEmail: "",
  phone: "",
  password: "",
  confirmPassword: "",
  shopName: "",
  tradeLicenseNo: "",
  address: "",
  city: "",
  area: "",
  specialties: "",
  courierPickup: false,
  inShopRepair: true,
  spareParts: false,
  notes: "",
};

type VendorApplicationFormState = typeof emptyVendorApplicationForm;
type SessionUser = {
  role?: string | null;
  accessToken?: string | null;
};

export default function VendorApplyForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const sessionUser = session?.user as SessionUser | undefined;
  const role = sessionUser?.role ?? null;
  const token = sessionUser?.accessToken;

  const [form, setForm] = useState<VendorApplicationFormState>({
    ...emptyVendorApplicationForm,
  });
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    async function loadExisting() {
      setError("");

      if (!token || role !== "VENDOR") {
        setForm({ ...emptyVendorApplicationForm });
        setIsEditMode(false);
        setLoadingExisting(false);
        return;
      }

      setLoadingExisting(true);

      try {
        const result = await getVendorApplicationStatus(token);
        const app = result.application as ExistingVendorApplication | undefined;

        if (!app) {
          setForm({ ...emptyVendorApplicationForm });
          setIsEditMode(false);
          return;
        }

        if (app.status === "APPROVED") {
          if (app.setupComplete) {
            router.replace("/vendor/dashboard");
          } else {
            router.replace("/vendor/setup-shop");
          }
          return;
        }

        setForm({
          ...emptyVendorApplicationForm,
          ownerName: app.ownerName || "",
          businessEmail: app.businessEmail || "",
          phone: app.phone || "",
          shopName: app.shopName || "",
          tradeLicenseNo: app.tradeLicenseNo || "",
          address: app.address || "",
          city: app.city || "",
          area: app.area || "",
          specialties: Array.isArray(app.specialties)
            ? app.specialties.join(", ")
            : "",
          courierPickup: Boolean(app.courierPickup),
          inShopRepair:
            typeof app.inShopRepair === "boolean" ? app.inShopRepair : true,
          spareParts: Boolean(app.spareParts),
          notes: app.notes || "",
        });
        setIsEditMode(app.status === "REJECTED" || app.status === "PENDING");
      } catch {
        setForm({ ...emptyVendorApplicationForm });
        setIsEditMode(false);
      } finally {
        setLoadingExisting(false);
      }
    }

    void loadExisting();
  }, [status, token, role, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.ownerName.trim()) {
        throw new Error("Owner name is required.");
      }

      if (!form.businessEmail.trim()) {
        throw new Error("Business email is required.");
      }

      if (!form.phone.trim()) {
        throw new Error("Phone is required.");
      }

      if (!form.shopName.trim()) {
        throw new Error("Shop name is required.");
      }

      if (!form.address.trim()) {
        throw new Error("Business address is required.");
      }

      if (isEditMode) {
        if (!token) {
          throw new Error("Please log in first.");
        }

        await updateVendorApplication(token, {
          ownerName: form.ownerName.trim(),
          businessEmail: form.businessEmail.trim(),
          phone: form.phone.trim(),
          shopName: form.shopName.trim(),
          tradeLicenseNo: form.tradeLicenseNo.trim() || undefined,
          address: form.address.trim(),
          city: form.city.trim() || undefined,
          area: form.area.trim() || undefined,
          specialties: form.specialties,
          courierPickup: form.courierPickup,
          inShopRepair: form.inShopRepair,
          spareParts: form.spareParts,
          notes: form.notes.trim() || undefined,
        });

        router.push("/vendor/status");
        router.refresh();
        return;
      }

      if (!form.password) {
        throw new Error("Password is required.");
      }

      if (form.password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }

      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const result = await createVendorApplication({
        ownerName: form.ownerName.trim(),
        businessEmail: form.businessEmail.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        shopName: form.shopName.trim(),
        tradeLicenseNo: form.tradeLicenseNo.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim() || undefined,
        area: form.area.trim() || undefined,
        specialties: form.specialties,
        courierPickup: form.courierPickup,
        inShopRepair: form.inShopRepair,
        spareParts: form.spareParts,
        notes: form.notes.trim() || undefined,
      });

      router.push(
        `/vendor/apply/success?id=${encodeURIComponent(result.application.id)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit application.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loadingExisting) {
    return (
      <div className="w-full max-w-4xl rounded-[2rem] border border-white/60 bg-white/90 p-8 shadow-2xl backdrop-blur">
        <p className="text-sm text-muted-foreground">Loading vendor application...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl rounded-[2rem] border border-white/60 bg-white/90 p-8 shadow-2xl backdrop-blur">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-accent-dark">
          {isEditMode ? "Edit Vendor Application" : "Vendor Application"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEditMode
            ? "Update your submitted vendor information below."
            : "Apply as a repair shop partner. Your application will be reviewed by the admin team."}
        </p>
      </div>

      {isEditMode ? (
        <div className="mb-4 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Update your previous vendor application and submit again. It will go back to pending review.
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="rounded-2xl border border-border px-4 py-3 text-sm"
            placeholder="Owner name"
            name="vendorOwnerName"
            autoComplete="off"
            value={form.ownerName}
            onChange={(e) => setForm((prev) => ({ ...prev, ownerName: e.target.value }))}
          />

          <input
            className="rounded-2xl border border-border px-4 py-3 text-sm"
            placeholder="Business email"
            type="email"
            name="vendorBusinessEmail"
            autoComplete="off"
            value={form.businessEmail}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, businessEmail: e.target.value }))
            }
          />

          <input
            className="rounded-2xl border border-border px-4 py-3 text-sm"
            placeholder="Phone"
            name="vendorPhone"
            autoComplete="off"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />

          <input
            className="rounded-2xl border border-border px-4 py-3 text-sm"
            placeholder="Shop name"
            name="vendorShopName"
            autoComplete="off"
            value={form.shopName}
            onChange={(e) => setForm((prev) => ({ ...prev, shopName: e.target.value }))}
          />

          {!isEditMode ? (
            <>
              <input
                className="rounded-2xl border border-border px-4 py-3 text-sm"
                placeholder="Password"
                type="password"
                name="vendorPassword"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
              />

              <input
                className="rounded-2xl border border-border px-4 py-3 text-sm"
                placeholder="Confirm password"
                type="password"
                name="vendorConfirmPassword"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
              />
            </>
          ) : null}

          <input
            className="rounded-2xl border border-border px-4 py-3 text-sm md:col-span-2"
            placeholder="Trade license number (optional)"
            name="vendorTradeLicenseNo"
            autoComplete="off"
            value={form.tradeLicenseNo}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, tradeLicenseNo: e.target.value }))
            }
          />

          <input
            className="rounded-2xl border border-border px-4 py-3 text-sm md:col-span-2"
            placeholder="Business address"
            name="vendorBusinessAddress"
            autoComplete="off"
            value={form.address}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
          />

          <input
            className="rounded-2xl border border-border px-4 py-3 text-sm"
            placeholder="City"
            name="vendorCity"
            autoComplete="off"
            value={form.city}
            onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
          />

          <input
            className="rounded-2xl border border-border px-4 py-3 text-sm"
            placeholder="Area"
            name="vendorArea"
            autoComplete="off"
            value={form.area}
            onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
          />
        </div>

        {!isEditMode && passwordsMismatch ? (
          <p className="text-sm text-red-600">Passwords do not match.</p>
        ) : null}

        <input
          className="w-full rounded-2xl border border-border px-4 py-3 text-sm"
          placeholder="Specialties (comma separated, e.g. Apple, Samsung, Laptop Repair)"
          name="vendorSpecialties"
          autoComplete="off"
          value={form.specialties}
          onChange={(e) => setForm((prev) => ({ ...prev, specialties: e.target.value }))}
        />

        <textarea
          className="min-h-[120px] w-full rounded-2xl border border-border px-4 py-3 text-sm"
          placeholder="Additional notes (optional)"
          name="vendorNotes"
          autoComplete="off"
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
        />

        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.courierPickup}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, courierPickup: e.target.checked }))
              }
            />
            Courier pickup
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.inShopRepair}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, inShopRepair: e.target.checked }))
              }
            />
            In-shop repair
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.spareParts}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, spareParts: e.target.checked }))
              }
            />
            Spare parts
          </label>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || (!isEditMode && passwordsMismatch)}
          className="w-full rounded-2xl bg-accent-dark px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading
            ? isEditMode
              ? "Updating..."
              : "Submitting..."
            : isEditMode
              ? "Update submitted information"
              : "Submit vendor application"}
        </button>
      </form>
    </div>
  );
}
