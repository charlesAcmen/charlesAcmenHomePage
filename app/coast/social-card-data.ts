import githubUrl from '../../assets/image/github.jpg?url';
import instagramUrl from '../../assets/image/IG.jpg?url';
import qqUrl from '../../assets/image/qq.jpg?url';
import qqQrUrl from '../../assets/image/qqqrcode.jpg?url';
import redNoteUrl from '../../assets/image/rednote.jpg?url';
import wechatUrl from '../../assets/image/wechat.jpg?url';
import wechatQrUrl from '../../assets/image/wechatqrcode.png?url';
import xUrl from '../../assets/image/x.jpg?url';
import youtubeUrl from '../../assets/image/yt.jpg?url';

export type CardImage = {
  url: string;
  aspect: number;
};

export type SocialCardConfig = {
  id: string;
  label: string;
  front: CardImage;
  back?: CardImage;
  href?: string;
  focusOnActivate?: boolean;
  cycleImages?: CardImage[];
  labelHref?: string;
  showFullImage?: boolean;
};

export const socialCards: SocialCardConfig[] = [
  {
    id: 'wechat',
    label: 'WECHAT',
    front: { url: wechatUrl, aspect: 1 },
    back: { url: wechatQrUrl, aspect: 453 / 434 },
  },
  {
    id: 'qq',
    label: 'QQ',
    front: { url: qqUrl, aspect: 1 },
    back: { url: qqQrUrl, aspect: 666 / 1206 },
  },
  {
    id: 'instagram',
    label: 'INSTAGRAM',
    front: { url: instagramUrl, aspect: 1 },
    href: 'https://www.instagram.com/charlieacmen/',
  },
  {
    id: 'youtube',
    label: 'YOUTUBE',
    front: { url: youtubeUrl, aspect: 1 },
    href: 'https://www.youtube.com/@charlesAcmen',
  },
  {
    id: 'x',
    label: 'X',
    front: { url: xUrl, aspect: 1 },
    href: 'https://x.com/charlesAcmen',
  },
  {
    id: 'red-note',
    label: 'RED NOTE',
    front: { url: redNoteUrl, aspect: 1 },
    href: 'https://www.xiaohongshu.com/user/profile/60b9ea030000000001006c68',
  },
  {
    id: 'github',
    label: 'GITHUB',
    front: { url: githubUrl, aspect: 1 },
    href: 'https://github.com/charlesAcmen',
  },
];
