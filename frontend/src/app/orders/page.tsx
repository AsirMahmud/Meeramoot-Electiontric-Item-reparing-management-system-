"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/home/Navbar";
import { getMyOrders, acceptBid, createSupportTicket, createDispute } from "@/lib/api";

type OrderItem = {
  id: string;
  title: string;
  deviceType?: string | null;
  brand?: string | null;
  model?: string | null;
  problem?: string | null;
  status: string;
  mode: string;
  repairJob?: {
    shop?: {
      name: string;
    } | null;
    deliveries?: {
      status?: string | null;
    }[];
  } | null;
  bids?: {
    id: string;
    totalCost: number;
    estimatedDays?: number | null;
    notes?: string | null;
    shop: {
      name: string;
      ratingAvg: number;
      priceLevel: number;
    };
  }[];
};

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [message, setMessage] = useState("Loading your orders...");

  const fetchOrders = async (token: string) => {
    try {
      const data = await getMyOrders(token);
      setOrders(data);
      setMessage(data.length ? "" : "No orders yet.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load orders.");
    }
  };

  useEffect(() => {
    const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;
    if (!token) {
      setMessage("Log in to view your orders.");
      return;
    }
    fetchOrders(token);
  }, [session]);

  const handleAcceptBid = async (requestId: string, bidId: string) => {
    const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;
    if (!token) return;
    try {
      setMessage("Accepting bid...");
      await acceptBid(token, requestId, bidId);
      await fetchOrders(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to accept bid.");
    }
  };

  const handleCreateSupportTicket = async (requestId: string) => {
    const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;
    if (!token) return;
    const subject = window.prompt("Brief subject of your issue:");
    if (!subject) return;
    const messageContent = window.prompt("Describe the issue in detail:");
    if (!messageContent) return;

    try {
      setMessage("Submitting support ticket...");
      await createSupportTicket(token, requestId, subject, messageContent);
      setMessage("Support ticket submitted successfully. We'll get back to you soon!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to submit ticket.");
    }
  };

  const handleCreateDispute = async (requestId: string) => {
    const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;
    if (!token) return;
    const reason = window.prompt("Reason for dispute:");
    if (!reason) return;

    try {
      setMessage("Opening dispute case...");
      await createDispute(token, requestId, reason);
      setMessage("Dispute filed successfully. Support staff will review it shortly.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to file dispute.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar
        isLoggedIn={!!session?.user}
        firstName={session?.user?.name?.split(" ")[0]}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              Orders
            </p>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              Track your requests
            </h1>
          </div>

          <Link
            href="/requests/new"
            className="rounded-full bg-[var(--accent-dark)] px-6 py-3 text-sm font-semibold text-white"
          >
            New request
          </Link>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">
                    {order.title}
                  </h2>
                  <p className="mt-2 text-[var(--muted-foreground)]">
                    {order.deviceType} {order.brand || ""} {order.model || ""}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {order.problem}
                  </p>
                </div>

                <div className="rounded-full bg-[var(--mint-100)] px-4 py-2 text-sm font-semibold text-[var(--accent-dark)]">
                  {order.status.replaceAll("_", " ")}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--mint-50)] p-4 text-sm text-[var(--muted-foreground)]">
                  <p className="font-semibold text-[var(--foreground)]">Flow</p>
                  <p>{order.mode.replaceAll("_", " ")}</p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--mint-50)] p-4 text-sm text-[var(--muted-foreground)]">
                  <p className="font-semibold text-[var(--foreground)]">Shop</p>
                  <p>{order.repairJob?.shop?.name || "Matching in progress"}</p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--mint-50)] p-4 text-sm text-[var(--muted-foreground)]">
                  <p className="font-semibold text-[var(--foreground)]">
                    Latest delivery
                  </p>
                  <p>
                    {order.repairJob?.deliveries?.[0]?.status?.replaceAll(
                      "_",
                      " "
                    ) || "No delivery assigned yet"}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleCreateSupportTicket(order.id)}
                  className="rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                >
                  Raise Support Ticket
                </button>
                {order.status !== "PENDING" && order.status !== "CANCELLED" && (
                  <button
                    onClick={() => handleCreateDispute(order.id)}
                    className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                  >
                    File Dispute
                  </button>
                )}
              </div>

              {order.status === "PENDING" && order.bids && order.bids.length > 0 && (
                <div className="mt-6 border-t border-[var(--border)] pt-6">
                  <h3 className="font-semibold text-lg text-[var(--foreground)] mb-4">Available Shop Quotes</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {order.bids.map((bid) => (
                      <div key={bid.id} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-[var(--foreground)] text-lg">{bid.shop.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">★ {bid.shop.ratingAvg.toFixed(1)} • {bid.shop.priceLevel || "$$"}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-[var(--accent-dark)]">${bid.totalCost.toFixed(2)}</p>
                            {bid.estimatedDays && (
                              <p className="text-xs text-[var(--muted-foreground)]">{bid.estimatedDays} days est.</p>
                            )}
                          </div>
                        </div>
                        {bid.notes && (
                          <div className="rounded-xl bg-[var(--card)] p-3 text-sm text-[var(--muted-foreground)] mb-4 flex-grow border border-[var(--border)]">
                            "{bid.notes}"
                          </div>
                        )}
                        <button
                          onClick={() => handleAcceptBid(order.id, bid.id)}
                          className="mt-auto w-full rounded-full bg-[var(--accent-dark)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                        >
                          Accept Quote
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}

          {!orders.length && (
            <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-8 text-[var(--muted-foreground)] shadow-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}