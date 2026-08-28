import { CreditCard, ShieldCheck, Clock, AlertCircle, Coffee, ChevronRight, Banknote } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Link } from "react-router-dom";

// ── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "methods", icon: CreditCard, title: "Phương thức thanh toán" },
  { id: "security", icon: ShieldCheck, title: "Bảo mật thông tin" },
  { id: "processing", icon: Clock, title: "Thời gian xử lý" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-6 bg-accent rounded-full" />
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{children}</p>
    </div>
  );
}

function PolicySection({ id, icon: Icon, number, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-start gap-5 p-6 md:p-8 rounded-2xl bg-card border border-border/50 hover:border-accent/30 hover:shadow-md transition-all duration-200">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-muted-foreground">{String(number).padStart(2, "0")}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base md:text-lg font-bold font-serif text-foreground mb-3">{title}</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function BulletItem({ children }) {
  return (
    <div className="flex items-start gap-2">
      <ChevronRight className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentPolicyPage() {
  useDocumentTitle("Chính sách thanh toán");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 md:py-16 mb-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-10 font-medium">
          <Link to="/" className="hover:text-accent transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-accent font-bold">Chính sách thanh toán</span>
        </div>

        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border/60 p-8 md:p-14 mb-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-6 border border-accent/20">
              <CreditCard className="w-3.5 h-3.5" />
              Thanh toán
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground leading-tight mb-4">
              Chính sách thanh toán
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Các phương thức và quy định thanh toán khi mua hàng tại Coffee Shop. Mọi giao dịch đều được bảo mật và xử lý minh bạch.
            </p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* Sidebar TOC */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-card border border-border/60 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Nội dung</p>
              <nav className="space-y-1">
                {SECTIONS.map(({ id, icon: Icon, title }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{title}</span>
                  </a>
                ))}
              </nav>

              {/* Payment method badges */}
              <div className="mt-6 pt-5 border-t border-border/50">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Chấp nhận</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/5 border border-accent/10">
                    <Banknote className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-medium text-foreground">Tiền mặt</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/5 border border-accent/10">
                    <CreditCard className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-medium text-foreground">PayOS QR Code</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Policy sections */}
          <div className="lg:col-span-3 space-y-4">
            <SectionLabel>Điều khoản thanh toán</SectionLabel>

            <PolicySection id="methods" icon={CreditCard} number={1} title="Phương thức thanh toán">
              <BulletItem>Thanh toán bằng <strong className="text-foreground">tiền mặt</strong> trực tiếp tại quầy hoặc khi nhận hàng.</BulletItem>
              <BulletItem>Thanh toán trực tuyến qua <strong className="text-foreground">PayOS</strong> — quét mã QR nhanh chóng, an toàn.</BulletItem>
              <BulletItem>Vui lòng chọn phương thức phù hợp ngay khi đặt hàng để tránh nhầm lẫn.</BulletItem>
            </PolicySection>

            <PolicySection id="security" icon={ShieldCheck} number={2} title="Bảo mật thông tin">
              <BulletItem>Mọi thông tin thanh toán được <strong className="text-foreground">mã hóa SSL</strong> theo tiêu chuẩn bảo mật cao nhất.</BulletItem>
              <BulletItem>Chúng tôi không lưu trữ thông tin thẻ ngân hàng của bạn.</BulletItem>
              <BulletItem>Giao dịch PayOS được xử lý bởi cổng thanh toán được cấp phép bởi Ngân hàng Nhà nước Việt Nam.</BulletItem>
              <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-400">Dữ liệu của bạn được bảo vệ theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.</p>
              </div>
            </PolicySection>

            <PolicySection id="processing" icon={Clock} number={3} title="Thời gian xử lý">
              <BulletItem>Đơn hàng được xử lý ngay sau khi hệ thống xác nhận thanh toán thành công.</BulletItem>
              <BulletItem>Với thanh toán PayOS, trạng thái đơn cập nhật tức thì sau khi giao dịch hoàn tất.</BulletItem>
              <BulletItem>Đơn PayOS chờ thanh toán quá <strong className="text-foreground">5 phút</strong> sẽ tự động bị hủy.</BulletItem>
              <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">Chúng tôi không chịu trách nhiệm cho các giao dịch thất bại do lỗi kết nối ngân hàng hoặc nhà cung cấp dịch vụ thanh toán.</p>
              </div>
            </PolicySection>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-14 rounded-3xl bg-card border border-border/60 p-8 md:p-12 text-center">
          <Coffee className="w-10 h-10 text-accent mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold font-serif text-foreground mb-2">Gặp sự cố thanh toán?</h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
            Nếu bạn gặp vấn đề trong quá trình thanh toán, hãy liên hệ ngay với chúng tôi để được hỗ trợ kịp thời.
          </p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-colors shadow-sm cursor-pointer"
          >
            <Coffee className="w-4 h-4" />
            Liên hệ hỗ trợ
          </Link>
        </div>

      </div>
    </div>
  );
}

