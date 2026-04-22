"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/home/Navbar";
import {
  checkoutCart,
  getMyCarts,
  removeCartItem,
  updateCartItem,
  type Cart,
} from "@/lib/api";

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;

  const [carts, setCarts] = useState<Cart[]>([]);
  const [message, setMessage] = useState("Loading cart...");
  const [busy, setBusy] = useState(false);

  const [scheduleType, setScheduleType] = useState<"NOW" | "LATER">("NOW");
  const [scheduledAt, setScheduledAt] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BKASH">("CASH");
  const [addressMode, setAddressMode] = useState<"PROFILE" | "MANUAL" | "MAP">("MANUAL");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [problemNote, setProblemNote] = useState("");

  async function loadCart() {
    if (!token) {
      setMessage("Log in to view your cart.");
      return;
    }

    try {
      const data = await getMyCarts(token);
      setCarts(data);
      setMessage(data.length ? "" : "Your cart is empty.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load cart.");
    }
  }

  useEffect(() => {
    loadCart();
  }, [token]);

  const primaryCart = carts[0] || null;

  const subtotal = useMemo(() => {
    if (!primaryCart) return 0;
    return primaryCart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
  }, [primaryCart]);

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setAddressMode("MAP");
        setMessage("Current location captured. You can still edit the address text below.");
      },
      () => {
        setMessage("Could not get your current location.");
      }
    );
  }

  return (
    <main className="min-h-screen bg-[#E4FCD5]">
      <Navbar isLoggedIn={!!session?.user} firstName={session?.user?.name?.split(" ")[0]} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-[#58725f]">Direct order checkout</p>
          <h1 className="mt-2 text-4xl font-bold text-[#173726]">Your cart</h1>
          <p className="mt-2 text-[#5b7262]">
            Add services from a shop, then confirm schedule, payment, address, and order.
          </p>
        </div>

        {message ? (
          <div className="rounded-[2rem] bg-white p-6 text-[#355541] shadow-sm">{message}</div>
        ) : null}

        {primaryCart ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="space-y-6">
              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#173726]">{primaryCart.shop.name}</h2>
                    <p className="mt-2 text-sm text-[#5c7563]">{primaryCart.shop.address}</p>
                  </div>
                  <div className="rounded-full bg-[#eef8ea] px-4 py-2 text-sm font-semibold text-[#214c34]">
                    ⭐ {primaryCart.shop.ratingAvg.toFixed(1)} · {primaryCart.shop.reviewCount} reviews
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {primaryCart.items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[1.5rem] border border-[#dfe8d9] p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-[#173726]">{item.serviceName}</h3>
                          {item.description ? (
                            <p className="mt-1 text-sm text-[#5c7563]">{item.description}</p>
                          ) : null}
                          <p className="mt-2 text-sm text-[#355541]">
                            ৳{Number(item.price).toLocaleString("en-BD")} each
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={item.quantity}
                            onChange={async (e) => {
                              if (!token) return;
                              await updateCartItem(item.id, Number(e.target.value), token);
                              await loadCart();
                            }}
                            className="rounded-full border border-[#cfe0c6] px-4 py-2 text-sm text-[#173726]"
                          >
                            {[1, 2, 3, 4, 5].map((qty) => (
                              <option key={qty} value={qty}>
                                Qty {qty}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={async () => {
                              if (!token) return;
                              await removeCartItem(item.id, token);
                              await loadCart();
                            }}
                            className="rounded-full border border-[#214c34] bg-white px-4 py-2 text-sm font-semibold text-[#214c34]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#173726]">Schedule</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setScheduleType("NOW")}
                    className={`rounded-[1.5rem] border px-4 py-4 text-left ${
                      scheduleType === "NOW"
                        ? "border-[#214c34] bg-[#eef8ea]"
                        : "border-[#dfe8d9] bg-white"
                    }`}
                  >
                    <div className="font-semibold text-[#173726]">Now</div>
                    <div className="mt-1 text-sm text-[#5c7563]">Book the soonest available pickup slot.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleType("LATER")}
                    className={`rounded-[1.5rem] border px-4 py-4 text-left ${
                      scheduleType === "LATER"
                        ? "border-[#214c34] bg-[#eef8ea]"
                        : "border-[#dfe8d9] bg-white"
                    }`}
                  >
                    <div className="font-semibold text-[#173726]">Choose time</div>
                    <div className="mt-1 text-sm text-[#5c7563]">Pick a date and time that works for you.</div>
                  </button>
                </div>

                {scheduleType === "LATER" ? (
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="mt-4 w-full rounded-2xl border border-[#cfe0c6] px-4 py-3"
                  />
                ) : null}
              </div>

              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#173726]">Payment method</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    className={`rounded-[1.5rem] border px-4 py-4 text-left ${
                      paymentMethod === "CASH"
                        ? "border-[#214c34] bg-[#eef8ea]"
                        : "border-[#dfe8d9] bg-white"
                    }`}
                  >
                    <div className="font-semibold text-[#173726]">Cash</div>
                    <div className="mt-1 text-sm text-[#5c7563]">Pay when service is handled.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("BKASH")}
                    className={`rounded-[1.5rem] border px-4 py-4 text-left ${
                      paymentMethod === "BKASH"
                        ? "border-[#214c34] bg-[#eef8ea]"
                        : "border-[#dfe8d9] bg-white"
                    }`}
                  >
                    <div className="font-semibold text-[#173726]">bKash</div>
                    <div className="mt-1 text-sm text-[#5c7563]">Save as pending payment method for this order.</div>
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#173726]">Address</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setAddressMode("PROFILE")}
                    className={`rounded-[1.25rem] border px-4 py-3 text-sm font-semibold ${
                      addressMode === "PROFILE"
                        ? "border-[#214c34] bg-[#eef8ea] text-[#173726]"
                        : "border-[#dfe8d9] bg-white text-[#355541]"
                    }`}
                  >
                    Saved address
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressMode("MANUAL")}
                    className={`rounded-[1.25rem] border px-4 py-3 text-sm font-semibold ${
                      addressMode === "MANUAL"
                        ? "border-[#214c34] bg-[#eef8ea] text-[#173726]"
                        : "border-[#dfe8d9] bg-white text-[#355541]"
                    }`}
                  >
                    Manual entry
                  </button>
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    className={`rounded-[1.25rem] border px-4 py-3 text-sm font-semibold ${
                      addressMode === "MAP"
                        ? "border-[#214c34] bg-[#eef8ea] text-[#173726]"
                        : "border-[#dfe8d9] bg-white text-[#355541]"
                    }`}
                  >
                    Use my location
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-2xl border border-[#cfe0c6] px-4 py-3"
                    placeholder="House, road, area details"
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="rounded-2xl border border-[#cfe0c6] px-4 py-3"
                      placeholder="City"
                    />
                    <input
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="rounded-2xl border border-[#cfe0c6] px-4 py-3"
                      placeholder="Area"
                    />
                  </div>

                  {lat && lng ? (
                    <div className="rounded-2xl border border-[#cfe0c6] bg-[#f6fbf4] px-4 py-3 text-sm text-[#355541]">
                      Location attached: {lat.toFixed(5)}, {lng.toFixed(5)}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#173726]">Extra notes</h2>
                <textarea
                  rows={4}
                  value={problemNote}
                  onChange={(e) => setProblemNote(e.target.value)}
                  className="mt-4 w-full rounded-2xl border border-[#cfe0c6] px-4 py-3"
                  placeholder="Add any issue details, pickup notes, landmarks, or special instructions"
                />
              </div>
            </section>

            <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#173726]">Order summary</h2>
                <div className="mt-5 space-y-3 text-sm text-[#355541]">
                  <div className="flex items-center justify-between">
                    <span>Services</span>
                    <span>{primaryCart.items.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Schedule</span>
                    <span>{scheduleType === "NOW" ? "Now" : "Chosen time"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment</span>
                    <span>{paymentMethod === "BKASH" ? "bKash" : "Cash"}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#e2ebe0] pt-3 text-base font-bold text-[#173726]">
                    <span>Subtotal</span>
                    <span>৳{subtotal.toLocaleString("en-BD")}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    if (!token || !primaryCart) return;

                    try {
                      setBusy(true);
                      setMessage("");

                      await checkoutCart(
                        primaryCart.id,
                        {
                          scheduleType,
                          scheduledAt: scheduleType === "LATER" ? scheduledAt : undefined,
                          paymentMethod,
                          addressMode,
                          address,
                          city,
                          area,
                          lat,
                          lng,
                          deliveryType: "REGULAR",
                          problemNote,
                        },
                        token
                      );

                      router.push("/orders");
                    } catch (error) {
                      setMessage(
                        error instanceof Error ? error.message : "Could not confirm order."
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#214c34] px-6 py-3 text-sm font-semibold text-white"
                >
                  {busy ? "Confirming..." : "Confirm order"}
                </button>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}