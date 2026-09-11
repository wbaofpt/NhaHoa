import { useDeferredValue, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  Search,
  SlidersHorizontal,
  Truck,
  Flower2,
  Check,
} from "lucide-react";
import { useStore } from "../store";
import {
  CatalogState,
  Empty,
  PageHeading,
  ProductGrid,
  Quantity,
} from "../components";
import { categories, occasions, money } from "../types";
export function Shop() {
  const { products } = useStore();
  const [params, setParams] = useSearchParams();
  const category = params.get("loai") || "Tất cả";
  const occasion = params.get("dip") || "";
  const query = params.get("q") || "";
  const deferred = useDeferredValue(query);
  const [sort, setSort] = useState("featured");
  const [budget, setBudget] = useState("all");
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };
  const normalize = (s: string) =>
    s
      .toLocaleLowerCase("vi")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  const filtered = products
    .filter(
      (p) =>
        (category === "Tất cả" || p.category === category) &&
        (!occasion || p.occasion === occasion) &&
        normalize(p.name + " " + p.flowers).includes(normalize(deferred)) &&
        (budget === "all" ||
          (budget === "low"
            ? p.price < 500000
            : budget === "mid"
              ? p.price >= 500000 && p.price <= 800000
              : p.price > 800000)),
    )
    .sort((a, b) =>
      sort === "asc"
        ? a.price - b.price
        : sort === "desc"
          ? b.price - a.price
          : sort === "new"
            ? b.id - a.id
            : a.id - b.id,
    );
  return (
    <>
      <PageHeading
        eyebrow="CỬA HÀNG HOA"
        title="Một bó hoa, một niềm vui."
        description="Tìm một chút rực rỡ cho bạn, một chút yêu thương cho người."
      />
      <div className="shop-layout wrap section-bottom">
        <aside className="shop-sidebar">
          <h2>
            <SlidersHorizontal size={17} />
            Chọn hoa cùng Nhà
          </h2>
          <fieldset>
            <legend>Kiểu dáng</legend>
            {categories.map((c) => (
              <label className="radio-label" key={c}>
                <input
                  type="radio"
                  name="category"
                  checked={category === c}
                  onChange={() => update("loai", c === "Tất cả" ? "" : c)}
                />
                {c}
              </label>
            ))}
          </fieldset>
          <label className="field">
            Dịp tặng
            <select
              value={occasion}
              onChange={(e) => update("dip", e.target.value)}
            >
              <option value="">Mọi khoảnh khắc</option>
              {occasions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Khoảng giá
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="all">Tất cả mức giá</option>
              <option value="low">Dưới 500.000đ</option>
              <option value="mid">500.000đ – 800.000đ</option>
              <option value="high">Trên 800.000đ</option>
            </select>
          </label>
          {(query || occasion || category !== "Tất cả" || budget !== "all") && (
            <button
              className="button outline small"
              onClick={() => {
                setParams({});
                setBudget("all");
                setSort("featured");
              }}
            >
              Xóa bộ lọc
            </button>
          )}
          <div className="sidebar-note">
            <Flower2 size={28} strokeWidth={1} />
            <h3>Chưa tìm thấy điều bạn muốn?</h3>
            <p>Nhà Hoa sẽ cùng bạn chọn một bó hoa thật riêng.</p>
            <Link to="/lien-he">
              Nhắn cho Nhà Hoa <ArrowUpRight size={14} />
            </Link>
          </div>
        </aside>
        <div>
          <div className="shop-toolbar">
            <div className="search-field">
              <Search size={18} />
              <input
                aria-label="Tìm hoa"
                value={query}
                onChange={(e) => update("q", e.target.value)}
                placeholder="Tìm tên hoa, loại hoa…"
              />
            </div>
            <label className="sort-label">
              <span className="sr-only">Sắp xếp</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Nhà Hoa gợi ý</option>
                <option value="asc">Giá thấp đến cao</option>
                <option value="desc">Giá cao đến thấp</option>
                <option value="new">Mới nhất</option>
              </select>
            </label>
          </div>
          <p className="result-count">
            {filtered.length} mẫu hoa dành cho bạn {occasion && "· " + occasion}
          </p>
          <CatalogState>
            {filtered.length ? (
              <ProductGrid products={filtered} />
            ) : (
              <Empty
                title="Chưa có bó hoa phù hợp"
                text="Thử đổi từ khóa hoặc khoảng giá để tìm thêm những cánh hoa."
                to="/hoa"
                action="Xem tất cả hoa"
              />
            )}
          </CatalogState>
        </div>
      </div>
    </>
  );
}
export function ProductDetail() {
  const { slug } = useParams();
  const { products, add, favorites, favorite } = useStore();
  const [count, setCount] = useState(1);
  const p = products.find((p) => p.slug === slug);
  return (
    <CatalogState>
      {p ? (
        <>
          <div className="wrap breadcrumbs">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/hoa">Cửa hàng hoa</Link>
            <span>/</span>
            <span>{p.name}</span>
          </div>
          <section className="detail-layout wrap">
            <div className="detail-image">
              <img src={p.image} alt={p.name} />
              {p.badge && <span className="product-badge">{p.badge}</span>}
            </div>
            <div className="detail-copy">
              <span className="eyebrow">
                {p.category} / {p.occasion}
              </span>
              <h1>{p.name}</h1>
              <p className="detail-price">
                {money(p.price)}
                {p.old_price && <del>{money(p.old_price)}</del>}
              </p>
              <p>{p.description}</p>
              <div className="flower-composition">
                <Flower2 size={22} strokeWidth={1.2} />
                <div>
                  <strong>Một bó yêu thương gồm</strong>
                  <p>{p.flowers}</p>
                </div>
              </div>
              <p className="stock">
                <span />{" "}
                {p.stock > 0
                  ? `Có sẵn · ${p.stock} bó có thể đặt`
                  : "Mẫu hoa tạm hết"}
              </p>
              <div className="detail-actions">
                <Quantity
                  value={count}
                  change={setCount}
                  max={Math.min(20, p.stock)}
                />
                <button
                  className="button"
                  disabled={!p.stock}
                  onClick={() => add(p, count)}
                >
                  Thêm vào giỏ hoa <ArrowUpRight size={18} />
                </button>
                <button
                  className="icon-button outlined"
                  aria-label="Yêu thích mẫu hoa"
                  aria-pressed={favorites.includes(p.id)}
                  onClick={() => favorite(p.id)}
                >
                  <Heart
                    fill={favorites.includes(p.id) ? "currentColor" : "none"}
                  />
                </button>
              </div>
              <div className="detail-perks">
                <p>
                  <Truck size={17} />
                  Miễn phí giao hàng cho đơn từ 800.000đ
                </p>
                <p>
                  <Check size={17} />
                  Tặng thiệp viết tay & bao gói chỉn chu
                </p>
              </div>
              <details open>
                <summary>Một lời nhắn nhỏ từ Nhà Hoa</summary>
                <p>
                  Hoa là món quà của tự nhiên, màu sắc và dáng hoa có thể khác
                  nhẹ theo mùa. Nhà Hoa sẽ liên hệ trước nếu cần thay đổi loại
                  hoa chính. Hình ảnh minh họa phong cách phối hoa.
                </p>
              </details>
              <details>
                <summary>Chăm sóc & giữ hoa tươi</summary>
                <p>
                  Cắt chéo gốc, thay nước sạch mỗi ngày và đặt hoa ở nơi mát.
                  Tránh nắng trực tiếp và nguồn nhiệt để hoa ở bên bạn lâu hơn.
                </p>
                <Link className="text-link" to="/cham-soc-hoa">
                  Xem hướng dẫn chăm từng kiểu hoa
                </Link>
              </details>
              <details>
                <summary>Giao nhận hoa</summary>
                <p>
                  Chọn ngày giao ở bước đặt hàng. Nhà Hoa xác nhận thời gian phù
                  hợp trước khi giao. Phí giao nội thành là 35.000đ, miễn phí từ
                  800.000đ.
                </p>
                <Link className="text-link" to="/huong-dan-dat-hang">
                  Hướng dẫn đặt hàng
                </Link>
              </details>
            </div>
          </section>
          <section className="section wrap">
            <div className="section-heading">
              <div>
                <span className="eyebrow">CÓ THỂ BẠN CŨNG THƯƠNG</span>
                <h2>
                  Thêm một chút <em>rực rỡ.</em>
                </h2>
              </div>
            </div>
            <ProductGrid
              products={products.filter((x) => x.id !== p.id).slice(0, 4)}
            />
          </section>
        </>
      ) : (
        <Empty
          title="Bó hoa này chưa có ở Nhà"
          text="Mời bạn ghé xem những mẫu hoa đang nở."
        />
      )}
    </CatalogState>
  );
}
export function Favorites() {
  const { products, favorites } = useStore();
  const selected = products.filter((p) => favorites.includes(p.id));
  return (
    <>
      <PageHeading
        eyebrow="GÓC NHỎ CỦA BẠN"
        title="Những bó hoa bạn thương."
        description="Lưu lại một chút đẹp đẽ, để lần sau dễ tìm nhau hơn."
      />
      <section className="wrap section-bottom">
        <CatalogState>
          {selected.length ? (
            <ProductGrid products={selected} />
          ) : (
            <Empty
              title="Góc nhỏ đang chờ hoa"
              text="Chạm vào trái tim trên mẫu hoa bạn yêu để lưu ở đây."
            />
          )}
        </CatalogState>
      </section>
    </>
  );
}
