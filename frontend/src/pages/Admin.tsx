import { useEffect, useState, type FormEvent } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  Flower2,
  Package,
  MessageSquare,
  LayoutDashboard,
  Plus,
  Pencil,
  ArrowUpRight,
} from "lucide-react";
import { useStore } from "../store";
import {
  api,
  post,
  money,
  statuses,
  categories,
  occasions,
  type Product,
  type Order,
} from "../types";
import { PageHeading } from "../components";
const moves: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipping", "cancelled"],
  shipping: ["delivered"],
  delivered: [],
  cancelled: [],
};
const blank = {
  name: "",
  slug: "",
  category: "Bó hoa",
  occasion: "Sinh nhật",
  price: 450000,
  old_price: null,
  image: "/images/rose.jpg",
  description: "",
  flowers: "",
  badge: null,
  stock: 20,
  active: true,
};
type Inquiry = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};
export default function Admin() {
  const { user, authLoading, reload } = useStore();
  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [notice, setNotice] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const [p, o, i] = await Promise.all([
        api<Product[]>("/admin/products"),
        api<Order[]>("/admin/orders"),
        api<Inquiry[]>("/admin/inquiries"),
      ]);
      setProducts(p);
      setOrders(o);
      setInquiries(i);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.role === "admin") void load();
  }, [user]);
  if (authLoading)
    return (
      <p className="wrap section" role="status">
        Đang kiểm tra quyền truy cập…
      </p>
    );
  if (!user) return <Navigate to="/dang-nhap?next=/quan-tri" replace />;
  if (user.role !== "admin")
    return (
      <section className="empty-state">
        <h1>Khu vực dành cho quản trị viên</h1>
        <Link className="button" to="/">
          Về Nhà Hoa
        </Link>
      </section>
    );
  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      await api("/admin/products" + (editing.id ? "/" + editing.id : ""), {
        method: editing.id ? "PUT" : "POST",
        body: JSON.stringify({ ...editing, active: Boolean(editing.active) }),
      });
      setEditing(null);
      await load();
      reload();
      setNotice("Đã lưu mẫu hoa.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const status = async (order: Order, next: string) => {
    if (
      next === "cancelled" &&
      !window.confirm(`Hủy đơn ${order.id} và hoàn lại tồn kho?`)
    )
      return;
    setBusy(true);
    try {
      await api("/admin/orders/" + order.id, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      await load();
      reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="QUẢN TRỊ NHÀ HOA"
        title="Chăm chút cho ngôi nhà."
        description="Quản lý hoa, đơn hàng và những lời nhắn của khách."
      />
      <section className="admin-layout wrap section-bottom">
        <nav className="admin-nav" aria-label="Quản trị">
          {[
            { id: "overview", label: "Tổng quan", Icon: LayoutDashboard },
            { id: "products", label: "Sản phẩm", Icon: Flower2 },
            { id: "orders", label: "Đơn hàng", Icon: Package },
            { id: "inquiries", label: "Lời nhắn", Icon: MessageSquare },
          ].map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "active" : ""}
              onClick={() => {
                setTab(t.id);
                setEditing(null);
              }}
            >
              <t.Icon size={18} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="admin-content">
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="form-success">
              {notice}
            </p>
          )}
          {loading && <p role="status">Đang cập nhật dữ liệu…</p>}
          {tab === "overview" && (
            <>
              <div className="stats-grid">
                <div>
                  <small>Doanh thu đơn đã giao</small>
                  <strong>
                    {money(
                      orders
                        .filter((o) => o.status === "delivered")
                        .reduce((s, o) => s + o.total, 0),
                    )}
                  </strong>
                </div>
                <div>
                  <small>Đơn chờ xác nhận</small>
                  <strong>
                    {orders.filter((o) => o.status === "pending").length}
                  </strong>
                </div>
                <div>
                  <small>Mẫu hoa đang bán</small>
                  <strong>{products.filter((p) => p.active).length}</strong>
                </div>
              </div>
              <h2>Hoạt động cửa hàng</h2>
              <div className="admin-welcome">
                <Flower2 size={40} strokeWidth={1} />
                <h3>Mỗi đơn hoa là một câu chuyện.</h3>
                <p>
                  Bạn có {orders.length} đơn hàng và {inquiries.length} lời
                  nhắn. Ghé từng mục để xác nhận đơn, cập nhật tồn kho và trả
                  lời khách.
                </p>
                <button className="button" onClick={() => setTab("orders")}>
                  Xem đơn hàng <ArrowUpRight size={18} />
                </button>
              </div>
            </>
          )}
          {tab === "products" && (
            <>
              <div className="section-heading">
                <h2>Danh sách hoa ({products.length})</h2>
                <button
                  className="button small"
                  onClick={() => setEditing({ ...blank })}
                >
                  <Plus size={16} />
                  Thêm mẫu hoa
                </button>
              </div>
              {editing && (
                <form className="admin-editor" onSubmit={save}>
                  <h3>{editing.id ? "Chỉnh sửa mẫu hoa" : "Mẫu hoa mới"}</h3>
                  <div className="form-grid">
                    {[
                      { key: "name", label: "Tên hoa" },
                      {
                        key: "slug",
                        label: "Đường dẫn (không dấu, dùng dấu -)",
                      },
                      { key: "flowers", label: "Thành phần hoa" },
                      { key: "image", label: "Đường dẫn ảnh" },
                    ].map((f) => (
                      <label className="field" key={f.key}>
                        {f.label}
                        <input
                          required
                          value={String(editing[f.key as keyof Product] || "")}
                          onChange={(e) =>
                            setEditing({ ...editing, [f.key]: e.target.value })
                          }
                        />
                      </label>
                    ))}
                    <label className="field">
                      Kiểu dáng
                      <select
                        value={editing.category}
                        onChange={(e) =>
                          setEditing({ ...editing, category: e.target.value })
                        }
                      >
                        {categories.slice(1).map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Dịp tặng
                      <select
                        value={editing.occasion}
                        onChange={(e) =>
                          setEditing({ ...editing, occasion: e.target.value })
                        }
                      >
                        {occasions.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Giá (đ)
                      <input
                        required
                        type="number"
                        min={10000}
                        max={50000000}
                        value={editing.price}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            price: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                    <label className="field">
                      Tồn kho
                      <input
                        required
                        type="number"
                        min={0}
                        max={10000}
                        value={editing.stock}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            stock: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                    <label className="field full">
                      Mô tả
                      <textarea
                        required
                        minLength={10}
                        rows={3}
                        value={editing.description}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            description: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(editing.active)}
                        onChange={(e) =>
                          setEditing({ ...editing, active: e.target.checked })
                        }
                      />
                      Đang bán
                    </label>
                  </div>
                  <div className="hero-buttons">
                    <button className="button" disabled={busy}>
                      {busy ? "Đang lưu…" : "Lưu mẫu hoa"}
                    </button>
                    <button
                      type="button"
                      className="button outline"
                      onClick={() => setEditing(null)}
                    >
                      Đóng
                    </button>
                  </div>
                </form>
              )}
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Mẫu hoa</th>
                      <th>Giá</th>
                      <th>Tồn kho</th>
                      <th>Trạng thái</th>
                      <th>
                        <span className="sr-only">Thao tác</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="table-product">
                            <img src={p.image} alt="" />
                            <span>
                              {p.name}
                              <small>{p.category}</small>
                            </span>
                          </div>
                        </td>
                        <td>{money(p.price)}</td>
                        <td>{p.stock}</td>
                        <td>{p.active ? "Đang bán" : "Đã ẩn"}</td>
                        <td>
                          <button
                            className="icon-button"
                            aria-label={"Sửa " + p.name}
                            onClick={() => {
                              setEditing({ ...p });
                              window.scrollTo({
                                top: 200,
                                behavior: "instant",
                              });
                            }}
                          >
                            <Pencil size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {tab === "orders" && (
            <>
              <h2>Đơn hàng ({orders.length})</h2>
              {!orders.length && <p>Chưa có đơn hàng.</p>}
              {orders.map((o) => (
                <article className="admin-order" key={o.id}>
                  <div className="section-heading">
                    <h3>{o.id}</h3>
                    <strong>{money(o.total)}</strong>
                  </div>
                  <p>
                    {o.recipient} · {o.phone} · {o.email}
                  </p>
                  <p>
                    {o.address} · Giao ngày {o.delivery_date}
                  </p>
                  {o.message && <blockquote>Thiệp: {o.message}</blockquote>}
                  <div className="mini-cart">
                    {o.items?.map((item, index) => (
                      <div key={index}>
                        <img src={item.image} alt="" />
                        <span>
                          {item.name}
                          <small>Số lượng: {item.quantity}</small>
                        </span>
                        <strong>{money(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="order-admin-actions">
                    <span className={"status-badge " + o.status}>
                      {statuses[o.status]}
                    </span>
                    {moves[o.status]?.map((next) => (
                      <button
                        className="button outline small"
                        disabled={busy}
                        key={next}
                        onClick={() => status(o, next)}
                      >
                        {statuses[next]}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </>
          )}
          {tab === "inquiries" && (
            <>
              <h2>Lời nhắn của khách ({inquiries.length})</h2>
              {!inquiries.length && <p>Chưa có lời nhắn.</p>}
              {inquiries.map((i) => (
                <article className="admin-order" key={i.id}>
                  <h3>{i.name}</h3>
                  <a className="inline-link" href={"mailto:" + i.email}>
                    {i.email}
                  </a>
                  <p className="preserve-lines">{i.message}</p>
                  <small>{i.created_at}</small>
                </article>
              ))}
            </>
          )}
        </div>
      </section>
    </>
  );
}
