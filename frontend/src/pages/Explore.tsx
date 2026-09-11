import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, Flower2, Leaf, ShoppingBag, Truck } from "lucide-react";
import {
  ButtonLink,
  CatalogState,
  Empty,
  PageHeading,
  ProductGrid,
} from "../components";
import { collections, services } from "../editorial";
import { useStore } from "../store";

export function CollectionDetail() {
  const { slug } = useParams();
  const { products } = useStore();
  const collection = collections.find((item) => item.slug === slug);
  if (!collection) return <NotFound />;
  const selected = products.filter(
    (product) => product.occasion === collection.occasion,
  );
  return (
    <>
      <PageHeading
        eyebrow={"HOA " + collection.occasion.toUpperCase()}
        title={collection.name}
        description={collection.text}
      />
      <section className="editorial-split wrap section-bottom">
        <img
          src={`/images/${collection.image}.jpg`}
          alt={"Gợi ý sắc hoa cho dịp " + collection.occasion.toLowerCase()}
        />
        <div>
          <span className="eyebrow">CHỌN HOA BẰNG SỰ QUAN TÂM</span>
          <h2>Món quà bắt đầu từ câu chuyện.</h2>
          <p>{collection.story}</p>
          <ul className="editorial-list">
            {collection.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <ButtonLink to="/huong-dan-dat-hang" outline>
            Xem cách đặt hoa
          </ButtonLink>
        </div>
      </section>
      <section className="wrap section-bottom">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NHÀ HOA GỢI Ý</span>
            <h2>Hoa cho dịp {collection.occasion.toLowerCase()}</h2>
          </div>
          <Link
            className="text-link"
            to={`/hoa?dip=${encodeURIComponent(collection.occasion)}`}
          >
            Lọc theo giá & kiểu dáng <ArrowUpRight size={18} />
          </Link>
        </div>
        <CatalogState>
          {selected.length ? (
            <ProductGrid products={selected} />
          ) : (
            <Empty
              title="Nhà đang chọn thêm hoa"
              text="Bạn có thể gửi màu yêu thích và ngân sách để được tư vấn cho dịp này."
              to="/lien-he"
              action="Nhờ Nhà Hoa tư vấn"
            />
          )}
        </CatalogState>
      </section>
      <SupportBanner />
    </>
  );
}

export function Services() {
  return (
    <>
      <PageHeading
        eyebrow="DỊCH VỤ NHÀ HOA"
        title="Hoa cho những câu chuyện riêng."
        description="Từ một món quà nhỏ đến ngày vui nhiều người. Chúng mình bắt đầu bằng việc lắng nghe."
      />
      <section className="service-grid wrap section-bottom">
        {services.map((service) => (
          <article className="service-card" key={service.slug}>
            <img
              src={`/images/${service.image}.jpg`}
              alt={service.name}
              loading="lazy"
            />
            <div>
              <span className="eyebrow">{service.label}</span>
              <h2>{service.name}</h2>
              <p>{service.intro}</p>
              <Link className="text-link" to={`/dich-vu/${service.slug}`}>
                Tìm hiểu dịch vụ <ArrowUpRight size={18} />
              </Link>
            </div>
          </article>
        ))}
      </section>
      <section className="wrap section-bottom">
        <div className="section-heading">
          <div>
            <span className="eyebrow">TỪ Ý TƯỞNG ĐẾN BÓ HOA</span>
            <h2>Cùng Nhà chuẩn bị từng bước.</h2>
          </div>
        </div>
        <ol className="guide-steps">
          {[
            [
              "Kể điều bạn mong",
              "Gửi dịp sử dụng, ngày cần hoa, địa điểm và ngân sách dự kiến.",
            ],
            [
              "Thống nhất phương án",
              "Nhà Hoa trao đổi mẫu, nguồn hoa, hạng mục, giá và lịch giao phù hợp.",
            ],
            [
              "Xác nhận rồi thực hiện",
              "Chỉ thực hiện sau khi các bên thống nhất. Gửi lời nhắn chưa phải là đặt dịch vụ thành công.",
            ],
          ].map(([title, text], i) => (
            <li key={title}>
              <span className="step-number">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>
      <SupportBanner />
    </>
  );
}

export function ServiceDetail() {
  const { slug } = useParams();
  const service = services.find((item) => item.slug === slug);
  if (!service) return <NotFound />;
  return (
    <>
      <PageHeading
        eyebrow={service.label}
        title={service.name}
        description={service.intro}
      />
      <section className="editorial-split wrap section-bottom">
        <img src={`/images/${service.image}.jpg`} alt={service.name} />
        <div>
          <h2>Để hoa hợp với điều bạn cần.</h2>
          <p>{service.body}</p>
          <ul className="editorial-list">
            {service.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="service-request wrap section-bottom">
        <div>
          <span className="eyebrow">TRƯỚC KHI GỬI LỜI NHẮN</span>
          <h2>Bạn chuẩn bị giúp Nhà nhé.</h2>
          <p>{service.prepare}</p>
          <p>
            Giá và khả năng phục vụ phụ thuộc nguồn hoa, số lượng, địa điểm và
            thời gian. Nhà Hoa sẽ trao đổi cụ thể; hình ảnh trên trang minh họa
            phong cách.
          </p>
        </div>
        <div className="help-panel">
          <Flower2 size={32} aria-hidden="true" />
          <h3>Bắt đầu một cuộc trò chuyện</h3>
          <p>
            Điền yêu cầu trong biểu mẫu. Nhà Hoa tiếp nhận và phản hồi qua email
            bạn cung cấp.
          </p>
          <ButtonLink to={`/lien-he?dich-vu=${service.slug}`}>
            Nhận tư vấn dịch vụ
          </ButtonLink>
          <Link className="text-link" to="/dich-vu">
            Xem các dịch vụ khác
          </Link>
        </div>
      </section>
    </>
  );
}

export function OrderGuide() {
  return (
    <>
      <PageHeading
        eyebrow="LẦN ĐẦU GHÉ NHÀ?"
        title="Đặt một bó hoa, thật dễ."
        description="Từng bước nhỏ để món quà đến đúng người và mang đúng lời bạn muốn nói."
      />
      <section className="editorial-split wrap section-bottom">
        <img src="/images/pink.jpg" alt="Cành hoa màu hồng trên nền sáng" />
        <div>
          <span className="eyebrow">TRƯỚC KHI CHỌN HOA</span>
          <h2>Một chút chuẩn bị, nhiều phần yên tâm.</h2>
          <p>
            Bạn cần tên, số điện thoại và địa chỉ người nhận; ngày muốn giao;
            một lời nhắn nếu có. Đăng nhập hoặc tạo tài khoản để đặt hàng và
            theo dõi đơn.
          </p>
          <ul className="editorial-list">
            <li>Website đang hỗ trợ thanh toán khi nhận hoa (COD).</li>
            <li>Phí giao 35.000đ; miễn phí với tiền hoa từ 800.000đ.</li>
            <li>
              Ngày giao là ngày mong muốn. Thời gian cụ thể được xác nhận sau
              khi tiếp nhận đơn.
            </li>
          </ul>
          <ButtonLink to="/hoa">Bắt đầu chọn hoa</ButtonLink>
        </div>
      </section>
      <section className="wrap section-bottom">
        <h2>Từ cửa hàng đến tay người nhận</h2>
        <ol className="guide-steps">
          {[
            [
              "Chọn mẫu hoa",
              "Lọc theo kiểu dáng, dịp tặng và khoảng giá. Mở chi tiết để xem thành phần, giá và số lượng còn có thể đặt.",
            ],
            [
              "Kiểm tra giỏ hoa",
              "Thêm số lượng cần mua, xem lại tiền hoa và phí giao. Giỏ được giữ trong trình duyệt để bạn tiếp tục sau.",
            ],
            [
              "Đăng nhập hoặc đăng ký",
              "Nếu chưa đăng nhập, Nhà đưa bạn đến trang tài khoản rồi quay lại thanh toán với giỏ còn nguyên.",
            ],
            [
              "Điền thông tin nhận",
              "Nhập đúng người nhận, điện thoại, địa chỉ, ngày giao và lời thiệp. Kiểm tra kỹ trước khi gửi đơn COD.",
            ],
            [
              "Lưu mã đơn",
              "Trang thành công hiển thị mã đơn. Bạn cũng có thể tìm đơn tại Tài khoản; việc ghi nhận đơn chưa phải xác nhận giờ giao.",
            ],
            [
              "Dõi theo và nhận hoa",
              "Tra cứu bằng tài khoản đã đặt, mã đơn và email. Khi nhận, kiểm tra hoa và liên hệ Nhà nếu cần hỗ trợ.",
            ],
          ].map(([title, text], i) => (
            <li key={title}>
              <span className="step-number">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="wrap section-bottom support-grid">
        <div className="help-panel">
          <Truck aria-hidden="true" />
          <h2>Cần đổi thông tin đơn?</h2>
          <p>
            Gửi mã đơn và nội dung muốn sửa qua Liên hệ càng sớm càng tốt. Nhà
            Hoa kiểm tra tiến độ trước khi xác nhận thay đổi; đơn đang giao hoặc
            đã giao không thể hủy trực tiếp.
          </p>
          <Link className="text-link" to="/chinh-sach/giao-hang">
            Xem giao hàng & đổi trả
          </Link>
        </div>
        <div className="help-panel">
          <ShoppingBag aria-hidden="true" />
          <h2>Tặng hoa bất ngờ?</h2>
          <p>
            COD có thể khiến người nhận phải thanh toán. Hãy trao đổi với Nhà
            trước khi đặt nếu bạn muốn giấu tên hoặc người nhận không phải trả
            tiền.
          </p>
          <Link className="text-link" to="/lien-he">
            Trao đổi với Nhà Hoa
          </Link>
        </div>
      </section>
    </>
  );
}

export function FlowerCare() {
  return (
    <>
      <PageHeading
        eyebrow="CẨM NANG CHĂM HOA"
        title="Giữ hoa, giữ một chút vui."
        description="Dành vài phút mỗi ngày cho bó hoa vừa đến nhà. Mỗi loài có nhịp nở riêng, bạn cứ chăm và quan sát."
      />
      <section className="editorial-split wrap section-bottom">
        <img src="/images/tulip.jpg" alt="Những cành tulip trong bình" />
        <div>
          <Leaf size={32} aria-hidden="true" />
          <h2>Khi hoa vừa đến</h2>
          <p>
            Gỡ bao gói vận chuyển nhẹ nhàng, kiểm tra hoa và chuẩn bị bình sạch.
            Nếu cần giữ kiểu bó, hãy để nguyên phần buộc cành trong lúc sắp xếp.
          </p>
          <ul className="editorial-list">
            <li>Dùng dụng cụ sắc và sạch cắt bớt khoảng 1–2 cm phần gốc.</li>
            <li>Bỏ lá nằm dưới mặt nước rồi cắm vào nước sạch.</li>
            <li>Nếu có gói dưỡng đi kèm, dùng theo hướng dẫn trên bao bì.</li>
          </ul>
        </div>
      </section>
      <section className="wrap section-bottom">
        <h2>Chọn cách chăm theo kiểu hoa</h2>
        <div className="care-grid">
          {[
            [
              "Bó hoa cắm bình",
              "Thay nước hằng ngày, rửa bình khi có cặn và cắt lại gốc khi cần. Loại bỏ cành héo để phần còn lại dễ chăm hơn.",
            ],
            [
              "Giỏ hoa dùng mút cắm",
              "Kiểm tra độ ẩm của mút, thêm nước từ từ để mút đủ ẩm và tránh tràn khỏi giỏ. Hạn chế rút rồi cắm lại nhiều lần vì dễ làm lỏng vị trí cành.",
            ],
            [
              "Bình hoa đã sắp sẵn",
              "Kiểm tra mực nước và giữ bình sạch. Khi thay nước, đỡ các cành nhẹ nhàng để giữ bố cục; không đổ nước lên cánh hoa.",
            ],
            [
              "Hoa cầm tay ngày cưới",
              "Giữ ở nơi mát trước khi sử dụng, hạn chế nắng và nguồn nhiệt. Hỏi cách giữ phần gốc phù hợp với kiểu buộc và chất liệu trang trí của bó hoa.",
            ],
          ].map(([title, text]) => (
            <article className="help-panel" key={title}>
              <Flower2 aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="prose wrap section-bottom">
        <h2>Những điều nên tránh</h2>
        <ul className="editorial-list">
          <li>Nắng trực tiếp, luồng điều hòa mạnh và các nguồn nhiệt.</li>
          <li>Để hoa sát trái cây chín hoặc ngâm lá trong nước lâu ngày.</li>
          <li>
            Tự pha nhiều chất vào nước khi chưa có hướng dẫn cho loại hoa.
          </li>
        </ul>
        <p>
          Độ bền phụ thuộc loài hoa, độ nở khi nhận và môi trường đặt bình. Nhà
          Hoa không áp dụng một số ngày tươi cố định cho mọi mẫu.
        </p>
        <h2>Hoa có vấn đề khi vừa nhận?</h2>
        <p>
          Lưu lại ảnh tình trạng hoa và mã đơn, rồi gửi lời nhắn trong 24 giờ
          qua trang Liên hệ. Biểu mẫu hiện nhận nội dung văn bản; hãy mô tả tình
          trạng trước, Nhà sẽ trao đổi cách tiếp nhận ảnh khi phản hồi.
        </p>
        <ButtonLink to="/lien-he">Nhờ Nhà Hoa hỗ trợ</ButtonLink>
      </section>
    </>
  );
}

export function SupportBanner() {
  return (
    <section className="support-banner wrap section-bottom">
      <div>
        <span className="eyebrow">CHƯA BIẾT BẮT ĐẦU TỪ ĐÂU?</span>
        <h2>Nhà ở đây, cùng bạn chọn hoa.</h2>
        <p>
          Kể cho chúng mình dịp tặng, ngân sách và điều người nhận yêu thích.
        </p>
      </div>
      <ButtonLink to="/lien-he">Nhắn cho Nhà Hoa</ButtonLink>
    </section>
  );
}

export function SiteMap() {
  const groups = [
    {
      title: "Chọn & đặt hoa",
      links: [
        ["/", "Trang chủ"],
        ["/hoa", "Cửa hàng hoa"],
        ["/bo-suu-tap", "Bộ sưu tập"],
        ...collections.map((c) => ["/bo-suu-tap/" + c.slug, c.name]),
        ["/gio-hang", "Giỏ hoa"],
        ["/thanh-toan", "Thanh toán"],
      ],
    },
    {
      title: "Cảm hứng & dịch vụ",
      links: [
        ["/ve-nha-hoa", "Về Nhà Hoa"],
        ["/chuyen-nha-hoa", "Chuyện nhà hoa"],
        ["/cham-soc-hoa", "Chăm sóc hoa"],
        ["/dich-vu", "Dịch vụ"],
        ...services.map((s) => ["/dich-vu/" + s.slug, s.name]),
      ],
    },
    {
      title: "Tài khoản & hỗ trợ",
      links: [
        ["/tai-khoan", "Tài khoản và đơn hàng"],
        ["/yeu-thich", "Hoa yêu thích"],
        ["/tai-khoan/bao-mat", "Bảo mật tài khoản"],
        ["/tra-cuu", "Tra cứu đơn"],
        ["/huong-dan-dat-hang", "Hướng dẫn đặt hàng"],
        ["/cau-hoi", "Câu hỏi thường gặp"],
        ["/lien-he", "Liên hệ"],
        ["/chinh-sach/giao-hang", "Giao hàng & đổi trả"],
        ["/chinh-sach/bao-mat", "Chính sách bảo mật"],
        ["/chinh-sach/dieu-khoan", "Điều khoản mua hàng"],
      ],
    },
  ];
  return (
    <>
      <PageHeading
        eyebrow="MỌI GÓC NHỎ CỦA NHÀ"
        title="Bạn muốn ghé đâu hôm nay?"
        description="Tìm nhanh cửa hàng, nội dung tư vấn và các trang hỗ trợ. Các tính năng riêng sẽ yêu cầu đăng nhập."
      />
      <section className="service-grid wrap section-bottom">
        {groups.map((group) => (
          <div className="help-panel" key={group.title}>
            <h2>{group.title}</h2>
            <ul className="site-links">
              {group.links.map(([to, label]) => (
                <li key={to}>
                  <Link to={to}>
                    {label}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}

export function NotFound() {
  return (
    <>
      <PageHeading
        eyebrow="404 · LẠC MỘT CHÚT THÔI"
        title="Con đường này chưa có hoa."
        description="Đường dẫn có thể đã thay đổi hoặc chưa tồn tại. Bạn vẫn có thể ghé các góc khác của Nhà."
      />
      <section className="not-found-actions wrap section-bottom">
        <ButtonLink to="/hoa">Về cửa hàng hoa</ButtonLink>
        <ButtonLink to="/so-do-trang" outline>
          Xem tất cả các trang
        </ButtonLink>
      </section>
    </>
  );
}
