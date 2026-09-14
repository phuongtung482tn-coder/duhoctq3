import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-student.webp";
import expert1 from "@/assets/expert-1.webp";
import expert2 from "@/assets/expert-2.webp";
import expert3 from "@/assets/expert-3.webp";
import { LeadForm, MAJORS } from "@/components/LeadForm";
import { Reveal } from "@/components/Reveal";
import { ScarcityBar } from "@/components/ScarcityBar";
import { RecentLeadPopup } from "@/components/RecentLeadPopup";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { FooterStats } from "@/components/FooterStats";
import { initBehavior, markFaqClick } from "@/lib/behavior";
import visaImg from "@/assets/gallery-visa.webp";
import campusImg from "@/assets/gallery-campus.webp";
import dormRoomImg from "@/assets/gallery-dorm-room.webp";
import airportImg from "@/assets/gallery-airport.webp";
import { Toaster } from "@/components/ui/sonner";
import { FOOTER } from "@/lib/config";

const TITLE = "Du Học Nghề Trung Quốc 0Đ | Vừa Học Vừa Làm Lương 15-30 Triệu";
const DESC =
  "Du học nghề Trung Quốc học phí 0Đ: học 20% lý thuyết - 80% thực hành, lương cứng 15-30 triệu/tháng, bằng Cao đẳng chính quy quốc tế. Đăng ký nhận lộ trình miễn phí.";

const FAQS = [
  {
    slug: "hoc_phi",
    q: "Du học nghề Trung Quốc học phí 0Đ có thật không?",
    a: "Có. Học phí được doanh nghiệp Trung Quốc tài trợ theo chương trình liên kết đào tạo nhân lực. Học viên chỉ cần chuẩn bị chi phí hồ sơ, vé máy bay và sinh hoạt ban đầu; phần này được tư vấn minh bạch trước khi đăng ký.",
  },
  {
    slug: "tieng_trung",
    q: "Điều kiện tham gia gồm những gì?",
    a: "Tốt nghiệp THPT (hoặc tương đương), độ tuổi 18-28, sức khỏe tốt. Không cần chứng minh tài chính và không yêu cầu biết tiếng Hán trước — học viên được đào tạo tiếng Hán nền tảng trước khi bay.",
  },
  {
    slug: "luong_thuc_tap",
    q: "Vừa học vừa làm thì lương bao nhiêu và có đủ sống không?",
    a: "Thu nhập thực tập tại doanh nghiệp đối tác thường 15-30 triệu đồng/tháng tùy ngành và ca làm. Mức này đủ trang trải sinh hoạt, ký túc xá và còn dư gửi về gia đình.",
  },
  {
    slug: "bang_cap",
    q: "Bằng tốt nghiệp có được công nhận không?",
    a: "Học viên nhận bằng Cao đẳng chính quy của trường tại Trung Quốc, được công nhận quốc tế, có thể ở lại làm việc, học liên thông lên Đại học hoặc về Việt Nam làm cho doanh nghiệp FDI.",
  },
  {
    slug: "thoi_gian",
    q: "Thời gian nhập học và quy trình mất bao lâu?",
    a: "Có hai kỳ nhập học mỗi năm: tháng 3 và tháng 9. Từ lúc đăng ký tới khi bay thường 3-5 tháng, gồm xét hồ sơ, học tiếng Hán và làm thủ tục visa.",
  },
  {
    slug: "nganh_hoc",
    q: "Ngành nào đang cần nhiều nhân lực nhất?",
    a: "Công nghệ ô tô điện, công nghệ drone (UAV), IoT và logistics là các ngành tuyển nhiều nhất, đồng thời có mức lương thực tập cao nhất trong 8 ngành của chương trình.",
  },
];

const FAQ_JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    scripts: [{ type: "application/ld+json", children: FAQ_JSONLD }],
  }),
  component: Landing,
});

