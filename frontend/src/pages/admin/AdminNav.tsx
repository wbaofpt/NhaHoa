import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BellRing,
  Boxes,
  CalendarDays,
  ClipboardList,
  Flower2,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Settings2,
  UserRound,
  Users,
} from "lucide-react";

const items = [
  ["/quan-tri", "Tổng quan", LayoutDashboard],
  ["/quan-tri/products", "Sản phẩm", Flower2],
  ["/quan-tri/orders", "Đơn hàng", Boxes],
  ["/quan-tri/inquiries", "Lời nhắn", MessageSquare],
  ["/quan-tri/inventory", "Tồn kho", ClipboardList],
  ["/quan-tri/categories", "Danh mục", Flower2],
  ["/quan-tri/customers", "Khách hàng", Users],
  ["/quan-tri/subscribers", "Người nhận tin", Mail],
  ["/quan-tri/reports", "Báo cáo", BarChart3],
  ["/quan-tri/order-calendar", "Lịch giao hoa", CalendarDays],
  ["/quan-tri/alerts", "Cảnh báo vận hành", BellRing],
  ["/quan-tri/activity", "Nhật ký hoạt động", UserRound],
  ["/quan-tri/settings", "Cài đặt vận hành", Settings2],
] as const;

export function AdminNav() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <nav className="admin-nav" aria-label="Quản trị">
      {items.map(([to, label, Icon], index) => index < 4 ? (
        <button
          key={to}
          className={location.pathname === to ? "active" : ""}
          onClick={() => navigate(to)}
          type="button"
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ) : (
        <NavLink
          key={to}
          to={to}
          end={to === "/quan-tri"}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
