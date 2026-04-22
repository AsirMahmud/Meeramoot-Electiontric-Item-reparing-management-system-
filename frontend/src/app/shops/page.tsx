<<<<<<< HEAD
import { Suspense } from "react";
import ShopsResultsClient from "@/components/shops/shops-results-client";
=======
import ShopsResultsClient from "./shops-results-client";
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba

export default function ShopsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f7f8f3]" />}>
      <ShopsResultsClient />
    </Suspense>
  );
}
