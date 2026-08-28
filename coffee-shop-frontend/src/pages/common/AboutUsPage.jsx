import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  Phone,
  Github,
  Coffee,
  Server,
  Layout,
  Database,
  BookOpen,
  Code2,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

// ── Data ─────────────────────────────────────────────────────────────────────

const PROJECT = {
  title: "Hệ Thống Quản Lý Quán Cà Phê",
  subtitle: "Đồ án tốt nghiệp — Khoa Công nghệ Thông tin - Chuyên ngành Kỹ thuật phần mềm",
  description:
    "Xây dựng một hệ thống quản lý quán cà phê toàn diện, tích hợp từ giao diện đặt hàng trực tuyến dành cho khách hàng đến bảng điều khiển quản trị nội bộ, hỗ trợ đa vai trò: Admin, Nhân viên, Barista. Hệ thống được phát triển theo mô hình RESTful API với frontend React và backend Node.js.",
  year: "Tháng 1 năm 2026 - Tháng 5 năm 2026",
  school: "Trường Đại học FPT",
  instructor: "Giảng viên hướng dẫn: ThS. Nguyễn Mạnh Hùng",
};

const OBJECTIVES = [
  "Xây dựng hệ thống đặt hàng trực tuyến cho khách hàng (giao hàng, mang đi, tại bàn)",
  "Quản lý thực đơn, danh mục, topping và hình ảnh sản phẩm",
  "Hệ thống Flash Sale và chương trình khách hàng thân thiết (điểm tích lũy)",
  "Quản lý nhân sự: ca làm việc, chấm công, lịch biểu",
  "Báo cáo doanh thu cuối ca / cuối ngày theo thời gian thực",
  "Tích hợp thanh toán QR Code qua PayOS",
  "Hệ thống đánh giá sản phẩm và phản hồi từ khách hàng",
  "Giao diện POS dành cho nhân viên bán mang đi",
];

const TECH_STACK = [
  { icon: Layout, label: "Frontend", value: "React 18 + Vite + Tailwind CSS" },
  { icon: Server, label: "Backend", value: "Node.js + Express.js" },
  { icon: Database, label: "Database", value: "MySQL + Sequelize ORM" },
  { icon: Code2, label: "Realtime", value: "Socket.IO" },
  { icon: Coffee, label: "Thanh toán", value: "PayOS QR Code" },
];

