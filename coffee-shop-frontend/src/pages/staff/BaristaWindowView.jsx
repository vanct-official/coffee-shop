import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Coffee,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RefreshCw,
  ShoppingBag,
  Truck,
  BookOpen,
  Undo2,
  Eye,
  Check,
  AlertTriangle,
  Flame,
  Search,
  CheckSquare2,
  Square,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Âm thanh báo đơn mới (Sử dụng Web Audio API tổng hợp âm chime tự nhiên)
function playOrderChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    // Note 1 (E5 - 659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2 (B5 - 987.77Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (err) {
    // Ignore audio autoplay restrictions
  }
}

// Bộ đếm thời gian trôi qua cho mỗi đơn (Live Elapsed Timer)
function ElapsedTimer({ createdAt }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const calc = () => {
      if (!createdAt) return 0;
      const start = new Date(createdAt).getTime();
      if (Number.isNaN(start)) return 0;
      return Math.max(0, Math.floor((Date.now() - start) / 1000));
    };

    setSeconds(calc());
    const timer = setInterval(() => setSeconds(calc()), 1000);
    return () => clearInterval(timer);
  }, [createdAt]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  // Cảnh báo màu theo thời gian
  // Dưới 5 phút: Xanh lá (bình thường)
  // 5 - 10 phút: Hổ phách/Vàng (cần khẩn trương)
  // Trên 10 phút: Đỏ cảnh báo (quá hạn)
  let statusBadgeStyle = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
  let isUrgent = false;

  if (mins >= 10) {
    statusBadgeStyle = "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 animate-pulse font-black";
    isUrgent = true;
  } else if (mins >= 5) {
    statusBadgeStyle = "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold";
  }

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono tracking-wider shadow-2xs ${statusBadgeStyle}`}
      title={`Thời gian chờ: ${formatted}`}
    >
      {isUrgent ? (
        <Flame className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
      ) : (
        <Clock className="w-3.5 h-3.5" />
      )}
      <span>{formatted}</span>
    </div>
  );
}

export default function BaristaWindowView({
  orders = [],
  loading = false,
  loadOrders,
  onStatusChange,
  onViewRecipe,
  onSelectOrder,
}) {
  // Tabs: "preparing" (đang pha) hoặc "completed" (đã xong)
  const [activeTab, setActiveTab] = useState("preparing");
  // Bộ lọc loại đơn: "all", "dine-in", "takeaway", "delivery"
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  // Từ khóa tìm kiếm (theo mã đơn hoặc tên món)
  const [searchQuery, setSearchQuery] = useState("");
  // Checkbox từng món đã làm xong: key dạng `${orderId}_${idx}`
  const [checkedItems, setCheckedItems] = useState(() => new Set());
  // Âm thanh
  const [soundEnabled, setSoundEnabled] = useState(true);
  // Toàn màn hình
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Đồng hồ thời gian thực
  const [currentTime, setCurrentTime] = useState(new Date());
  // Đang bấm hoàn thành đơn
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Cập nhật đồng hồ thời gian thực
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Theo dõi số lượng đơn đang pha để phát âm thanh khi có đơn mới
  const preparingOrdersCount = useMemo(() => {
    return orders.filter(
      (o) =>
        String(o.status || "").toLowerCase() === "preparing" ||
        String(o.status || "").toLowerCase() === "pending"
    ).length;
  }, [orders]);

  const [prevPreparingCount, setPrevPreparingCount] = useState(preparingOrdersCount);

  useEffect(() => {
    if (preparingOrdersCount > prevPreparingCount) {
      if (soundEnabled) {
        playOrderChime();
      }
    }
    setPrevPreparingCount(preparingOrdersCount);
  }, [preparingOrdersCount, prevPreparingCount, soundEnabled]);

  // Bật/tắt toàn màn hình
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Toggle tick từng món trong đơn
  const toggleItemCheck = (orderId, idx) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      const key = `${orderId}_${idx}`;
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Lọc danh sách đơn hàng
  const { preparingList, completedList } = useMemo(() => {
    const prep = [];
    const comp = [];

    orders.forEach((o) => {
      const st = String(o.status || "").toLowerCase();
      if (st === "preparing" || st === "pending") {
        prep.push(o);
      } else if (st === "completed" || st === "served") {
        comp.push(o);
      }
    });

    // Đơn đang pha: Đơn cũ nhất (chờ lâu nhất) xếp lên đầu để ưu tiên
    prep.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    // Đơn đã xong: Đơn mới hoàn thành xếp lên đầu
    comp.sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));

    return { preparingList: prep, completedList: comp };
  }, [orders]);

  // Đếm tổng số ly nước đang chờ pha
  const totalDrinksPreparing = useMemo(() => {
    return preparingList.reduce((acc, order) => {
      const items = order.items || order.orderItems || [];
      return acc + items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    }, 0);
  }, [preparingList]);

  // Áp dụng bộ lọc loại đơn & tìm kiếm
  const currentList = activeTab === "preparing" ? preparingList : completedList;

  const filteredOrders = useMemo(() => {
    return currentList.filter((order) => {
      // Lọc theo loại đơn
      if (orderTypeFilter !== "all") {
        const type = String(order.order_type || "").toLowerCase();
        if (orderTypeFilter === "dine-in" && !["dine-in", "at-table"].includes(type)) return false;
        if (orderTypeFilter === "takeaway" && type !== "takeaway") return false;
        if (orderTypeFilter === "delivery" && type !== "delivery") return false;
      }

      // Lọc theo tìm kiếm
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = String(order.id).includes(q);
        const tableMatch = String(order.table_code || order.table?.code || order.receiver_name || "").toLowerCase().includes(q);
        const itemMatch = (order.items || order.orderItems || []).some((item) =>
          String(item.product_name || item.name || "").toLowerCase().includes(q)
        );
        if (!idMatch && !tableMatch && !itemMatch) return false;
      }

      return true;
    });
  }, [currentList, orderTypeFilter, searchQuery]);

  // Hành động hoàn thành đơn
  const handleCompleteOrder = async (orderId) => {
    try {
      setActionLoadingId(orderId);
      await onStatusChange(orderId, "completed");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Hành động hoàn tác đơn về preparing
  const handleUndoOrder = async (orderId) => {
    try {
      setActionLoadingId(orderId);
      await onStatusChange(orderId, "preparing");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper hiển thị badge loại đơn & vị trí bàn
  const renderOrderTypeBadge = (order) => {
    const type = String(order.order_type || "").toLowerCase();
    const tableCode = order.table_code || order.table?.code || (type === "dine-in" ? order.receiver_name : null);

    if (type === "dine-in" || type === "at-table") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700/80 shadow-2xs">
          <Coffee className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          {tableCode ? `BÀN ${String(tableCode).replace(/^Bàn\s*/i, "")}` : "TẠI BÀN"}
        </span>
      );
    }

    if (type === "takeaway") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 shadow-2xs">
          <ShoppingBag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          MANG VỀ
        </span>
      );
    }

    if (type === "delivery") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/80 shadow-2xs">
          <Truck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          GIAO HÀNG
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
        {order.order_type || "ĐƠN HÀNG"}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 dark:bg-slate-950 select-none overflow-hidden font-sans">
      {/* ============================================================== */}
      {/* TOP HEADER: Thanh điều khiển Barista KDS                       */}
      {/* ============================================================== */}
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 py-3 shadow-md z-30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Tiêu đề & Đồng hồ thời gian thực */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Coffee className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-white">
                  Cửa Sổ Pha Chế
                </h1>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
                  KDS Live
                </Badge>
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 pt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                {currentTime.toLocaleDateString("vi-VN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}{" "}
                •{" "}
                <span className="font-bold text-slate-200">
                  {currentTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </p>
            </div>
          </div>

          {/* Tab chính: Đang pha chế vs Đã xong */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-2xl border border-slate-700/80 shadow-inner">
            <button
              onClick={() => setActiveTab("preparing")}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === "preparing"
                  ? "bg-amber-500 text-slate-950 shadow-md scale-100"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Flame className={`w-4 h-4 ${activeTab === "preparing" ? "text-slate-950" : "text-amber-400"}`} />
              <span>Đang Pha Chế</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-black ${
                  activeTab === "preparing" ? "bg-slate-950 text-amber-400" : "bg-slate-700 text-slate-200"
                }`}
              >
                {preparingList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === "completed"
                  ? "bg-emerald-500 text-slate-950 shadow-md scale-100"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${activeTab === "completed" ? "text-slate-950" : "text-emerald-400"}`} />
              <span>Đã Xong</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-black ${
                  activeTab === "completed" ? "bg-slate-950 text-emerald-400" : "bg-slate-700 text-slate-200"
                }`}
              >
                {completedList.length}
              </span>
            </button>
          </div>

          {/* Công cụ: Âm thanh, Toàn màn hình, Làm mới */}
          <div className="flex items-center gap-2">
            {/* Live Drink Stats */}
            {activeTab === "preparing" && (
              <div className="hidden xl:flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span>Tổng cần pha:</span>
                <span className="text-amber-400 font-black text-sm">{totalDrinksPreparing} ly</span>
              </div>
            )}

            {/* Sound Toggle */}
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playOrderChime();
              }}
              className={`h-9 w-9 rounded-xl border-slate-700 ${
                soundEnabled
                  ? "bg-slate-800 text-amber-400 border-amber-500/40 hover:bg-slate-700"
                  : "bg-slate-800 text-slate-500 hover:text-slate-400"
              }`}
              title={soundEnabled ? "Tắt âm thanh chuông báo" : "Bật âm thanh chuông báo"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              size="icon"
              variant="outline"
              onClick={toggleFullscreen}
              className="h-9 w-9 rounded-xl border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              title={isFullscreen ? "Thoát toàn màn hình" : "Mở toàn màn hình"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>

            {/* Refresh */}
            <Button
              size="icon"
              variant="outline"
              onClick={loadOrders}
              disabled={loading}
              className="h-9 w-9 rounded-xl border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              title="Làm mới danh sách đơn"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
            </Button>
          </div>
        </div>

        {/* SUB-BAR: Bộ lọc loại đơn & Tìm kiếm */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1.5 hidden sm:inline">Lọc loại đơn:</span>
            {[
              { id: "all", label: "Tất cả", icon: Sparkles },
              { id: "dine-in", label: "Tại bàn", icon: Coffee },
              { id: "takeaway", label: "Mang về", icon: ShoppingBag },
              { id: "delivery", label: "Giao hàng", icon: Truck },
            ].map((f) => {
              const Icon = f.icon;
              const isSelected = orderTypeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setOrderTypeFilter(f.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-amber-400 text-slate-950 shadow-xs"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Ô tìm kiếm nhanh */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm mã đơn, bàn, tên món..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* BODY: Danh sách thẻ đơn hàng KDS Live                          */}
      {/* ============================================================== */}
      <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        {filteredOrders.length === 0 ? (
          <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-8 bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 shadow-inner">
              <Coffee className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {activeTab === "preparing"
                ? "Không có đơn hàng nào đang chờ pha chế"
                : "Chưa có đơn hàng nào hoàn thành trong bộ lọc"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1.5">
              {activeTab === "preparing"
                ? "Quầy pha chế đang sạch sẽ và sẵn sàng đón nhận những ly đồ uống thơm ngon tiếp theo! ☕"
                : "Các đơn hoàn thành sẽ xuất hiện tại đây sau khi bạn bấm 'Xác nhận xong'."}
            </p>
            {orderTypeFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOrderTypeFilter("all")}
                className="mt-4 rounded-xl"
              >
                Xem tất cả loại đơn
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pb-6">
            {filteredOrders.map((order) => {
              const items = order.items || order.orderItems || [];
              const isPreparing = String(order.status || "").toLowerCase() === "preparing" || String(order.status || "").toLowerCase() === "pending";
              const isOrderActionLoading = actionLoadingId === order.id;

              // Tính số lượng ly trong đơn này
              const orderTotalDrinks = items.reduce(
                (sum, i) => sum + (Number(i.quantity) || 1),
                0
              );

              return (
                <Card
                  key={order.id}
                  className={`flex flex-col justify-between rounded-3xl border-2 shadow-md transition-all duration-200 hover:shadow-xl overflow-hidden bg-card ${
                    isPreparing
                      ? "border-amber-400/80 dark:border-amber-500/60 shadow-amber-500/5 hover:border-amber-500"
                      : "border-emerald-400/80 dark:border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20"
                  }`}
                >
                  {/* TICKET TOP: Thông tin header vé order */}
                  <div className="p-4 sm:p-5 border-b border-border/80 bg-slate-50/70 dark:bg-slate-900/60">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-xl sm:text-2xl font-black italic tracking-tight text-foreground">
                          ĐƠN #{order.id}
                        </span>
                        <span className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                          {orderTotalDrinks} ly nước
                        </span>
                      </div>

                      {/* Bộ đếm thời gian hoặc badge hoàn thành */}
                      {isPreparing ? (
                        <ElapsedTimer createdAt={order.created_at} />
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã xong</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-border/50">
                      {renderOrderTypeBadge(order)}

                      <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                        {new Date(order.created_at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* TICKET BODY: Danh sách món đồ uống cần pha chế */}
                  <div className="flex-1 p-4 sm:p-5 space-y-3 min-h-[160px] max-h-[340px] overflow-y-auto custom-scrollbar-thin">
                    {items.length === 0 ? (
                      <p className="text-xs italic text-muted-foreground text-center py-6">
                        Chưa có danh sách món
                      </p>
                    ) : (
                      items.map((item, idx) => {
                        const checkKey = `${order.id}_${idx}`;
                        const isChecked = checkedItems.has(checkKey);
                        const productName = item.product_name || item.name || item.productName || "Đồ uống";
                        const size = item.size || item.product_size;
                        const quantity = Number(item.quantity) || 1;
                        const toppings = Array.isArray(item.toppings) ? item.toppings : [];

                        return (
                          <div
                            key={idx}
                            onClick={() => toggleItemCheck(order.id, idx)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                              isChecked
                                ? "bg-slate-100/80 dark:bg-slate-800/40 border-slate-300/60 dark:border-slate-700/60 opacity-60 line-through"
                                : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-2xs"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              {/* Checkbox + Số lượng + Tên món */}
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItemCheck(order.id, idx);
                                  }}
                                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                    isChecked
                                      ? "bg-emerald-600 border-emerald-600 text-white"
                                      : "border-slate-400/80 dark:border-slate-600 hover:border-amber-500"
                                  }`}
                                >
                                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </button>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline gap-1.5 flex-wrap">
                                    <span className="font-black text-amber-700 dark:text-amber-400 text-sm">
                                      x{quantity}
                                    </span>
                                    <span className="font-black text-sm text-foreground leading-snug">
                                      {productName}
                                    </span>
                                    {size && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] font-bold px-1.5 py-0 uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                      >
                                        Size {size}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Danh sách topping */}
                                  {toppings.length > 0 && (
                                    <div className="mt-1 space-y-0.5 pl-0.5">
                                      {toppings.map((top, tIdx) => (
                                        <div
                                          key={tIdx}
                                          className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1"
                                        >
                                          <span className="text-amber-500">•</span>
                                          <span>
                                            {top.name} {Number(top.quantity) > 1 ? `x${top.quantity}` : ""}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Ghi chú riêng của món */}
                                  {item.note && (
                                    <p className="mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 italic">
                                      Ghi chú: {item.note}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Nút Xem Công Thức */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewRecipe &&
                                    onViewRecipe({
                                      product: {
                                        id: item.productId || item.product_id,
                                        name: productName,
                                      },
                                      size: {
                                        id: item.productSizeId || item.size_id || item.product_size_id,
                                        size: size,
                                      },
                                    });
                                }}
                                className="flex-shrink-0 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-amber-500/10 hover:border-amber-400 text-slate-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                                title="Xem công thức pha chế"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Ghi chú chung của đơn hàng */}
                    {order.note && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-black uppercase tracking-wider block text-[10px] text-amber-700 dark:text-amber-400">
                            Ghi chú đơn hàng:
                          </span>
                          <p className="mt-0.5 leading-relaxed">{order.note}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TICKET FOOTER: Nút Hoàn thành hoặc Hoàn tác */}
                  <div className="p-4 border-t border-border/80 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col gap-2">
                    {isPreparing ? (
                      <div className="flex items-center gap-2 w-full">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => onSelectOrder && onSelectOrder(order)}
                          className="h-12 w-12 rounded-2xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
                          title="Xem chi tiết đơn"
                        >
                          <Eye className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </Button>

                        <Button
                          type="button"
                          disabled={isOrderActionLoading}
                          onClick={() => handleCompleteOrder(order.id)}
                          className="flex-1 h-12 rounded-2xl font-black text-sm uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 gap-2 transition-all active:scale-[0.98]"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span>{isOrderActionLoading ? "Đang lưu..." : "Xong Pha Chế"}</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => onSelectOrder && onSelectOrder(order)}
                          className="h-11 w-11 rounded-2xl border-slate-300 dark:border-slate-700 flex-shrink-0"
                          title="Xem chi tiết đơn"
                        >
                          <Eye className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          disabled={isOrderActionLoading}
                          onClick={() => handleUndoOrder(order.id)}
                          className="flex-1 h-11 rounded-2xl font-bold text-xs uppercase tracking-wider border-slate-300 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 gap-2"
                        >
                          <Undo2 className="w-4 h-4 text-amber-600" />
                          <span>Hoàn tác về đang pha</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
