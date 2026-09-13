import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { AdminNav } from "./AdminNav";
import {
  CalendarDays,
  ClipboardList,
  Settings2,
  TriangleAlert,
} from "lucide-react";
import { api, statuses, type Order, type Product } from "../../types";
import { PageHeading } from "../../components";
export default function AdminExtra() {
  const page = useLocation().pathname.split("/").pop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nha-hoa-admin-settings") || "{}"); } catch { return {}; }
  });
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const removeOrder = async (id: string) => {
    if (!window.confirm(`Xóa đơn ${id} khỏi lịch sử?`)) return;
    setDeleting(id);
    try { await api(`/admin/orders/${id}`, { method: "DELETE" }); setOrders((all) => all.filter((order) => order.id !== id)); }
    catch (e) { setError((e as Error).message); }
    finally { setDeleting(null); }
  };
  const saveSettings = (event: FormEvent) => {
    event.preventDefault();
    localStorage.setItem("nha-hoa-admin-settings", JSON.stringify(settings));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };
  useEffect(() => {
    Promise.all([
      api<Order[]>("/admin/orders"),
      api<Product[]>("/admin/products"),
    ])
      .then(([o, p]) => {
        setOrders(o);
        setProducts(p);
      })
      .catch((e) => setError(e.message));
  }, []);
  const title =
    page === "order-calendar"
      ? "Lịch giao hoa"
      : page === "alerts"
        ? "Cảnh báo vận hành"
        : page === "settings"
          ? "Cài đặt vận hành"
          : "Nhật ký hoạt động";
  const nav = [
    ["/quan-tri/order-calendar", "Lịch giao hoa"],
    ["/quan-tri/alerts", "Cảnh báo"],
    ["/quan-tri/activity", "Nhật ký hoạt động"],
    ["/quan-tri/settings", "Cài đặt"],
  ];
  const grouped = orders.reduce<Record<string, Order[]>>((all, o) => {
    (all[o.delivery_date] ||= []).push(o);
    return all;
  }, {});
  return (
    <>
      <PageHeading
        eyebrow="QUẢN TRỊ NHÀ HOA"
        title={title}
        description="Công cụ theo dõi và vận hành dành cho đội ngũ Nhà Hoa."
      />
      <section className="admin-layout wrap section-bottom">
        <AdminNav />
        <div className="admin-content">
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {page === "order-calendar" ? (
            <>
              <h2>
                <CalendarDays /> Lịch giao theo ngày
              </h2>
              {Object.keys(grouped)
                .sort()
                .map((date) => (
                  <section className="calendar-day" key={date}>
                    <h3>
                      {date.split("-").reverse().join("/")}{" "}
                      <small>{grouped[date].length} đơn</small>
                    </h3>
                    {grouped[date].map((o) => (
                      <div className="activity-row" key={o.id}>
                        <strong>{o.id}</strong>
                        <span>{o.recipient}</span>
                        <em>{statuses[o.status]}</em><button className="button outline small" disabled={deleting === o.id} onClick={() => void removeOrder(o.id)}>Xóa lịch sử</button>
                      </div>
                    ))}
                  </section>
                ))}
              {!orders.length && <p>Chưa có đơn để lên lịch.</p>}
            </>
          ) : page === "alerts" ? (
            <>
              <h2>
                <TriangleAlert /> Cảnh báo vận hành
              </h2>
              <div className="alert-grid">
                {products
                  .filter((p) => p.stock < 5)
                  .map((p) => (
                    <article className="help-panel" key={p.id}>
                      <h3>{p.name}</h3>
                      <p className="stock-low">Chỉ còn {p.stock} bó</p>
                      <Link className="text-link" to="/quan-tri/inventory">
                        Mở tồn kho
                      </Link>
                    </article>
                  ))}
              </div>
              {!products.some((p) => p.stock < 5) && (
                <div className="help-panel">
                  <h3>Mọi thứ đang ổn</h3>
                  <p>Chưa có sản phẩm nào dưới ngưỡng 5 bó.</p>
                </div>
              )}
            </>
          ) : page === "settings" ? (
            <>
              <h2>
                <Settings2 /> Cài đặt vận hành
              </h2>
              <form className="help-panel admin-settings-form" onSubmit={saveSettings}>
                <h3>Chỉnh sửa cài đặt</h3>
                <label className="field">Khu vực giao<input value={settings.area || "TP. Hồ Chí Minh"} onChange={(e) => setSettings({ ...settings, area: e.target.value })} /></label>
                <label className="field">Phí giao tiêu chuẩn<input value={settings.shipping || "35.000?"} onChange={(e) => setSettings({ ...settings, shipping: e.target.value })} /></label>
                <label className="field">Ngưỡng miễn phí<input value={settings.freeShipping || "800.000?"} onChange={(e) => setSettings({ ...settings, freeShipping: e.target.value })} /></label>
                <button className="button" type="submit">Lưu cài đặt</button>
                {saved && <span className="form-success" role="status">Đã lưu</span>}
              </form>
              <div className="settings-list">
                <div>
                  <strong>Khu vực giao</strong>
                  <span>TP. Hồ Chí Minh</span>
                </div>
                <div>
                  <strong>Phí giao tiêu chuẩn</strong>
                  <span>35.000đ</span>
                </div>
                <div>
                  <strong>Ngưỡng miễn phí</strong>
                  <span>800.000đ</span>
                </div>
                <div>
                  <strong>Thanh toán</strong>
                  <span>COD · xác nhận thủ công</span>
                </div>
                <div>
                  <strong>Ngưỡng cảnh báo tồn kho</strong>
                  <span>Dưới 5 bó</span>
                </div>
              </div>
              <p className="muted">
                Các giá trị này được bảo vệ trong mã server; trang chỉ hiển thị
                để tham chiếu.
              </p>
            </>
          ) : (
            <>
              <h2>
                <ClipboardList /> Nhật ký hoạt động
              </h2>
              {orders.slice(0, 12).map((o) => (
                <div className="activity-row" key={o.id}>
                  <strong>{o.id}</strong>
                  <span>Đơn của {o.recipient}</span>
                  <em>{statuses[o.status]}</em><button className="button outline small" disabled={deleting === o.id} onClick={() => void removeOrder(o.id)}>Xóa</button>
                </div>
              ))}
              {!orders.length && <p>Chưa có hoạt động.</p>}
            </>
          )}
        </div>
      </section>
    </>
  );
}
