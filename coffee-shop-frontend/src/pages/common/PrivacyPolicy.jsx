import {
  Shield,
  Database,
  Lock,
  Users,
  FileText,
  UserCheck,
  Coffee,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

// ── Data ─────────────────────────────────────────────────────────────────────

const PRIVACY_SECTIONS = [
  {
    id: "collection",
    icon: Database,
    title: "Thu thập thông tin",
    description:
      "Chúng tôi thu thập họ tên, email, số điện thoại, địa chỉ giao hàng và lịch sử đơn hàng nhằm phục vụ hoạt động kinh doanh và nâng cao trải nghiệm dịch vụ.",
  },
  {
    id: "purpose",
    icon: Users,
    title: "Mục đích sử dụng",
    description:
      "Dữ liệu được sử dụng để xử lý đơn hàng, chăm sóc khách hàng và gửi thông tin khuyến mãi khi có sự đồng ý. Chúng tôi không sử dụng dữ liệu ngoài mục đích đã khai báo.",
  },
  {
    id: "scope",
    icon: FileText,
    title: "Phạm vi sử dụng",
    description:
      "Thông tin chỉ được sử dụng nội bộ và không chia sẻ cho bên thứ ba nếu không có sự đồng ý của bạn hoặc yêu cầu từ cơ quan pháp luật.",
  },
  {
    id: "security",
    icon: Lock,
    title: "Biện pháp bảo mật",
    description:
      "Mã hóa mật khẩu bằng bcrypt, sử dụng HTTPS cho toàn bộ kết nối và giới hạn quyền truy cập nội bộ theo vai trò nhằm đảm bảo an toàn dữ liệu.",
  },
  {
    id: "rights",
    icon: UserCheck,
    title: "Quyền của khách hàng",
    description:
      "Bạn có quyền chỉnh sửa thông tin cá nhân, yêu cầu xóa tài khoản hoặc từ chối nhận email quảng cáo bất kỳ lúc nào thông qua trang cài đặt tài khoản.",
  },
  {
    id: "retention",
    icon: Shield,
    title: "Lưu trữ thông tin",
    description:
      "Dữ liệu được lưu trữ trên máy chủ bảo mật cho đến khi khách hàng yêu cầu xóa hoặc tài khoản không còn hoạt động trong 24 tháng liên tiếp.",
  },
];

const TOC = PRIVACY_SECTIONS.map(({ id, icon, title }) => ({ id, icon, title }));

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-6 bg-accent rounded-full" />
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{children}</p>
    </div>
  );
}

function PrivacyCard({ id, icon: Icon, title, description }) {
  return (
    <div id={id} className="scroll-mt-24 flex items-start gap-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-accent/30 hover:shadow-md transition-all duration-200">
      <div className="w-11 h-11 shrink-0 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-bold font-serif text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

function PrivacyPolicy() {
  useDocumentTitle("Chính sách bảo mật");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 md:py-16 mb-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-10 font-medium">
          <Link to="/" className="hover:text-accent transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-accent font-bold">Chính sách bảo mật</span>
        </div>

        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border/60 p-8 md:p-14 mb-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-6 border border-accent/20">
              <Shield className="w-3.5 h-3.5" />
              Bảo mật
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground leading-tight mb-4">
              Chính sách bảo mật
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Coffee Shop cam kết bảo vệ thông tin cá nhân của bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.
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
                {TOC.map(({ id, icon: Icon, title }) => (
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

              {/* Commitment badge */}
              <div className="mt-6 pt-5 border-t border-border/50">
                <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30">
                  <Shield className="w-3.5 h-3.5 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
                    Cam kết tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Privacy cards grid */}
          <div className="lg:col-span-3">
            <SectionLabel>Điều khoản bảo mật</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRIVACY_SECTIONS.map((section) => (
                <PrivacyCard key={section.id} {...section} />
              ))}
            </div>

            {/* Contact note */}
            <div className="mt-6 flex items-start gap-3 p-5 rounded-2xl bg-card border border-border/50">
              <ChevronRight className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nếu bạn có câu hỏi về chính sách bảo mật hoặc muốn thực hiện quyền của mình, vui lòng liên hệ với chúng tôi qua trang <Link to="/store" className="text-accent hover:underline font-medium">thông tin cửa hàng</Link>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-14 rounded-3xl bg-card border border-border/60 p-8 md:p-12 text-center">
          <Coffee className="w-10 h-10 text-accent mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold font-serif text-foreground mb-2">Dữ liệu của bạn, quyền của bạn</h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
            Chúng tôi luôn đặt sự riêng tư của bạn lên hàng đầu. Liên hệ ngay nếu bạn muốn chỉnh sửa hoặc xóa thông tin cá nhân.
          </p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-colors shadow-sm cursor-pointer"
          >
            <Coffee className="w-4 h-4" />
            Liên hệ chúng tôi
          </Link>
        </div>

      </div>
    </div>
  );
}

export default PrivacyPolicy;

