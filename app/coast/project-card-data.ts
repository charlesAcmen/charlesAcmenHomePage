import mitUrl from '../../assets/image/mit.png?url';
import project3Cover1Url from '../../assets/image/project3cover1.jpg?url';
import project3Cover2Url from '../../assets/image/project3cover2.jpg?url';
import project3Cover3Url from '../../assets/image/project3cover3.jpg?url';
import twitchDanmakuUrl from '../../assets/image/twitch-danmaku.png?url';
import youtubeDanmakuUrl from '../../assets/image/youtube-danmaku.png?url';
import type { SocialCardConfig } from './social-card-data';

export const projectCards: SocialCardConfig[] = [
  {
    id: 'cuda-path-tracer',
    label: 'CUDA PATH TRACER',
    front: { url: project3Cover1Url, aspect: 1009 / 1626 },
    cycleImages: [
      { url: project3Cover2Url, aspect: 1009 / 1626 },
      { url: project3Cover3Url, aspect: 1009 / 1626 },
    ],
    labelHref: 'https://github.com/charlesAcmen/Project3-CUDA-Path-Tracer',
    showFullImage: true,
  },
  {
    id: 'youtube-danmaku',
    label: 'YOUTUBE LIVE CHAT EXTENSION',
    front: { url: youtubeDanmakuUrl, aspect: 1324 / 858 },
    labelHref: 'https://github.com/charlesAcmen/youtube-danmaku-extension',
    focusOnActivate: true,
    showFullImage: true,
  },
  {
    id: 'twitch-danmaku',
    label: 'TWITCH LIVE CHAT EXTENSION',
    front: { url: twitchDanmakuUrl, aspect: 1153 / 799 },
    labelHref: 'https://github.com/charlesAcmen/twitch-danmaku-extension',
    focusOnActivate: true,
    showFullImage: true,
  },
  {
    id: 'mit-6824',
    label: 'MIT 6.824 / DISTRIBUTED SYSTEMS',
    front: { url: mitUrl, aspect: 1288 / 1221 },
    labelHref: 'https://github.com/charlesAcmen/Raft_KV',
    focusOnActivate: true,
    showFullImage: true,
  },
];
