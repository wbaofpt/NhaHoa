import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  Flower2,
  LogOut,
  Package,
  Check,
  Truck,
  Eye,
  EyeOff,
} from "lucide-react";
import { api, post, money, statuses, type User, type Order } from "../types";
import { useStore } from "../store";
import { PageHeading, Empty, ButtonLink } from "../components";
export function Auth({ register = false }: { register?: boolean }) {
  const { setUser, user, authLoading } = useStore();
  const [params] = useSearchParams();
  const next = params.get("next");
  const destination =
    next?.startsWith("/") &&
    !next.startsWith("//") &&
    !/[\\\r\n]/.test(next) &&
    !/^\/dang-(nhap|ky)/.test(next)
      ? next
      : "/tai-khoan";
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notRobot, setNotRobot] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [sendingPhoneCode, setSendingPhoneCode] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [smsCooldown, setSmsCooldown] = useState(0);
  const sendPhoneCode = async () => undefined;
  /* SMS verification is intentionally not part of registration. */
  /*
    if (!/^(?:0|\+84)[35789][0-9]{8}$/.test(phone.replace(/[\s()-]/g, ""))) {
      setPhoneError("Nhập số di động Việt Nam hợp lệ, ví dụ 0901234567.");
      return;
    }
    setSendingPhoneCode(true);
    setPhoneError("");
    try {
      await api("/auth/send-phone-code", post({ phone }));
      setPhoneCodeSent(true);
      setPhoneCode("");
      setSmsCooldown(60);
    } catch (e) {
      setPhoneError((e as Error).message);
    } finally {
      setSendingPhoneCode(false);
    }
  */
  const sendCode = async () => {
    if (!form.email) return setError("Vui lòng nhập email trước.");
    setSendingCode(true);
    try { await api("/auth/send-email-code", post({ email: form.email })); setCodeSent(true); setError(""); }
    catch (e) { setError((e as Error).message); }
    finally { setSendingCode(false); }
  };
  useEffect(() => {
    if (user && !authLoading) navigate(destination, { replace: true });
  }, [user, authLoading, destination, navigate]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    /* SMS verification is not required for registration. */
    if (false && register && (!phoneCodeSent || !/^\d{6}$/.test(phoneCode))) {
      setPhoneError("Vui lòng gửi và nhập mã SMS gồm 6 số trước khi tạo tài khoản.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api<User>(
        "/auth/" + (register ? "register" : "login"),
        post(register ? { ...form, confirmPassword, emailCode: verificationCode, notRobot } : { identifier: form.email, password: form.password, notRobot }),
      );
      setUser(result);
      navigate(destination);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="auth-layout">
      <div className="auth-visual">
        <img src="/images/pink.jpg" alt="Những cánh hoa hồng mềm mại" />
        <div>
          <span className="eyebrow">NHÀ HOA — GỬI TRỌN ĐIỀU THƯƠNG</span>
          <h2>
            Một nơi lưu giữ
            <br />
            những điều <em>đẹp đẽ.</em>
          </h2>
        </div>
      </div>
      <div className="auth-form">
        <Flower2 size={36} strokeWidth={1} />
        <span className="eyebrow">CHÀO BẠN ĐẾN VỚI NHÀ</span>
        <h1>
          {register ? "Thêm một người thương." : "Thật vui khi gặp lại bạn."}
        </h1>
        <p>
          {register
            ? "Tạo tài khoản để lưu lại những bó hoa và đơn hàng của bạn."
            : "Đăng nhập để tiếp tục gửi những điều yêu thương."}
        </p>
        <form onSubmit={submit}>
          {next && !register && (
            <p className="soft-note">
              Đăng nhập để tiếp tục{" "}
              {next.startsWith("/gio-hang")
                ? "xem giỏ hoa"
                : next.startsWith("/thanh-toan")
                ? "đặt hoa"
                : next.startsWith("/yeu-thich")
                  ? "lưu những bó hoa yêu thích"
                  : next.startsWith("/tra-cuu")
                    ? "theo dõi đơn hoa"
                    : "mở góc riêng của bạn"}
              . Giỏ hoa của bạn vẫn được giữ lại.
            </p>
          )}
          {register && (
            <label className="field">
              Tên của bạn
              <input
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
          )}
          <div className="field">
            <label htmlFor="auth-identifier">{register ? "Email" : "Email hoặc số điện thoại"}</label>
            <div className="verification-input">
              <input id="auth-identifier" type={register ? "email" : "text"} required autoComplete={register ? "email" : "username"} autoCapitalize="none" spellCheck={false} maxLength={190} value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); if (register) { setCodeSent(false); setVerificationCode(""); } }} />
              {register && <button type="button" className="button outline small" onClick={() => void sendCode()} disabled={sendingCode}>{sendingCode ? "Đang gửi…" : codeSent ? "Gửi lại mã" : "Gửi mã"}</button>}
            </div>
          </div>
          {register && codeSent && <label className="field">Mã xác minh đăng ký qua email<input inputMode="numeric" maxLength={6} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Nhập mã 6 số" /></label>}
          {false && register && (
            <>
              <div className="field">
                <label htmlFor="registration-phone">Số điện thoại</label>
                <div className="verification-input">
                  <input
                    id="registration-phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={25}
                    placeholder="0901234567"
                    value={phone}
                    disabled={sendingPhoneCode || busy}
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? "registration-phone-error" : "registration-phone-help"}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneCodeSent(false);
                      setPhoneCode("");
                      setPhoneError("");
                    }}
                  />
                  <button
                    type="button"
                    className="button outline small"
                    onClick={() => void sendPhoneCode()}
                    disabled={sendingPhoneCode || smsCooldown > 0 || busy}
                    aria-label="Gửi mã xác minh SMS"
                  >
                    {sendingPhoneCode ? "Đang gửi…" : smsCooldown > 0 ? `Gửi lại (${smsCooldown}s)` : phoneCodeSent ? "Gửi lại SMS" : "Gửi mã SMS"}
                  </button>
                </div>
                <small id="registration-phone-help" role="status">
                  {phoneCodeSent ? "Đã gửi mã SMS. Mã có hiệu lực trong 10 phút." : "Nhận mã SMS để xác minh số điện thoại của bạn."}
                </small>
                {phoneError && <p id="registration-phone-error" className="form-error" role="alert">{phoneError}</p>}
              </div>
              {phoneCodeSent && (
                <label className="field">
                  Mã xác minh SMS
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Nhập mã 6 số"
                  />
                </label>
              )}
            </>
          )}
          <label className="field">
            Mật khẩu
            <span className="password-input">
              <input
                type={show ? "text" : "password"}
                aria-label="Mật khẩu"
                aria-describedby={
                  register ? "registration-password-help" : undefined
                }
                required
                minLength={8}
                maxLength={72}
                autoComplete={register ? "new-password" : "current-password"}
                value={form.password}
                onChange={(e) => { e.currentTarget.setCustomValidity(""); setForm({ ...form, password: e.target.value }); }}
                onInvalid={(e) => e.currentTarget.setCustomValidity("Mật khẩu phải có ít nhất 8 ký tự.")}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            {register && (
              <small id="registration-password-help">
                Ít nhất 8 ký tự, tối đa 72 byte UTF-8. Có thể dùng cụm từ dễ
                nhớ.
              </small>
            )}
          </label>
          {register && <label className="field">Xác nhận mật khẩu<span className="password-input"><input type={showConfirm ? "text" : "password"} required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /><button type="button" className="icon-button" aria-label={showConfirm ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"} onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>}
          <label className="robot-check"><input type="checkbox" required checked={notRobot} onChange={(e) => setNotRobot(e.target.checked)} /> Tôi không phải robot</label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button" disabled={busy || authLoading}>
            {busy ? "Đang xử lý…" : register ? "Tạo tài khoản" : "Đăng nhập"}
            <ArrowUpRight size={18} />
          </button>
          {!register && <p><Link className="inline-link" to="/quen-mat-khau">Quên mật khẩu?</Link></p>}
        </form>
        <p>
          {register ? "Đã là người nhà? " : "Bạn chưa có tài khoản? "}
          <Link
            className="inline-link"
            to={
              (register ? "/dang-nhap" : "/dang-ky") +
              "?next=" +
              encodeURIComponent(destination)
            }
          >
            {register ? "Đăng nhập" : "Đăng ký ngay"}
          </Link>
        </p>
      </div>
    </section>
  );
}
export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sent, setSent] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const send = async () => {
    setBusy(true); setError("");
    try { await api("/auth/forgot-password/request", post({ email })); setSent(true); setMessage("Nếu email tồn tại, mã xác nhận đã được gửi."); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const reset = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await api("/auth/forgot-password/reset", post({ email, code, newPassword: password, confirmPassword: confirm })); setMessage("Mật khẩu đã thay đổi. Hãy đăng nhập bằng mật khẩu mới."); setTimeout(() => navigate("/dang-nhap"), 1200); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  return <section className="auth-layout"><div className="auth-visual"><img src="/images/pink.jpg" alt="Những cánh hoa hồng mềm mại" /></div><div className="auth-form"><Flower2 size={36} strokeWidth={1} /><span className="eyebrow">KHÔI PHỤC GÓC RIÊNG</span><h1>Đặt lại mật khẩu.</h1><p>Nhập email để nhận mã xác minh riêng cho việc đặt lại mật khẩu.</p><form onSubmit={reset}><label className="field">Email<div className="verification-input"><input type="email" required autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setSent(false); }} /><button type="button" className="button outline small" onClick={() => void send()} disabled={busy || !email}>{sent ? "Gửi lại mã" : "Gửi mã"}</button></div></label>{sent && <><label className="field">Mã đặt lại mật khẩu<input inputMode="numeric" autoComplete="one-time-code" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} /></label><label className="field">Mật khẩu mới<span className="password-input"><input type={show ? "text" : "password"} required minLength={8} maxLength={72} value={password} onChange={(e) => { e.currentTarget.setCustomValidity(""); setPassword(e.target.value); }} onInvalid={(e) => e.currentTarget.setCustomValidity("Mật khẩu phải có ít nhất 8 ký tự.")} /><button type="button" className="icon-button" aria-label={show ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label><label className="field">Xác nhận mật khẩu mới<input type={show ? "text" : "password"} required value={confirm} onChange={(e) => { e.currentTarget.setCustomValidity(""); setConfirm(e.target.value); }} onInvalid={(e) => e.currentTarget.setCustomValidity("Vui lòng nhập lại mật khẩu.")} /></label><button className="button" disabled={busy}>Đặt lại mật khẩu <ArrowUpRight size={18} /></button></>}{message && <p className="form-success" role="status">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}</form><p><Link className="inline-link" to="/dang-nhap">Quay lại đăng nhập</Link></p></div></section>;
}
export function Account() {
  const { user, setUser, authLoading } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    if (user)
      api<Order[]>("/orders")
        .then(setOrders)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [user]);
  if (authLoading)
    return (
      <p className="wrap section" role="status">
        Đang tải tài khoản…
      </p>
    );
  if (!user)
    return (
      <Empty
        title="Chào bạn đến với Nhà"
        text="Đăng nhập để xem những đơn hoa đã gửi."
        to="/dang-nhap"
        action="Đăng nhập"
      />
    );
  const logout = async () => {
    try {
      await api("/auth/logout", post({}));
      setUser(null);
      navigate("/");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="GÓC NHÀ CỦA BẠN"
        title={"Chào " + user.name + "."}
        description="Những yêu thương bạn đã gửi, Nhà Hoa giữ ở đây."
      />
      <section className="wrap section-bottom">
        <div className="account-bar">
          <span>{user.email}</span>
          <div>
            <ButtonLink to="/tai-khoan/thong-tin">Thông tin cá nhân</ButtonLink>
            <ButtonLink to="/tai-khoan/bao-mat">Bảo mật tài khoản</ButtonLink>
            {user.role === "admin" && (
              <ButtonLink to="/quan-tri">Quản trị cửa hàng</ButtonLink>
            )}
            <button className="button outline small" onClick={logout}>
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </div>
        <h2>Đơn hoa của bạn</h2>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {loading ? (
          <p role="status">Đang tải đơn hoa…</p>
        ) : orders.length ? (
          <div className="orders-list">
            {orders.map((o) => (
              <article className="order-card" key={o.id}>
                <Package strokeWidth={1} />
                <div>
                  <strong>{o.id}</strong>
                  <p>
                    Giao ngày {o.delivery_date} · {o.recipient}
                  </p>
                </div>
                <span className={"status-badge " + o.status}>
                  {statuses[o.status]}
                </span>
                <strong>{money(o.total)}</strong>
                <Link className="text-link" to={"/tai-khoan/don-hang/" + o.id}>
                  Chi tiết <ArrowUpRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <Empty
            title="Chưa có đơn hoa nào"
            text="Gửi bó hoa đầu tiên, bắt đầu một câu chuyện đẹp."
          />
        )}
      </section>
    </>
  );
}
export function Tracking() {
  const [params] = useSearchParams();
  const { user } = useStore();
  const [id, setId] = useState(params.get("ma") || "");
  const [email, setEmail] = useState(user?.email || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setOrder(null);
    try {
      setOrder(
        await api<Order>(
          "/orders/track",
          post({ id: id.trim().toUpperCase(), email: email.trim() }),
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const steps = ["pending", "confirmed", "preparing", "shipping", "delivered"];
  return (
    <>
      <PageHeading
        eyebrow="DÕI THEO YÊU THƯƠNG"
        title="Bó hoa của bạn đang ở đâu?"
        description="Nhập mã đơn hoa và email đã dùng khi đặt hàng."
      />
      <section className="tracking-wrap wrap section-bottom">
        <form onSubmit={submit} className="tracking-form">
          <label className="field">
            Mã đơn hoa
            <input
              required
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="NH…"
              pattern="[Nn][Hh][a-fA-F0-9]{10}"
            />
          </label>
          <label className="field">
            Email đặt hàng
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button className="button" disabled={busy}>
            {busy ? "Đang tìm đơn hoa…" : "Tra cứu đơn hoa"}
            <ArrowUpRight size={18} />
          </button>
        </form>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {order && (
          <div className="tracking-result">
            <div className="section-heading">
              <h2>{order.id}</h2>
              <span className={"status-badge " + order.status}>
                {statuses[order.status]}
              </span>
            </div>
            {order.status !== "cancelled" && (
              <ol className="tracking-steps">
                {steps.map((step, i) => (
                  <li
                    className={steps.indexOf(order.status) >= i ? "done" : ""}
                    key={step}
                  >
                    <span>
                      {steps.indexOf(order.status) >= i ? (
                        <Check size={16} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <strong>{statuses[step]}</strong>
                  </li>
                ))}
              </ol>
            )}
            <p>
              Ngày giao dự kiến: <strong>{order.delivery_date}</strong>
            </p>
            {order.items?.map((i, index) => (
              <div className="tracking-item" key={index}>
                <img src={i.image} alt={i.name} />
                <span>
                  {i.name} × {i.quantity}
                </span>
                <strong>{money(i.price * i.quantity)}</strong>
              </div>
            ))}
            <p className="tracking-total">
              Tổng thanh toán: <strong>{money(order.total)}</strong>
            </p>
          </div>
        )}
      </section>
    </>
  );
}