const BENEFITS = [
  {
    stat: "0Đ",
    title: "Học phí bằng 0",
    text: "Doanh nghiệp Trung Quốc tài trợ toàn bộ học phí theo chương trình liên kết đào tạo nhân lực.",
  },
  {
    stat: "80%",
    title: "80% thực hành",
    text: "Chỉ 20% lý thuyết. Bạn làm việc trực tiếp trên dây chuyền, máy móc và công nghệ mới nhất.",
  },
  {
    stat: "15-30tr",
    title: "Lương cứng mỗi tháng",
    text: "Vừa học vừa làm, thu nhập 15-30 triệu/tháng, đủ chi phí sinh hoạt và gửi về gia đình.",
  },
  {
    stat: "Bằng",
    title: "Cao đẳng chính quy quốc tế",
    text: "Bằng Cao đẳng chính quy được công nhận quốc tế, mở đường ở lại làm việc hoặc học tiếp.",
  },
];

const MAJOR_ICONS = ["🚗", "🛸", "🛒", "🚚", "🔌", "📡", "⚙️", "🀄"];

const MAJOR_FUTURES = [
  "Đón đầu xu hướng điện hóa giao thông, pin thế hệ mới và hệ sinh thái xe thông minh.",
  "Phát triển cùng nhu cầu UAV trong nông nghiệp, vận chuyển, khảo sát và cứu hộ.",
  "Mở rộng theo thương mại xuyên biên giới, bán hàng đa kênh và vận hành bằng dữ liệu.",
  "Giữ vai trò cốt lõi khi chuỗi cung ứng khu vực ngày càng tự động hóa và kết nối sâu.",
  "Là nền tảng cho thiết bị thông minh, năng lượng sạch, robot và sản xuất công nghệ cao.",
  "Kết nối nhà máy, đô thị và thiết bị thông minh trong nền kinh tế số tương lai.",
  "Thúc đẩy nhà máy thông minh, robot cộng tác và dây chuyền sản xuất ít phụ thuộc lao động tay chân.",
  "Tạo lợi thế trong thương mại, dịch vụ và hợp tác doanh nghiệp Việt Nam – Trung Quốc.",
];

const PAINS = [
  "Làm công nhân 10-12 tiếng/ngày, lương không tăng, tay nghề không lên.",
  "Không có bằng cấp quốc tế nên mãi không thoát khỏi vị trí lao động phổ thông.",
  "Muốn đi nước ngoài nhưng sợ chi phí hàng trăm triệu và rủi ro môi giới.",
];

const STEPS = [
  {
    n: "01",
    t: "Đăng ký & tư vấn 1:1",
    d: "Điền form, chuyên viên gọi lại trong 30 phút, gửi lộ trình chi tiết.",
  },
  {
    n: "02",
    t: "Chọn ngành & xét hồ sơ",
    d: "Chọn 1 trong 8 ngành hot, hoàn thiện hồ sơ theo hướng dẫn từng bước.",
  },
  {
    n: "03",
    t: "Học tiếng Hán & định hướng",
    d: "Đào tạo tiếng Hán nền tảng và kỹ năng trước khi bay.",
  },
  {
    n: "04",
    t: "Nhập học & bắt đầu kiếm tiền",
    d: "Sang trường đối tác, học nghề và làm việc có lương ngay từ kỳ đầu.",
  },
];

const GALLERY = [
  { img: visaImg, caption: "Visa du học sinh đã được cấp cho học viên khóa gần nhất" },
  { img: campusImg, caption: "Khuôn viên trường Cao đẳng nghề đối tác tại Trung Quốc" },
  { img: dormRoomImg, caption: "Phòng ký túc xá trong trường — miễn 100% phí ở" },
  { img: airportImg, caption: "Học viên lên đường nhập học kỳ tháng 9" },
];

