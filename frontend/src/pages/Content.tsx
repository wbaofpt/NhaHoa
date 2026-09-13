import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Flower2, Leaf, Heart, Clock, Send } from "lucide-react";
import { PageHeading, ButtonLink, Botanical, Empty } from "../components";
import { api, post } from "../types";
import { collections, services, extraArticles } from "../editorial";
import { SupportBanner } from "./Explore";
export const articles = [
  ...extraArticles,
  {
    slug: "giu-hoa-tuoi-lau",
    image: "tulip",
    category: "Chăm hoa",
    title: "Giữ một bó hoa tươi lâu, giữ niềm vui ở lại",
    intro:
      "Một chút quan tâm mỗi ngày sẽ giúp những cánh hoa ở bên bạn lâu hơn.",
    sections: [
      [
        "Bắt đầu từ một chiếc bình sạch",
        "Rửa bình thật sạch trước khi cắm hoa. Nước sạch và chiếc bình không còn cặn giúp hoa có một khởi đầu tốt. Loại bỏ những chiếc lá nằm dưới mặt nước để giữ nước trong hơn.",
      ],
      [
        "Cắt gốc, thay nước, một thói quen nhỏ",
        "Dùng kéo sắc cắt chéo phần gốc khoảng 1–2 cm trước khi cắm. Thay nước mỗi ngày và cắt lại một chút gốc khi cần. Nếu có gói dưỡng hoa, sử dụng đúng hướng dẫn trên bao bì.",
      ],
      [
        "Chọn một góc dịu dàng",
        "Đặt bình ở nơi thoáng mát, tránh nắng trực tiếp, luồng điều hòa mạnh và các nguồn nhiệt. Không để hoa sát đĩa trái cây chín. Mỗi loài hoa có nhịp nở riêng, hãy dành một chút thời gian quan sát.",
      ],
    ],
  },
  {
    slug: "ngon-ngu-cua-hoa",
    image: "rose",
    category: "Chuyện về hoa",
    title: "Khi những cánh hoa nói thay lời bạn",
    intro:
      "Không có một quy tắc tuyệt đối cho ngôn ngữ của hoa. Điều đẹp nhất vẫn là câu chuyện bạn gửi gắm.",
    sections: [
      [
        "Một sắc màu, một cảm xúc",
        "Sắc hồng gợi sự dịu dàng, trắng mang cảm giác trong trẻo, còn vàng thường khiến ta nghĩ đến ánh nắng. Hãy chọn màu mà người nhận yêu, hoặc màu gắn với một kỷ niệm của hai người.",
      ],
      [
        "Không cần đợi một ngày đặc biệt",
        "Một bó hoa vào chiều thứ ba cũng có thể là món quà đáng nhớ. Lời cảm ơn, lời chúc ngày mới hay một câu “mình nghĩ đến bạn” đều xứng đáng được gói cùng những cánh hoa.",
      ],
      [
        "Để lời nhắn mang dấu ấn của bạn",
        "Một tấm thiệp ngắn, viết bằng cách nói quen thuộc, thường gần gũi hơn một câu cầu kỳ. Kể về một điều nhỏ bạn trân trọng ở người nhận. Nhà Hoa sẽ giúp bạn viết lại thật chỉn chu.",
      ],
    ],
  },
  {
    slug: "hoa-cho-ngay-binh-thuong",
    image: "garden",
    category: "Sống cùng hoa",
    title: "Một ngày bình thường cũng xứng đáng có hoa",
    intro:
      "Bạn không cần một lý do thật lớn để mang một chút thiên nhiên về nhà.",
    sections: [
      [
        "Bắt đầu thật nhỏ",
        "Một cành hoa trong chiếc cốc yêu thích, vài nhánh lá bên cửa sổ, hoặc một bó nhỏ trên bàn ăn. Không cần cầu kỳ, chỉ cần hợp với góc sống và tâm trạng của bạn.",
      ],
      [
        "Một khoảng nghỉ giữa ngày",
        "Thay nước, xoay bình, ngắm một nụ hoa vừa nở. Những việc giản đơn này có thể trở thành khoảng nghỉ nhỏ khỏi màn hình và lịch trình bận rộn.",
      ],
      [
        "Tặng hoa cho chính mình",
        "Đừng quên rằng bạn cũng là người xứng đáng nhận những điều đẹp đẽ. Chọn một bó hoa vì bạn thích nó, vậy là đủ.",
      ],
    ],
  },
];
export function Collections() {
  return (
    <>
      <PageHeading
        eyebrow="NHỮNG MÙA THƯƠNG"
        title="Mỗi câu chuyện, một sắc hoa."
        description="Bộ sưu tập được chọn cho những khoảnh khắc đáng nhớ của bạn."
      />
      <section className="collection-grid wrap section-bottom">
        {collections.map((c) => (
          <Link
            className="collection-card"
            key={c.occasion}
            to={"/bo-suu-tap/" + c.slug}
          >
            <img
              src={"/images/" + c.image + ".jpg"}
              alt={c.name}
              loading="lazy"
            />
            <div>
              <span className="eyebrow">HOA {c.occasion.toUpperCase()}</span>
              <h2>{c.name}</h2>
              <p>{c.text}</p>
              <span className="text-link">
                Khám phá bộ sưu tập <ArrowUpRight size={18} />
              </span>
            </div>
          </Link>
        ))}
      </section>
      <SupportBanner />
    </>
  );
}
export function About() {
  return (
    <>
      <PageHeading
        eyebrow="CÂU CHUYỆN NHÀ HOA"
        title="Từ một tình yêu rất nhỏ."
        description="Với hoa. Với thiên nhiên. Với những điều đẹp đẽ trong cuộc sống."
      />
      <section className="about-hero wrap">
        <img src="/images/garden.jpg" alt="Cành hoa nở trong ánh sáng dịu" />
        <div>
          <span className="eyebrow">
            CHÚNG MÌNH TIN VÀO NHỮNG ĐIỀU GIẢN ĐƠN
          </span>
          <h2>
            Hoa không chỉ là một món quà.
            <br />
            Hoa là một <em>cách quan tâm.</em>
          </h2>
          <p>
            Nhà Hoa là một tiệm hoa trực tuyến dành cho những người yêu nét đẹp
            tự nhiên. Chúng mình chọn hoa theo mùa, phối màu nhẹ nhàng và gói
            từng bó bằng sự chăm chút.
          </p>
          <p>
            Mỗi đơn hoa là một câu chuyện: lời cảm ơn còn chưa kịp nói, lời chúc
            cho khởi đầu mới, hay đơn giản là một chút niềm vui bạn dành cho
            chính mình.
          </p>
          <p>Nhà Hoa muốn được góp một phần nhỏ vào những khoảnh khắc ấy.</p>
          <Botanical className="about-botanical" />
        </div>
      </section>
      <section className="values wrap section">
        {[
          {
            Icon: Leaf,
            title: "Thuận theo tự nhiên",
            text: "Trân trọng vẻ đẹp riêng của từng cành hoa, từng mùa nở.",
          },
          {
            Icon: Heart,
            title: "Chân thành trong từng việc",
            text: "Tư vấn rõ ràng, lắng nghe câu chuyện và ngân sách của bạn.",
          },
          {
            Icon: Flower2,
            title: "Chăm chút đến tận tay",
            text: "Từ chọn hoa, gói giấy đến viết thiệp, mỗi bước đều có sự quan tâm.",
          },
        ].map((v) => (
          <div key={v.title}>
            <v.Icon size={35} strokeWidth={1} />
            <h3>{v.title}</h3>
            <p>{v.text}</p>
          </div>
        ))}
      </section>
      <div className="closing-quote">
        <h2>
          Rất vui được là một phần
          <br />
          trong câu chuyện của bạn.
        </h2>
        <ButtonLink to="/hoa">Chọn một chút yêu thương</ButtonLink>
      </div>
    </>
  );
}
export function Blog() {
  const [params, setParams] = useSearchParams();
  const [remoteArticles, setRemoteArticles] = useState<typeof articles>([]);
  useEffect(() => { void api<typeof articles>("/articles").then(setRemoteArticles).catch(() => setRemoteArticles([])); }, []);
  const query = params.get("q") || "";
  const category = params.get("chu-de") || "";
  const customArticles = (() => { try { return JSON.parse(localStorage.getItem("nha-hoa-articles") || "[]"); } catch { return []; } })();
  const managedArticles = remoteArticles.length ? remoteArticles : articles;
  const allArticles = [...customArticles, ...managedArticles.filter((article) => !customArticles.some((item: { slug: string }) => item.slug === article.slug))];
  const normalize = (text: string) =>
    text
      .toLocaleLowerCase("vi")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  const shown = allArticles.filter(
    (a) =>
      (!category || a.category === category) &&
      normalize(a.title + " " + a.intro).includes(normalize(query)),
  );
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };
  return (
    <>
      <PageHeading
        eyebrow="CHUYỆN NHÀ HOA"
        title="Chuyện hoa, chuyện đời."
        description="Một chút kiến thức, một chút cảm hứng. Cùng sống chậm với hoa."
      />
      <div className="content-filters wrap">
        <label className="field">
          Tìm câu chuyện
          <input
            type="search"
            value={query}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Sinh nhật, lời thiệp, chăm hoa…"
          />
        </label>
        <div className="field">
          <label htmlFor="article-category">Chủ đề</label>
          <select
            id="article-category"
            value={category}
            onChange={(e) => update("chu-de", e.target.value)}
          >
            <option value="">Tất cả chủ đề</option>
            {Array.from(new Set(allArticles.map((a) => a.category))).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <p role="status">{shown.length} câu chuyện</p>
      </div>
      {!shown.length && (
        <div className="prose wrap section-bottom">
          <h2>Chưa tìm thấy câu chuyện phù hợp</h2>
          <p>Thử một từ khóa ngắn hơn hoặc chọn lại chủ đề.</p>
          <button className="button outline" onClick={() => setParams({})}>
            Xóa bộ lọc
          </button>
        </div>
      )}
      <section className="journal-grid wrap section-bottom">
        {shown.map((a) => (
          <Link
            className="journal-card"
            key={a.slug}
            to={"/chuyen-nha-hoa/" + a.slug}
          >
            <div>
              <img src={"/images/" + a.image + ".jpg"} alt="" />
            </div>
            <span className="eyebrow">{a.category} · 3 PHÚT ĐỌC</span>
            <h2>{a.title}</h2>
            <p>{a.intro}</p>
            <span className="text-link">
              Đọc câu chuyện <ArrowUpRight size={18} />
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
export function Article() {
  const { slug } = useParams();
  const fallback = articles.find((a) => a.slug === slug);
  const [a, setArticle] = useState<typeof fallback>(fallback);
  useEffect(() => { if (slug) void api<typeof fallback>(`/articles/${slug}`).then(setArticle).catch(() => setArticle(fallback)); }, [slug]);
  if (!a)
    return (
      <Empty
        title="Câu chuyện chưa được viết"
        text="Ghé đọc những câu chuyện khác của Nhà Hoa nhé."
        to="/chuyen-nha-hoa"
        action="Về góc chuyện hoa"
      />
    );
  return (
    <>
      <section className="article-hero wrap">
        <img className="article-hero-image" src={a.image.startsWith("data:") ? a.image : "/images/" + a.image + ".jpg"} alt={a.title} />
        <div className="article-hero-copy"><span className="eyebrow">{a.category}</span><h1>{a.title}</h1><p>{a.intro}</p><p className="muted">Biên soạn bởi Nhà Hoa · <Clock size={14} /> 3 phút đọc</p></div>
      </section>
      <article className="article-body wrap section-bottom">
        <div className="article-reading">
          {a.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}
          <div className="article-end"><Flower2 /><p>Cảm ơn bạn đã dừng lại một chút cùng Nhà Hoa.</p><Link className="text-link" to="/cham-soc-hoa">Mở cẩm nang chăm hoa</Link><ButtonLink to="/hoa">Mang chút hoa về nhà</ButtonLink></div>
        </div>
      </article>
      <section className="wrap section-bottom">
        <h2>Đọc thêm cùng Nhà</h2>
        <div className="journal-grid">
          {articles
            .filter((item) => item.slug !== a.slug)
            .slice(0, 3)
            .map((item) => (
              <Link
                className="journal-card"
                key={item.slug}
                to={"/chuyen-nha-hoa/" + item.slug}
              >
                <div>
                  <img
                    src={"/images/" + item.image + ".jpg"}
                    alt=""
                    loading="lazy"
                  />
                </div>
                <span className="eyebrow">{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.intro}</p>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}
export function Contact() {
  const [params] = useSearchParams();
  const requested = services.find((s) => s.slug === params.get("dich-vu"));
  const orderCode = /^NH[A-F0-9]{10}$/.test(params.get("don") || "")
    ? params.get("don")
    : null;
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: requested
      ? `Mình muốn được tư vấn: ${requested.name}.
Ngày cần hoa: 
Ngân sách dự kiến: 
Địa điểm và mong muốn: `
      : orderCode
        ? `Mình cần hỗ trợ đơn ${orderCode}.
Nội dung cần hỗ trợ: `
        : "",
  });
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setResult("");
    setError("");
    try {
      await api("/contact", post(form));
      setResult(
        "Lời nhắn đã được lưu. Nhà Hoa sẽ phản hồi qua email bạn cung cấp.",
      );
      setForm({ name: "", email: "", message: "" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="NHÀ HOA LUÔN LẮNG NGHE"
        title="Kể Nhà Hoa nghe nhé."
        description="Một ý tưởng cho bó hoa, một câu hỏi hay đơn giản là lời chào."
      />
      <section className="contact-layout wrap section-bottom">
        <div className="contact-info">
          <Flower2 size={42} strokeWidth={1} />
          <h2>
            Mỗi lời nhắn đều
            <br />
            được đón nhận.
          </h2>
          <p>
            Bạn muốn một bó hoa riêng cho người thương, trang trí một góc nhỏ
            hay chuẩn bị hoa cho ngày cưới? Hãy kể về dịp tặng, màu yêu thích và
            ngân sách của bạn.
          </p>
          <hr />
          <h3>Tiệm hoa trực tuyến</h3>
          <p>
            Nhận đơn mỗi ngày, 8:00 – 20:00
            <br />
            Giao hoa tại TP. Hồ Chí Minh
          </p>
          <Link className="text-link" to="/cau-hoi">
            Có thể câu trả lời ở đây <ArrowUpRight size={16} />
          </Link>
        </div>
        <form onSubmit={submit} className="contact-form">
          <label className="field">
            Nhà Hoa gọi bạn là gì?
            <input
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="field">
            Email để chúng mình hồi âm
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="field">
            Điều bạn muốn nhắn gửi
            <textarea
              rows={6}
              required
              minLength={10}
              maxLength={3000}
              placeholder="Mình đang tìm một bó hoa…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {result && (
            <p role="status" className="form-success">
              {result}
            </p>
          )}
          <p className="muted">
            Thông tin được dùng để trả lời yêu cầu. Xem{" "}
            <Link className="inline-link" to="/chinh-sach/bao-mat">
              chính sách bảo mật
            </Link>
            . Vui lòng không gửi mật khẩu hoặc thông tin thẻ.
          </p>
          <button className="button" disabled={busy}>
            {busy ? "Đang gửi…" : "Gửi lời nhắn cho Nhà"}
            <Send size={17} />
          </button>
        </form>
      </section>
    </>
  );
}
const faqs = [
  [
    "Tính năng nào cần tài khoản?",
    "Bạn có thể xem hoa và thêm vào giỏ mà chưa đăng nhập. Thanh toán, lưu yêu thích và xem đơn hàng cần tài khoản. Sau khi đăng nhập, bạn quay lại trang đang dùng với giỏ còn nguyên.",
  ],
  [
    "Phí giao được tính thế nào?",
    "Phí giao là 35.000đ; đơn có tiền hoa từ 800.000đ được miễn phí giao. Tổng tiền được hiển thị trong giỏ và ở bước thanh toán để bạn kiểm tra trước khi đặt.",
  ],
  [
    "Làm sao xem lại mã đơn?",
    "Đăng nhập tài khoản đã đặt rồi vào Tài khoản. Danh sách đơn có mã và liên kết Chi tiết để tra cứu. Bạn không thể tra cứu đơn thuộc tài khoản khác chỉ bằng mã và email.",
  ],
  [
    "Giỏ hoa và yêu thích có được lưu không?",
    "Giỏ được lưu trên trình duyệt đang dùng; xóa dữ liệu trình duyệt sẽ xóa giỏ. Yêu thích được lưu theo tài khoản và có thể xem khi đăng nhập trên thiết bị khác.",
  ],
  [
    "Tôi quên mật khẩu thì làm gì?",
    "Website chưa hỗ trợ đặt lại mật khẩu tự động qua email. Bạn có thể gửi yêu cầu hỗ trợ qua Liên hệ; không gửi mật khẩu cũ. Nếu còn đăng nhập và biết mật khẩu hiện tại, dùng trang Bảo mật tài khoản để đổi.",
  ],
  [
    "Có đặt hoa theo ngân sách hoặc cho sự kiện không?",
    "Ghé trang Dịch vụ để xem hoa theo yêu cầu, hoa cưới và hoa doanh nghiệp. Gửi ngày, địa điểm, số lượng và ngân sách; Nhà Hoa trao đổi phương án trước khi xác nhận nhận làm.",
  ],

  [
    "Nhà Hoa giao hoa ở đâu?",
    "Hiện tại Nhà Hoa nhận giao trong khu vực TP. Hồ Chí Minh. Khi nhận đơn, chúng mình sẽ liên hệ xác nhận địa chỉ và giờ giao cụ thể.",
  ],
  [
    "Mình có thể đặt hoa giao trong ngày không?",
    "Bạn có thể chọn ngày hôm nay khi đặt hoa. Khả năng giao trong ngày phụ thuộc tồn kho, địa chỉ và thời điểm đặt. Nhà Hoa sẽ xác nhận trước khi chuẩn bị đơn.",
  ],
  [
    "Hoa có giống hệt hình không?",
    "Hình ảnh thể hiện phong cách phối hoa. Do hoa tự nhiên thay đổi theo mùa, sắc độ và dáng hoa có thể khác nhẹ. Nếu cần thay hoa chính, chúng mình sẽ trao đổi với bạn trước.",
  ],
  [
    "Có thể gửi thiệp và giấu tên người tặng không?",
    "Có nhé. Bạn viết lời nhắn ở bước đặt hàng và ghi rõ yêu cầu giấu tên. Thiệp viết tay được tặng kèm đơn hoa.",
  ],
  [
    "Thanh toán bằng cách nào?",
    "Website hiện hỗ trợ thanh toán khi nhận hoa (COD). Nếu tặng bất ngờ và không muốn người nhận thanh toán, hãy gửi lời nhắn tư vấn trước khi đặt đơn.",
  ],
  [
    "Mình muốn thay đổi hoặc hủy đơn thì làm sao?",
    "Gửi yêu cầu qua trang Liên hệ kèm mã đơn và email đặt hàng. Nhà Hoa sẽ xem xét thay đổi hoặc hủy trước khi hoa được giao; đơn đã giao không thể hủy.",
  ],
  [
    "Nếu hoa bị hỏng khi nhận thì sao?",
    "Lưu ảnh tình trạng hoa và gửi mô tả kèm mã đơn qua Liên hệ trong 24 giờ từ khi nhận. Biểu mẫu chưa hỗ trợ tải ảnh; Nhà Hoa sẽ trao đổi cách nhận ảnh khi phản hồi và thống nhất phương án xử lý sau khi kiểm tra.",
  ],
];
export function FAQ() {
  const [query, setQuery] = useState("");
  const normalize = (text: string) =>
    text
      .toLocaleLowerCase("vi")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  const shown = faqs.filter(([q, a]) =>
    normalize(q + " " + a).includes(normalize(query)),
  );
  return (
    <>
      <PageHeading
        eyebrow="NHỮNG ĐIỀU BẠN MUỐN BIẾT"
        title="Nhà Hoa giải đáp."
        description="Để bạn yên tâm gửi đi một bó yêu thương."
      />
      <section className="prose wrap section-bottom">
        <label className="field">
          Tìm câu trả lời
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Thử: phí giao, tài khoản, mật khẩu…"
          />
        </label>
        <p role="status">
          {shown.length
            ? `${shown.length} câu trả lời`
            : "Chưa có câu trả lời phù hợp. Thử từ khóa khác hoặc nhắn cho Nhà bên dưới."}
        </p>
        {shown.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
        <div className="article-end">
          <h2>Bạn còn điều muốn hỏi?</h2>
          <ButtonLink to="/lien-he">Nhắn cho Nhà Hoa</ButtonLink>
        </div>
      </section>
    </>
  );
}
const policies: Record<string, { title: string; sections: string[][] }> = {
  "giao-hang": {
    title: "Giao hàng & đổi trả",
    sections: [
      [
        "Phạm vi và phí giao hoa",
        "Nhà Hoa giao tại TP. Hồ Chí Minh. Phí giao là 35.000đ cho đơn dưới 800.000đ; miễn phí từ 800.000đ. Thời gian cụ thể được xác nhận sau khi đặt đơn.",
      ],
      [
        "Thay đổi và hủy đơn",
        "Liên hệ Nhà Hoa kèm mã đơn sớm nhất có thể. Yêu cầu sẽ được kiểm tra theo tiến độ chuẩn bị thực tế. Đơn đang giao hoặc đã giao không thể hủy trực tiếp.",
      ],
      [
        "Ngày giao và người nhận",
        "Ngày bạn chọn là ngày giao mong muốn. Khả năng phục vụ còn phụ thuộc nguồn hoa, thời điểm đặt và địa chỉ. Vui lòng cung cấp số điện thoại liên lạc được; nếu người nhận vắng mặt hoặc cần đổi địa chỉ, Nhà Hoa sẽ trao đổi lại phương án trước khi tiếp tục.",
      ],
      [
        "Nhận hoa và thanh toán",
        "Kiểm tra tên người nhận, mẫu hoa và tình trạng bao gói khi nhận. Thanh toán COD theo tổng tiền đã được xác nhận. Với yêu cầu giao bất ngờ, hãy trao đổi trước để làm rõ ai là người thanh toán.",
      ],
      [
        "Chất lượng khi nhận",
        "Nếu hoa hư hỏng khi nhận, hãy lưu ảnh và gửi phản ánh trong 24 giờ qua trang Liên hệ. Nhà Hoa sẽ xác minh, thống nhất việc thay thế hoặc hoàn tiền trước khi xử lý.",
      ],
    ],
  },
  "bao-mat": {
    title: "Chính sách bảo mật",
    sections: [
      [
        "Thông tin được thu thập",
        "Khi bạn đặt hoa, chúng mình lưu tên, email, số điện thoại, địa chỉ nhận, ngày giao và lời nhắn để xử lý đơn. Tài khoản lưu mật khẩu dưới dạng băm.",
      ],
      [
        "Mục đích sử dụng",
        "Thông tin được dùng để xác nhận, giao hoa, hỗ trợ đơn và trả lời yêu cầu. Email nhận tin chỉ được lưu khi bạn chủ động đăng ký.",
      ],
      [
        "Cookie và lưu trữ trình duyệt",
        "Cookie phiên đăng nhập giúp duy trì tài khoản. Giỏ hàng được lưu trong trình duyệt; danh sách yêu thích được lưu theo tài khoản trong cơ sở dữ liệu để bạn dùng trên nhiều thiết bị.",
      ],
      [
        "Yêu cầu về dữ liệu",
        "Bạn có thể gửi yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin qua trang Liên hệ bằng email liên quan. Nhà Hoa sẽ xác minh trước khi thực hiện.",
      ],
      [
        "Giữ an toàn tài khoản",
        "Không chia sẻ mật khẩu hoặc dùng chung phiên đăng nhập trên thiết bị công cộng. Trang Bảo mật tài khoản cho phép đổi mật khẩu và đăng xuất mọi thiết bị. Nhà Hoa không yêu cầu bạn gửi mật khẩu qua biểu mẫu liên hệ.",
      ],
      [
        "Thông tin người được tặng hoa",
        "Khi nhập thông tin người nhận khác mình, bạn cần bảo đảm có cơ sở phù hợp để cung cấp thông tin đó cho việc giao hoa. Chỉ gửi những thông tin cần thiết; tránh đưa thông tin riêng tư nhạy cảm vào lời thiệp hoặc ghi chú.",
      ],
    ],
  },
  "dieu-khoan": {
    title: "Điều khoản mua hàng",
    sections: [
      [
        "Thông tin sản phẩm",
        "Giá hiển thị bằng Việt Nam đồng. Hoa là sản phẩm tự nhiên; màu sắc và kích thước có thể thay đổi nhẹ theo mùa. Hình ảnh mang tính minh họa phối hoa.",
      ],
      [
        "Xác nhận đơn",
        "Gửi đơn thành công nghĩa là hệ thống đã ghi nhận yêu cầu. Nhà Hoa sẽ xác nhận khả năng cung cấp và lịch giao trước khi thực hiện.",
      ],
      [
        "Thanh toán và giao nhận",
        "Hiện hỗ trợ thanh toán khi nhận hoa. Người đặt có trách nhiệm cung cấp thông tin chính xác và đảm bảo người nhận có thể nhận đơn.",
      ],
      [
        "Hỗ trợ",
        "Mọi thắc mắc về đơn, thay đổi hoa hoặc chất lượng được tiếp nhận qua trang Liên hệ. Vui lòng cung cấp mã đơn và email để được hỗ trợ.",
      ],
      [
        "Tài khoản và lịch sử mua hàng",
        "Đặt hàng, lưu yêu thích và tra cứu đơn yêu cầu đăng nhập. Bạn có trách nhiệm giữ an toàn tài khoản và kiểm tra lại thông tin trước khi gửi đơn. Mã đơn được lưu tại trang Tài khoản.",
      ],
      [
        "Yêu cầu thiết kế riêng",
        "Nội dung trên trang Dịch vụ là thông tin tư vấn. Gửi biểu mẫu không tự tạo đơn mua hàng hoặc xác nhận lịch phục vụ. Mẫu, hạng mục, chi phí và phương thức thực hiện cần được thống nhất riêng trước khi tiến hành.",
      ],
    ],
  },
};
export function Policy() {
  const { slug } = useParams();
  const policy = policies[slug || ""];
  if (!policy)
    return (
      <Empty
        title="Trang chưa có ở Nhà Hoa"
        text="Mời bạn quay lại cửa hàng hoa."
      />
    );
  return (
    <>
      <PageHeading eyebrow="THÔNG TIN MUA HÀNG" title={policy.title} />
      <article className="prose wrap section-bottom">
        {policy.sections.map(([title, text]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
        <ButtonLink to="/lien-he">Liên hệ hỗ trợ</ButtonLink>
      </article>
    </>
  );
}
