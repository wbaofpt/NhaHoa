import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Flower2, Leaf } from "lucide-react";
import { useStore } from "../store";
import {
  ButtonLink,
  ProductGrid,
  CatalogState,
  Promises,
  Botanical,
} from "../components";
import { categories } from "../types";
export default function Home() {
  const { products } = useStore();
  const [category, setCategory] = useState("Tất cả");
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span /> MỘT CHÚT HOA, THÊM YÊU ĐỜI
          </div>
          <h1>
            Gửi hoa,
            <br />
            gửi cả <em>tấm lòng.</em>
          </h1>
          <p>
            Có những điều, một bó hoa sẽ nói thay bạn.
            <br />
            Để Nhà Hoa gói ghém yêu thương, gửi đến
            <br className="desktop-br" /> người bạn trân quý.
          </p>
          <div className="hero-buttons">
            <ButtonLink to="/hoa">Chọn một bó hoa</ButtonLink>
            <ButtonLink to="/ve-nha-hoa" outline>
              Câu chuyện Nhà Hoa
            </ButtonLink>
          </div>
          <div className="hero-footnote">
            <Flower2 size={21} strokeWidth={1} />
            <span>
              Hoa tươi mỗi ngày <i>·</i> Thương gửi tận tay
            </span>
          </div>
          <Botanical className="hero-botanical" />
        </div>
        <div className="hero-visual">
          <img
            className="hero-photo"
            src="/images/hero.jpg"
            alt="Bó hoa tươi nhiều sắc màu được gói giấy thủ công"
            fetchPriority="high"
            width="1600"
            height="1400"
          />
          <div className="hero-image-tint" />
          <div className="round-stamp">
            <Flower2 size={29} strokeWidth={1} />
            <span>
              GÓI GHÉM
              <br />
              YÊU THƯƠNG
            </span>
          </div>
          <div className="hero-note">
            <span>THE EVERYDAY COLLECTION</span>
            <p>
              Những điều nhỏ.
              <br />
              <em>Niềm vui thật to.</em>
            </p>
            <Link to="/bo-suu-tap" aria-label="Khám phá bộ sưu tập">
              <ArrowUpRight size={25} />
            </Link>
          </div>
          <span className="image-credit">BLOOM WITH LOVE, BY NHÀ HOA</span>
        </div>
      </section>
      <Promises />
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MỖI DỊP ĐẶC BIỆT, MỘT LỜI THƯƠNG</span>
            <h2>
              Hoa cho những <em>khoảnh khắc.</em>
            </h2>
          </div>
          <Link className="text-link" to="/bo-suu-tap">
            Khám phá tất cả <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="occasion-grid">
          {[
            {
              name: "Sinh nhật",
              caption: "Thêm một tuổi, thêm niềm vui",
              image: "pink",
            },
            { name: "Tình yêu", caption: "Thay lời muốn nói", image: "rose" },
            {
              name: "Chúc mừng",
              caption: "Cho những khởi đầu rực rỡ",
              image: "sunshine",
            },
            {
              name: "Cảm ơn",
              caption: "Gửi một chút chân thành",
              image: "garden",
            },
          ].map((item, i) => (
            <Link
              className={"occasion-card occasion-" + i}
              key={item.name}
              to={"/hoa?dip=" + encodeURIComponent(item.name)}
            >
              <img
                src={"/images/" + item.image + ".jpg"}
                alt={"Hoa " + item.name.toLowerCase()}
                loading="lazy"
              />
              <div>
                <small>0{i + 1} / MỘT LỜI THƯƠNG</small>
                <h3>{item.name}</h3>
                <p>{item.caption}</p>
              </div>
              <span>
                <ArrowUpRight size={20} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="bestsellers section">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ĐƯỢC CHỌN BẰNG CẢ TRÁI TIM</span>
              <h2>
                Những bó hoa <em>được yêu.</em>
              </h2>
            </div>
            <Link className="text-link" to="/hoa">
              Ghé cửa hàng hoa <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="filter-tabs" aria-label="Loại hoa">
            {categories.map((c) => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <CatalogState>
            <ProductGrid
              products={products
                .filter((p) => category === "Tất cả" || p.category === category)
                .slice(0, 4)}
            />
          </CatalogState>
        </div>
      </section>
      <section className="story-section wrap">
        <div className="story-image">
          <img
            src="/images/garden.jpg"
            alt="Những cành hoa nhỏ trong ánh sáng tự nhiên"
            loading="lazy"
          />
          <span className="photo-caption">
            Một góc bình yên, một chút Nhà Hoa.
          </span>
          <div className="story-small">
            <img
              src="/images/white.jpg"
              alt="Hoa trắng dịu dàng"
              loading="lazy"
            />
          </div>
        </div>
        <div className="story-copy">
          <span className="eyebrow">CHÀO BẠN, CHÚNG MÌNH LÀ NHÀ HOA</span>
          <h2>
            Một tiệm hoa nhỏ.
            <br />
            Những yêu thương <em>thật lớn.</em>
          </h2>
          <p>
            Nhà Hoa bắt đầu từ niềm vui giản đơn: được chạm vào những cánh hoa
            mỗi sáng và nhìn thấy nụ cười của người nhận.
          </p>
          <p>
            Chúng mình tin rằng hoa không chỉ dành cho những ngày đặc biệt. Một
            bó hoa trên bàn, một lời nhắn bất ngờ — cũng đủ để một ngày bình
            thường trở nên đáng nhớ.
          </p>
          <ButtonLink to="/ve-nha-hoa" outline>
            Đọc câu chuyện của chúng mình
          </ButtonLink>
          <Botanical className="story-botanical" />
        </div>
      </section>
      <section className="custom-banner wrap">
        <Flower2 strokeWidth={0.7} />
        <div>
          <span className="eyebrow">MỘT BÓ HOA, CHỈ DÀNH CHO BẠN</span>
          <h2>
            Bạn kể câu chuyện.
            <br />
            Nhà Hoa chọn những cánh hoa.
          </h2>
          <p>Thiết kế hoa theo yêu cầu, cho những điều thật riêng.</p>
        </div>
        <ButtonLink to="/lien-he">Cùng Nhà Hoa tạo nên</ButtonLink>
      </section>
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CHUYỆN HOA, CHUYỆN CHÚNG MÌNH</span>
            <h2>
              Một chút cảm hứng <em>mỗi ngày.</em>
            </h2>
          </div>
          <Link className="text-link" to="/chuyen-nha-hoa">
            Đọc thêm chuyện hoa <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="journal-grid">
          {[
            {
              slug: "giu-hoa-tuoi-lau",
              image: "tulip",
              tag: "CHĂM HOA",
              title: "Giữ một bó hoa tươi lâu, giữ niềm vui ở lại",
            },
            {
              slug: "ngon-ngu-cua-hoa",
              image: "rose",
              tag: "CHUYỆN VỀ HOA",
              title: "Khi những cánh hoa nói thay lời bạn",
            },
            {
              slug: "hoa-cho-ngay-binh-thuong",
              image: "garden",
              tag: "SỐNG CÙNG HOA",
              title: "Một ngày bình thường cũng xứng đáng có hoa",
            },
          ].map((p) => (
            <Link
              className="journal-card"
              key={p.slug}
              to={"/chuyen-nha-hoa/" + p.slug}
            >
              <div>
                <img
                  src={"/images/" + p.image + ".jpg"}
                  alt=""
                  loading="lazy"
                />
              </div>
              <span className="eyebrow">
                {p.tag} <i>·</i> 5 PHÚT ĐỌC
              </span>
              <h3>{p.title}</h3>
              <span className="text-link">
                Đọc câu chuyện <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <div className="closing-quote">
        <Leaf size={25} strokeWidth={1} />
        <p>“Đôi khi, hạnh phúc chỉ là một bó hoa.”</p>
        <span>NHÀ HOA — GỬI TRỌN ĐIỀU THƯƠNG</span>
      </div>
    </>
  );
}
