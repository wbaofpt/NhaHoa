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
import { PageHeading, useConfirm } from "../../components";
export default function AdminExtra() {
  const confirm = useConfirm();
  const page = useLocation().pathname.split("/").pop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<{ addresses: string[] }>(() => {
    try { const value = JSON.parse(localStorage.getItem("nha-hoa-admin-settings") || "{}"); return { ...value, addresses: Array.isArray(value.addresses) ? value.addresses : value.address ? [value.address] : ["TP. Ho Chi Minh"] }; } catch { return { addresses: ["TP. Ho Chi Minh"] }; }
  });  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const removeOrder = async (id: string) => {
    if (!(await confirm(`Xóa đơn ${id} khỏi lịch sử?`))) return;
    setDeleting(id);
    try { await api(`/admin/orders/${id}`, { method: "DELETE" }); setOrders((all) => all.filter((order) => order.id !== id)); }
    catch (e) { setError((e as Error).message); }
    finally { setDeleting(null); }
  };
  const saveSettings = (event: FormEvent) => {
    event.preventDefault();
    localStorage.setItem("nha-hoa-admin-settings", JSON.stringify(settings));
    window.dispatchEvent(new Event("nha-hoa-settings"));
    localStorage.setItem("nha-hoa-home-banner", JSON.stringify(settings));
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
                                <div className="field full">
                  {"\u0110\u1ecba ch\u1ec9 c\u1eeda h\u00e0ng"}
                  <div className="admin-address-list">
                    {settings.addresses.map((address, index) => (
                      <div className="admin-address-row" key={index}>
                        <input value={address} placeholder={"Nh\u1eadp \u0111\u1ecba ch\u1ec9 c\u1eeda h\u00e0ng"} onChange={(e) => setSettings({ ...settings, addresses: settings.addresses.map((item, i) => i === index ? e.target.value : item) })} />
                        <button className="button outline small" type="button" onClick={() => setSettings({ ...settings, addresses: settings.addresses.filter((_, i) => i !== index) })} disabled={settings.addresses.length <= 1}>{"X\u00f3a"}</button>
                      </div>
                    ))}
                    <button className="button outline small" type="button" onClick={() => setSettings({ ...settings, addresses: [...settings.addresses, ""] })}>{"+ Th\u00eam \u0111\u1ecba ch\u1ec9"}</button>
                  </div>
                                  </div>
                <div className="settings-actions">
                  <button className="button" type="submit">L&#x01B0;u c&#x00E0;i &#x0111;&#x1EB7;t</button>
                  {saved && <span className="form-success" role="status">&#x0110;&#x00E3; l&#x01B0;u</span>}
                </div>
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
