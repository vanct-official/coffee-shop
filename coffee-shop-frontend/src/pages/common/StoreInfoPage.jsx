import React, { useEffect, useState } from "react";
import { Loader2, MapPin, Phone, Clock, Coffee, ArrowRight, Wifi, ParkingCircle, Star } from "lucide-react";
import receiptSettingService from "@/services/receiptSettingService";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Link } from "react-router-dom";

// ── Data ─────────────────────────────────────────────────────────────────────

const AMENITIES = [
  { icon: Wifi, label: "Wifi miễn phí" },
  { icon: ParkingCircle, label: "Bãi giữ xe" },
  { icon: Coffee, label: "Gọi mang đi" },
  { icon: Star, label: "Phục vụ tận nơi" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-6 bg-accent rounded-full" />
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{children}</p>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/50 hover:border-accent/30 hover:shadow-md transition-all duration-200">
      <div className="w-11 h-11 shrink-0 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{title}</h3>
        <div className="text-sm font-medium text-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function StoreInfoPage() {
  useDocumentTitle("Cửa hàng");

  const [storeInfo, setStoreInfo] = useState({
    name: "Coffee Shop",
    address: "Đang cập nhật địa chỉ...",
    phone: "Đang cập nhật số điện thoại...",
    open_time: "07:00",
    close_time: "22:30",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await receiptSettingService.getSettings();
        const data = res?.data || {};
        setStoreInfo({
          name: data.store_name || "Coffee Shop",
          address: data.address || "123 Đường B, Quận C, TP. HCM",
          phone: data.phone || "09xxxxxxxxx",
          open_time: data.open_time || "07:00",
          close_time: data.close_time || "22:30",
        });
      } catch (error) {
        console.error("Lỗi lấy thông tin cửa hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 md:py-16 mb-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-10 font-medium">
          <Link to="/" className="hover:text-accent transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-accent font-bold">Cửa hàng</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            {/* ── Hero ── */}
            <div className="relative rounded-3xl overflow-hidden bg-card border border-border/60 p-8 md:p-14 mb-10">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-6 border border-accent/20">
                  <Coffee className="w-3.5 h-3.5" />
                  Thông tin cửa hàng
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground leading-tight mb-4">
                  Chào mừng đến với{" "}
                  <span className="text-accent">{storeInfo.name}</span>
                </h1>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
                  Nơi thưởng thức cà phê và đồ uống tuyệt hảo với không gian thoải mái, ấm cúng dành cho mọi đối tượng.
                </p>
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-colors shadow-sm cursor-pointer"
                >
                  <Coffee className="w-4 h-4" />
                  Xem thực đơn
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

              {/* ── Left: Info + Amenities ── */}
              <div className="lg:col-span-2 space-y-6">

                {/* Contact Info */}
                <section>
                  <SectionLabel>Liên hệ</SectionLabel>
                  <h2 className="text-2xl font-bold font-serif text-foreground mb-6">
                    Thông tin liên hệ
                  </h2>
                  <div className="space-y-3">
                    <InfoCard icon={MapPin} title="Địa chỉ">
                      {storeInfo.address}
                    </InfoCard>
                    <InfoCard icon={Phone} title="Số điện thoại / Zalo">
                      <a
                        href={`tel:${storeInfo.phone.replace(/\s/g, "")}`}
                        className="hover:text-accent transition-colors font-mono"
                      >
                        {storeInfo.phone}
                      </a>
                    </InfoCard>
                    <InfoCard icon={Clock} title="Giờ mở cửa">
                      Từ <span className="font-bold text-accent">{storeInfo.open_time}</span>
                      {" "}đến{" "}
                      <span className="font-bold text-accent">{storeInfo.close_time}</span>
                      {" "}hằng ngày
                    </InfoCard>
                  </div>
                </section>

                {/* Amenities */}
                <section>
                  <SectionLabel>Tiện ích</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {AMENITIES.map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/50 hover:border-accent/30 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground leading-tight">{label}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Opening hours */}
                <div className="rounded-2xl bg-card border border-border/60 p-5 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Lịch hoạt động</p>
                  {["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"].map((day) => (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{day}</span>
                      <span className="font-semibold text-foreground">
                        {storeInfo.open_time} – {storeInfo.close_time}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              {/* ── Right: Map ── */}
              <div className="lg:col-span-3 space-y-4">
                <SectionLabel>Vị trí</SectionLabel>
                <h2 className="text-2xl font-bold font-serif text-foreground mb-6">
                  Tìm chúng tôi trên bản đồ
                </h2>
                <div className="w-full h-[420px] lg:h-[540px] rounded-3xl overflow-hidden shadow-xl border border-border/60">
                  <iframe
                    title="Bản đồ quán Coffee"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(storeInfo.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                  />
                </div>
                {/* Address chip */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border/50">
                  <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{storeInfo.address}</span>
                </div>
              </div>

            </div>

            {/* ── Footer CTA ── */}
            <div className="mt-14 rounded-3xl bg-card border border-border/60 p-8 md:p-12 text-center">
              <Coffee className="w-10 h-10 text-accent mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-bold font-serif text-foreground mb-2">
                Ghé thăm chúng tôi ngay hôm nay!
              </h3>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
                Đặt hàng trước để tiết kiệm thời gian, hoặc ghé trực tiếp để trải nghiệm không gian cà phê ấm cúng của chúng tôi.
              </p>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-colors shadow-sm cursor-pointer"
              >
                <Coffee className="w-4 h-4" />
                Đặt hàng ngay
              </Link>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