const EXPERTS = [
  {
    img: expert1,
    name: "Ths. Nguyễn Thu Hương",
    role: "Chuyên gia định hướng ngành học",
    bio: "Tập trung đánh giá năng lực, sở thích và mục tiêu dài hạn để giúp học viên chọn ngành phù hợp.",
    experience:
      "Kinh nghiệm tư vấn lộ trình học nghề quốc tế và định hướng nghề nghiệp sau tốt nghiệp.",
  },
  {
    img: expert2,
    name: "Ông Lê Quang Vinh",
    role: "Chuyên gia hồ sơ & tuyển sinh",
    bio: "Đồng hành cùng học viên từ bước rà soát điều kiện đến hoàn thiện hồ sơ nhập học và visa.",
    experience:
      "Kinh nghiệm xử lý hồ sơ tuyển sinh, thủ tục du học và chuẩn bị trước khi xuất cảnh.",
  },
  {
    img: expert3,
    name: "Cô Phạm Minh Anh",
    role: "Chuyên gia đồng hành học viên",
    bio: "Hỗ trợ học viên chuẩn bị ngôn ngữ, kỹ năng thích nghi và kế hoạch học tập tại Trung Quốc.",
    experience:
      "Kinh nghiệm đào tạo kỹ năng tiền du học và hỗ trợ học viên trong quá trình hòa nhập.",
  },
];

const STATS = [
  { v: "100%", l: "Học viên có việc làm khi thực tập" },
  { v: "15-30tr", l: "Thu nhập mỗi tháng khi vừa học vừa làm" },
  { v: "8", l: "Ngành công nghệ đang khát nhân lực" },
  { v: "0Đ", l: "Học phí trong toàn bộ khóa học" },
];

const TESTIMONIALS = [
  {
    name: "Nguyễn Văn Hùng",
    meta: "Ngành Ô tô điện · Quảng Châu · khóa tháng 9",
    text: "Trước em làm xưởng gỗ 7 triệu/tháng. Sang đây vừa học vừa làm được hơn 20 triệu, tháng nào cũng gửi về nhà 10 triệu. Tay nghề lên hẳn vì được làm trên xe thật.",
  },
  {
    name: "Trần Thị Ngọc",
    meta: "Ngành Thương mại điện tử · Nghĩa Ô",
    text: "Em không biết tiếng Hán, được học nền tảng trước khi bay nên sang không bị choáng. Giờ em phụ trách livestream cho một shop, thu nhập ổn định.",
  },
  {
    name: "Lê Đình Phúc",
    meta: "Ngành Drone (UAV) · Thâm Quyến",
    text: "Nhà em không đủ tiền cho đi du học tự túc. Chương trình 0Đ giúp em học ngành công nghệ mà chi phí ban đầu rất nhẹ. Ra trường có bằng Cao đẳng chính quy.",
  },
];

