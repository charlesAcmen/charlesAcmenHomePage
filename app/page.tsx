'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { content } from './site-data';

const CoastScene = dynamic(() => import('./coast-scene'), {
  ssr: false,
  loading: () => <div className="scene-loading" aria-label="正在绘制海岸"><span />正在绘制海岸…</div>,
});

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const copy = content.zh;

  return (
    <main className="coast-page">
      <CoastScene />
      <header className="coast-header">
        <a className="coast-wordmark" href="#coast" aria-label="CharlesAcmen 首页">
          <span>CHARLES</span><strong>ACMEN</strong>
        </a>
        <p className="coast-edition">COAST STUDY<br />NO. 01 / 2026</p>
        <button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="site-index" aria-label={menuOpen ? '关闭网站索引' : '打开网站索引'} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}<span>{menuOpen ? '关闭' : '索引'}</span>
        </button>
      </header>
      <section className="coast-intro" aria-label="网站介绍">
        <p>Somewhere by the sea</p>
        <h1>一间<span>不一样的</span><br />工作室。</h1>
      </section>
      <div className="coast-instruction" aria-hidden="true">
        <span className="mouse-mark"><i /></span><span className="touch-mark"><i /></span>
        <span className="pointer-copy">滚动靠近</span><span className="touch-copy">上滑靠近</span>
      </div>
      <aside className={`site-index ${menuOpen ? 'is-open' : ''}`} id="site-index" aria-hidden={!menuOpen}>
        <div className="index-inner">
          <span className="index-kicker">CHARLESACMEN / INDEX</span>
          <h2>{copy.about.title}</h2>
          <p className="index-about">{copy.about.body}</p>
          <div className="index-projects">
            {copy.projects.map((project) => (
              <a href={project.href} target="_blank" rel="noreferrer" key={project.slug} tabIndex={menuOpen ? 0 : -1}>
                <span>0{project.index}</span><strong>{project.title}</strong><small>{project.kind}</small><ArrowUpRight aria-hidden="true" />
              </a>
            ))}
          </div>
          <div className="index-links">
            <a href="https://github.com/charlesAcmen" target="_blank" rel="noreferrer" tabIndex={menuOpen ? 0 : -1}>GitHub <ArrowUpRight aria-hidden="true" /></a>
            <a href="https://www.xiaohongshu.com/user/profile/60b9ea030000000001006c68" target="_blank" rel="noreferrer" tabIndex={menuOpen ? 0 : -1}>小红书 <ArrowUpRight aria-hidden="true" /></a>
          </div>
        </div>
      </aside>
    </main>
  );
}
