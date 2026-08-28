import {
  ShoppingBag,
  Clock,
  XCircle,
  RefreshCcw,
  CreditCard,
  UserCheck,
  Coffee,
  Star,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

// ── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "order-form", icon: ShoppingBag, title: "Hình thức đặt hàng" },
  { id: "processing-time", icon: Clock, title: "Thời gian xử lý" },
  { id: "cancellation", icon: XCircle, title: "Chính sách hủy đơn" },
  { id: "refund", icon: RefreshCcw, title: "Đổi trả & hoàn tiền" },
  { id: "payment", icon: CreditCard, title: "Thanh toán" },
  { id: "responsibility", icon: UserCheck, title: "Trách nhiệm khách hàng" },
  { id: "loyalty", icon: Star, title: "Tích & đổi điểm loyalty" },
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
        {/* Number + Icon */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-muted-foreground">{String(number).padStart(2, "0")}</span>
        </div>
        {/* Content */}
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

function OrderPolicy() {
  useDocumentTitle("Chính sách đặt hàng");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 md:py-16 mb-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-10 font-medium">
          <Link to="/" className="hover:text-accent transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-accent font-bold">Chính sách đặt hàng</span>
        </div>

        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border/60 p-8 md:p-14 mb-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-6 border border-accent/20">
              <ShoppingBag className="w-3.5 h-3.5" />
              Chính sách
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground leading-tight mb-4">
              Chính sách đặt hàng
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Các quy định và điều khoản khi đặt hàng tại Coffee Shop. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
            </p>
          </div>
        </div>

        {/* Main grid: sidebar + content */}
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
            </div>
          </aside>

          {/* Policy sections */}
          <div className="lg:col-span-3 space-y-4">
            <SectionLabel>Điều khoản sử dụng</SectionLabel>

            <PolicySection id="order-form" icon={ShoppingBag} number={1} title="Hình thức đặt hàng">
              <BulletItem>Đặt online giao tận nơi hoặc nhận tại quán.</BulletItem>
              <BulletItem>Gọi món trực tiếp tại quầy.</BulletItem>
              <BulletItem>Hệ thống gửi xác nhận sau khi đặt thành công.</BulletItem>
            </PolicySection>

            <PolicySection id="processing-time" icon={Clock} number={2} title="Thời gian xử lý">
              <BulletItem>Xác nhận đơn trong 5–15 phút kể từ khi đặt.</BulletItem>
              <BulletItem>Giao hàng phụ thuộc khu vực.</BulletItem>
              <BulletItem>Giờ cao điểm có thể chậm hơn.</BulletItem>
            </PolicySection>

            <PolicySection id="cancellation" icon={XCircle} number={3} title="Chính sách hủy đơn">
              <BulletItem>
                Khách hàng được hủy đơn khi đơn đang ở trạng thái <strong className="text-foreground">Chờ xác nhận</strong> và có sử dụng phương thức thanh toán <strong className="text-foreground">tiền mặt</strong>.
              </BulletItem>
              <BulletItem>
                Khi đơn đã chuyển sang Đang chuẩn bị hoặc đã thanh toán qua PayOS thành công, hệ thống sẽ không cho hủy từ phía khách hàng.
              </BulletItem>
              <BulletItem>
                Với đơn PayOS, đơn ở trạng thái chờ thanh toán có thể bị hệ thống tự động hủy sau <strong className="text-foreground">5 phút</strong> nếu chưa thanh toán thành công.
              </BulletItem>
              <BulletItem>
                Khi đơn bị hủy, hệ thống đồng bộ lại điểm loyalty (nếu đơn có sử dụng điểm) và khách hàng có thể bị trừ 20 điểm uy tín nếu lý do hủy từ phía khách.
              </BulletItem>
            </PolicySection>

            <PolicySection id="refund" icon={RefreshCcw} number={4} title="Đổi trả & hoàn tiền">
              <BulletItem>Sai món hoặc sản phẩm lỗi.</BulletItem>
              <BulletItem>Hư hỏng khi giao hàng.</BulletItem>
              <BulletItem>Thông báo trong vòng 24 giờ kể từ khi nhận hàng.</BulletItem>
            </PolicySection>

            <PolicySection id="payment" icon={CreditCard} number={5} title="Thanh toán">
              <BulletItem>Tiền mặt tại quầy hoặc ngay khi nhận hàng.</BulletItem>
              <BulletItem>Chuyển khoản trực tuyến thông qua hệ thống thanh toán PayOS.</BulletItem>
              <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                <span className="text-amber-600 dark:text-amber-500 text-xs font-bold uppercase tracking-wider mt-0.5">Lưu ý</span>
                <p className="text-xs text-amber-700 dark:text-amber-400">Chúng tôi không chịu trách nhiệm cho các giao dịch không thành công do lỗi ngân hàng hoặc nhà cung cấp dịch vụ thanh toán.</p>
              </div>
            </PolicySection>

            <PolicySection id="responsibility" icon={UserCheck} number={6} title="Trách nhiệm khách hàng">
              <BulletItem>Cung cấp thông tin chính xác khi đặt hàng.</BulletItem>
              <BulletItem>Kiểm tra sản phẩm ngay khi nhận.</BulletItem>
            </PolicySection>

            <PolicySection id="loyalty" icon={Star} number={7} title="Tích & đổi điểm loyalty">
              <BulletItem>
                <strong className="text-foreground">Tích điểm:</strong> Khi đơn hoàn tất, hệ thống cộng <strong className="text-foreground">1 điểm / 10.000đ</strong> giá trị đơn.
              </BulletItem>
              <BulletItem>
                <strong className="text-foreground">Đổi điểm:</strong> Tại bước thanh toán, dùng điểm để giảm giá với tỷ lệ <strong className="text-foreground">1 điểm = 100đ</strong>.
              </BulletItem>
              <BulletItem>Chỉ tài khoản đã đăng nhập mới được sử dụng điểm loyalty.</BulletItem>
              <BulletItem>Số điểm sử dụng không được vượt quá số điểm hiện có và giá trị đơn hàng.</BulletItem>
              <BulletItem>
                <strong className="text-foreground">Hoàn điểm khi hủy đơn:</strong> Nếu đơn đã dùng điểm và bị hủy, hệ thống hoàn lại số điểm vào ví loyalty.
              </BulletItem>
              <BulletItem>Lịch sử điểm được ghi nhận minh bạch: cộng, trừ, hoàn, điều chỉnh.</BulletItem>
            </PolicySection>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-14 rounded-3xl bg-card border border-border/60 p-8 md:p-12 text-center">
          <Coffee className="w-10 h-10 text-accent mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold font-serif text-foreground mb-2">Cần hỗ trợ thêm?</h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
            Nếu bạn có thắc mắc về chính sách đặt hàng, hãy liên hệ với chúng tôi qua trang thông tin cửa hàng.
          </p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-colors shadow-sm cursor-pointer"
          >
            <Coffee className="w-4 h-4" />
            Xem thông tin cửa hàng
          </Link>
        </div>

      </div>
    </div>
  );
}

export default OrderPolicy;
