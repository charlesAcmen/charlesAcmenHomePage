'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, Languages, Radio, Terminal } from 'lucide-react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { content, type Locale } from './site-data';

const GITHUB_URL = 'https://github.com/charlesAcmen';
const XIAOHONGSHU_URL =
  'https://www.xiaohongshu.com/user/profile/60b9ea030000000001006c68';

export default function Home() {
  const [locale, setLocale] = useState<Locale>('zh');
  const heroRef = useRef<HTMLElement>(null);
  const copy = content[locale];

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  }, [locale]);

  useEffect(() => {
    if (!heroRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      duration: 1.1,
      lerp: 0.08,
      smoothWheel: true,
      touchMultiplier: 1.1,
    });
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const hero = heroRef.current;
    const scenes = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-scene]'));
    const context = gsap.context(() => {
      gsap.set(scenes.slice(1), { autoAlpha: 0, yPercent: 16 });
      gsap
        .timeline({
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        })
        .to(scenes[0], { autoAlpha: 0, yPercent: -18, duration: 1 }, 0.9)
        .to(scenes[1], { autoAlpha: 1, yPercent: 0, duration: 1 }, 1)
        .to(scenes[1], { autoAlpha: 0, yPercent: -18, duration: 1 }, 2.3)
        .to(scenes[2], { autoAlpha: 1, yPercent: 0, duration: 1 }, 2.4);

      gsap.to('[data-orbit]', {
        rotate: 360,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.7 },
      });
      gsap.to('[data-sun]', {
        yPercent: -18,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.7 },
      });
    }, hero);

    return () => {
      context.revert();
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="site-shell">
      <a className="skip-link" href="#work">{copy.skipToWork}</a>
      <header className="site-nav">
        <a className="wordmark" href="#top" aria-label="CharlesAcmen home">
          <span aria-hidden="true">CA</span><span>CharlesAcmen</span>
        </a>
        <nav aria-label={copy.primaryNavigation} className="nav-links">
          <a href="#about">{copy.nav.about}</a><a href="#work">{copy.nav.work}</a><a href="#links">{copy.nav.links}</a>
        </nav>
        <button className="language-toggle" type="button" onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')} aria-label={copy.languageToggle}>
          <Languages size={16} strokeWidth={2.2} aria-hidden="true" /><span>{locale === 'zh' ? 'EN' : '中'}</span>
        </button>
      </header>

      <section className="hero" id="top" ref={heroRef} aria-label={copy.heroLabel}>
        <div className="hero-stage">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-glow glow-one" aria-hidden="true" /><div className="hero-glow glow-two" aria-hidden="true" />
          <div className="horizon" aria-hidden="true" />
          <div className="sun-disc" data-sun aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <span key={index} />)}</div>
          <div className="orbit orbit-one" data-orbit aria-hidden="true" /><div className="orbit orbit-two" data-orbit aria-hidden="true" />
          <div className="hero-index hero-index-left" aria-hidden="true"><span>01</span><i /><span>26</span></div>
          <div className="hero-index hero-index-right" aria-hidden="true"><span>CN / EN</span><i /><span>ONLINE</span></div>

          <div className="hero-scenes">
            <div className="hero-scene hero-scene-primary" data-hero-scene>
              <p className="eyebrow">{copy.hero.eyebrow}</p>
              <h1><span>CHARLES</span><strong>ACMEN</strong></h1>
              <p className="hero-statement">{copy.hero.statement}</p>
              <div className="hero-actions">
                <SocialLink href={GITHUB_URL} label="GitHub" icon={<Terminal size={18} />} />
                <SocialLink href={XIAOHONGSHU_URL} label={copy.xiaohongshu} icon={<Radio size={18} />} />
              </div>
            </div>
            <div className="hero-scene hero-scene-note" data-hero-scene>
              <p className="eyebrow">{copy.hero.sceneTwoKicker}</p><p className="scene-display">{copy.hero.sceneTwo}</p><span className="scene-number">02</span>
            </div>
            <div className="hero-scene hero-scene-note" data-hero-scene>
              <p className="eyebrow">{copy.hero.sceneThreeKicker}</p><p className="scene-display">{copy.hero.sceneThree}</p>
              <a className="scene-link" href="#work">{copy.hero.exploreWork}<ArrowDown size={18} aria-hidden="true" /></a><span className="scene-number">03</span>
            </div>
          </div>
          <a className="scroll-cue" href="#about"><span>{copy.scrollCue}</span><ArrowDown size={16} aria-hidden="true" /></a>
        </div>
      </section>

      <section className="about-section" id="about" aria-labelledby="about-title">
        <div className="section-kicker">01 / {copy.nav.about}</div>
        <div className="about-layout"><h2 id="about-title">{copy.about.title}</h2><div className="about-copy"><p>{copy.about.body}</p><p className="about-signoff">{copy.about.signoff}</p></div></div>
      </section>

      <section className="work-section" id="work" aria-labelledby="work-title">
        <div className="work-heading"><div><span className="section-kicker">02 / {copy.nav.work}</span><h2 id="work-title">{copy.work.title}</h2></div><p>{copy.work.intro}</p></div>
        <div className="project-list">
          {copy.projects.map((project) => (
            <a className={`project-card project-card-${project.index}`} href={project.href} key={project.slug} target="_blank" rel="noreferrer" aria-label={`${project.title} — ${copy.openOnGithub}`}>
              <span className="project-ordinal">0{project.index}</span>
              <div className="project-main"><p className="project-kind">{project.kind}</p><h3>{project.title}</h3><p className="project-description">{project.description}</p>
                <ul className="tag-list" aria-label={copy.technologyStack}>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div className="project-meta">
                {project.metric && <p className="project-metric"><strong>{project.metric}</strong><span>{project.metricNote}</span></p>}
                <span className="project-link">{copy.openOnGithub}<ArrowUpRight size={20} aria-hidden="true" /></span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="closing-section" id="links" aria-labelledby="links-title">
        <div className="closing-sun" aria-hidden="true" /><span className="section-kicker">03 / {copy.nav.links}</span><h2 id="links-title">{copy.closing.title}</h2><p>{copy.closing.body}</p>
        <div className="closing-links"><SocialLink href={GITHUB_URL} label="GitHub" icon={<Terminal size={19} />} /><SocialLink href={XIAOHONGSHU_URL} label={copy.xiaohongshu} icon={<Radio size={19} />} /></div>
      </section>
      <footer className="site-footer"><span>© {new Date().getFullYear()} CharlesAcmen</span><span>{copy.footer}</span></footer>
    </main>
  );
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return <a className="social-link" href={href} target="_blank" rel="noreferrer">{icon}<span>{label}</span><ArrowUpRight size={15} aria-hidden="true" /></a>;
}
