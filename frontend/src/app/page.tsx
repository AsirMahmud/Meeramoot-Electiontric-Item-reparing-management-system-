"use client";

import { useEffect, useMemo, useState } from "react";
import FeaturedShops from "@/components/home/FeaturedShops";
import Navbar from "@/components/home/Navbar";
import PopularCategories from "@/components/home/PopularCategories";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import SidebarFilters from "@/components/home/SidebarFilters";
import OfferCarousel from "@/components/home/OfferCarousel";
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> feature/moderation-ui

type StoredUser = {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
};

export default function HomePage() {
  const [user, setUser] = useState<StoredUser | null>(null);
<<<<<<< HEAD
=======
import { getShops } from "@/lib/api";

export default function HomePage() {
  const [shops, setShops] = useState([]);
  const [shopsError, setShopsError] = useState<string | null>(null);
  const [shopsLoading, setShopsLoading] = useState(true);
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba
=======
>>>>>>> feature/moderation-ui
  const [language, setLanguage] = useState<"en" | "bn">("en");

  useEffect(() => {
    function syncUserFromStorage() {
      const rawUser = localStorage.getItem("meramot.user");
  
      if (!rawUser) {
        setUser(null);
        return;
      }
  
      try {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> feature/moderation-ui
        setUser(JSON.parse(rawUser));
      } catch {
        localStorage.removeItem("meramot.user");
        setUser(null);
<<<<<<< HEAD
      }
    }
  
    syncUserFromStorage();
  
    window.addEventListener("meramot-auth-changed", syncUserFromStorage);
  
    return () => {
      window.removeEventListener("meramot-auth-changed", syncUserFromStorage);
    };
=======
        setShopsLoading(true);
        const data = await getShops();
        setShops(data);
        setShopsError(null);
      } catch (err) {
        setShops([]);
        setShopsError("Could not load shops. Check that the backend is running and the API is configured correctly.");
      } finally {
        setShopsLoading(false);
      }
    }
  
    loadShops();
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba
=======
      }
    }
  
    syncUserFromStorage();
  
    window.addEventListener("meramot-auth-changed", syncUserFromStorage);
  
    return () => {
      window.removeEventListener("meramot-auth-changed", syncUserFromStorage);
    };
>>>>>>> feature/moderation-ui
  }, []);

  const firstName = useMemo(() => {
    return (
<<<<<<< HEAD
<<<<<<< HEAD
      user?.name?.trim()?.split(" ")[0] ||
      user?.username?.trim()?.split(" ")[0] ||
      "User"
    );
  }, [user]);
=======
      session?.user?.name?.trim()?.split(" ")[0] ||
      (session?.user as any)?.username?.trim()?.split(" ")[0] ||
      "User"
    );
  }, [session]);
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba
=======
      user?.name?.trim()?.split(" ")[0] ||
      user?.username?.trim()?.split(" ")[0] ||
      "User"
    );
  }, [user]);
>>>>>>> feature/moderation-ui

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar
        isLoggedIn={!!user}
        firstName={firstName}
        language={language}
        onLanguageChange={setLanguage}
      />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <SidebarFilters />

        <div className="space-y-8">
          <OfferCarousel />
          <FeaturedShops />
          <PopularCategories />
          <RecentlyViewed />
        </div>
      </div>
    </main>
  );
}