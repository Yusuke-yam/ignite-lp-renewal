const heroBadges = [
  {
    icon: <BrainIcon />,
    lines: ["認知科学×AIで", "すべての人が", "成果を出せる"]
  },
  {
    icon: <CrownIcon />,
    lines: ["認定プロコーチと", "AIコンサルタントが", "伴走するので", "必ず結果が出る"]
  },
  {
    icon: <ChartIcon />,
    lines: ["必ず収益化するまで伴走"]
  }
];

const cases = [
  {
    id: "case-1",
    title: "Before/After 例1",
    src: "/assets/case-1-revenue-fixed.png",
    alt: "Before After 例1 AIで理想の働き方と初めての収益を実現"
  },
  {
    id: "case-2",
    title: "Before/After 例2",
    src: "/assets/case-2-revenue-fixed.png",
    alt: "Before After 例2 AIを教育する立場になり収益化する事例"
  }
];

export default function Home() {
  return (
    <main className="pageShell" aria-label="IgnAIte LP">
      <div className="lpCanvas">
        <section id="hero" className="heroSection">
          <div className="heroCopy">
            <img className="brandLogo" src="/assets/logo.png" width={409} height={122} alt="IgnAIte" />
            <h1 className="heroTitle">
              <span>生きたい生き方を</span>
              <span>
                実現しよう、<em>AI</em>で
              </span>
            </h1>
            <p className="heroLead">
              認知科学プロコーチ（認定率1桁台）と
              <br />
              AIコンサルタントがあなたの人生に伴走します
            </p>
            <div className="badgeGrid" aria-label="IgnAIteの特徴">
              {heroBadges.map((badge) => (
                <article className="medalBadge" key={badge.lines.join("")}>
                  <span className="medalIcon" aria-hidden="true">
                    {badge.icon}
                  </span>
                  <p>
                    {badge.lines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div className="heroImagePanel" aria-hidden="true">
            <img src="/assets/hero-resort.png" width={1122} height={1402} alt="" draggable={false} />
          </div>
        </section>

        <section className="caseStack" aria-label="Before After 事例">
          {cases.map((item) => (
            <section id={item.id} className="caseSection" key={item.id}>
              <h2 className="caseTitle">{item.title}</h2>
              <div className="caseVisual">
                <img className="caseImage" src={item.src} alt={item.alt} draggable={false} />
              </div>
            </section>
          ))}
          <div className="mobileCaseCta">
            <p className="ctaCatch mobileCaseCtaCatch">
              <span />
              コーチング×AIで、人生の可能性を広げましょう
              <span />
            </p>
            <DiagnosisCta compact />
            <div className="ctaFooter mobileCaseCtaFooter">
              <p>コーチング・AIのプロが、あなたの未来に伴走します</p>
            </div>
          </div>
        </section>

        <section id="diagnosis" className="finalCtaSection desktopFinalCta">
          <p className="ctaCatch">
            <span />
            コーチング×AIで、人生の可能性を広げましょう
            <span />
          </p>
          <DiagnosisCta />
          <div className="ctaFooter">
            <p>コーチング・AIのプロが、あなたの未来に伴走します</p>
          </div>
        </section>
        <div className="mobileCaseCta mobileCaseCtaBottom">
          <p className="ctaCatch mobileCaseCtaCatch">
            <span />
            コーチング×AIで、人生の可能性を広げましょう
            <span />
          </p>
          <DiagnosisCta compact />
          <div className="ctaFooter mobileCaseCtaFooter">
            <p>コーチング・AIのプロが、あなたの未来に伴走します</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function DiagnosisCta({ compact = false }: { compact?: boolean }) {
  return (
    <a
      className={`ctaButton ctaHitArea${compact ? " compactCtaButton" : ""}`}
      href="https://lin.ee/vQSfqnp"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="無料のAI活用適性診断を始める"
    >
      <ClipboardIcon />
      <strong>
        <span>まずは無料の</span>
        <span>AI活用適性診断をやってみる</span>
      </strong>
      <span className="timeBadge">
        所要時間
        <b>1分</b>
      </span>
    </a>
  );
}

function BrainIcon() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="脳">
      <path d="M22 47c-7 0-13-5-13-12 0-5 3-10 8-12 0-7 7-12 14-10 4-4 10-4 14 0 7-1 13 4 13 11 4 2 7 6 7 11 0 7-6 12-13 12" />
      <path d="M31 13v38M22 27c6 0 9 4 9 9M43 27c-6 0-9 4-9 9M18 36c5 0 8 4 8 9M47 36c-5 0-8 4-8 9" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="王冠">
      <path d="m11 25 13 12 8-20 8 20 13-12-5 26H16L11 25Z" />
      <path d="M18 54h28" />
      <circle cx="11" cy="23" r="3" />
      <circle cx="32" cy="15" r="3" />
      <circle cx="53" cy="23" r="3" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="上昇グラフ">
      <path d="M12 52h41M17 45V33h8v12M30 45V24h8v21M43 45V16h8v29" />
      <path d="m14 27 12-10 10 7L52 10" />
      <path d="M47 10h5v5" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="clipboardIcon" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M22 12h20v8H22z" />
      <path d="M18 16H10v42h33V47" />
      <path d="M46 24h8v14" />
      <path d="M19 30h20M19 40h17M19 50h12" />
      <path d="m39 47 7 7 12-18" />
    </svg>
  );
}
