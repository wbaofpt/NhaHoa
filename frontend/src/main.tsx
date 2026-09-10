import React, { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { StoreProvider, useStore } from "./store";
import { Header, Footer, Empty } from "./components";
import Home from "./pages/Home";
import { Shop, ProductDetail, Favorites } from "./pages/Shop";
import { Cart, Checkout, Success } from "./pages/Checkout";
import { Auth, Account, Tracking } from "./pages/Account";
import {
  Collections,
  About,
  Blog,
  Article,
  Contact,
  FAQ,
  Policy,
  articles,
} from "./pages/Content";
import "./styles.css";
const Admin = lazy(() => import("./pages/Admin"));
function NavigationEffects() {
  const { pathname } = useLocation();
  const { products } = useStore();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Gửi hoa, gửi cả tấm lòng",
      "/hoa": "Cửa hàng hoa tươi",
      "/bo-suu-tap": "Bộ sưu tập hoa",
      "/ve-nha-hoa": "Câu chuyện Nhà Hoa",
      "/chuyen-nha-hoa": "Chuyện hoa & cuộc sống",
      "/lien-he": "Liên hệ",
      "/gio-hang": "Giỏ hoa của bạn",
      "/thanh-toan": "Đặt hoa",
      "/dang-nhap": "Đăng nhập",
      "/dang-ky": "Đăng ký",
      "/tai-khoan": "Tài khoản",
      "/tra-cuu": "Tra cứu đơn hoa",
      "/quan-tri": "Quản trị",
      "/yeu-thich": "Hoa yêu thích",
      "/cau-hoi": "Câu hỏi thường gặp",
      "/dat-hang-thanh-cong": "Đã nhận đơn hoa",
      "/chinh-sach/giao-hang": "Giao hàng & đổi trả",
      "/chinh-sach/bao-mat": "Chính sách bảo mật",
      "/chinh-sach/dieu-khoan": "Điều khoản mua hàng",
    };
    const article = articles.find((a) => pathname.endsWith("/" + a.slug));
    const product = products.find((p) => pathname === "/hoa/" + p.slug);
    const title =
      titles[pathname] ||
      article?.title ||
      product?.name ||
      (pathname.startsWith("/hoa/") ? "Chi tiết hoa" : "Trang không tồn tại");
    document.title = title + " | Nhà Hoa";
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", document.title);
    const description =
      product?.description ||
      article?.intro ||
      `${title}. Khám phá Nhà Hoa — những bó hoa được chăm chút, gửi trọn điều thương.`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:type"]')
      ?.setAttribute("content", article ? "article" : "website");
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute(
      "content",
      /gio-hang|thanh-toan|tai-khoan|quan-tri|dang-|tra-cuu|yeu-thich|thanh-cong/.test(
        pathname,
      ) || !import.meta.env.VITE_SITE_URL
        ? "noindex,follow"
        : "index,follow",
    );
    if (import.meta.env.VITE_SITE_URL) {
      const url = new URL(pathname, import.meta.env.VITE_SITE_URL).href;
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", url);
      let og = document.querySelector('meta[property="og:url"]');
      if (!og) {
        og = document.createElement("meta");
        og.setAttribute("property", "og:url");
        document.head.appendChild(og);
      }
      og.setAttribute("content", url);
      for (const [key, value] of [
        [
          "og:image",
          new URL(
            product?.image || "/images/hero.jpg",
            import.meta.env.VITE_SITE_URL,
          ).href,
        ],
        ["og:image:alt", product?.name || "Nhà Hoa — Gửi trọn điều thương"],
      ]) {
        let tag = document.querySelector(`meta[property="${key}"]`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("property", key);
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", value);
      }
    }
  }, [pathname, products]);
  return null;
}
function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <NavigationEffects />
        <a className="skip-link" href="#main">
          Đến nội dung chính
        </a>
        <Header />
        <main id="main">
          <Suspense
            fallback={
              <p className="wrap section" role="status">
                Đang mở trang…
              </p>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hoa" element={<Shop />} />
              <Route path="/hoa/:slug" element={<ProductDetail />} />
              <Route path="/bo-suu-tap" element={<Collections />} />
              <Route path="/ve-nha-hoa" element={<About />} />
              <Route path="/chuyen-nha-hoa" element={<Blog />} />
              <Route path="/chuyen-nha-hoa/:slug" element={<Article />} />
              <Route path="/lien-he" element={<Contact />} />
              <Route path="/cau-hoi" element={<FAQ />} />
              <Route path="/chinh-sach/:slug" element={<Policy />} />
              <Route path="/yeu-thich" element={<Favorites />} />
              <Route path="/gio-hang" element={<Cart />} />
              <Route path="/thanh-toan" element={<Checkout />} />
              <Route path="/dat-hang-thanh-cong" element={<Success />} />
              <Route path="/dang-nhap" element={<Auth key="login" />} />
              <Route
                path="/dang-ky"
                element={<Auth key="register" register />}
              />
              <Route path="/tai-khoan" element={<Account />} />
              <Route path="/tra-cuu" element={<Tracking />} />
              <Route path="/quan-tri" element={<Admin />} />
              <Route
                path="*"
                element={
                  <Empty
                    title="Lạc vào vườn hoa rồi…"
                    text="Trang bạn tìm chưa có ở đây. Cùng quay lại Nhà Hoa nhé."
                    to="/"
                    action="Về trang chủ"
                  />
                }
              />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </StoreProvider>
    </BrowserRouter>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
