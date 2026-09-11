import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  Heart,
  ShoppingBag,
  UserRound,
  Menu,
  X,
  ArrowUpRight,
  Flower2,
  Truck,
  ShieldCheck,
  Leaf,
  Minus,
  Plus,
} from "lucide-react";
import { useStore } from "./store";
import { api, post, money, type Product } from "./types";
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      className={`logo ${light ? "light" : ""}`}
      to="/"
      aria-label="Nhà Hoa — Trang chủ"
    >
      <img src="/logo-mark.svg" alt="" width="48" height="48" />
      <span>
        nhà hoa<small>HOA TƯƠI & NHỮNG ĐIỀU THƯƠNG</small>
      </span>
    </Link>
  );
}
export function Header() {
  const { cart, favorites } = useStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    setSearch(false);
  }, [location.pathname]);
  return (
    <>
      <div className="announcement">
        <span>Một bó hoa, ngàn lời thương.</span>
        <span>
          Miễn phí giao hàng cho đơn từ 800.000đ <ArrowUpRight size={13} />
        </span>
        <Link to="/tra-cuu">Tra cứu đơn hàng</Link>
      </div>
      <header className="header">
        <div className="header-inner">
          <Logo />
          <nav
            id="main-navigation"
            className={open ? "main-nav open" : "main-nav"}
            aria-label="Điều hướng chính"
          >
            <NavLink to="/" end>
              Trang chủ
            </NavLink>
            <NavLink to="/hoa">Cửa hàng hoa</NavLink>
            <NavLink to="/bo-suu-tap">Bộ sưu tập</NavLink>
            <NavLink to="/dich-vu">Dịch vụ</NavLink>
            <NavLink to="/ve-nha-hoa">Về Nhà Hoa</NavLink>
            <NavLink to="/chuyen-nha-hoa">Chuyện nhà hoa</NavLink>
            <NavLink className="mobile-nav-extra" to="/tai-khoan">
              Tài khoản của bạn
            </NavLink>
            <NavLink className="mobile-nav-extra" to="/tra-cuu">
              Tra cứu đơn hoa
            </NavLink>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Tìm kiếm"
              aria-expanded={search}
              aria-controls="header-search"
              onClick={() => setSearch(!search)}
            >
              <Search size={20} />
            </button>
            <Link
              className="icon-button account-icon"
              to="/tai-khoan"
              aria-label="Tài khoản"
            >
              <UserRound size={20} />
            </Link>
            <Link
              className="icon-button"
              to="/yeu-thich"
              aria-label="Hoa yêu thích"
            >
              <Heart size={20} />
              {favorites.length > 0 && (
                <span className="counter">{favorites.length}</span>
              )}
            </Link>
            <Link className="icon-button" to="/gio-hang" aria-label="Giỏ hoa">
              <ShoppingBag size={20} />
              <span className="counter">
                {cart.reduce((n, i) => n + i.quantity, 0)}
              </span>
            </Link>
            <button
              className="icon-button mobile-menu"
              aria-label={open ? "Đóng menu" : "Mở menu"}
              aria-expanded={open}
              aria-controls="main-navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {search && (
          <form
            id="header-search"
            className="header-search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/hoa?q=" + encodeURIComponent(query));
              setSearch(false);
            }}
          >
            <label htmlFor="search-top">Bạn đang tìm hoa gì?</label>
            <input
              id="search-top"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Thử tìm hoa hồng, tulip…"
              autoFocus
            />
            <button className="button small">
              Tìm hoa <Search size={16} />
            </button>
          </form>
        )}
      </header>
    </>
  );
}
export function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const subscribe = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/subscribe", post({ email }));
      setMessage("Cảm ơn bạn! Nhà Hoa đã ghi nhận đăng ký.");
      setEmail("");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <footer>
      <div className="newsletter wrap">
        <div>
          <span className="eyebrow">MỘT CHÚT HOA, MỘT CHÚT VUI</span>
          <h2>Để những điều đẹp đẽ tìm đến bạn.</h2>
        </div>
        <form onSubmit={subscribe}>
          <label className="sr-only" htmlFor="newsletter">
            Email nhận tin
          </label>
          <div className="newsletter-input">
            <input
              id="newsletter"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn"
            />
            <button aria-label="Đăng ký nhận tin" disabled={busy}>
              <ArrowRight />
            </button>
          </div>
          <p role="status">
            {message || "Những mùa hoa mới và lời nhắn nhỏ từ Nhà Hoa."}
          </p>
        </form>
      </div>
      <div className="footer-main wrap">
        <div>
          <Logo light />
          <p>
            Mang thiên nhiên đến gần hơn.
            <br />
            Gửi yêu thương đi xa hơn.
          </p>
          <div className="footer-signature">From our garden, with love.</div>
        </div>
        <div>
          <h3>Khám phá Nhà Hoa</h3>
          <Link to="/hoa">Tất cả hoa tươi</Link>
          <Link to="/bo-suu-tap">Hoa cho mọi dịp</Link>
          <Link to="/dich-vu">Dịch vụ hoa</Link>
          <Link to="/cham-soc-hoa">Cẩm nang chăm hoa</Link>
          <Link to="/ve-nha-hoa">Câu chuyện của chúng mình</Link>
          <Link to="/chuyen-nha-hoa">Chuyện hoa & cuộc sống</Link>
        </div>
        <div>
          <h3>Nhà Hoa luôn ở đây</h3>
          <Link to="/lien-he">Liên hệ & tư vấn</Link>
          <Link to="/tra-cuu">Theo dõi đơn hàng</Link>
          <Link to="/cau-hoi">Câu hỏi thường gặp</Link>
          <Link to="/huong-dan-dat-hang">Hướng dẫn đặt hàng</Link>
          <Link to="/chinh-sach/giao-hang">Giao hàng & đổi trả</Link>
        </div>
        <div>
          <h3>Ghé thăm một chút nhé</h3>
          <p>
            Tiệm hoa trực tuyến
            <br />
            Giao hoa khu vực TP. Hồ Chí Minh
          </p>
          <p>Nhận đơn mỗi ngày · 8:00 – 20:00</p>
          <Link className="text-link" to="/lien-he">
            Gửi lời nhắn <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom wrap">
        <span>
          © {new Date().getFullYear()} Nhà Hoa. Được làm bằng cả tấm lòng.
        </span>
        <Link to="/chinh-sach/bao-mat">Chính sách bảo mật</Link>
        <Link to="/so-do-trang">Sơ đồ trang</Link>
        <Link to="/chinh-sach/dieu-khoan">Điều khoản sử dụng</Link>
      </div>
    </footer>
  );
}
export function ButtonLink({
  to,
  children,
  outline = false,
}: {
  to: string;
  children: ReactNode;
  outline?: boolean;
}) {
  return (
    <Link className={`button ${outline ? "outline" : ""}`} to={to}>
      {children}
      <ArrowUpRight size={18} />
    </Link>
  );
}
export function ProductCard({ product }: { product: Product }) {
  const { add, favorites, favorite } = useStore();
  return (
    <article className="product-card">
      <div className="product-image">
        <Link to={"/hoa/" + product.slug}>
          <img
            src={product.image}
            alt={product.name + " — " + product.category}
            loading="lazy"
            width="500"
            height="600"
          />
        </Link>
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
        <button
          className={`favorite-button ${favorites.includes(product.id) ? "selected" : ""}`}
          aria-label={"Yêu thích " + product.name}
          aria-pressed={favorites.includes(product.id)}
          onClick={() => favorite(product.id)}
        >
          <Heart size={18} />
        </button>
        <button
          className="quick-add"
          onClick={() => add(product)}
          disabled={!product.stock}
        >
          <Plus size={16} />
          {product.stock ? "Thêm vào giỏ hoa" : "Tạm hết hoa"}
        </button>
      </div>
      <div className="product-meta">
        <span>
          {product.category} · {product.occasion}
        </span>
        <Link to={"/hoa/" + product.slug}>
          <h3>{product.name}</h3>
        </Link>
        <p>
          {money(product.price)}
          {product.old_price && <del>{money(product.old_price)}</del>}
        </p>
      </div>
    </article>
  );
}
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
export function CatalogState({ children }: { children: ReactNode }) {
  const { loading, error, reload } = useStore();
  if (loading)
    return (
      <div
        className="product-grid"
        role="status"
        aria-busy="true"
        aria-label="Đang tải hoa"
      >
        {[1, 2, 3, 4].map((i) => (
          <div className="skeleton" key={i} />
        ))}
      </div>
    );
  if (error)
    return (
      <div className="empty-state">
        <Flower2 />
        <h2>Nhà Hoa đang kết nối lại</h2>
        <p>{error}</p>
        <button className="button" onClick={reload}>
          Thử lại
        </button>
      </div>
    );
  return children;
}
export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-heading wrap">
      <div className="breadcrumbs">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <span>{eyebrow || title}</span>
      </div>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
