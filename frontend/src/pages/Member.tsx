import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, MapPin, ShieldCheck } from "lucide-react";
import { ButtonLink, PageHeading } from "../components";
import { useStore } from "../store";
import { api, money, statuses, type Order, type User } from "../types";

export function Profile() {
  const { user, setUser } = useStore();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setError("");
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setSaved(false);
    setError("");
    try {
      const updated = await api<User>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setUser(updated);
      setForm({
        name: updated.name,
        phone: updated.phone || "",
        address: updated.address || "",
      });
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="THÔNG TIN CÁ NHÂN"
        title="Để Nhà biết bạn hơn một chút."
        description="Lưu thông tin thường dùng để lần đặt hoa tiếp theo nhanh hơn."
      />
      <section className="member-layout wrap section-bottom">
        <form
          className="help-panel member-form"
          onSubmit={submit}
          aria-busy={busy}
        >
          <h2>Thông tin của bạn</h2>
          <label className="field">
            Họ và tên
            <input
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label className="field">
            Email đăng nhập
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              aria-describedby="profile-email-help"
            />
          </label>
          <p id="profile-email-help" className="muted">
            Email dùng để đăng nhập và liên kết tài khoản; không thay đổi tại
            đây.
          </p>
          <label className="field">
            Số điện thoại (không bắt buộc)
            <input
              type="tel"
              autoComplete="tel"
              pattern="(?:0|\+84)[0-9]{9}"
              maxLength={12}
              aria-describedby="profile-phone-help"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </label>
          <p id="profile-phone-help" className="muted">
            Nhập 10 chữ số bắt đầu bằng 0, hoặc dùng +84 thay số 0 đầu tiên.
          </p>
          <label className="field">
            Địa chỉ thường dùng (không bắt buộc)
            <textarea
              rows={3}
              minLength={10}
              maxLength={500}
              autoComplete="street-address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="form-success">
              Đã lưu thông tin của bạn.
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Đang lưu…" : "Lưu thông tin"}
          </button>
        </form>
        <aside className="member-aside">
          <div className="help-panel">
            <MapPin aria-hidden="true" />
            <h2>Đặt cho mình hay tặng người?</h2>
            <p>
              Điện thoại và địa chỉ được điền sẵn khi bạn mở trang thanh toán.
              Bạn luôn có thể sửa người nhận và địa chỉ cho từng đơn; thay đổi
              hồ sơ không sửa các đơn đã đặt.
            </p>
          </div>
          <div className="help-panel">
            <ShieldCheck aria-hidden="true" />
            <h2>Giữ tài khoản an toàn</h2>
            <p>
              Muốn đổi mật khẩu hoặc đăng xuất các thiết bị khác? Ghé trang bảo
              mật tài khoản.
            </p>
            <Link className="text-link" to="/tai-khoan/bao-mat">
              Quản lý bảo mật
            </Link>
          </div>
          <ButtonLink to="/tai-khoan" outline>
            Về tài khoản & đơn hàng
          </ButtonLink>
        </aside>
      </section>
    </>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { user } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setOrder(null);
    setError("");
    api<Order>("/orders/" + encodeURIComponent(id || ""))
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, user?.id, revision]);
  const steps = ["pending", "confirmed", "preparing", "shipping", "delivered"];
  return (
    <>
      <PageHeading
        eyebrow="CHI TIẾT ĐƠN HOA"
        title={order ? "Đơn hoa " + order.id : "Dõi theo một bó yêu thương."}
        description="Thông tin được lưu tại thời điểm đặt hàng, dành riêng cho tài khoản của bạn."
      />
      <section className="wrap section-bottom">
        {loading ? (
          <p role="status">Đang tải chi tiết đơn hoa…</p>
        ) : error ? (
          <div className="help-panel">
            <p role="alert" className="form-error">
              {error}
            </p>
            <button
              className="button outline"
              onClick={() => setRevision((value) => value + 1)}
            >
              Thử lại
            </button>
          </div>
        ) : (
          order && (
            <>
              <div className="order-detail-status">
                <span className={"status-badge " + order.status}>
                  {statuses[order.status] || order.status}
                </span>
                <p>
                  Ngày đặt:{" "}
                  {new Date(order.created_at).toLocaleString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                  })}
                </p>
                <button
                  className="button outline small"
                  onClick={() => setRevision((value) => value + 1)}
                >
                  Cập nhật trạng thái
                </button>
              </div>
              {order.status !== "cancelled" ? (
                <ol className="tracking-steps">
                  {steps.map((step, index) => (
                    <li
                      key={step}
                      className={
                        steps.indexOf(order.status) >= index ? "done" : ""
                      }
                      aria-current={step === order.status ? "step" : undefined}
                    >
                      <span>
                        {steps.indexOf(order.status) >= index ? (
                          <Check size={16} aria-hidden="true" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <strong>{statuses[step]}</strong>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="soft-note">
                  Đơn này đã hủy và không tiếp tục giao. Bạn có thể chọn hoa để
                  tạo một đơn mới.
                </p>
              )}
              <div className="member-layout">
                <div className="help-panel">
                  <h2>Những bó hoa đã chọn</h2>
                  {order.items?.map((item, index) => (
                    <div className="tracking-item" key={index}>
                      <img src={item.image} alt={item.name} />
                      <span>
                        {item.name}
                        <small>
                          {money(item.price)} × {item.quantity}
                        </small>
                      </span>
                      <strong>{money(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                  <dl className="order-detail-totals">
                    <div>
                      <dt>Tiền hoa</dt>
                      <dd>{money(order.subtotal)}</dd>
                    </div>
                    <div>
                      <dt>Phí giao</dt>
                      <dd>
                        {order.shipping ? money(order.shipping) : "Miễn phí"}
                      </dd>
                    </div>
                    <div>
                      <dt>Tổng thanh toán COD</dt>
                      <dd>
                        <strong>{money(order.total)}</strong>
                      </dd>
                    </div>
                  </dl>
                  <p className="muted">
                    Giá và tên hoa ở đây được giữ theo đơn đã đặt.
                  </p>
                </div>
                <div className="member-aside">
                  <div className="help-panel">
                    <h2>Thông tin nhận hoa</h2>
                    <dl className="recipient-details">
                      <dt>Người nhận</dt>
                      <dd>{order.recipient}</dd>
                      <dt>Điện thoại</dt>
                      <dd>{order.phone}</dd>
                      <dt>Email đặt hàng</dt>
                      <dd>{order.email}</dd>
                      <dt>Địa chỉ</dt>
                      <dd>{order.address}</dd>
                      <dt>Ngày giao dự kiến</dt>
                      <dd>
                        {order.delivery_date.split("-").reverse().join("/")}
                      </dd>
                    </dl>
                  </div>
                  <div className="help-panel">
                    <h2>Lời nhắn gửi cùng hoa</h2>
                    <p className="order-message">
                      {order.message ||
                        "Bạn chưa gửi lời thiệp hoặc ghi chú cho đơn này."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="support-banner">
                <div>
                  <h2>Cần hỗ trợ đơn hoa này?</h2>
                  <p>
                    Gửi yêu cầu kèm mã đơn để Nhà kiểm tra tiến độ và trao đổi
                    với bạn.
                  </p>
                </div>
                <ButtonLink to={"/lien-he?don=" + encodeURIComponent(order.id)}>
                  Liên hệ về đơn này
                </ButtonLink>
              </div>
            </>
          )
        )}
        <div className="member-back">
          <ButtonLink to="/tai-khoan" outline>
            Về lịch sử đơn hàng
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
