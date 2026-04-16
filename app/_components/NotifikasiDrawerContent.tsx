// app/_components/NotifikasiDrawerContent.tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactPaginate from "react-paginate";

import bellIcon from "@/public/assets/Icons/bell.png";
import docsIcon from "@/public/assets/Icons/docs.png";
import emptyNotif from "@/public/assets/Images/emptyNotif.png";
import { IoIosArrowBack } from "react-icons/io";

import {
  countAllNotif,
  getAllNotif,
  readAllNotif,
  readNotifById,
  safeParseNotifPayload,
} from "../_api/Notification/Notification";
import type { NotificationItem } from "../_shared/types/Notification";
import { debounce, toastErrorFromAPI } from "../_shared/utils";
import toast from "react-hot-toast";

// Tambahkan di bagian atas file (setelah import)
const ShimmerNotification = () => (
  <div className="rounded-xl p-4 mb-4 border border-gray-200 animate-pulse">
    <div className="flex items-center gap-3">
      {/* Icon placeholder */}
      <div className="w-8 h-8 rounded-full bg-gray-200" />

      {/* Content placeholder */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          {/* Badge "Baru" placeholder (opsional) */}
          <div className="w-12 h-5 bg-gray-200 rounded-full" />

          {/* Title placeholder */}
          <div className="h-4 bg-gray-200 rounded w-3/4 flex-1" />
        </div>

        {/* Date placeholder */}
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />

        {/* Body placeholder */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    </div>
  </div>
);

const ShimmerTab = () => (
  <div className="flex mt-3 justify-between items-center pt-3 space-x-6 overflow-x-auto scrollbar-hide">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="sm:min-w-30 flex items-center justify-center gap-2 whitespace-nowrap relative"
      >
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="bg-gray-200 text-white text-xs rounded-full h-5 w-5" />
      </div>
    ))}
  </div>
);