const MEMBERS = [
  {
    avatar: "https://avatars.githubusercontent.com/vanct-official",
    fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    name: "Chu Thế Văn",
    role: "Trưởng nhóm · Fullstack Developer",
    phone: "0976 812 898",
    github: "https://github.com/vanct-official",
    responsibilities: ["Backend API", "Admin Dashboard", "DevOps", "Database Design"],
  },
  {
    avatar: "https://avatars.githubusercontent.com/mhung889",
    fallback: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    name: "Đào Mạnh Hùng",
    role: "Frontend Developer",
    phone: "0985 267 680",
    github: "https://github.com/mhung889",
    responsibilities: ["Giao diện khách hàng", "Trang sản phẩm", "Giỏ hàng", "Thanh toán"],
  },
  {
    avatar: "https://avatars.githubusercontent.com/KhaiPV114",
    fallback: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    name: "Phan Văn Khải",
    role: "Backend Developer",
    phone: "0326 928 660",
    github: "https://github.com/KhaiPV114",
    responsibilities: ["Socket.IO", "Báo cáo", "Ca làm việc", "Chấm công"],
  },
  {
    avatar: "https://avatars.githubusercontent.com/TranTuan-ops",
    fallback: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    name: "Trần Văn Tuấn",
    role: "Backend Developer",
    phone: "0352 207 042",
    github: "https://github.com/TranTuan-ops",
    responsibilities: ["Socket.IO", "Báo cáo", "Ca làm việc", "Chấm công"],
  },
  {
    avatar: "https://avatars.githubusercontent.com/tiennthe",
    fallback: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    name: "Nguyễn Tân Tiến",
    role: "Backend Developer",
    phone: "0354 234 203",
    github: "https://github.com/tiennthe",
    responsibilities: ["Socket.IO", "Báo cáo", "Ca làm việc", "Chấm công"],
  },
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

function MemberCard({ member }) {
  return (
    <div className="group relative flex flex-col bg-card border border-border/60 rounded-3xl overflow-hidden hover:border-accent/40 hover:shadow-xl transition-all duration-300">
      {/* Avatar */}
      <div className="relative aspect-square bg-secondary/40 overflow-hidden">
        <img
          src={member.avatar || member.fallback}
          alt={member.name}
          onError={(e) => { e.target.src = member.fallback; }}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Role badge */}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-block text-[11px] font-semibold text-white/90 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
            {member.role}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold font-serif text-foreground">{member.name}</h3>
          <a
            href={`tel:${member.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors mt-1"
          >
            <Phone className="w-3.5 h-3.5" />
            {member.phone}
          </a>
        </div>

        {/* Responsibilities */}
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Phụ trách</p>
          <div className="flex flex-wrap gap-1.5">
            {member.responsibilities.map((r) => (
              <span key={r} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-foreground font-medium border border-border/50">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* GitHub */}
        {member.github && member.github !== "#" && (
          <a
            href={member.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border-t border-border/50 pt-3 mt-auto"
          >
            <Github className="w-4 h-4" />
            <span className="font-medium">GitHub Profile</span>
          </a>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AboutUsPage() {
  useDocumentTitle("Giới thiệu dự án");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 md:py-16 mb-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-10 font-medium">
          <Link to="/" className="hover:text-accent transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-accent font-bold">Giới thiệu dự án</span>
        </div>

        {/* ── Hero ── */}
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border/60 p-8 md:p-14 mb-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-6 border border-accent/20">
              <GraduationCap className="w-3.5 h-3.5" />
              {PROJECT.subtitle}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground leading-tight mb-4">
              {PROJECT.title}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 max-w-2xl">
              {PROJECT.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-accent" />{PROJECT.year}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-accent" />{PROJECT.school}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

          {/* ── Left: Objectives + Tech ── */}
          <div className="xl:col-span-2 space-y-12">

            {/* Objectives */}
            <section>
              <SectionLabel>Mục tiêu đề tài</SectionLabel>
              <h2 className="text-2xl font-bold font-serif text-foreground mb-6">Những gì hệ thống đạt được</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OBJECTIVES.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/50 hover:border-accent/30 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">{obj}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tech Stack */}
            <section>
              <SectionLabel>Công nghệ sử dụng</SectionLabel>
              <h2 className="text-2xl font-bold font-serif text-foreground mb-6">Ngăn xếp công nghệ</h2>
              <div className="flex flex-col gap-3">
                {TECH_STACK.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-accent/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ── Right: Project Info Card ── */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 rounded-3xl bg-card border border-border/60 p-6 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Tên đề tài</p>
                <p className="font-semibold text-foreground text-sm leading-relaxed">{PROJECT.title}</p>
              </div>
              <div className="h-px bg-border/50" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Năm thực hiện</p>
                <p className="font-semibold text-foreground text-sm">{PROJECT.year}</p>
              </div>
              <div className="h-px bg-border/50" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Trường / Khoa</p>
                <p className="font-semibold text-foreground text-sm leading-relaxed">{PROJECT.school}</p>
              </div>
              <div className="h-px bg-border/50" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Giảng viên</p>
                <p className="font-semibold text-foreground text-sm">{PROJECT.instructor}</p>
              </div>
              <div className="h-px bg-border/50" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Số thành viên</p>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
                  <p className="font-semibold text-foreground text-sm">{MEMBERS.length} thành viên</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Team Members ── */}
        <section className="mt-16">
          <SectionLabel>Thành viên tham gia</SectionLabel>
          <h2 className="text-2xl font-bold font-serif text-foreground mb-2">Đội ngũ phát triển</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-xl">
            Những sinh viên đã cùng nhau xây dựng và hoàn thiện hệ thống trong suốt quá trình thực hiện đồ án.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {MEMBERS.map((member) => (
              <MemberCard key={member.name} member={member} />
            ))}
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <div className="mt-16 rounded-3xl bg-card border border-border/60 p-8 md:p-12 text-center">
          <Coffee className="w-10 h-10 text-accent mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold font-serif text-foreground mb-2">Cảm ơn bạn đã quan tâm!</h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
            Đây là sản phẩm của đồ án tốt nghiệp được thực hiện với tất cả tâm huyết. Mọi phản hồi và đóng góp đều rất quý giá với chúng tôi.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-colors shadow-sm"
          >
            <Coffee className="w-4 h-4" />
            Khám phá thực đơn
          </Link>
        </div>

      </main>
    </div>
  );
}
