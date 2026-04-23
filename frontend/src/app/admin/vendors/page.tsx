"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  approveAdminVendorApplication,
  getAdminVendorApplications,
  rejectAdminVendorApplication,
  type AdminVendorApplication,
} from "@/lib/api";

type PendingAdminAction =
  | { type: "approve"; id: string }
  | { type: "reject"; id: string }
  | null;

export default function AdminVendorReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const role = (session?.user as { role?: string } | undefined)?.role;
  const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;

  const [applications, setApplications] = useState<AdminVendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [pendingAction, setPendingAction] = useState<PendingAdminAction>(null);

  async function loadApplications(currentToken: string) {
    setLoading(true);
    setMessage("");

    try {
      const data = await getAdminVendorApplications(currentToken);
      setApplications(data.applications || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(application: AdminVendorApplication) {
    if (!token) {
      return;
    }

    setPendingAction({ type: "approve", id: application.id });
    setMessage("");

    try {
      await approveAdminVendorApplication(token, application.id);
      await loadApplications(token);
      setMessage(`Approved ${application.shopName}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not approve vendor.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleReject(application: AdminVendorApplication) {
    if (!token) {
      return;
    }

    setPendingAction({ type: "reject", id: application.id });
    setMessage("");

    try {
      await rejectAdminVendorApplication(
        token,
        application.id,
        rejectReason[application.id] || "Application rejected by admin"
      );
      await loadApplications(token);
      setMessage(`Rejected ${application.shopName}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not reject vendor.");
    } finally {
      setPendingAction(null);
    }
  }

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if (role !== "ADMIN") {
      router.replace("/");
      return;
    }

    if (token) {
      void loadApplications(token);
    }
  }, [session, status, role, token, router]);

  if (status === "loading" || loading) {
    return <div className="text-[#244233]">Loading vendor applications...</div>;
  }

  if (!session?.user || role !== "ADMIN") {
    return null;
  }

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#5E7366]">
          Admin
        </p>
        <h2 className="mt-3 text-4xl font-bold text-[#1F4D2E]">Vendor Review</h2>
        <p className="mt-3 text-lg text-[#6B7C72]">
          Review pending vendor applications and approve or reject them.
        </p>
      </div>

      {message ? (
        <div className="mb-6 rounded-2xl border border-[#D7E2D2] bg-[#F2F5EF] p-4 text-sm text-[#244233]">
          {message}
        </div>
      ) : null}

      <div className="space-y-5">
        {applications.length === 0 ? (
          <div className="rounded-[28px] border border-[#D7E2D2] bg-[#F2F5EF] p-6 text-[#6B7C72]">
            No vendor applications found.
          </div>
        ) : (
          applications.map((app) => {
            const isApproving =
              pendingAction?.type === "approve" && pendingAction.id === app.id;
            const isRejecting =
              pendingAction?.type === "reject" && pendingAction.id === app.id;
            const isBusy = pendingAction?.id === app.id;

            return (
              <div
                key={app.id}
                className="rounded-[28px] border border-[#D7E2D2] bg-[#F2F5EF] p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-[#1F4D2E]">{app.shopName}</h3>
                    <p className="text-sm text-[#6B7C72]">
                      Owner: {app.ownerName} · {app.businessEmail}
                    </p>
                    <p className="text-sm text-[#6B7C72]">Phone: {app.phone}</p>
                    <p className="text-sm text-[#6B7C72]">
                      Address: {app.address}
                      {app.city ? `, ${app.city}` : ""}
                      {app.area ? `, ${app.area}` : ""}
                    </p>
                    <p className="text-sm text-[#6B7C72]">
                      Trade License: {app.tradeLicenseNo || "Not provided"}
                    </p>
                    <p className="text-sm text-[#6B7C72]">
                      Specialties: {app.specialties?.join(", ") || "None"}
                    </p>
                    <p className="text-sm text-[#6B7C72]">
                      Services:
                      {app.courierPickup ? " Courier Pickup" : ""}
                      {app.inShopRepair ? " In-Shop Repair" : ""}
                      {app.spareParts ? " Spare Parts" : ""}
                    </p>
                    <p className="text-sm text-[#6B7C72]">
                      Status: <span className="font-semibold text-[#1F4D2E]">{app.status}</span>
                    </p>
                    {app.notes ? (
                      <p className="text-sm text-[#6B7C72]">Notes: {app.notes}</p>
                    ) : null}
                    {app.rejectionReason ? (
                      <p className="text-sm text-red-600">
                        Rejection reason: {app.rejectionReason}
                      </p>
                    ) : null}
                  </div>

                  <div className="w-full max-w-sm space-y-3">
                    {app.status === "PENDING" ? (
                      <>
                        <button
                          className="w-full rounded-full bg-[#1F4D2E] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => void handleApprove(app)}
                          disabled={isBusy}
                        >
                          {isApproving ? "Approving..." : "Approve vendor"}
                        </button>

                        <textarea
                          value={rejectReason[app.id] || ""}
                          onChange={(e) =>
                            setRejectReason((prev) => ({
                              ...prev,
                              [app.id]: e.target.value,
                            }))
                          }
                          rows={3}
                          placeholder="Optional rejection reason"
                          className="w-full rounded-2xl border border-[#C9D9C5] bg-white px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isBusy}
                        />

                        <button
                          className="w-full rounded-full border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => void handleReject(app)}
                          disabled={isBusy}
                        >
                          {isRejecting ? "Rejecting..." : "Reject vendor"}
                        </button>
                      </>
                    ) : (
                      <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[#244233]">
                        This application is already {app.status.toLowerCase()}.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
