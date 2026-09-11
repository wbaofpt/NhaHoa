import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Trash2,
  ArrowRight,
  Check,
  ShoppingBag,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "../store";
import { Empty, PageHeading, Quantity, ButtonLink } from "../components";
import { api, post, money, today } from "../types";
export function Cart() {
  const { cart, quantity } = useStore();
  const subtotal = cart.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );
  return (
    <>
      <PageHeading eyebrow="GIỎ HOA CỦA BẠN" title="Một giỏ đầy yêu thương." />
      {cart.length ? (
        <div className="cart-layout wrap section-bottom">
          <div>
            <div className="shipping-note">
              <Truck size={20} />
              {subtotal >= 800000
                ? "Giỏ hoa của bạn đã được miễn phí giao hàng."
                : `Thêm ${money(800000 - subtotal)} để được miễn phí giao hàng.`}
            </div>
            {cart.map((i) => (
              <article className="cart-item" key={i.product.id}>
                <Link to={"/hoa/" + i.product.slug}>
                  <img src={i.product.image} alt={i.product.name} />
                </Link>
                <div>
                  <small>{i.product.category}</small>
                  <Link to={"/hoa/" + i.product.slug}>
                    <h3>{i.product.name}</h3>
                  </Link>
                  <p>{money(i.product.price)}</p>
                  <Quantity
                    value={i.quantity}
                    change={(n) => quantity(i.product.id, n)}
                    max={Math.min(20, i.product.stock)}
                  />
                </div>
                <div className="cart-item-end">
                  <strong>{money(i.product.price * i.quantity)}</strong>
                  <button
                    className="icon-button"
                    aria-label={"Xóa " + i.product.name}
                    onClick={() => quantity(i.product.id, 0)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))}
            <Link className="text-link" to="/hoa">
              Chọn thêm một chút hoa <ArrowRight size={17} />
            </Link>
          </div>
          <OrderSummary subtotal={subtotal}>
            <ButtonLink to="/thanh-toan">Tiến hành đặt hoa</ButtonLink>
          </OrderSummary>
        </div>
      ) : (
        <Empty
          title="Giỏ hoa đang chờ bạn"
          text="Một bó hoa nhỏ cũng đủ làm một ngày rực rỡ hơn."
        />
      )}
    </>
  );
}
function OrderSummary({
  subtotal,
  children,
}: {
  subtotal: number;
  children?: React.ReactNode;
}) {
  const shipping = subtotal >= 800000 ? 0 : 35000;
  return (
    <aside className="order-summary">
      <h2>Gói ghém đơn hoa</h2>
      <dl>
        <div>
          <dt>Tạm tính</dt>
          <dd>{money(subtotal)}</dd>
        </div>
        <div>
          <dt>Giao hoa</dt>
          <dd>{shipping ? money(shipping) : "Miễn phí"}</dd>
        </div>
        <div className="summary-total">
          <dt>Tổng cộng</dt>
          <dd>{money(subtotal + shipping)}</dd>
        </div>
      </dl>
      {children}
      <p>
        <ShieldCheck size={16} />
        Thông tin của bạn được bảo mật
      </p>
      <small>
        Giá cuối cùng được xác nhận từ tồn kho và bảng giá hiện tại khi đặt đơn.
      </small>
    </aside>
  );
}
export function Checkout() {
  const { cart, user, clear, reload } = useStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    recipient: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    delivery_date: today(),
    message: "",
    payment_method: "cod",
  });
  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await api<{ id: string }>(
        "/orders",
        post({
          ...form,
          items: cart.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
          })),
        }),
      );
      clear();
      reload();
      navigate("/dat-hang-thanh-cong?ma=" + result.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (!cart.length)
    return (
      <Empty
        title="Bạn chưa chọn hoa"
        text="Chọn một bó hoa trước khi gửi yêu thương nhé."
      />
    );
  return (
    <>
      <PageHeading eyebrow="ĐẶT HOA" title="Yêu thương sắp được gửi đi." />
      <form onSubmit={submit} className="cart-layout wrap section-bottom">
        <div className="checkout-form">
          <p className="soft-note">
            Đơn hoa được lưu trong tài khoản <strong>{user?.email}</strong> để
            bạn dễ theo dõi.
          </p>
          <h2>
            <span className="step-number">1</span>Hoa sẽ được gửi đến
          </h2>
          <div className="form-grid">
            <label className="field">
              Tên người nhận
              <input
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                {...field("recipient")}
              />
            </label>
            <label className="field">
              Số điện thoại
              <input
                required
                type="tel"
                pattern="(0|\+84)[0-9]{9}"
                placeholder="09xxxxxxxx"
                autoComplete="tel"
                {...field("phone")}
              />
            </label>
            <label className="field full">
              Email nhận thông tin đơn
              <input
                required
                type="email"
                autoComplete="email"
                {...field("email")}
              />
            </label>
            <label className="field full">
              Địa chỉ giao hoa tại TP. Hồ Chí Minh
              <input
                required
                minLength={10}
                maxLength={500}
                placeholder="Số nhà, đường, phường và quận"
                autoComplete="street-address"
                {...field("address")}
              />
            </label>
            <label className="field full">
              Ngày bạn muốn gửi hoa
              <input
                type="date"
                required
                min={today()}
                {...field("delivery_date")}
              />
              <small>Nhà Hoa sẽ liên hệ xác nhận giờ giao phù hợp.</small>
            </label>
          </div>
          <h2>
            <span className="step-number">2</span>Một lời nhắn gửi kèm
          </h2>
          <label className="field">
            Nội dung thiệp (không bắt buộc)
            <textarea
              maxLength={1000}
              rows={4}
              placeholder="Viết những điều bạn muốn gửi đến người thương…"
              {...field("message")}
            />
          </label>
          <h2>
            <span className="step-number">3</span>Thanh toán
          </h2>
          <label className="payment-option">
            <input type="radio" checked readOnly name="payment" />
            <div>
              <strong>Thanh toán khi nhận hoa (COD)</strong>
              <small>Thanh toán trực tiếp khi đơn hoa được giao.</small>
            </div>
            <ShoppingBag size={22} />
          </label>
          <p className="muted">
            Bằng việc đặt hoa, bạn đồng ý với{" "}
            <Link to="/chinh-sach/dieu-khoan">điều khoản mua hàng</Link> của Nhà
            Hoa.
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <OrderSummary
          subtotal={cart.reduce(
            (sum, i) => sum + i.product.price * i.quantity,
            0,
          )}
        >
          <div className="mini-cart">
            {cart.map((i) => (
              <div key={i.product.id}>
                <img src={i.product.image} alt="" />
                <span>
                  {i.product.name}
                  <small>Số lượng: {i.quantity}</small>
                </span>
                <strong>{money(i.product.price * i.quantity)}</strong>
              </div>
            ))}
          </div>
          <button className="button" disabled={busy}>
            {busy ? "Đang gửi đơn hoa…" : "Đặt hoa & gửi yêu thương"}
            <ArrowRight size={18} />
          </button>
        </OrderSummary>
      </form>
    </>
  );
}
export function Success() {
  const [params] = useSearchParams();
  const id = params.get("ma");
  return (
    <section className="success-page wrap">
      <div className="success-icon">
        <Check size={35} />
      </div>
      <span className="eyebrow">CẢM ƠN BẠN ĐÃ CHỌN NHÀ HOA</span>
      <h1>Yêu thương đã được đón nhận.</h1>
      <p>
        Nhà Hoa đã ghi nhận đơn và sẽ liên hệ xác nhận.
        <br />
        Chúng mình sẽ chăm chút từng cánh hoa cho bạn.
      </p>
      {id && (
        <div className="order-code">
          <small>MÃ ĐƠN HOA CỦA BẠN</small>
          <strong>{id}</strong>
          <span>Hãy lưu mã này và email đặt hàng để tra cứu.</span>
        </div>
      )}
      <div className="hero-buttons">
        <ButtonLink to={"/tra-cuu" + (id ? "?ma=" + id : "")}>
          Theo dõi đơn hoa
        </ButtonLink>
        <ButtonLink to="/hoa" outline>
          Tiếp tục ngắm hoa
        </ButtonLink>
      </div>
    </section>
  );
}
