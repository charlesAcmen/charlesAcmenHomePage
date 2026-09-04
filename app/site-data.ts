export type Locale = 'zh' | 'en';

type Project = {
  slug: string;
  index: number;
  kind: string;
  title: string;
  description: string;
  stack: string[];
  href: string;
  metric?: string;
  metricNote?: string;
};

type SiteCopy = {
  skipToWork: string;
  primaryNavigation: string;
  languageToggle: string;
  xiaohongshu: string;
  openOnGithub: string;
  technologyStack: string;
  heroLabel: string;
  scrollCue: string;
  nav: { about: string; work: string; links: string };
  hero: {
    eyebrow: string;
    statement: string;
    sceneTwoKicker: string;
    sceneTwo: string;
    sceneThreeKicker: string;
    sceneThree: string;
    exploreWork: string;
  };
  about: { title: string; body: string; signoff: string };
  work: { title: string; intro: string };
  closing: { title: string; body: string };
  footer: string;
  projects: Project[];
};

export const content: Record<Locale, SiteCopy> = {
  zh: {
    skipToWork: '跳到作品',
    primaryNavigation: '主导航',
    languageToggle: '切换至英文',
    xiaohongshu: '小红书',
    openOnGithub: '查看源码',
    technologyStack: '技术栈',
    heroLabel: 'CharlesAcmen 的个人作品首页',
    scrollCue: '向下探索',
    nav: { about: '关于', work: '作品', links: '链接' },
    hero: {
      eyebrow: 'PERSONAL TRANSMISSION / 01',
      statement: '把靠近硬件的思考，做成能被看见、运行和讨论的系统。',
      sceneTwoKicker: 'BUILD IN PUBLIC',
      sceneTwo: '从像素、路径与并发里，把想法推到下一帧。',
      sceneThreeKicker: 'SIGNAL / NOISE',
      sceneThree: '代码在运行，故事也在继续。',
      exploreWork: '进入作品档案',
    },
    about: {
      title: '在底层，留下一道霓虹。',
      body:
        'CharlesAcmen 专注于 GPU 编程、实时渲染与分布式系统。这里不做一份静态履历，而是记录从并行算法到实时服务的完整工程表达。',
      signoff: '代码、渲染、系统，以及持续公开的构建过程。',
    },
    work: {
      title: 'Selected works',
      intro: '三条不同的技术路径，共享同一个原则：把复杂问题做成可读、可运行、可复查的作品。',
    },
    closing: {
      title: '下一次刷新，仍在路上。',
      body: '在 GitHub 看源码，在小红书看构建过程与技术推文。',
    },
    footer: 'Built in public · 中国 / 全球',
    projects: [
      {
        slug: 'cuda-path-tracer',
        index: 1,
        kind: 'GPU GRAPHICS',
        title: 'CUDA Path Tracer',
        description:
          '从零实现的渐进式 CUDA Monte Carlo 路径追踪器：世界空间 BVH、glTF/GLB 场景、GGX PBR、直接光照与 MIS 汇入同一条 GPU 渲染管线。',
        stack: ['CUDA', 'C++', 'BVH', 'GGX PBR', 'MIS'],
        href: 'https://github.com/charlesAcmen/Project3-CUDA-Path-Tracer',
      },
      {
        slug: 'raft-kv',
        index: 2,
        kind: 'DISTRIBUTED SYSTEMS',
        title: 'C++ Raft KV System',
        description:
          '以 C++ 手写 Raft 共识与键值存储，在日志复制、选主与状态机之间建立一个可追踪的分布式系统实现。',
        stack: ['C++', 'Raft', 'KV Store', 'Consensus'],
        href: 'https://github.com/charlesAcmen/Raft_KV',
      },
      {
        slug: 'live-stream-danmaku',
        index: 3,
        kind: 'REAL-TIME BACKEND',
        title: 'Live Stream Danmaku',
        description:
          '面向直播场景的高并发弹幕后端：WebSocket 连接管理、Redis Pub/Sub 广播、Kafka 异步削峰与 MySQL 批量落盘协同工作。',
        stack: ['Go', 'WebSocket', 'Redis', 'Kafka', 'MySQL'],
        href: 'https://github.com/charlesAcmen/live-stream-danmaku',
        metric: '6 万+ 长连接 · 150 万下行 QPS',
        metricNote: '本地 WSL2 压测，非生产 SLA',
      },
    ],
  },
  en: {
    skipToWork: 'Skip to selected works',
    primaryNavigation: 'Primary navigation',
    languageToggle: 'Switch to Chinese',
    xiaohongshu: 'Xiaohongshu',
    openOnGithub: 'View source',
    technologyStack: 'Technology stack',
    heroLabel: 'CharlesAcmen portfolio home',
    scrollCue: 'Scroll to explore',
    nav: { about: 'About', work: 'Works', links: 'Links' },
    hero: {
      eyebrow: 'PERSONAL TRANSMISSION / 01',
      statement: 'Turning close-to-the-metal thinking into systems people can see, run, and discuss.',
      sceneTwoKicker: 'BUILD IN PUBLIC',
      sceneTwo: 'From pixels, paths, and concurrency to the next frame.',
      sceneThreeKicker: 'SIGNAL / NOISE',
      sceneThree: 'The code is running. The story keeps moving.',
      exploreWork: 'Enter the archive',
    },
    about: {
      title: 'Leave a neon trace at the bottom of the stack.',
      body:
        'CharlesAcmen works across GPU programming, real-time rendering, and distributed systems. This is not a static resume: it is an evolving record of engineering from parallel algorithms to live services.',
      signoff: 'Code, rendering, systems, and the process of building in public.',
    },
    work: {
      title: 'Selected works',
      intro: 'Three technical paths, one principle: make hard problems readable, runnable, and inspectable.',
    },
    closing: {
      title: 'The next refresh is already in motion.',
      body: 'Find the source on GitHub and the build logs, notes, and technical posts on Xiaohongshu.',
    },
    footer: 'Built in public · China / Global',
    projects: [
      {
        slug: 'cuda-path-tracer',
        index: 1,
        kind: 'GPU GRAPHICS',
        title: 'CUDA Path Tracer',
        description:
          'A progressive CUDA Monte Carlo path tracer built from scratch, bringing world-space BVH, glTF/GLB scenes, GGX PBR, direct lighting, and MIS into one GPU rendering pipeline.',
        stack: ['CUDA', 'C++', 'BVH', 'GGX PBR', 'MIS'],
        href: 'https://github.com/charlesAcmen/Project3-CUDA-Path-Tracer',
      },
      {
        slug: 'raft-kv',
        index: 2,
        kind: 'DISTRIBUTED SYSTEMS',
        title: 'C++ Raft KV System',
        description:
          'A C++ implementation of Raft consensus and a key-value store, tracing the path between log replication, leader election, and a replicated state machine.',
        stack: ['C++', 'Raft', 'KV Store', 'Consensus'],
        href: 'https://github.com/charlesAcmen/Raft_KV',
      },
      {
        slug: 'live-stream-danmaku',
        index: 3,
        kind: 'REAL-TIME BACKEND',
        title: 'Live Stream Danmaku',
        description:
          'A high-concurrency live-chat backend with WebSocket connection management, Redis Pub/Sub fan-out, Kafka buffering, and batched MySQL persistence.',
        stack: ['Go', 'WebSocket', 'Redis', 'Kafka', 'MySQL'],
        href: 'https://github.com/charlesAcmen/live-stream-danmaku',
        metric: '60K+ connections · 1.5M downstream QPS',
        metricNote: 'Local WSL2 benchmark, not a production SLA',
      },
    ],
  },
};