export function Empty({
  title,
  text,
  to = "/hoa",
  action = "Khám phá những bó hoa",
}: {
  title: string;
  text: string;
  to?: string;
  action?: string;
}) {
  return (
    <div className="empty-state">
      <Flower2 size={44} strokeWidth={1} />
      <h2>{title}</h2>
      <p>{text}</p>
      <ButtonLink to={to}>{action}</ButtonLink>
    </div>
  );
}
export function Quantity({
  value,
  change,
  max = 20,
}: {
  value: number;
  change: (n: number) => void;
  max?: number;
}) {
  return (
    <div className="quantity">
      <button
        aria-label="Giảm số lượng"
        disabled={value <= 1}
        onClick={() => change(value - 1)}
      >
        <Minus size={15} />
      </button>
      <output aria-label="Số lượng">{value}</output>
      <button
        aria-label="Tăng số lượng"
        disabled={value >= max}
        onClick={() => change(value + 1)}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
export function Promises() {
  return (
    <div className="promises wrap">
      {[
        {
          icon: Flower2,
          title: "Hoa tươi mỗi ngày",
          text: "Chọn lọc từ những vườn hoa",
        },
        {
          icon: Truck,
          title: "Giao hoa tận tay",
          text: "Đúng hẹn, trọn vẹn yêu thương",
        },
        {
          icon: Heart,
          title: "Thiệp viết từ trái tim",
          text: "Miễn phí thiệp & lời nhắn",
        },
        {
          icon: ShieldCheck,
          title: "Chăm chút từng bó hoa",
          text: "Tỉ mỉ từ những điều nhỏ nhất",
        },
      ].map(({ icon: Icon, title, text }) => (
        <div key={title}>
          <Icon size={29} strokeWidth={1.2} />
          <span>
            <strong>{title}</strong>
            <small>{text}</small>
          </span>
        </div>
      ))}
    </div>
  );
}
export function Botanical({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 220"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M80 215Q65 120 100 35M80 160Q20 160 20 100Q65 105 80 160ZM83 130Q135 130 145 70Q100 80 83 130ZM88 95Q40 90 45 45Q80 50 88 95ZM96 56Q120 35 105 5Q77 25 96 56Z" />
      <path d="m80 160-50-45m55 16 45-45m-43 9L53 56" />
    </svg>
  );
}