export default function NotifikasiDrawerContent({
  onClose,
}: {
  onClose?: () => void;
}) {
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
  const [counts, setCounts] = useState({
    semua: 0,
    notifikasi: 0,
    informasi: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);
  const hasFetchedCounts = useRef(false);

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

  const getCategoryFromItem = (
    item: NotificationItem,
  ): "notifikasi" | "informasi" => {
    // Gunakan category dari API, bukan dari type
    return item.category === "notification" ? "notifikasi" : "informasi";
  };

  const getIconTypeFromItem = (item: NotificationItem): "bell" | "document" => {
    // Gunakan category dari API
    return item.category === "notification" ? "bell" : "document";
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

  const fetchAllCounts = async (force = false) => {
    // Jangan fetch jika sudah ada data dan tidak dipaksa
    if (
      counts.semua !== 0 ||
      counts.notifikasi !== 0 ||
      counts.informasi !== 0
    ) {
      if (!force) return;
    }

    try {
      setCountsLoading(true);
      const [semuaRes, notifRes, infoRes] = await Promise.all([
        countAllNotif(),
        countAllNotif("notification"),
        countAllNotif("information"),
      ]);

      setCounts({
        semua: semuaRes.data?.count || 0,
        notifikasi: notifRes.data?.count || 0,
        informasi: infoRes.data?.count || 0,
      });
    } catch (error) {
      console.error("Gagal memuat counts notifikasi:", error);
    } finally {
      setCountsLoading(false);
    }
  };

  const fetchNotifications = async (
    nextPage = 1,
    category?: string,
    isRead?: boolean,
  ) => {
    try {
      const params: any = {
        page: nextPage,
        pageSize,
      };

      // Tambahkan query params sesuai kebutuhan
      if (category === "notifikasi") {
        params.category = "notification";
      } else if (category === "informasi") {
        params.category = "information";
      }

      if (isRead !== undefined) {
        params.is_read = isRead;
      }

      setLoading(true);

      const res = await getAllNotif(params);

      const total = Number(res?.data?.total ?? 0);
      setTotalItems(Number.isFinite(total) ? total : 0);

      if (!Array.isArray(res?.data?.result)) {
        setNotifications([]);
        return;
      }

      const safeResult = res?.data?.result?.map((item: any) =>
        safeParseNotifPayload(item),
      ) as NotificationItem[];

      setNotifications(safeResult);
      setPage(nextPage);
    } catch (error) {
      console.error("Gagal memuat notifikasi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Fetch notifikasi sesuai tab aktif
      await fetchNotifications(1, activeTab, undefined);

      // Fetch counts hanya sekali saat mount (bukan setiap ganti tab)
      if (!hasFetchedCounts.current) {
        await fetchAllCounts();
        hasFetchedCounts.current = true;
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = (tab: "semua" | "notifikasi" | "informasi") => {
    setActiveTab(tab);
    fetchNotifications(1, tab, undefined);
  };

  const displayItems = notifications;

  const handleReadAll = async () => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menandai semua notifikasi sebagai sudah dibaca?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const resReadAll = await readAllNotif();
      toast.success(
        resReadAll.data?.messages ||
          "Berhasil menandai semua notifikasi sebagai sudah dibaca.",
      );

      // Optimistic update
      setCounts({ semua: 0, notifikasi: 0, informasi: 0 });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

      await fetchNotifications(page, activeTab, undefined);
    } catch (error) {
      console.error("Gagal baca semua notifikasi:", error);
      fetchAllCounts(true);
    }
  };

  const handleOpenDetail = async (item: NotificationItem) => {
    const safeItem = safeParseNotifPayload(item as any) as any;
    const payload = safeItem.payload?.[0] ?? {};
    const iconType = getIconTypeFromItem(safeItem);
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handlePageChange = useCallback(
    debounce(async (selectedItem: { selected: number }) => {
      const nextPage = selectedItem.selected + 1;
      if (nextPage === page) return;

      try {
        setLoading(true);
        await fetchNotifications(nextPage, activeTab, undefined);
      } catch (err: any) {
        toastErrorFromAPI(err);
      } finally {
        setLoading(false);
      }
    }, 300),
    [page, activeTab],
  );

  // --- DETAIL VIEW ---
  if (selectedItem) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedItem(null);
                fetchAllCounts(true);
              }}
              className=""
            >
              <IoIosArrowBack size={20} />
            </button>
            <h2 className="text-xl font-bold ">Detail Notifikasi</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 notif-scroll">
          <div className="flex gap-3 mb-4">
            <div className="shrink-0 mt-1">{getIcon(selectedItem.icon)}</div>
            <div>
              <span className="flex gap-2 items-center font-bold text-base sm:text-lg">
                {selectedItem.title}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                {selectedItem.date}
              </span>
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
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 border-b border-gray-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div onClick={onClose} className="cursor-pointer">
              <IoIosArrowBack size={20} />
            </div>
            <h2 className="text-xl font-bold">Notifikasi dan Informasi</h2>
          </div>
          <button
            onClick={handleReadAll}
            disabled={counts.semua === 0}
            className="text-primary hover:underline font-bold  ml-auto mt-2 sm:mt-0 sm:ml-0 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Baca Semua
          </button>
        </div>

        {countsLoading ? (
          <div className="my-1">
            <ShimmerTab />
          </div>
        ) : (
          <div className="flex mt-3 justify-between items-center pt-3 space-x-6 overflow-x-auto scrollbar-hide">
            {[
              { key: "semua", label: "Semua", count: counts.semua },
              {
                key: "notifikasi",
                label: "Notifikasi",
                count: counts.notifikasi,
              },
              { key: "informasi", label: "Informasi", count: counts.informasi },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() =>
                  handleTabChange(key as "semua" | "notifikasi" | "informasi")
                }
                className={`pb-1 sm:min-w-30 flex items-center justify-center gap-2 whitespace-nowrap relative ${
                  activeTab === key
                    ? "text-black font-bold border-b-3 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
                {count > 0 && (
                  <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 notif-scroll">
        {loading ? (
          <div className="text-center text-gray-500">
            <>
              <ShimmerNotification />
              <ShimmerNotification />
              <ShimmerNotification />
              <ShimmerNotification />
              <ShimmerNotification />
            </>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Image
              src={emptyNotif}
              alt="Empty Notification"
              className="mx-auto max-w-30 sm:max-w-75 mb-6"
            />
            <p className="text-xl">Tidak ada notifikasi</p>
          </div>
        ) : (
          <>
            {displayItems.map((item) => {
              const safeItem = safeParseNotifPayload(item);
              const payload = safeItem.payload?.[0] ?? {};
              const iconType = getIconTypeFromItem(safeItem); // <-- gunakan safeItem
              const isBaru = !item.is_read;
              const category = getCategoryFromItem(safeItem);

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
                    pageLinkClassName="px-2 py-1 cursor-pointer text-sm font-medium rounded text-gray-700 hover:bg-gray-100"
                    activeLinkClassName="bg-primary text-white hover:bg-primary"
                    previousLinkClassName="px-2 py-1 cursor-pointer text-sm font-medium disabled:opacity-50"
                    nextLinkClassName="px-2 py-1 cursor-pointer text-sm font-medium disabled:opacity-50"
                    breakLinkClassName="px-2 py-1 text-sm text-gray-400"
                    disabledLinkClassName="opacity-50 cursor-not-allowed!"
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
