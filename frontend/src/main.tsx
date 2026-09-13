import React, { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { StoreProvider, useStore } from "./store";
import { Header, Footer, SupportFloat } from "./components";
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
import { AuthGate } from "./AuthGate";
import { MotionEffects } from "./MotionEffects";
import Security from "./pages/Security";
import { PageMotion, BloomLoader, HomeWelcome } from "./PageMotion";
import { Profile, OrderDetail } from "./pages/Member";
import AdminManagement from "./pages/admin/AdminManagement";
import AdminExtra from "./pages/admin/AdminExtra";
import AdminAccess from "./pages/admin/AdminAccess";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBanner from "./pages/admin/AdminBanner";
import AdminStories from "./pages/admin/AdminStories";
import {
  Services,
  ServiceDetail,
  CollectionDetail,
  OrderGuide,
  FlowerCare,
  SiteMap,
  NotFound,
} from "./pages/Explore";
import { collections, services } from "./editorial";
const Admin = lazy(() => import("./pages/admin/Admin"));
function NavigationEffects() {
  const { pathname } = useLocation();
  const { products } = useStore();
  useEffect(() => {
    if (pathname.startsWith("/quan-tri")) return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  useEffect(() => {
    const titles: Record<string, string> = {
      "/dich-vu": "Dịch vụ hoa theo yêu cầu",
      "/huong-dan-dat-hang": "Hướng dẫn đặt hàng",
      "/cham-soc-hoa": "Cẩm nang chăm sóc hoa",
      "/so-do-trang": "Sơ đồ trang",
      ...Object.fromEntries(
        collections.map((c) => ["/bo-suu-tap/" + c.slug, c.name]),
      ),
      ...Object.fromEntries(
        services.map((s) => ["/dich-vu/" + s.slug, s.name]),
      ),
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
      "/tai-khoan/bao-mat": "Bảo mật tài khoản",
      "/tai-khoan/thong-tin": "Thông tin cá nhân",
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
      (pathname.startsWith("/tai-khoan/don-hang/")
        ? "Chi tiết đơn hoa"
        : pathname.startsWith("/hoa/")
          ? "Chi tiết hoa"
          : "Trang không tồn tại");
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
        <HomeWelcome />
        <MotionEffects />
        <a className="skip-link" href="#main">
          Đến nội dung chính
        </a>
        <Header />
        <PageMotion>
          <Suspense
            fallback={<BloomLoader label="Nhà đang mở trang cho bạn…" />}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hoa" element={<Shop />} />
              <Route path="/hoa/:slug" element={<ProductDetail />} />
              <Route path="/bo-suu-tap" element={<Collections />} />
              <Route path="/bo-suu-tap/:slug" element={<CollectionDetail />} />
              <Route path="/dich-vu" element={<Services />} />
              <Route path="/dich-vu/:slug" element={<ServiceDetail />} />
              <Route path="/huong-dan-dat-hang" element={<OrderGuide />} />
              <Route path="/cham-soc-hoa" element={<FlowerCare />} />
              <Route path="/so-do-trang" element={<SiteMap />} />
              <Route path="/ve-nha-hoa" element={<About />} />
              <Route path="/chuyen-nha-hoa" element={<Blog />} />
              <Route path="/chuyen-nha-hoa/:slug" element={<Article />} />
              <Route path="/lien-he" element={<Contact />} />
              <Route path="/cau-hoi" element={<FAQ />} />
              <Route path="/chinh-sach/:slug" element={<Policy />} />
              <Route
                path="/yeu-thich"
                element={
                  <AuthGate>
                    <Favorites />
                  </AuthGate>
                }
              />
              <Route
                path="/gio-hang"
                element={
                  <AuthGate>
                    <Cart />
                  </AuthGate>
                }
              />
              <Route
                path="/thanh-toan"
                element={
                  <AuthGate>
                    <Checkout />
                  </AuthGate>
                }
              />
              <Route path="/dat-hang-thanh-cong" element={<Success />} />
              <Route path="/dang-nhap" element={<Auth key="login" />} />
              <Route
                path="/dang-ky"
                element={<Auth key="register" register />}
              />
              <Route
                path="/tai-khoan"
                element={
                  <AuthGate>
                    <Account />
                  </AuthGate>
                }
              />
              <Route
                path="/tai-khoan/bao-mat"
                element={
                  <AuthGate>
                    <Security />
                  </AuthGate>
                }
              />
              <Route
                path="/tra-cuu"
                element={
                  <AuthGate>
                    <Tracking />
                  </AuthGate>
                }
              />
              <Route path="/quan-tri" element={<Admin />} />
              <Route path="/quan-tri/products" element={<Admin />} />
              <Route path="/quan-tri/orders" element={<Admin />} />
              <Route path="/quan-tri/inquiries" element={<Admin />} />
              <Route
                path="/quan-tri/inventory"
                element={
                  <AdminAccess>
                    <AdminManagement />
                  </AdminAccess>
                }
              />
              <Route path="/quan-tri/categories" element={<AdminAccess><AdminCategories /></AdminAccess>} />
              <Route path="/quan-tri/banner" element={<AdminAccess><AdminBanner /></AdminAccess>} />
              <Route path="/quan-tri/stories" element={<AdminAccess><AdminStories /></AdminAccess>} />
              <Route
                path="/quan-tri/customers"
                element={
                  <AdminAccess>
                    <AdminManagement />
                  </AdminAccess>
                }
              />
              <Route
                path="/quan-tri/subscribers"
                element={
                  <AdminAccess>
                    <AdminManagement />
                  </AdminAccess>
                }
              />
              <Route
                path="/quan-tri/reports"
                element={
                  <AdminAccess>
                    <AdminManagement />
                  </AdminAccess>
                }
              />
              <Route
                path="/quan-tri/order-calendar"
                element={
                  <AdminAccess>
                    <AdminExtra />
                  </AdminAccess>
                }
              />
              <Route
                path="/quan-tri/alerts"
                element={
                  <AdminAccess>
                    <AdminExtra />
                  </AdminAccess>
                }
              />
              <Route
                path="/quan-tri/activity"
                element={
                  <AdminAccess>
                    <AdminExtra />
                  </AdminAccess>
                }
              />
              <Route
                path="/quan-tri/settings"
                element={
                  <AdminAccess>
                    <AdminExtra />
                  </AdminAccess>
                }
              />
              <Route
                path="/tai-khoan/thong-tin"
                element={
                  <AuthGate>
                    <Profile />
                  </AuthGate>
                }
              />
              <Route
                path="/tai-khoan/don-hang/:id"
                element={
                  <AuthGate>
                    <OrderDetail />
                  </AuthGate>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PageMotion>
        <Footer />
        <SupportFloat />
      </StoreProvider>
    </BrowserRouter>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
