import type { Emotion, MoodEntry } from "@/lib/types";

export type ReliefCategory = "meditation" | "music" | "exercise";
export type ReliefInteraction =
  | "breathing"
  | "meditation"
  | "audio"
  | "exercise"
  | "writing"
  | "reflection"
  | "rest"
  | "share";

export interface BreathPhase {
  label: string;
  duration: number;
  scale: number;
}

export interface ReliefPlan {
  id: string;
  title: string;
  category: ReliefCategory;
  interaction: ReliefInteraction;
  duration: string;
  description: string;
  accent: string;
  timerSeconds?: number;
  instructions?: string[];
  prompts?: string[];
  phases?: BreathPhase[];
  rounds?: number;
  externalUrl?: string;
  generatedAudio?: boolean;
}

export const CATEGORY_LABELS: Record<ReliefCategory, string> = {
  meditation: "冥想",
  music: "音乐",
  exercise: "运动",
};

const FOUR_SEVEN_EIGHT_PHASES: BreathPhase[] = [
  { label: "吸气", duration: 4, scale: 1.2 },
  { label: "屏息", duration: 7, scale: 1.2 },
  { label: "呼气", duration: 8, scale: 0.76 },
];

const BOX_BREATHING_PHASES: BreathPhase[] = [
  { label: "吸气", duration: 4, scale: 1.2 },
  { label: "停留", duration: 4, scale: 1.2 },
  { label: "呼气", duration: 4, scale: 0.76 },
  { label: "停留", duration: 4, scale: 0.76 },
];

export const RELIEF_PLANS: ReliefPlan[] = [
  {
    id: "breathing-478",
    title: "4-7-8 呼吸",
    category: "meditation",
    interaction: "breathing",
    duration: "约 2 分钟",
    description: "跟随圆圈慢慢呼吸，让身体从警觉中松下来。",
    accent: "#AFA0CC",
    phases: FOUR_SEVEN_EIGHT_PHASES,
    rounds: 4,
  },
  {
    id: "body-scan",
    title: "身体扫描冥想",
    category: "meditation",
    interaction: "meditation",
    duration: "5 分钟",
    description: "从额头到脚尖，温柔觉察身体每一处感觉。",
    accent: "#91BDA9",
    timerSeconds: 300,
    instructions: [
      "闭上眼睛，感受呼吸自然进出。",
      "注意额头、下巴和肩膀，允许它们放松。",
      "把注意力移到胸口、腹部和双手。",
      "感受双腿和脚底与地面的接触。",
      "做一次深呼吸，慢慢睁开眼睛。",
    ],
  },
  {
    id: "white-noise",
    title: "舒缓白噪音",
    category: "music",
    interaction: "audio",
    duration: "按需播放",
    description: "用柔和的环境声盖住纷乱思绪，留一点安静。",
    accent: "#8EACC2",
    generatedAudio: true,
  },
  {
    id: "box-breathing",
    title: "方块呼吸",
    category: "meditation",
    interaction: "breathing",
    duration: "约 1 分钟",
    description: "吸气、停留、呼气、停留各四秒，找回节奏。",
    accent: "#9FAFD0",
    phases: BOX_BREATHING_PHASES,
    rounds: 4,
  },
  {
    id: "gentle-music",
    title: "轻音乐片刻",
    category: "music",
    interaction: "audio",
    duration: "5 分钟",
    description: "暂时放下任务，让舒缓旋律陪你停一会儿。",
    accent: "#C3A7CB",
    externalUrl:
      "https://open.spotify.com/search/%E8%88%92%E7%BC%93%E8%BD%BB%E9%9F%B3%E4%B9%90",
  },
  {
    id: "walk-5",
    title: "5 分钟散步",
    category: "exercise",
    interaction: "exercise",
    duration: "5 分钟",
    description: "离开原位走一小圈，用脚步打断焦虑循环。",
    accent: "#D2A26F",
    timerSeconds: 300,
    instructions: [
      "放下手机，站起来舒展肩背。",
      "用舒服的速度走动，留意脚掌落地。",
      "看看周围三样东西，听听附近的声音。",
      "最后放慢脚步，做一次完整的深呼吸。",
    ],
  },
  {
    id: "walk-10",
    title: "10 分钟散步",
    category: "exercise",
    interaction: "exercise",
    duration: "10 分钟",
    description: "去有光线或绿意的地方走走，让身体带心情移动。",
    accent: "#8DB79E",
    timerSeconds: 600,
    instructions: [
      "穿上舒服的鞋，选择熟悉安全的路线。",
      "前几分钟只关注呼吸和脚步。",
      "抬头留意天空、树木或街边的颜色。",
      "不用追求速度，愿意出发就已经很好。",
    ],
  },
  {
    id: "warm-playlist",
    title: "温暖歌单",
    category: "music",
    interaction: "audio",
    duration: "10 分钟",
    description: "听几首让你感到被接住的歌，不急着振作。",
    accent: "#D49B86",
    externalUrl:
      "https://open.spotify.com/search/%E6%B8%A9%E6%9A%96%E6%B2%BB%E6%84%88%E6%AD%8C%E5%8D%95",
  },
  {
    id: "small-joys",
    title: "写 3 件小确幸",
    category: "meditation",
    interaction: "reflection",
    duration: "3 分钟",
    description: "不必宏大，记录今天三个微小但真实的好瞬间。",
    accent: "#E0B768",
    prompts: ["第一件小事", "第二件小事", "第三件小事"],
  },
  {
    id: "vent-writing",
    title: "书写宣泄",
    category: "meditation",
    interaction: "writing",
    duration: "3 分钟",
    description: "把想说的话全部写下，然后一键“粉碎”它们。",
    accent: "#DB8879",
  },
  {
    id: "brisk-move",
    title: "快走或跳绳",
    category: "exercise",
    interaction: "exercise",
    duration: "5 分钟",
    description: "在安全范围内动起来，为身体里的能量找出口。",
    accent: "#DA9569",
    timerSeconds: 300,
    instructions: [
      "先活动脚踝、膝盖和肩膀。",
      "选择快走或轻量跳绳，保持能够说话的强度。",
      "专注动作节奏，不在脑中重演冲突。",
      "最后一分钟放慢速度，等待心跳平稳。",
    ],
  },
  {
    id: "stretch-5",
    title: "5 分钟拉伸",
    category: "exercise",
    interaction: "exercise",
    duration: "5 分钟",
    description: "活动僵硬的肩颈与腰背，给疲惫的身体一点空间。",
    accent: "#A79B91",
    timerSeconds: 300,
    instructions: [
      "缓慢转动肩膀，前后各五次。",
      "头部轻轻向左右侧倾，各停留十五秒。",
      "双手向上延伸，再放松向前折叠。",
      "坐下转动脚踝，最后伸展小腿后侧。",
    ],
  },
  {
    id: "power-nap",
    title: "小睡建议",
    category: "meditation",
    interaction: "rest",
    duration: "20 分钟",
    description: "设置短暂休息计时，避免睡得太久反而更昏沉。",
    accent: "#9FA8B3",
    timerSeconds: 1200,
    instructions: [
      "找一个安全、安静的位置，把手机调成勿扰。",
      "放松下巴与肩膀，不要求自己必须睡着。",
      "闭眼休息，计时结束后喝一点水。",
    ],
  },
  {
    id: "ambient-music",
    title: "放空音乐",
    category: "music",
    interaction: "audio",
    duration: "10 分钟",
    description: "让轻柔环境音乐填满空白，暂时不处理任何事。",
    accent: "#9BA8BC",
    externalUrl:
      "https://open.spotify.com/search/%E6%94%BE%E7%A9%BA%E7%8E%AF%E5%A2%83%E9%9F%B3%E4%B9%90",
  },
  {
    id: "capture-moment",
    title: "记录此刻",
    category: "meditation",
    interaction: "reflection",
    duration: "2 分钟",
    description: "写下当下值得记住的细节，为好心情留一张快照。",
    accent: "#DDB45C",
    prompts: ["此刻最想记住的是……"],
  },
  {
    id: "gratitude",
    title: "感恩练习",
    category: "meditation",
    interaction: "reflection",
    duration: "3 分钟",
    description: "想起三件值得感谢的人或事，让温暖多停留一会儿。",
    accent: "#8DBAA3",
    prompts: ["感谢的人或事", "一个被照顾的瞬间", "想对自己说的话"],
  },
  {
    id: "share-friend",
    title: "分享给朋友",
    category: "meditation",
    interaction: "share",
    duration: "1 分钟",
    description: "把这份好心情分享出去，让连接延长此刻的感受。",
    accent: "#D4A179",
  },
];

