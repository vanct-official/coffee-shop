import React from "react";

/**
 * AdminPageHeader - Component tiêu đề trang chuẩn hóa cho tất cả các trang Admin.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.title - Tiêu đề chính của trang
 * @param {React.ReactNode} [props.subtitle] - Mô tả phụ hoặc hướng dẫn ngắn
 * @param {React.ReactNode} [props.icon] - Icon đại diện cho module (Lucide icon)
 * @param {React.ReactNode} [props.badge] - Badge hoặc nhãn trạng thái đi kèm tiêu đề
 * @param {React.ReactNode} [props.actions] - Các nút bấm hành động bên phải (Button thêm mới, xuất file, ...)
 * @param {React.ReactNode} [props.children] - Nội dung tùy chỉnh thêm (filters, tabs bar, ...)
 * @param {string} [props.className] - Class CSS tùy biến thêm
 */
export default function AdminPageHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  children,
  className = "",
}) {
  return (
    <div className={`space-y-4 mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
        {/* Left: Title, Icon, Subtitle */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 shadow-xs">
              {typeof Icon === "function" || (typeof Icon === "object" && Icon !== null && Icon.$$typeof) ? (
                <Icon className="w-5 h-5" />
              ) : (
                Icon
              )}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-serif">
                {title}
              </h1>
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional Extra bar below header (Filter bar, Stats chips, etc.) */}
      {children && <div>{children}</div>}
    </div>
  );
}
