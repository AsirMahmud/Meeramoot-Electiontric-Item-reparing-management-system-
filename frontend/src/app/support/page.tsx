"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Navbar from "@/components/home/Navbar";
import {
  getSupportTickets,
  createSupportTicketNew,
  getCustomerDisputes,
} from "@/lib/support-api";

export default function SupportDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"tickets" | "disputes">("tickets");
  const [tickets, setTickets] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Modal states for new ticket
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", message: "", priority: "NORMAL", repairRequestId: "" });
  const [creating, setCreating] = useState(false);

  const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;

  useEffect(() => {
    if (token) {
      loadData(token);
    } else if (session !== undefined) {
      setMessage("Log in to view your support history.");
      setLoading(false);
    }
  }, [session, token]);

  const loadData = async (tok: string) => {
    setLoading(true);
    setMessage("");
    try {
      const [ticketsRes, disputesRes] = await Promise.all([
        getSupportTickets(tok),
        getCustomerDisputes(tok),
      ]);
      setTickets(ticketsRes?.data ?? []);
      setDisputes(disputesRes?.data ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load support data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      setMessage("Subject and message are required.");
      return;
    }
    setCreating(true);
    setMessage("");
    try {
      await createSupportTicketNew(token, newTicket);
      setIsTicketModalOpen(false);
      setNewTicket({ subject: "", message: "", priority: "NORMAL", repairRequestId: "" });
      setMessage("Ticket created successfully.");
      loadData(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create ticket.");
    } finally {
      setCreating(false);
    }
  };

  const renderStatus = (status: string) => {
    const map: Record<string, string> = {
      OPEN: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      RESOLVED: "bg-green-100 text-green-800",
      CLOSED: "bg-gray-100 text-gray-600",
      ESCALATED: "bg-red-100 text-red-800",
      INVESTIGATING: "bg-purple-100 text-purple-800",
      WAITING_EVIDENCE: "bg-orange-100 text-orange-800",
      WAITING_RESPONSE: "bg-orange-100 text-orange-800",
    };
    const label = status.replace(/_/g, " ");
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-800"}`}>
        {label}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar isLoggedIn={!!session?.user} firstName={session?.user?.name?.split(" ")[0]} />

      <div className="mx-auto max-w-5xl px-3 sm:px-4 py-6 md:py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Help</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Customer Support</h1>
          </div>
          <button
            onClick={() => { setIsTicketModalOpen(true); setMessage(""); }}
            className="shrink-0 rounded-full bg-[var(--accent-dark)] px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            + Raise New Ticket
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted-foreground)]">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[var(--border)]">
          <button
            className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "tickets"
              ? "border-[var(--accent-dark)] text-[var(--accent-dark)]"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            onClick={() => setActiveTab("tickets")}
          >
            My Tickets ({tickets.length})
          </button>
          <button
            className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "disputes"
              ? "border-[var(--accent-dark)] text-[var(--accent-dark)]"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            onClick={() => setActiveTab("disputes")}
          >
            My Disputes ({disputes.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-dark)] border-t-transparent" />
          </div>
        ) : activeTab === "tickets" ? (
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted-foreground)] shadow-sm">
                No support tickets found. Raise one using the button above.
              </div>
            ) : (
              tickets.map((ticket) => (
                <Link key={ticket.id} href={`/support/tickets/${ticket.id}`}>
                  <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-sm hover:border-[var(--accent-dark)] hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--accent-dark)] transition-colors leading-tight">
                        {ticket.subject}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)] line-clamp-1">{ticket.message}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {format(new Date(ticket.createdAt), "MMM d, yyyy h:mm a")}
                        </span>
                        {ticket.repairRequestId && (
                          <span className="text-xs bg-[var(--mint-100)] text-[var(--accent-dark)] px-2 py-0.5 rounded-full">
                            Req: {ticket.repairRequestId.slice(-6)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {renderStatus(ticket.status)}
                      <span className="text-[var(--muted-foreground)]">&rarr;</span>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.length === 0 ? (
              <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted-foreground)] shadow-sm">
                No disputes found.
              </div>
            ) : (
              disputes.map((dispute) => (
                <Link key={dispute.id} href={`/support/disputes/${dispute.id}`}>
                  <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-sm hover:border-[var(--accent-dark)] hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--accent-dark)] transition-colors leading-tight">
                        {dispute.reason}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        Against: {dispute.against?.name || "Vendor"}
                      </p>
                      <span className="text-xs text-[var(--muted-foreground)] mt-2 block">
                        Opened: {format(new Date(dispute.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {renderStatus(dispute.status)}
                      <span className="text-[var(--muted-foreground)]">&rarr;</span>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--card)] w-full max-w-lg rounded-[2rem] p-6 shadow-xl border border-[var(--border)] relative">
            <button
              onClick={() => setIsTicketModalOpen(false)}
              className="absolute top-6 right-6 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Raise a Ticket</h2>

            <form onSubmit={handleCreateTicket} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-2 bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--accent-dark)] outline-none"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Message</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-2 bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--accent-dark)] outline-none min-h-[100px]"
                  placeholder="Provide details about your issue..."
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-2 bg-[var(--background)] text-[var(--foreground)] outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Related Request ID (Optional)</label>
                  <input
                    type="text"
                    value={newTicket.repairRequestId}
                    onChange={(e) => setNewTicket({ ...newTicket, repairRequestId: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-2 bg-[var(--background)] text-[var(--foreground)] outline-none"
                    placeholder="Request ID"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-5 py-2.5 rounded-full font-medium border border-[var(--border)] hover:bg-[var(--mint-50)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-full bg-[var(--accent-dark)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {creating ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
