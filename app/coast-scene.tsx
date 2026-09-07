'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { createCoastExperience } from './coast/create-coast-experience';

export default function CoastScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<ReturnType<typeof createCoastExperience> | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const experience = createCoastExperience(mount, setProgress);
    experienceRef.current = experience;
    return () => { experience.dispose(); experienceRef.current = null; };
  }, []);

  const percent = Math.round(progress * 100);
  return (
    <section className="coast-experience" id="coast" aria-label="可滚动探索的迈阿密海岸线描场景">
      <div ref={mountRef} className="coast-canvas" />
      <nav className="sr-only" aria-label="CharlesAcmen 社交主页">
        <a href="https://github.com/charlesAcmen" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.instagram.com/charlieacmen/" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://www.youtube.com/@charlesAcmen" target="_blank" rel="noreferrer">YouTube</a>
        <a href="https://x.com/charlesAcmen" target="_blank" rel="noreferrer">X</a>
        <a href="https://www.xiaohongshu.com/user/profile/60b9ea030000000001006c68" target="_blank" rel="noreferrer">小红书</a>
        <span>微信和 QQ 联系二维码可通过墙上的对应卡片查看。</span>
      </nav>
      <div className="journey-control">
        <div className="journey-labels"><span>OCEAN VIEW</span><span>{percent}%</span><span>THE STUDIO</span></div>
        <input className="journey-range" type="range" min="0" max="100" value={percent} aria-label="镜头距离" onChange={(event) => experienceRef.current?.setProgress(Number(event.target.value) / 100)} />
        <button type="button" onClick={() => experienceRef.current?.setProgress(0)} aria-label="回到海岸全景"><RotateCcw aria-hidden="true" /><span>返回全景</span></button>
      </div>
      <noscript>需要启用 JavaScript 才能观看 3D 海岸场景。</noscript>
    </section>
  );
}
