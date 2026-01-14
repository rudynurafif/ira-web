// app/add-on/[id]/page.tsx
"use client";

import { getAddOn } from "@/app/_api/AddOn/AddOn";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import { useEffect, useState } from "react";
import Cubmu from "./_components/Cubmu";
import { notFound } from "next/navigation";
import { use } from "react";

export default function AddOnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  const uuidFromUrl = resolvedParams?.id; // UUID langsung dari URL
  const [selectedAddon, setSelectedAddon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFindAddon = async () => {
      try {
        const resAddon = await getAddOn({});
        const addons = resAddon.data?.result || [];

        // Cari addon berdasarkan ID (UUID) — exact match
        const matched = addons.find((addon: any) => addon.id === uuidFromUrl);

        if (!matched) {
          notFound(); // Tampilkan halaman 404 jika tidak ditemukan
          return;
        }

        setSelectedAddon(matched);
      } catch (err: any) {
        toastErrorFromAPI(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFindAddon();
  }, [uuidFromUrl]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!selectedAddon) {
    return <div className="p-6">Add-on tidak ditemukan.</div>;
  }

  if (selectedAddon.name === "Cubmu") {
    return (
      <div className="">
        <Cubmu items={selectedAddon.add_on_item_id} />
      </div>
    );
  }

  // Opsional: fallback untuk addon lain
  return (
    <div className="">
      <h1 className="text-2xl font-bold">{selectedAddon.name}</h1>
      <p>{selectedAddon.description}</p>
    </div>
  );
}