function Landing() {
  useEffect(() => initBehavior(), []);

  const hotlineHref = FOOTER.hotline ? `tel:${FOOTER.hotline.replace(/\s+/g, "")}` : "#dang-ky";
  const zaloHref =
    FOOTER.zalo ||
    (FOOTER.hotline ? `https://zalo.me/${FOOTER.hotline.replace(/\D/g, "")}` : "#dang-ky");
  const zaloExternal = Boolean(FOOTER.zalo || FOOTER.hotline);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-sm font-extrabold leading-tight sm:text-base">
            Trung tâm Hướng nghiệp &amp;
            <br className="sm:hidden" /> Phát triển Sự nghiệp Quốc tế
          </span>
          <a
            href="#dang-ky"
            className="hidden rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-cta)] transition hover:-translate-y-0.5 hover:brightness-110 sm:inline-block"
          >
            Nhận lộ trình 0Đ
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="surface-panel relative overflow-hidden">
        <img
          src={heroImg}
          alt="Học viên Việt Nam thực hành lắp ráp ô tô điện tại trung tâm đào tạo nghề Trung Quốc"
          width={1600}
          height={1104}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div className="text-surface-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-gold-foreground">
              Tuyển sinh kỳ tháng 3 &amp; tháng 9
            </span>
            <h1 className="mt-6 text-3xl font-black leading-[1.12] sm:text-4xl lg:text-[3.25rem]">
              5 năm nữa bạn vẫn muốn đứng ở vị trí{" "}
              <span className="text-hero-gradient">công nhân lặp đi lặp lại?</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-surface-foreground/85 sm:text-lg">
              Du học nghề Trung Quốc: <strong>học phí 0Đ</strong>, vừa học vừa làm{" "}
              <strong>lương 15-30 triệu/tháng</strong>, ra trường có{" "}
              <strong>bằng Cao đẳng chính quy quốc tế</strong> và tay nghề công nghệ cao.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#dang-ky"
                className="cta-pulse rounded-xl bg-primary px-7 py-4 text-center text-base font-extrabold uppercase tracking-wide text-primary-foreground sm:text-lg"
              >
                Đăng ký nhận lộ trình 0Đ
              </a>
              <span className="text-center text-sm text-surface-foreground/70 sm:text-left">
                Chỉ còn <strong className="text-gold">5</strong> suất học bổng 0Đ trong tháng
              </span>
            </div>
            <ul className="mt-9 grid gap-2.5 text-sm text-surface-foreground/80 sm:grid-cols-2">
              <li>✓ Không chứng minh tài chính</li>
              <li>✓ Không cần tiếng Hán trước</li>
              <li>✓ Xét hồ sơ tốt nghiệp THPT</li>
              <li>✓ Hỗ trợ trọn gói tới khi nhập học</li>
            </ul>
          </div>
          <div className="space-y-3 lg:pl-4">
            <ScarcityBar tone="dark" />
            <LeadForm />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-muted/50 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.l} delay={i * 80}>
              <div className="glass-card h-full rounded-2xl p-5 text-center">
                <p className="text-2xl font-black text-primary sm:text-3xl">{s.v}</p>
                <p className="mt-2 text-xs font-semibold leading-snug text-muted-foreground sm:text-sm">
                  {s.l}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pain */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="max-w-2xl text-2xl font-extrabold sm:text-3xl lg:text-4xl">
          Nếu bạn đang gặp một trong ba điều này, bạn cần đọc tiếp
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {PAINS.map((p, i) => (
            <Reveal key={p} delay={i * 100}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
                <span className="text-lg font-black text-primary">!</span>
                <p className="mt-2 text-card-foreground/85">{p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section data-section="luong_thuc_tap" className="bg-muted/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">
            4 lợi ích vàng của chương trình
          </h2>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 90}>
                <div className="glass-card h-full rounded-2xl p-6 transition hover:-translate-y-1">
                  <p className="text-3xl font-black text-primary">{b.stat}</p>
                  <h3 className="mt-3 text-lg font-bold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Majors */}
      <section data-section="nganh_hoc" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">
          8 ngành nghề phát triển trong 5-20 năm tới
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Các lựa chọn bám sát chuyển dịch công nghệ, sản xuất và thương mại giữa Việt Nam – Trung
          Quốc.
        </p>
        <div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {MAJORS.map((m, i) => (
            <Reveal key={m} delay={(i % 4) * 80}>
              <div className="h-full rounded-2xl border border-border bg-card p-5 transition duration-300 hover:-translate-y-1.5 hover:border-primary hover:shadow-[var(--shadow-card)]">
                <span className="text-2xl">{MAJOR_ICONS[i]}</span>
                <h3 className="mt-3 text-base font-bold leading-snug">{m}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {MAJOR_FUTURES[i]}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Experts */}
      <section className="bg-muted/50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">
            Đội ngũ chuyên gia tư vấn
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Đồng hành từ lúc chọn ngành, chuẩn bị hồ sơ đến khi học viên sẵn sàng nhập học.
          </p>
          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            {EXPERTS.map((e, i) => (
              <Reveal key={e.name} delay={i * 90}>
                <article className="glass-card flex h-full flex-col rounded-2xl p-6">
                  <img
                    src={e.img}
                    alt={`${e.name} — ${e.role}`}
                    width={640}
                    height={640}
                    loading="lazy"
                    decoding="async"
                    className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-border"
                  />
                  <h3 className="mt-4 text-base font-bold leading-snug">{e.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-primary">{e.role}</p>
                  <p className="mt-4 text-sm leading-relaxed text-card-foreground/85">{e.bio}</p>
                  <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                    {e.experience}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery carousel */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
        <h2 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">
          Hình ảnh thực tế: visa, trường học &amp; ký túc xá
        </h2>
        <p className="mt-3 text-muted-foreground">
          Ảnh từ các khóa học viên đã bay và trường đối tác tại Trung Quốc.
        </p>
        <Reveal>
          <div className="mt-8">
            <PhotoCarousel slides={GALLERY} />
          </div>
        </Reveal>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">
          Học viên đi trước nói gì
        </h2>
        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <blockquote className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1">
                <p className="text-gold" aria-hidden="true">
                  ★★★★★
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-card-foreground/90">
                  “{t.text}”
                </p>
                <footer className="mt-4 border-t border-border pt-3">
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.meta}</p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="surface-panel py-16 text-surface-foreground sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">
            Lộ trình 4 bước đơn giản
          </h2>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="glass-card-dark h-full rounded-2xl p-5">
                  <p className="text-2xl font-black text-gold">{s.n}</p>
                  <h3 className="mt-2 text-base font-bold">{s.t}</h3>
                  <p className="mt-1.5 text-sm text-surface-foreground/75">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl lg:text-4xl">
          Câu hỏi thường gặp
        </h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              onToggle={(e) => {
                if ((e.currentTarget as HTMLDetailsElement).open) markFaqClick(f.slug);
              }}
              className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/50"
            >
              <summary className="cursor-pointer list-none text-base font-bold leading-snug marker:hidden">
                <span className="mr-2 text-primary">?</span>
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-muted/60 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl lg:text-4xl">
            Đổi 30 giây hôm nay cho 5 năm tới của bạn
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            Nhận lộ trình chi tiết, danh sách trường và mức lương thực tế theo từng ngành — hoàn
            toàn 0Đ.
          </p>
          <div className="mt-8 space-y-3">
            <ScarcityBar />
            <LeadForm id="dang-ky-cuoi" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto mb-10 max-w-6xl px-4">
          <FooterStats />
        </div>
        <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground">
          <p className="font-bold text-foreground">
            Trung tâm Hướng nghiệp &amp; Phát triển Sự nghiệp Quốc tế
          </p>
          {(FOOTER.hotline || FOOTER.email) && (
            <p className="mt-2">
              {FOOTER.hotline && (
                <>
                  Hotline tư vấn:{" "}
                  <a className="font-semibold text-foreground" href={hotlineHref}>
                    {FOOTER.hotline}
                  </a>
                </>
              )}
              {FOOTER.hotline && FOOTER.email && " · "}
              {FOOTER.email && (
                <>
                  Email:{" "}
                  <a className="font-semibold text-foreground" href={`mailto:${FOOTER.email}`}>
                    {FOOTER.email}
                  </a>
                </>
              )}
            </p>
          )}
          <p className="mt-4 text-xs leading-relaxed">
            Đơn vị bảo trợ chuyên môn &amp; tuyển sinh: {FOOTER.sponsor}
            {FOOTER.address ? ` — ${FOOTER.address}` : ""}
            {FOOTER.licenseNumber ? ` · Giấy phép hoạt động số ${FOOTER.licenseNumber}` : ""}.
            Chương trình liên kết đào tạo với các trường Cao đẳng nghề và doanh nghiệp tại Trung
            Quốc.
          </p>
          <p className="mt-4 text-xs">© {new Date().getFullYear()} Bản quyền thuộc Trung tâm.</p>
        </div>
      </footer>

      <RecentLeadPopup />

      {/* Floating hotline button */}
      <div className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6">
        <a
          href={hotlineHref}
          aria-label="Gọi hotline tư vấn"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-cta)] transition hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3.5a1 1 0 0 1 1-1H7.5a1 1 0 0 1 1 1c0 1.24.2 2.44.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
          </svg>
        </a>
      </div>

      {/* Mobile sticky CTA (2 nút, hiện sau khi cuộn qua hero) */}
      <StickyMobileCTA zaloHref={zaloHref} zaloExternal={zaloExternal} />
      <div className="h-20 sm:hidden" />
    </div>
  );
}
