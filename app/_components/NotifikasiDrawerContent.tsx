// app/_components/NotifikasiDrawerContent.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import ReactPaginate from "react-paginate";

import bellIcon from "@/public/assets/Icons/bell.png";
import docsIcon from "@/public/assets/Icons/docs.png";
import { IoIosArrowBack } from "react-icons/io";

import {
  getAllNotif,
  readAllNotif,
  readNotifById,
  safeParseNotifPayload,
} from "../_api/Notification/Notification";
import type { NotificationItem } from "../_shared/types/Notification";
import Loader from "./Loader";
import { toastErrorFromAPI } from "../_shared/utils";

export default function NotifikasiDrawerContent() {
  const [activeTab, setActiveTab] = useState<
    "semua" | "notifikasi" | "informasi"
  >("semua");

  const [selectedItem, setSelectedItem] = useState<{
    id: number;
    type: string;
    icon: string;
    title: string;
    date: string;
    content: string;
  } | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Pagination state
  const [page, setPage] = useState<number>(1); // 1-based for API
  const [pageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPage, setLoadingPage] = useState<boolean>(false);

  const totalPages = useMemo(() => {
    const tp = Math.ceil((totalItems || 0) / pageSize);
    return tp > 0 ? tp : 1;
  }, [totalItems, pageSize]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return (
      date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    );
  };

  const getCategory = (type: string): "notifikasi" | "informasi" => {
    return type === "REMINDER" ? "notifikasi" : "informasi";
  };

  const getIconType = (type: string): "bell" | "document" => {
    return type === "REMINDER" ? "bell" : "document";
  };

  const getIcon = (iconType: string) => {
    if (iconType === "bell") {
      return (
        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
          <Image src={bellIcon} alt="bell" />
        </div>
      );
    }
    if (iconType === "document") {
      return (
        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
          <Image src={docsIcon} alt="docs" />
        </div>
      );
    }
    return null;
  };

  const fetchNotifications = async (nextPage = 1, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingPage(true);

      const res = await getAllNotif({ page: nextPage, pageSize });

      // ✅ total untuk pagination sumbernya dari GET list
      const total = Number(res?.data?.total ?? 0);
      setTotalItems(Number.isFinite(total) ? total : 0);

      if (!Array.isArray(res?.data?.result)) {
        setNotifications([]);
        return;
      }

      const safeResult = res.data.result.map((item: any) =>
        safeParseNotifPayload(item),
      ) as NotificationItem[];

      setNotifications(safeResult);
      setPage(nextPage);
    } catch (error) {
      console.error("Gagal memuat notifikasi:", error);
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingPage(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter list sesuai tab (filter hanya data page aktif)
  const filteredItems =
    activeTab === "semua"
      ? notifications
      : notifications.filter((item) => getCategory(item.type) === activeTab);

  // Badge counts (hitung dari data yang ke-load di page aktif)
  const notifCount = notifications.filter(
    (i) => getCategory(i.type) === "notifikasi" && !i.is_read,
  ).length;
  const infoCount = notifications.filter(
    (i) => getCategory(i.type) === "informasi" && !i.is_read,
  ).length;
  const semuaCount = notifications.filter((i) => !i.is_read).length;

  const handleReadAll = async () => {
    try {
      await readAllNotif();

      // optional optimistic
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

      // ✅ refetch halaman aktif biar sinkron (pagination tetap ada karena total dari list)
      await fetchNotifications(page);
    } catch (error) {
      console.error("Gagal baca semua notifikasi:", error);
    }
  };

  const handleOpenDetail = async (item: NotificationItem) => {
    const safeItem = safeParseNotifPayload(item as any) as any;
    const payload = safeItem.payload?.[0] ?? {};
    const iconType = getIconType(item.type);
    const isBaru = !item.is_read;

    setSelectedItem({
      id: item.id,
      type: isBaru ? "baru" : "normal",
      icon: iconType,
      title: payload?.notification?.title ?? "-",
      content: payload?.notification?.body ?? "-",
      date: formatDate(item.created_at),
    });

    if (isBaru) {
      try {
        await readNotifById(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)),
        );
      } catch (error) {
        console.error("Gagal membaca notifikasi:", error);
      }
    }
  };

  // react-paginate uses 0-based selected index
  const handlePageChange = async (selectedItem: { selected: number }) => {
    const nextPage = selectedItem.selected + 1; // convert to 1-based
    if (nextPage === page) return;
    try {
      setLoading(true);
      await fetchNotifications(nextPage);
    } catch (err: any) {
      toastErrorFromAPI(err);
    } finally {
      setLoading(false);
    }
  };

  // --- DETAIL VIEW ---
  if (selectedItem) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-border">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedItem(null)} className="">
              <IoIosArrowBack size={20} />
            </button>
            <h2 className="text-xl font-bold ">Detail Notifikasi</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 notif-scroll">
          <div className="flex gap-3 mb-4">
            <div className="shrink-0 mt-1">{getIcon(selectedItem.icon)}</div>
            <div>
              <span className="font-bold text-base sm:text-lg block">
                {selectedItem.title}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">{selectedItem.date}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-border">
            <p className="text-gray-700 whitespace-pre-line">
              {selectedItem.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Notifikasi dan Informasi</h2>
          <button
            onClick={handleReadAll}
            className="text-primary underline text-sm font-medium ml-auto mt-2 sm:mt-0 sm:ml-0"
          >
            Baca Semua
          </button>
        </div>

        <div className="flex pt-3 space-x-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: "semua", label: "Semua", count: semuaCount },
            { key: "notifikasi", label: "Notifikasi", count: notifCount },
            { key: "informasi", label: "Informasi", count: infoCount },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`pb-2 flex gap-1 whitespace-nowrap text-sm font-medium relative ${
                activeTab === key
                  ? "text-black border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
              {count > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 notif-scroll">
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            <Loader />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Tidak ada notifikasi
          </div>
        ) : (
          <>
            {filteredItems.map((item) => {
              const safeItem = safeParseNotifPayload(item as any) as any;
              const payload = safeItem.payload?.[0] ?? {};
              const iconType = getIconType(item.type);
              const isBaru = !item.is_read;

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className={`rounded-xl p-4 mb-4 border cursor-pointer transition-colors ${
                    isBaru
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 mt-1">{getIcon(iconType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex-col">
                        <div className="flex items-center gap-2">
                          {isBaru && (
                            <span className="bg-primary font-tertiary font-bold text-white text-sm px-2 py-1 rounded-full">
                              Baru
                            </span>
                          )}
                          <span
                            className={`font-tertiary ${isBaru ? "font-bold" : "font-semibold"} text-base sm:text-lg leading-tight truncate max-w-70`}
                          >
                            {payload.notification?.title ?? "-"}
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-xs text-secondary my-2 line-clamp-2">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm mt-1 line-clamp-2">
                        {payload.notification?.body ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center py-2">
                <div
                  className={
                    loadingPage ? "opacity-60 pointer-events-none" : ""
                  }
                >
                  <ReactPaginate
                    breakLabel="..."
                    nextLabel=">"
                    previousLabel="<"
                    onPageChange={handlePageChange}
                    pageRangeDisplayed={2}
                    marginPagesDisplayed={2}
                    pageCount={totalPages}
                    forcePage={page - 1}
                    renderOnZeroPageCount={null}
                    containerClassName="flex items-center gap-2"
                    pageClassName=""
                    pageLinkClassName="px-2 py-1 text-sm font-medium rounded text-gray-700 hover:bg-gray-100"
                    activeLinkClassName="bg-primary text-white hover:bg-primary"
                    previousLinkClassName="px-2 py-1 text-sm font-medium disabled:opacity-50"
                    nextLinkClassName="px-2 py-1 text-sm font-medium disabled:opacity-50"
                    breakLinkClassName="px-2 py-1 text-sm text-gray-400"
                    disabledLinkClassName="opacity-50 pointer-events-none"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
