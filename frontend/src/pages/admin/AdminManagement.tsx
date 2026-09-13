import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BarChart3, Boxes, Mail, RefreshCw, Users } from "lucide-react";
import { api, money, type Order, type Product, type User } from "../../types";
import { PageHeading } from "../../components";
import { AdminNav } from "./AdminNav";
type Subscriber = { email: string; created_at: string };
type Inquiry = { id: number; resolved?: boolean };
const links = [
  ["inventory", "Tồn kho"],
  ["customers", "Khách hàng"],
  ["subscribers", "Người nhận tin"],
  ["reports", "Báo cáo"],
];
export default function AdminManagement() {
  const section = useLocation().pathname.split("/").pop() || "reports";
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | number | null>(null);
  const [stockValues, setStockValues] = useState<Record<number, string>>({});
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const load = async () => {
    setLoading(true);
    try {
      const [p, o, c, s, i] = await Promise.all([
        api<Product[]>("/admin/products"),
        api<Order[]>("/admin/orders"),
        api<User[]>("/admin/customers"),
        api<Subscriber[]>("/admin/subscribers"),
        api<Inquiry[]>("/admin/inquiries"),
      ]);
      setProducts(p);
      setOrders(o);
      setCustomers(c);
      setSubscribers(s);
      setInquiries(i);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const adjust = async (id: number, delta: number) => {
    try {
      await api(`/admin/inventory/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ delta }),
      });
      setProducts((all) => all.map((product) => product.id === id ? { ...product, stock: product.stock + delta } : product));
      setStockValues((all) => {
        const current = all[id] === undefined ? products.find((product) => product.id === id)?.stock ?? 0 : Number(all[id]);
        return { ...all, [id]: String(current + delta) };
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const setStock = async (product: Product) => {
    const value = Number(stockValues[product.id]);
    if (!Number.isInteger(value) || value < 0 || value > 10000) {
      setError("Tồn kho phải là số nguyên từ 0 đến 10.000.");
      return;
    }
    await adjust(product.id, value - product.stock);
  };
  const toggleBan = async (customer: User) => {
    if (customer.role === "admin") return;
    setActionId(customer.id);
    try {
      await api(`/admin/customers/${customer.id}`, { method: "PATCH", body: JSON.stringify({ banned: !customer.banned }) });
      await load();
    } catch (e) { setError((e as Error).message); } finally { setActionId(null); }
  };
  const saveCustomer = async () => {
    if (!editingCustomer) return;
    setActionId(editingCustomer.id);
    try {
      await api(`/admin/customers/${editingCustomer.id}`, { method: "PATCH", body: JSON.stringify({ name: editingCustomer.name, email: editingCustomer.email, phone: editingCustomer.phone || "", address: editingCustomer.address || "" }) });
      setEditingCustomer(null);
      await load();
    } catch (e) { setError((e as Error).message); } finally { setActionId(null); }
  };
  const removeSubscriber = async (email: string) => {
    if (!window.confirm("Xóa email này khỏi danh sách nhận tin?")) return;
    setActionId(email);
    try {
      await api("/admin/subscribers", { method: "DELETE", body: JSON.stringify({ email }) });
      await load();
    } catch (e) { setError((e as Error).message); } finally { setActionId(null); }
  };
  const title =
    section === "inventory"
      ? "Tồn kho"
      : section === "customers"
        ? "Khách hàng"
        : section === "subscribers"
          ? "Người nhận tin"
          : "Báo cáo cửa hàng";
  const delivered = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.total, 0);
  return (
    <>
      <PageHeading
        eyebrow="QUẢN TRỊ NHÀ HOA"
        title={title}
        description="Theo dõi vận hành cửa hàng trong một không gian riêng."
      />
      <section className="admin-layout wrap section-bottom">
        <AdminNav />
        <div className="admin-content">
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {loading ? (
            <p role="status">Đang tải dữ liệu quản trị…</p>
          ) : section === "inventory" ? (
            <>
              <div className="section-heading">
                <h2>
                  <Boxes /> Tồn kho ({products.length})
                </h2>
                <button className="button outline small" onClick={load}>
                  <RefreshCw size={15} /> Cập nhật
                </button>
              </div>
              <div className="admin-stock-grid">
                {products.map((p) => (
                  <article className="help-panel" key={p.id}>
                    <img className="admin-stock-image" src={p.image} alt="" />
                    <h3>{p.name}</h3>
                    <p className={p.stock < 5 ? "stock-low" : ""}>
                      Còn {p.stock} bó
                    </p>
                    <div className="stock-controls">
                      <input className="stock-input" type="number" min="0" max="10000" aria-label={`Tồn kho ${p.name}`} value={stockValues[p.id] ?? p.stock} onChange={(e) => setStockValues({ ...stockValues, [p.id]: e.target.value })} />
                      <button className="button outline small" onClick={() => void setStock(p)}>Lưu</button>
                      <button
                        className="button outline small"
                        disabled={p.stock < 1}
                        onClick={() => adjust(p.id, -1)}
                      >
                        -1
                      </button>
                      <button
                        className="button small"
                        disabled={p.stock >= 10000}
                        onClick={() => adjust(p.id, 1)}
                      >
                        +1
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : section === "customers" ? (
            <>
              <h2>
                <Users /> Khách hàng ({customers.length})
              </h2>
              {editingCustomer && <div className="help-panel admin-edit-panel">
                <h3>Sửa thông tin khách hàng</h3>
                <div className="admin-edit-grid">
                  {(["name", "email", "phone", "address"] as const).map((field) => <label className="field" key={field}>{field === "name" ? "Tên" : field === "email" ? "Email" : field === "phone" ? "Điện thoại" : "Địa chỉ"}<input value={editingCustomer[field] || ""} onChange={(e) => setEditingCustomer({ ...editingCustomer, [field]: e.target.value })} /></label>)}
                </div>
                <div className="hero-buttons"><button className="button" disabled={actionId === editingCustomer.id} onClick={() => void saveCustomer()}>Lưu thay đổi</button><button className="button outline" onClick={() => setEditingCustomer(null)}>Hủy</button></div>
              </div>}
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Email</th>
                      <th>Điện thoại</th>
                      <th>Địa chỉ</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.email}</td>
                        <td>{c.phone || "—"}</td>
                        <td>{c.address || "—"}</td>
                        <td>{c.banned ? "Đã khóa" : "Hoạt động"}</td>
                        <td><div className="admin-row-actions"><button className="button outline small" onClick={() => setEditingCustomer({ ...c })}>Sửa</button>{c.role === "admin" ? <span className="muted">Quản trị viên</span> : <button className="button outline small" disabled={actionId === c.id} onClick={() => void toggleBan(c)}>{c.banned ? "Mở khóa" : "Khóa tài khoản"}</button>}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : section === "subscribers" ? (
            <>
              <h2>
                <Mail /> Người nhận tin ({subscribers.length})
              </h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Ngày đăng ký</th>
                                          <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((s) => (
                      <tr key={s.email}>
                        <td>{s.email}</td>
                        <td>
                          {new Date(s.created_at).toLocaleString("vi-VN")}
                        </td>
                        <td><button className="button outline small" disabled={actionId === s.email} onClick={() => void removeSubscriber(s.email)}>Xóa</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <h2>
                <BarChart3 /> Báo cáo cửa hàng
              </h2>
              <div className="stats-grid">
                <div>
                  <small>Doanh thu đã giao</small>
                  <strong>{money(delivered)}</strong>
                </div>
                <div>
                  <small>Tổng đơn</small>
                  <strong>{orders.length}</strong>
                </div>
                <div>
                  <small>Khách hàng</small>
                  <strong>{customers.length}</strong>
                </div>
                <div>
                  <small>Lời nhắn chờ xử lý</small>
                  <strong>{inquiries.length}</strong>
                </div>
              </div>
              <div className="help-panel report-panel">
                <h3>Phân bổ trạng thái đơn</h3>
                {Object.entries(
                  orders.reduce<Record<string, number>>((all, order) => {
                    all[order.status] = (all[order.status] || 0) + 1;
                    return all;
                  }, {}),
                ).map(([status, count]) => (
                  <p key={status}>
                    <span>{status}</span>
                    <strong>{count}</strong>
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
