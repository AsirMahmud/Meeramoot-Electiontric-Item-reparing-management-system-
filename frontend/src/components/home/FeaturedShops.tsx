"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ShopCard from "@/components/shops/shop-card";

type Shop = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address: string;
  ratingAvg: number;
  reviewCount: number;
  priceLevel: number;
  hasVoucher: boolean;
  freeDelivery: boolean;
  hasDeals: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function FeaturedShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch(`${API_URL}/api/shops?sort=topRated`);
        const data = await res.json();
        const normalized = Array.isArray(data) ? data : [];
        setShops(normalized.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch featured shops:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-2xl font-bold text-[#163625]">
        Featured shops
      </h2>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-2xl border border-[#d9e5d5] bg-white p-4 shadow-sm"
            >
              <div className="h-5 w-2/3 rounded bg-[#e7efe2]" />
              <div className="mt-3 h-4 w-full rounded bg-[#eef4ea]" />
              <div className="mt-2 h-4 w-5/6 rounded bg-[#eef4ea]" />
              <div className="mt-4 h-4 w-1/3 rounded bg-[#e7efe2]" />
              <div className="mt-5 flex gap-2">
                <div className="h-6 w-20 rounded-full bg-[#e3efdc]" />
                <div className="h-6 w-24 rounded-full bg-[#e3efdc]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <Link
              key={shop.id}
              href={`/shops?q=${encodeURIComponent(shop.name)}`}
              className="block"
            >
              <ShopCard shop={shop} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}