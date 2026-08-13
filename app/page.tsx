import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CheckCircle2,
  GraduationCap,
  Route,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Career Assistant",
    text: "Context-aware guidance based on each learner's education, skills, projects and career goals.",
  },
  {
    icon: Target,
    title: "Skill Gap Intelligence",
    text: "Discover strong, developing and missing skills for the learner's target career role.",
  },
  {
    icon: Route,
    title: "Personalized Roadmaps",
    text: "Turn skill gaps into a practical step-by-step learning, project and career preparation plan.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Opportunity Matching",
    text: "Recommend relevant projects and internships with transparent match reasons.",
  },
];

const roadmap = [
  { label: "Python", status: "Strong", state: "complete" },
  { label: "SQL", status: "Strong", state: "complete" },
  { label: "Excel", status: "Developing", state: "progress" },
  { label: "Power BI", status: "Missing", state: "missing" },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <video
          aria-hidden="true"
          className="landing-hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source
            src="/videos/landing-career-intelligence-background.mp4"
            type="video/mp4"
          />
        </video>

        <div
          aria-hidden="true"
          className="landing-hero-video-overlay"
        />

        <div className="grid-glow" />
        <div className="orb orb-one" />
        <div className="orb orb-two" />

        <nav className="navbar container">
          <a className="brand" href="#">
            <span className="brand-mark">
              <GraduationCap size={22} />
            </span>
            <span>
              Career<span className="brand-accent">Intel</span>
            </span>
          </a>

          <div className="nav-links">
            <a href="#features">Platform</a>
            <a href="#intelligence">Intelligence</a>
            <a href="#roadmap">Roadmap</a>
            <a href="#about">About</a>
          </div>

          <div className="nav-actions">
            <Link className="text-btn" href="/register">
              Sign in
            </Link>
            <Link className="nav-cta" href="/register">
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>

        <div className="hero-content container">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={15} />
              AI-POWERED LEARNER INTELLIGENCE
            </div>

            <h1>
              Turn every learner into a
              <span> career-ready candidate.</span>
            </h1>

            <p className="hero-description">
              One intelligent platform that understands each learner, detects
              skill gaps, builds personalized career roadmaps and connects
              learning progress with real opportunities.
            </p>

            <div className="hero-actions">
              <Link className="primary-btn" href="/register">
                Build My Career Roadmap
                <ArrowRight size={18} />
              </Link>
              <Link className="secondary-btn" href="/register">
                <BrainCircuit size={18} />
                Explore Intelligence
              </Link>
            </div>

            <div className="hero-proof">
              <div className="proof-item">
                <CheckCircle2 size={17} />
                Personalized AI
              </div>
              <div className="proof-item">
                <CheckCircle2 size={17} />
                Skill Gap Analysis
              </div>
              <div className="proof-item">
                <CheckCircle2 size={17} />
                Career Readiness
              </div>
            </div>
          </div>

          <div className="intelligence-shell" id="intelligence">
            <div className="floating-chip chip-one">
              <Sparkles size={15} />
              AI analyzing profile
            </div>

            <div className="floating-chip chip-two">
              <BriefcaseBusiness size={15} />
              86% opportunity match
            </div>

            <div className="dashboard-card">
              <div className="dashboard-top">
                <div>
                  <p className="mini-label">CAREER INTELLIGENCE</p>
                  <h3>Data Analyst</h3>
                </div>
                <div className="live-pill">
                  <span />
                  LIVE
                </div>
              </div>

              <div className="readiness-block">
                <div className="score-ring">
                  <div className="score-ring-inner">
                    <strong>68%</strong>
                    <span>Ready</span>
                  </div>
                </div>

                <div className="readiness-copy">
                  <span>Career readiness</span>
                  <strong>You're making strong progress.</strong>
                  <p>Complete two priority skills to reach the next level.</p>
                </div>
              </div>

              <div className="skill-list">
                {roadmap.map((skill) => (
                  <div className="skill-row" key={skill.label}>
                    <div className="skill-left">
                      <span className={`skill-dot ${skill.state}`} />
                      <span>{skill.label}</span>
                    </div>
                    <span className={`skill-status ${skill.state}`}>
                      {skill.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="ai-insight">
                <div className="insight-icon">
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <span>AI NEXT BEST ACTION</span>
                  <p>
                    Start Power BI fundamentals and build one analytics
                    dashboard project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="metrics container">
          <div className="metric">
            <strong>360°</strong>
            <span>Learner Intelligence</span>
          </div>
          <div className="metric-divider" />
          <div className="metric">
            <strong>AI</strong>
            <span>Personalized Guidance</span>
          </div>
          <div className="metric-divider" />
          <div className="metric">
            <strong>Live</strong>
            <span>Progress Tracking</span>
          </div>
          <div className="metric-divider" />
          <div className="metric">
            <strong>1?1</strong>
            <span>Career Roadmaps</span>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading container">
          <div>
            <p className="section-kicker">INTELLIGENCE THAT TAKES ACTION</p>
            <h2>
              More than advice.
              <span> A complete career intelligence system.</span>
            </h2>
          </div>

          <p>
            Every module works together to understand the learner, recommend
            the right next action and measure meaningful progress.
          </p>
        </div>

        <div className="feature-grid container">
          {features.map(({ icon: Icon, title, text }, index) => (
            <article className="feature-card" key={title}>
              <div className="feature-number">0{index + 1}</div>
              <div className="feature-icon">
                <Icon size={21} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link className="feature-link" href="/register">
                Explore module
                <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="career-flow-section" id="roadmap">
        <div className="career-flow container">
          <div className="flow-copy">
            <p className="section-kicker">ONE CONNECTED JOURNEY</p>
            <h2>
              From learner profile
              <span> to career outcome.</span>
            </h2>
            <p>
              Intelligence follows the learner continuously instead of giving
              the same static guidance to everyone.
            </p>

            <div className="flow-points">
              <div>
                <Users size={18} />
                Learner Profile
              </div>
              <div>
                <BrainCircuit size={18} />
                AI Analysis
              </div>
              <div>
                <Target size={18} />
                Skill Gap
              </div>
              <div>
                <Route size={18} />
                Personalized Roadmap
              </div>
              <div>
                <ChartNoAxesCombined size={18} />
                Progress Intelligence
              </div>
            </div>
          </div>

          <div className="flow-panel">
            <span className="panel-caption">LIVE INTELLIGENCE FLOW</span>

            <div className="flow-line">
              <div className="flow-node active">01</div>
              <div>
                <span>Profile understood</span>
                <strong>Python + SQL + Data interest</strong>
              </div>
            </div>

            <div className="flow-line">
              <div className="flow-node">02</div>
              <div>
                <span>Gap detected</span>
                <strong>Power BI + Statistics</strong>
              </div>
            </div>

            <div className="flow-line">
              <div className="flow-node">03</div>
              <div>
                <span>Action generated</span>
                <strong>6-week personalized roadmap</strong>
              </div>
            </div>

            <div className="flow-line">
              <div className="flow-node">04</div>
              <div>
                <span>Outcome improved</span>
                <strong>68% ? 84% job readiness</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