interface ReliefRule {
  emotions: Emotion[];
  minIntensity?: number;
  maxIntensity?: number;
  planIds: string[];
}

export const RELIEF_RULES: ReliefRule[] = [
  {
    emotions: ["anxious"],
    minIntensity: 6,
    planIds: ["breathing-478", "body-scan", "white-noise"],
  },
  {
    emotions: ["anxious"],
    maxIntensity: 5,
    planIds: ["box-breathing", "gentle-music", "walk-5"],
  },
  {
    emotions: ["sad"],
    planIds: ["walk-10", "warm-playlist", "small-joys"],
  },
  {
    emotions: ["angry"],
    planIds: ["vent-writing", "brisk-move", "box-breathing"],
  },
  {
    emotions: ["tired"],
    planIds: ["stretch-5", "power-nap", "ambient-music"],
  },
  {
    emotions: ["joy", "calm"],
    planIds: ["capture-moment", "gratitude", "share-friend"],
  },
];

export function getRecommendedReliefPlans(entry: MoodEntry) {
  const rule = RELIEF_RULES.find(
    (item) =>
      item.emotions.includes(entry.emotion) &&
      (item.minIntensity === undefined || entry.intensity >= item.minIntensity) &&
      (item.maxIntensity === undefined || entry.intensity <= item.maxIntensity),
  );

  const planIds = rule?.planIds ?? ["box-breathing", "gentle-music", "walk-5"];
  return planIds
    .map((id) => RELIEF_PLANS.find((plan) => plan.id === id))
    .filter((plan): plan is ReliefPlan => Boolean(plan));
}
