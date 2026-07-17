import { useState, useEffect, useRef, useMemo, useCallback } from "react";

const moguraImg = new URL("../../picture/mogura.png", import.meta.url).href;
const moguraFullImg = new URL("../../picture/mogura_full.png", import.meta.url).href;
const playerImg = new URL("../../picture/player.png", import.meta.url).href;
const senpaiImg = new URL("../../picture/senpai.png", import.meta.url).href;
const senpaiNormalImg = new URL("../../picture/senpai_normal.png", import.meta.url).href;
const senpaiHappyImg = new URL("../../picture/senpai_happy.png", import.meta.url).href;
const princeImg = new URL("../../picture/prince.png", import.meta.url).href;
const playerMiniImg = new URL("../../picture/player_mini.png", import.meta.url).href;
const senpaiMiniImg = new URL("../../picture/senpai_mini.png", import.meta.url).href;

/* ─── Types ─── */
type Phase = "title" | "opening" | "game" | "ending";
type EndingType = "D" | "NORMAL" | "S" | "TRUE";
type ConfettiType = "sad" | "normal" | "happy" | "royal";

interface MoleData {
  id: string;
  sound: string;
  hit: boolean;
}

type EndingLine = string | { speaker: string; text: string };

interface EndingData {
  rank: string;
  gradient: string;
  title: string;
  subtitle: string;
  lines: EndingLine[];
  emoji: string;
  confettiType: ConfettiType;
}

/* ─── Constants ─── */
const OPENING_LINES: { speaker: string; text: string }[] = [
  { speaker: "主人公", text: "今日こそ…！　絶対に言う！　「先輩、好きです」って！！" },
  { speaker: "先輩", text: "…そこにいるのは？" },
  { speaker: "主人公", text: "今だ…！　せ、せんぱ――" },
  { speaker: "【効果音】", text: "──── ゴォォォン！！ ────" },
  { speaker: "モグラ", text: "モゴーー！！" },
  { speaker: "主人公", text: "またお前らかーー！！　人の恋愛イベントに割り込むな！！" },
  { speaker: "主人公", text: "…こうなったら全員ぶっ飛ばして告白してやる！！" },
];

const QUIPS = [
  "空気読め！！",
  "恋のライバルがモグラって何！？",
  "帰れー！！",
  "なんでここに出てくるの！！",
  "告白させろーー！！",
  "モグラに邪魔されるの何回目！？",
  "もう知らん！！ぶっ飛ばす！！",
  "先輩が見てる！恥ずかしい！！",
  "ハンマーは持ってないけど気合いだ！！",
  "こっちは乙女心がかかってるんだ！！",
  "お前らのせいで青春が！！",
  "モグラのくせに生意気！！",
  "なんでモグラ！？なんでモグラなの！？",
];

const MOLE_SOUNDS = ["モゴ！", "モゴモゴ！", "モゴー！", "モゴォ！！", "モゴモゴモゴ！"];

const ENDINGS: Record<EndingType, EndingData> = {
  D: {
    rank: "D",
    gradient: "linear-gradient(135deg, #374151 0%, #111827 100%)",
    title: "GAME OVER",
    subtitle: "『恋はハンマーの後で』",
    lines: [
      { speaker: "モグラ", text: "モゴモゴーーッ！！" },
      { speaker: "主人公", text: "ちょっ、多すぎ！！" },
      "モグラに埋もれる主人公。",
      { speaker: "先輩", text: "あれ？誰かいたような気がするけど…気のせいか" },
      { speaker: "主人公", text: "いますーーー！！" },
      { speaker: "主人公", text: "埋まってますーー！！！" },
      { speaker: "先輩", text: "帰ろーっと" },
      { speaker: "主人公", text: "待ってぇぇぇぇ！！！" },
    ],
    emoji: "😭",
    confettiType: "sad",
  },
  NORMAL: {
    rank: "C～A",
    gradient: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
    title: "NORMAL END",
    subtitle: "『恋は明日に持ち越し！』",
    lines: [
      { speaker: "主人公", text: "最後の一匹ぃぃぃ！！" },
      { speaker: "主人公", text: "よし、先輩っ！好きで――" },
      "ボコッ。",
      { speaker: "モグラ", text: "モゴ！" },
      { speaker: "主人公", text: "だから空気読めぇぇぇ！！" },
      { speaker: "先輩", text: "ふふ。" },
      { speaker: "先輩", text: "今日も賑やかだね。" },
      { speaker: "主人公", text: "違います！！" },
      { speaker: "主人公", text: "宿敵です！！" },
      { speaker: "モグラ", text: "モゴ。" },
      { speaker: "主人公", text: "明日こそ覚えてろーーー！！" },
    ],
    emoji: "🌸",
    confettiType: "normal",
  },
  S: {
    rank: "S",
    gradient: "linear-gradient(135deg, #f472b6 0%, #e11d48 100%)",
    title: "HAPPY END ♥",
    subtitle: "『恋は叩いて掴み取る』",
    lines: [
      { speaker: "主人公", text: "先輩っ…！好きです！！" },
      { speaker: "先輩", text: "……！" },
      { speaker: "先輩", text: "……ありがと。" },
      { speaker: "先輩", text: "実は俺も前から君のこと気になってたんだ。" },
      { speaker: "主人公", text: "え。" },
      { speaker: "先輩", text: "ずっと気付いてた。" },
      { speaker: "主人公", text: "えええええ！？" },
      { speaker: "主人公", text: "じ、じゃあ…！" },
      { speaker: "先輩", text: "これからよろしくね" },
      { speaker: "Narration", text: "二人は両思い！おめでとう！" },
    ],
    emoji: "💖",
    confettiType: "happy",
  },
  TRUE: {
    rank: "S ★ノーミス★",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #ec4899 50%, #7c3aed 100%)",
    title: "★ TRUE END ★",
    subtitle: "『恋のライバルは、私だけの王子様』",
    lines: [
      { speaker: "Narration", text: "モグラが光に包まれていく＿＿" },
      { speaker: "？？？", text: "やっと……戻れた" },
      { speaker: "主人公", text: "……誰！？" },
      { speaker: "？？？", text: "僕は隣の国の王子" },
      { speaker: "王子", text: "悪い魔女に呪いをかけられて、モグラに姿を変えられていたんだ" },
      { speaker: "主人公", text: "何そのどこかで見たような設定" },
      { speaker: "王子", text: "……" },
      { speaker: "王子", text: "君のことが好きだ" },
      { speaker: "王子", text: "君を見た瞬間、一目惚れだった" },
      { speaker: "王子", text: "君を彼に渡したくなくて……妨害していた" },
      { speaker: "主人公", text: "（……顔、良）" },
      { speaker: "主人公", text: "（いやいや！ 私は先輩が好きで……）" },
      { speaker: "主人公", text: "（……好き、なのに。)" },
      { speaker: "王子", text: "モゴ" },
      { speaker: "主人公", text: "まだ言うんかい！！" },
      { speaker: "王子", text: "癖で" },
      { speaker: "主人公", text: "直して" },
      { speaker: "王子", text: "ごめん" },
      { speaker: "王子", text: "それでも、君が好きなんだ" },
      { speaker: "主人公", text: "……！" },
      { speaker: "Narration", text: "王子の顔を見る。思わず両手で顔を覆って" },
      { speaker: "主人公", text: "宿敵にときめくなんて、聞いてないんだけどーっ！！" },
    ],
    emoji: "👑",
    confettiType: "royal",
  },
};

const CONFETTI_CHARS: Record<ConfettiType, string[]> = {
  sad: ["💧", "😭", "🐭", "💦"],
  normal: ["🌸", "♥", "✿", "🌺"],
  happy: ["💖", "✨", "🌸", "⭐", "♥"],
  royal: ["👑", "✨", "💎", "⭐", "🌟", "♥"],
};

function MoleHelpIcon() {
  return (
    <span className="inline-flex items-center justify-center" style={{ width: 32, height: 32 }}>
      <span
        className="relative"
        style={{
          width: 28,
          height: 24,
          background: "linear-gradient(180deg, #b45309 0%, #92400e 100%)",
          borderRadius: "50% 50% 40% 40% / 60% 60% 40% 40%",
          border: "2px solid #78350f",
          overflow: "hidden",
        }}
      >
        <span
          className="absolute bg-white rounded-full"
          style={{ top: "20%", left: "18%", width: "22%", height: "25%" }}
        >
          <span
            className="absolute bg-gray-900 rounded-full"
            style={{ top: "30%", left: "25%", width: "55%", height: "55%" }}
          />
        </span>
        <span
          className="absolute bg-white rounded-full"
          style={{ top: "20%", right: "18%", width: "22%", height: "25%" }}
        >
          <span
            className="absolute bg-gray-900 rounded-full"
            style={{ top: "30%", left: "25%", width: "55%", height: "55%" }}
          />
        </span>
        <span
          className="absolute bg-pink-500 rounded-full"
          style={{ top: "52%", left: "50%", transform: "translateX(-50%)", width: "30%", height: "18%" }}
        />
      </span>
    </span>
  );
}

/* ─── Helpers ─── */
function getEndingType(score: number, misses: number): EndingType {
  if (score >= 10000 && misses === 0) return "TRUE";
  if (score >= 10000) return "S";
  if (score >= 3000) return "NORMAL";
  return "D";
}

function getRank(score: number): string {
  if (score >= 3000) return "S";
  if (score >= 2500) return "A";
  if (score >= 1800) return "B";
  if (score >= 1000) return "C";
  return "D";
}

/* ─── CSS Keyframes ─── */
const GAME_STYLES = `
@keyframes float-heart {
  0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.8; }
  100% { transform: translateY(-110vh) rotate(540deg) scale(0.4); opacity: 0; }
}
@keyframes mole-show {
  0%   { transform: translateY(100%); }
  65%  { transform: translateY(-10%); }
  100% { transform: translateY(0); }
}
@keyframes mole-hide {
  0%   { transform: translateY(0) scaleY(1); }
  100% { transform: translateY(110%) scaleY(0.5); }
}
@keyframes hit-star {
  0%   { transform: scale(0) rotate(0deg); opacity: 1; }
  60%  { transform: scale(1.5) rotate(20deg); opacity: 1; }
  100% { transform: scale(0) rotate(-10deg); opacity: 0; }
}
@keyframes confetti-fall {
  0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0.1; }
}
@keyframes game-shake {
  0%,100% { transform: translateX(0) rotate(0deg); }
  20%  { transform: translateX(-8px) rotate(-1.5deg); }
  40%  { transform: translateX(8px) rotate(1.5deg); }
  60%  { transform: translateX(-5px) rotate(-0.8deg); }
  80%  { transform: translateX(5px) rotate(0.8deg); }
}
@keyframes title-float {
  0%,100% { transform: translateY(0) rotate(-1deg); }
  50%  { transform: translateY(-7px) rotate(1deg); }
}
@keyframes title-mogura-fade {
  0%,20%,100% { opacity: 0; }
  40%,60% { opacity: 1; }
}
@keyframes btn-glow {
  0%,100% { box-shadow: 0 0 10px 3px rgba(236,72,153,0.45), 0 4px 20px rgba(236,72,153,0.25); }
  50%     { box-shadow: 0 0 22px 8px rgba(236,72,153,0.75), 0 4px 35px rgba(236,72,153,0.45); }
}
@keyframes quip-appear {
  0%   { transform: translateY(10px) scale(0.95); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes rank-pop {
  0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
  60%  { transform: scale(1.25) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes dialog-slide {
  0%   { transform: translateY(28px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes combo-pulse {
  0%   { transform: scale(1.5); color: #fbbf24; }
  100% { transform: scale(1); }
}
@keyframes time-warn {
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.12); }
}
`;

/* ─── Sub-components ─── */
function FloatingHearts() {
  const items = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 7,
        dur: 5 + Math.random() * 5,
        size: 12 + Math.random() * 22,
        char: ["♥", "♡", "✿", "★", "♪"][Math.floor(Math.random() * 5)],
        opacity: 0.25 + Math.random() * 0.5,
      })),
    []
  );
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map((it) => (
        <span
          key={it.id}
          className="absolute text-pink-300"
          style={{
            left: `${it.x}%`,
            bottom: -30,
            fontSize: it.size,
            opacity: it.opacity,
            animation: `float-heart ${it.dur}s ${it.delay}s ease-in infinite`,
          }}
        >
          {it.char}
        </span>
      ))}
    </div>
  );
}

function EndingFX({ endingType }: { endingType: EndingType }) {
  const items = useMemo(() => {
    const chars = CONFETTI_CHARS[ENDINGS[endingType].confettiType];
    return Array.from({ length: 38 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3.5,
      dur: 2.5 + Math.random() * 2.5,
      size: 15 + Math.random() * 20,
      char: chars[Math.floor(Math.random() * chars.length)],
    }));
  }, [endingType]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map((it) => (
        <span
          key={it.id}
          className="absolute"
          style={{
            left: `${it.x}%`,
            top: -30,
            fontSize: it.size,
            animation: `confetti-fall ${it.dur}s ${it.delay}s ease-in infinite`,
          }}
        >
          {it.char}
        </span>
      ))}
    </div>
  );
}

function MoleHole({
  mole,
  onHit,
  onMiss,
}: {
  mole: MoleData | null;
  onHit: () => void;
  onMiss: () => void;
}) {
  return (
    <div
      className="relative w-full aspect-square cursor-pointer select-none"
      onClick={() => {
        if (mole && !mole.hit) onHit();
        else if (!mole) onMiss();
      }}
    >
      {/* Ground mound */}
      <div
        className="absolute inset-x-0 bottom-0 border-2 border-amber-800"
        style={{
          height: "55%",
          background: "linear-gradient(180deg, #d97706 0%, #b45309 100%)",
          borderRadius: "50% 50% 40% 40% / 60% 60% 30% 30%",
        }}
      />
      {/* Hole opening */}
      <div
        className="absolute bg-amber-950 shadow-inner"
        style={{
          bottom: "28%",
          left: "14%",
          right: "14%",
          height: "32%",
          borderRadius: "50%",
        }}
      />
      {/* Mole clip container */}
      <div
        className="absolute overflow-hidden"
        style={{ bottom: 0, left: "8%", right: "8%", height: "77%" }}
      >
        {mole && (
          <div
            className="absolute bottom-0 w-full flex justify-center"
            style={{
              animation: mole.hit
                ? "mole-hide 0.24s ease-in forwards"
                : "mole-show 0.22s cubic-bezier(0.34,1.2,0.64,1) forwards",
            }}
          >
            <div className="flex flex-col items-center pb-1">
              {/* Sound bubble */}
              {!mole.hit && (
                <div
                  className="bg-white rounded-full border border-amber-300 shadow-sm leading-none whitespace-nowrap"
                  style={{
                    padding: "2px 6px",
                    fontSize: "clamp(7px, 2vw, 10px)",
                    fontWeight: 900,
                    color: "#92400e",
                    marginBottom: 3,
                  }}
                >
                  {mole.sound}
                </div>
              )}
              {/* Hit stars */}
              {mole.hit && (
                <div
                  className="font-black text-yellow-400 leading-none"
                  style={{ fontSize: "clamp(10px, 3vw, 14px)", marginBottom: 2, animation: "hit-star 0.25s ease-out" }}
                >
                  ✦✦✦
                </div>
              )}
              {/* Head */}
              <div
                className="relative border-2 border-amber-900 shadow-md overflow-hidden"
                style={{
                  width: "clamp(30px, 9vw, 42px)",
                  height: "clamp(26px, 8vw, 37px)",
                  borderRadius: "50% 50% 40% 40% / 60% 60% 40% 40%",
                  background: "#854113",
                }}
              >
                <img
                  src={moguraImg}
                  alt="mogura"
                  className="w-full h-full object-cover"
                  style={{ display: "block" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [phase, setPhase] = useState<Phase>("title");
  const [dialogIdx, setDialogIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(0);
  const [holes, setHoles] = useState<(MoleData | null)[]>(Array(9).fill(null));
  const [quip, setQuip] = useState(QUIPS[0]);
  const [shaking, setShaking] = useState(false);
  const [comboFlash, setComboFlash] = useState(false);
  const [endingType, setEndingType] = useState<EndingType>("D");
  const [showHelp, setShowHelp] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [gameMenuView, setGameMenuView] = useState<"menu" | "tips">("menu");
  const [openingShake, setOpeningShake] = useState(false);
  const [openingSenpaiVisible, setOpeningSenpaiVisible] = useState(false);
  const [openingMoguraFullVisible, setOpeningMoguraFullVisible] = useState(false);
  const [trueEndStage, setTrueEndStage] = useState<"mogura" | "prince">("mogura");
  const [trueEndFlash, setTrueEndFlash] = useState(false);
  const [endingDialogIdx, setEndingDialogIdx] = useState(0);
  const [bonusUnlocked, setBonusUnlocked] = useState(() => {
    try {
      return localStorage.getItem("koiiro_bonus") === "1";
    } catch {
      return false;
    }
  });
  const [showBonus, setShowBonus] = useState(false);
  const [selectedBonusCharacter, setSelectedBonusCharacter] = useState<string | null>(null);
  const [showTrueEndScene, setShowTrueEndScene] = useState(false);
  const [detailSenpaiPose, setDetailSenpaiPose] = useState<"default" | "normal" | "happy">("default");
  const [detailSenpaiOpacity, setDetailSenpaiOpacity] = useState(1);
  const [bonusImageExpanded, setBonusImageExpanded] = useState(false);
  const [senpaiPose, setSenpaiPose] = useState<"default" | "normal" | "happy">("default");
  const [bestScore, setBestScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("koiiro_best") || "0") || 0;
    } catch {
      return 0;
    }
  });

  /* ── Game refs ── */
  const missesRef = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const timeLeftRef = useRef(30);
  const holesRef = useRef<(MoleData | null)[]>(Array(9).fill(null));
  const moleTimersRef = useRef<(ReturnType<typeof setTimeout> | null)[]>(Array(9).fill(null));
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameActiveRef = useRef(false);
  const bestScoreRef = useRef(bestScore);
  bestScoreRef.current = bestScore;

  /* ── End game ── */
  const endGame = useCallback(() => {
    if (!gameActiveRef.current) return;
    gameActiveRef.current = false;
    moleTimersRef.current.forEach((t) => t && clearTimeout(t));
    moleTimersRef.current = Array(9).fill(null);
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
    const finalScore = scoreRef.current;
    const finalMisses = missesRef.current;
    if (finalScore > bestScoreRef.current) {
      setBestScore(finalScore);
      try { localStorage.setItem("koiiro_best", String(finalScore)); } catch {}
    }
    const nextEnding = getEndingType(finalScore, finalMisses);
    setEndingType(nextEnding);
    setEndingDialogIdx(0);
    setShowTrueEndScene(false);
    if (nextEnding === "TRUE") {
      setTrueEndStage("mogura");
      setTrueEndFlash(false);
      setBonusUnlocked(true);
      try { localStorage.setItem("koiiro_bonus", "1"); } catch {}
    }
    setPhase("ending");
  }, []);

  const closeGame = useCallback(() => {
    if (gameActiveRef.current) {
      gameActiveRef.current = false;
      moleTimersRef.current.forEach((t) => t && clearTimeout(t));
      moleTimersRef.current = Array(9).fill(null);
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
      holesRef.current = Array(9).fill(null);
      setHoles(Array(9).fill(null));
    }
    setShowGameMenu(false);
    setPhase("title");
  }, []);

  const endGameRef = useRef(endGame);
  endGameRef.current = endGame;
  const closeGameRef = useRef(closeGame);
  closeGameRef.current = closeGame;


  const openGameMenu = useCallback(() => {
    setGameMenuView("menu");
    setShowGameMenu(true);
  }, []);

  const openBonus = useCallback(() => {
    setSelectedBonusCharacter(null);
    setShowBonus(true);
  }, []);

  const closeBonus = useCallback(() => {
    setSelectedBonusCharacter(null);
    setShowBonus(false);
  }, []);

  const closeGameMenu = useCallback(() => {
    setShowGameMenu(false);
  }, []);

  const quitGame = useCallback(() => {
    if (gameActiveRef.current) {
      gameActiveRef.current = false;
      moleTimersRef.current.forEach((t) => t && clearTimeout(t));
      moleTimersRef.current = Array(9).fill(null);
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
      holesRef.current = Array(9).fill(null);
      setHoles(Array(9).fill(null));
    }
    setShowGameMenu(false);
    setPhase("title");
  }, []);

  /* ── Game timer ── */
  useEffect(() => {
    if (phase !== "game" || showGameMenu) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        timeLeftRef.current = next;
        if (next <= 0) {
          clearInterval(interval);
          endGameRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, showGameMenu]);

  /* ── Quip rotation ── */
  useEffect(() => {
    if (phase !== "game" || showGameMenu) return;
    const interval = setInterval(() => {
      setQuip(QUIPS[Math.floor(Math.random() * QUIPS.length)]);
    }, 2600);
    return () => clearInterval(interval);
  }, [phase, showGameMenu]);

  /* ── Mole spawning ── */
  useEffect(() => {
    if (phase !== "game" || showGameMenu) return;

    const spawnOne = () => {
      if (!gameActiveRef.current) return;

      const empty: number[] = [];
      holesRef.current.forEach((h, i) => { if (!h) empty.push(i); });

      if (empty.length > 0) {
        const idx = empty[Math.floor(Math.random() * empty.length)];
        const id = `${Date.now()}-${Math.random()}`;
        const sound = MOLE_SOUNDS[Math.floor(Math.random() * MOLE_SOUNDS.length)];
        const mole: MoleData = { id, sound, hit: false };

        const next = holesRef.current.map((h, i) => (i === idx ? mole : h));
        holesRef.current = next;
        setHoles([...next]);

        const elapsed = 30 - timeLeftRef.current;
        const hideDur = Math.max(600, 1450 - elapsed * 14);

        moleTimersRef.current[idx] = setTimeout(() => {
          if (holesRef.current[idx]?.id === id) {
            const cleaned = holesRef.current.map((h, i) => (i === idx ? null : h));
            holesRef.current = cleaned;
            setHoles([...cleaned]);
          }
          moleTimersRef.current[idx] = null;
        }, hideDur);
      }

      const elapsed = 30 - timeLeftRef.current;
      const nextInterval = Math.max(400, 1200 - elapsed * 13);
      spawnTimerRef.current = setTimeout(spawnOne, nextInterval);
    };

    spawnTimerRef.current = setTimeout(spawnOne, 700);
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [phase, showGameMenu]);

  /* ── Miss handler ── */
  const handleMiss = useCallback(() => {
    if (!gameActiveRef.current) return;
    missesRef.current++;
    if (comboRef.current > 0) {
      comboRef.current = 0;
      setCombo(0);
    }
  }, []);

  /* ── Hit handler ── */
  const handleHit = useCallback(
    (idx: number) => {
      if (!gameActiveRef.current) return;
      const mole = holesRef.current[idx];
      if (!mole || mole.hit) {
        handleMiss();
        return;
      }

      comboRef.current++;
      const newCombo = comboRef.current;
      setCombo(newCombo);
      setComboFlash(true);
      setTimeout(() => setComboFlash(false), 350);

      const bonus = Math.max(0, (newCombo - 2) * 30);
      scoreRef.current += 100 + bonus;
      setScore(scoreRef.current);

      const updated = holesRef.current.map((h, i) =>
        i === idx ? { ...mole, hit: true } : h
      );
      holesRef.current = updated;
      setHoles([...updated]);

      if (newCombo >= 3) {
        setShaking(true);
        setTimeout(() => setShaking(false), 420);
      }

      if (moleTimersRef.current[idx]) clearTimeout(moleTimersRef.current[idx]!);
      moleTimersRef.current[idx] = setTimeout(() => {
        if (holesRef.current[idx]?.id === mole.id) {
          const cleaned = holesRef.current.map((h, i) => (i === idx ? null : h));
          holesRef.current = cleaned;
          setHoles([...cleaned]);
        }
        moleTimersRef.current[idx] = null;
      }, 280);
    },
    [handleMiss]
  );

  /* ── Start game ── */
  const startGame = useCallback(() => {
    scoreRef.current = 0;
    missesRef.current = 0;
    comboRef.current = 0;
    timeLeftRef.current = 30;
    holesRef.current = Array(9).fill(null);
    moleTimersRef.current = Array(9).fill(null);
    gameActiveRef.current = true;
    setScore(0);
    setTimeLeft(30);
    setCombo(0);
    setHoles(Array(9).fill(null));
    setQuip(QUIPS[0]);
    setShaking(false);
    setComboFlash(false);
    setTrueEndStage("mogura");
    setTrueEndFlash(false);
    setPhase("game");
  }, []);

  const toOpening = useCallback(() => {
    setDialogIdx(0);
    setPhase("opening");
  }, []);

  const advanceDialog = () => {
    if (dialogIdx < OPENING_LINES.length - 1) {
      setDialogIdx(dialogIdx + 1);
    } else {
      startGame();
    }
  };

  /* ── Static opening stars ── */
  const senpaiImage = senpaiPose === "normal" ? senpaiNormalImg : senpaiPose === "happy" ? senpaiHappyImg : senpaiImg;

  const openingStars = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 55,
        size: 7 + Math.random() * 11,
        opacity: 0.2 + Math.random() * 0.5,
      })),
    []
  );

  useEffect(() => {
    if (phase !== "opening") {
      setOpeningSenpaiVisible(false);
      setOpeningMoguraFullVisible(false);
      setOpeningShake(false);
      return;
    }

    if (dialogIdx === 1) {
      setOpeningSenpaiVisible(false);
      const showTimer = window.setTimeout(() => setOpeningSenpaiVisible(true), 90);
      return () => window.clearTimeout(showTimer);
    }

    if (dialogIdx === 3) {
      setOpeningShake(true);
      const shakeTimer = window.setTimeout(() => {
        setOpeningShake(false);
        setOpeningMoguraFullVisible(true);
      }, 420);
      return () => window.clearTimeout(shakeTimer);
    }

    if (dialogIdx > 3) {
      setOpeningSenpaiVisible(true);
      setOpeningMoguraFullVisible(true);
    }
  }, [phase, dialogIdx]);

  useEffect(() => {
    setBonusImageExpanded(false);
  }, [selectedBonusCharacter, showBonus]);

  const currentLine = OPENING_LINES[dialogIdx];
  const ending = ENDINGS[endingType];
  const endingLine = ending.lines[endingDialogIdx];
  const isTrueEnding = endingType === "TRUE";

  const bonusCharacters = [
    {
      name: "主人公",
      image: playerImg,
      desc:
        "片思い中の先輩に毎日懲りずに告白する、猪突猛進な女の子。思い立ったら即行動がモットーで、持ち前の明るさとツッコミ力でどんなトラブルにも立ち向かう。恋路を邪魔するモグラとは因縁の宿敵。",
    },
    {
      name: "先輩",
      image: senpaiImg,
      desc:
        "主人公が想いを寄せる憧れの先輩。穏やかで優しくおっとりした癒し系の性格で、男女問わず多くの生徒から慕われている学園の人気者。首元のホクロがチャームポイント。天然な一面があり、突然モグラが現れてもあまり動じないほどのマイペースさを持つ。主人公が毎日のように会いに来ても笑顔で応じており、その優しさが主人公の恋心をますます大きくしている。",
    },
    {
      name: "モグラ",
      image: moguraFullImg,
      desc:
        "主人公が先輩へ告白しようとするたび、決まって地面から飛び出して邪魔をする謎のモグラ。「モグ！」「モグモグーッ！」としか話さないため何を考えているのかは誰にも分からないが、主人公の恋路を阻止することだけは異様な執念を見せる。叩かれても次の日には何事もなかったように現れるしぶとさを持ち、主人公とは毎日のように激突する因縁の宿敵である。",
    },
    {
      name: "王子（元・モグラ）",
      image: princeImg,
      desc:
        "隣国の王子。悪い魔女の呪いによって長い間モグラの姿に変えられていたが、主人公との出来事をきっかけに本来の姿を取り戻す。気品ある立ち振る舞いと誰もが見惚れる端正な容姿を持つ、まさに絵本に出てくるような理想の王子様。主人公への想いは真っ直ぐで、初めて見た時から一途に抱き続けてきた。トゥルーエンドで正体が明かされ、主人公の運命を大きく変える存在となる。主人公に叩かれるたび、どこか嬉しそうに見えたという目撃談もあるが、真相は定かではない。",
    },
  ];
  const detailSenpaiImage = detailSenpaiPose === "normal" ? senpaiNormalImg : detailSenpaiPose === "happy" ? senpaiHappyImg : senpaiImg;
  const selectedBonus = bonusCharacters.find((character) => character.name === selectedBonusCharacter) ?? null;
  const selectedBonusImage = selectedBonus?.name === "先輩" ? detailSenpaiImage : selectedBonus?.image;

  const advanceEndingDialog = () => {
    if (endingType === "TRUE" && showTrueEndScene && endingDialogIdx === 0) {
      setTrueEndStage("prince");
      setTrueEndFlash(true);
      setEndingDialogIdx(1);
      setTimeout(() => setTrueEndFlash(false), 300);
      return;
    }
    if (endingDialogIdx < ending.lines.length - 1) {
      setEndingDialogIdx(endingDialogIdx + 1);
    }
  };

  const cycleSenpaiDetailPose = () => {
    if (!selectedBonus || selectedBonus.name !== "先輩") return;
    const nextPose = detailSenpaiPose === "default" ? "normal" : detailSenpaiPose === "normal" ? "happy" : "default";
    setDetailSenpaiOpacity(0);
    setTimeout(() => {
      setDetailSenpaiPose(nextPose);
      setDetailSenpaiOpacity(1);
    }, 220);
  };

  const startTrueEndScene = () => {
    setShowTrueEndScene(true);
    setTrueEndStage("mogura");
    setEndingDialogIdx(0);
  };

  const endingSenpaiImage =
    endingType === "S"
      ? endingDialogIdx >= 2
        ? senpaiHappyImg
        : senpaiImg
      : endingType === "NORMAL" && endingDialogIdx >= 5
      ? senpaiNormalImg
      : senpaiImg;

  /* ── Render ── */
  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif" }}
    >
      <style>{GAME_STYLES}</style>

      {/* ══ TITLE SCREEN ══ */}
      {phase === "title" && (
        <div
          className="min-h-screen flex flex-col items-center justify-center relative px-6"
          style={{ background: "linear-gradient(160deg, #fbebf3 0%, #fbf7ff 45%, #f4f1fb 100%)" }}
        >
          <FloatingHearts />
          <div className="hidden lg:block absolute left-8 bottom-10 w-72 sm:w-80 lg:w-[24rem]">
            <img src={playerMiniImg} alt="player_mini" className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(244,114,182,0.2)]" />
          </div>
          <div className="hidden lg:block absolute right-6 bottom-8 w-40 sm:w-44 lg:w-48">
            <div className="relative">
              <img src={senpaiMiniImg} alt="senpai_mini" className="w-full h-auto object-contain drop-shadow-[0_18px_30px_rgba(109,40,217,0.16)]" />
              {[
                { right: "-8%", top: "-12%" },
                { right: "8%", top: "-4%" },
                { left: "-8%", top: "16%" },
                { right: "0%", top: "28%" },
                { left: "4%", top: "40%" },
                { right: "18%", top: "44%" },
              ].map((pos, i) => (
                <img
                  key={i}
                  src={moguraFullImg}
                  alt="mogura_full"
                  className="absolute w-20 h-20 object-contain"
                  style={{
                    ...pos,
                    opacity: 0,
                    animation: `title-mogura-fade 3.2s ${i * 0.38}s ease-in-out infinite`,
                    transform: `rotate(${i % 2 === 0 ? -12 : 10}deg)`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-5 text-center w-full max-w-sm">
            {/* Logo / title */}
            <div style={{ animation: "title-float 3.2s ease-in-out infinite" }}>
              <div
                className="text-pink-400 font-black tracking-widest mb-0.5"
                style={{ fontSize: "clamp(11px, 3.5vw, 16px)", letterSpacing: "0.18em" }}
              >
                ♥ 乙女ゲーム風モグラ叩き ♥
              </div>
              <h1
                className="text-pink-600 leading-tight"
                style={{
                  fontSize: "clamp(1.8rem, 8vw, 3.4rem)",
                  fontWeight: 900,
                  textShadow:
                    "2px 2px 0 #fda4af, 5px 5px 0 #fb7185, 0 0 40px rgba(236,72,153,0.25)",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                恋色モグラッシュ！
              </h1>
              <div className="text-purple-400 font-bold mt-1" style={{ fontSize: "clamp(12px, 3.5vw, 16px)" }}>
                ～ 告白への道はモグラだらけ ～
              </div>
            </div>

            {/* Best score */}
            <div
              className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-2.5 border-2 border-pink-200 shadow-lg"
            >
              <div className="text-pink-400 font-black text-xs tracking-widest">✦ BEST SCORE ✦</div>
              <div className="text-pink-600 font-black" style={{ fontSize: "clamp(1.4rem, 5vw, 2rem)" }}>
                {bestScore.toLocaleString()}
              </div>
            </div>

            {/* Ending list */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 border-pink-200 shadow-lg text-left w-full">
              <div className="text-pink-500 font-black text-sm tracking-widest mb-2">★ エンディング一覧 ★</div>
              <div className="space-y-1 text-sm text-slate-600">
                <div className="flex justify-between items-center gap-2 rounded-xl bg-pink-200 px-3 py-2">
                  <span className="text-pink-800">10,000点以上 + ノーミス</span>
                  <span className="font-black text-pink-800">TRUE END</span>
                </div>
                <div className="flex justify-between items-center gap-2 rounded-xl bg-pink-100 px-3 py-2">
                  <span className="text-pink-700">10,000点以上</span>
                  <span className="font-black text-pink-700">HAPPY END</span>
                </div>
                <div className="flex justify-between items-center gap-2 rounded-xl bg-pink-50 px-3 py-2">
                  <span className="text-pink-600">3,000点以上</span>
                  <span className="font-black text-pink-600">NORMAL END</span>
                </div>
                <div className="flex justify-between items-center gap-2 rounded-xl bg-white/80 px-3 py-2">
                  <span className="text-pink-500">3,000点未満</span>
                  <span className="font-black text-pink-500">GAME OVER</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={toOpening}
                className="w-full rounded-full text-white font-black tracking-widest transition-transform hover:scale-105 active:scale-95"
                style={{
                  padding: "0.75rem 2rem",
                  fontSize: "clamp(1rem, 4vw, 1.25rem)",
                  background: "linear-gradient(90deg, #f472b6, #ec4899)",
                  animation: "btn-glow 2.2s ease-in-out infinite",
                }}
              >
                ★ START ★
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="w-full py-2.5 rounded-full text-pink-600 font-bold border-2 border-pink-300 bg-white/80 hover:bg-pink-50 transition-colors"
                style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.1rem)" }}
              >
                ？ 遊び方
              </button>
              {bonusUnlocked && (
                <button
                  onClick={openBonus}
                  className="w-full py-2.5 rounded-full text-white font-black tracking-widest bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 transition-colors"
                  style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.1rem)" }}
                >
                  おまけ
                </button>
              )}
            </div>

            <div className="text-pink-300 font-bold text-sm">♪ Click or Tap to play ♪</div>
          </div>
        </div>
      )}

      {/* ══ OPENING SCREEN ══ */}
      {phase === "opening" && (
        <div
          className="min-h-screen relative cursor-pointer overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, #1e1b4b 0%, #4c1d95 18%, #7c3aed 45%, #db2777 78%, #f97316 100%)",
            animation: openingShake ? "game-shake 0.42s ease-out" : "none",
          }}
          onClick={advanceDialog}
        >
          {/* Stars */}
          <div className="absolute inset-0 pointer-events-none">
            {openingStars.map((s) => (
              <div
                key={s.id}
                className="absolute text-yellow-100"
                style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size, opacity: s.opacity }}
              >
                ✦
              </div>
            ))}
          </div>

          <div className="relative h-screen overflow-hidden">
            <div className="text-center opacity-60 pt-6">
              <div style={{ fontSize: "clamp(3rem, 12vw, 5rem)", filter: "brightness(0.6) sepia(0.3)" }}>
                🏫
              </div>
              <div className="text-yellow-200 text-xs font-bold tracking-widest mt-1">
                ─ 放課後の学校中庭 ─
              </div>
            </div>

            <div className="relative w-full h-[58vh] max-h-[58vh] overflow-hidden">
              <div className="absolute inset-0">
                <div
                  className="absolute left-1/2 top-0 -translate-x-1/2 transition-all duration-700"
                  style={{
                    width: "min(55vw, 260px)",
                    transform: openingSenpaiVisible ? "translateY(0) scale(2)" : "translateY(8px) scale(2)",
                    opacity: openingSenpaiVisible ? 1 : 0,
                    transformOrigin: "top center",
                  }}
                >
                  <img
                    src={senpaiImg}
                    alt="senpai"
                    className="block rounded-3xl shadow-2xl object-cover object-top"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              </div>

              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ opacity: openingMoguraFullVisible ? 1 : 0, transition: "opacity 0.9s ease-out" }}
              >
                <img
                  src={moguraFullImg}
                  alt="mogura_full"
                  className="w-auto h-full object-cover"
                  style={{ minWidth: "120%" }}
                />
              </div>
            </div>

            <div className="absolute left-0 right-0 bottom-0 px-4 pb-6">
              <div
                className="max-w-lg mx-auto rounded-2xl border-2 p-4 relative"
                style={{
                  borderColor: "rgba(249,168,212,0.45)",
                  background: "rgba(255,255,255,0.14)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div
                  className="absolute -top-4 left-5 px-3 py-0.5 rounded-full text-xs font-black border text-white"
                  style={{
                    background:
                      currentLine.speaker === "モグラ"
                        ? "#78350f"
                        : currentLine.speaker === "先輩"
                        ? "#1e1b4b"
                        : currentLine.speaker === "【効果音】"
                        ? "#1f2937"
                        : "#be185d",
                    borderColor:
                      currentLine.speaker === "モグラ"
                        ? "#d97706"
                        : currentLine.speaker === "先輩"
                        ? "#7c3aed"
                        : "rgba(249,168,212,0.5)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {currentLine.speaker}
                </div>

                <p className="text-white font-bold leading-relaxed mt-1" style={{ fontSize: "clamp(0.85rem, 3.5vw, 1.05rem)" }}>
                  {currentLine.text}
                </p>

                <div className="text-right mt-2 text-pink-200/60 text-xs animate-pulse font-bold">
                  {dialogIdx < OPENING_LINES.length - 1 ? "クリックで次へ ▼" : "ゲーム開始！ ▶▶"}
                </div>
              </div>

              <div className="flex justify-center gap-1.5 mt-3">
                {OPENING_LINES.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: i === dialogIdx ? 18 : 6,
                      height: 6,
                      background: i === dialogIdx ? "#f9a8d4" : "rgba(249,168,212,0.3)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ GAME SCREEN ══ */}
      {phase === "game" && (
        <div
          className="min-h-screen flex flex-col relative"
          style={{
            background: "linear-gradient(180deg, #fce7f3 0%, #fdf4ff 55%, #d1fae5 100%)",
            animation: shaking ? "game-shake 0.42s ease-out" : "none",
          }}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b-2 border-pink-200"
            style={{ background: "rgba(253,242,248,0.96)", backdropFilter: "blur(10px)" }}
          >
            {/* Score */}
            <div className="text-center min-w-[5rem]">
              <div className="text-pink-400 font-black text-xs tracking-wider">SCORE</div>
              <div
                className="text-pink-600 font-black tabular-nums"
                style={{ fontSize: "clamp(1.2rem, 5vw, 1.75rem)" }}
              >
                {score.toLocaleString()}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <div className="text-purple-400 font-black text-xs tracking-wider">TIME</div>
              <div
                className="font-black tabular-nums"
                style={{
                  fontSize: "clamp(1.6rem, 7vw, 2.2rem)",
                  color: timeLeft <= 10 ? "#e11d48" : timeLeft <= 20 ? "#f97316" : "#7c3aed",
                  animation:
                    timeLeft <= 10
                      ? "time-warn 0.5s ease-in-out infinite"
                      : "none",
                }}
              >
                {timeLeft}
              </div>
            </div>

            {/* Combo */}
            <div className="text-center min-w-[5rem]">
              <div className="text-rose-400 font-black text-xs tracking-wider">COMBO</div>
              <div
                className="text-rose-500 font-black"
                style={{
                  fontSize: "clamp(1.2rem, 5vw, 1.75rem)",
                  animation: comboFlash && combo > 0 ? "combo-pulse 0.35s ease-out" : "none",
                }}
              >
                {combo > 0 ? `×${combo}` : "---"}
              </div>
            </div>

            <button
              onClick={openGameMenu}
              className="rounded-full border-2 border-pink-200 bg-white/90 text-pink-600 font-black px-3 py-2 text-xs hover:bg-pink-50 transition-colors"
            >
              メニュー
            </button>
          </div>

          {/* Main game area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-4">
            {/* Rank line */}
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-0.5 rounded-full font-black text-sm border-2 border-pink-300 text-pink-600 bg-white/80"
              >
                RANK {getRank(score)}
              </span>
              <span className="text-pink-400 text-sm font-bold">{score.toLocaleString()} pts</span>
            </div>

            {/* 3×3 Mole grid */}
            <div
              className="grid grid-cols-3 p-3 rounded-3xl border-2 border-pink-200 shadow-lg"
              style={{
                gap: "clamp(6px, 2vw, 10px)",
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(4px)",
                maxWidth: 360,
                width: "100%",
              }}
            >
              {holes.map((mole, idx) => (
                <MoleHole
                  key={idx}
                  mole={mole}
                  onHit={() => handleHit(idx)}
                  onMiss={handleMiss}
                />
              ))}
            </div>

            {/* Heroine quip */}
            <div
              className="max-w-xs w-full"
              key={quip}
              style={{ animation: "quip-appear 0.35s ease-out" }}
            >
              <div className="bg-white rounded-2xl border-2 border-pink-200 px-4 py-2 text-center shadow">
                <span className="text-pink-500 font-black text-xs">主人公</span>
                <div className="text-pink-700 font-black mt-0.5" style={{ fontSize: "clamp(0.8rem, 3vw, 0.95rem)" }}>
                  「{quip}」
                </div>
              </div>
            </div>

            <div className="text-pink-300 font-bold text-xs">
              BEST: {bestScore.toLocaleString()} pts
            </div>
          </div>
        </div>
      )}

      {/* ══ GAME MENU MODAL ══ */}
      {showGameMenu && phase === "game" && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeGameMenu}
        >
          <div
            className="bg-white rounded-3xl border-2 border-pink-200 p-6 max-w-sm w-full shadow-2xl"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-pink-600 font-black text-lg">メニュー</div>
                <div className="text-sm text-slate-500">ゲームを一時停止しています</div>
              </div>
              <button
                onClick={closeGameMenu}
                className="text-slate-400 hover:text-slate-600 font-black"
              >
                ×
              </button>
            </div>

            {gameMenuView === "menu" ? (
              <div className="space-y-3">
                <button
                  onClick={quitGame}
                  className="w-full rounded-2xl bg-pink-500 text-white font-black py-3 hover:bg-pink-600 transition-colors"
                >
                  ゲームをやめる
                </button>
                <button
                  onClick={closeGameMenu}
                  className="w-full rounded-2xl border-2 border-pink-300 text-pink-600 font-black py-3 hover:bg-pink-50 transition-colors"
                >
                  ゲームを続ける
                </button>
                <button
                  onClick={() => setGameMenuView("tips")}
                  className="w-full rounded-2xl bg-white border-2 border-pink-300 text-pink-600 font-black py-3 hover:bg-pink-50 transition-colors"
                >
                  攻略のポイント
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-pink-600 font-black text-base">攻略のポイント</div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li>・モグラが出てきたらすぐに叩くこと！</li>
                  <li>・連続ヒットでコンボが上がり、点数がアップ。</li>
                  <li>・空振りするとコンボがリセットされるので慎重に。</li>
                  <li>・時間が経つほどモグラが速くなるので、終盤が勝負。</li>
                  <li>・ノーミスで10,000点以上取ると、いいことあるかも…？</li>
                </ul>
                <button
                  onClick={() => setGameMenuView("menu")}
                  className="w-full rounded-2xl border-2 border-pink-300 text-pink-600 font-black py-3 hover:bg-pink-50 transition-colors"
                >
                  メニューに戻る
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ ENDING SCREEN ══ */}
      {phase === "ending" && (
        <div
          className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-5 py-8"
          style={{ background: ending.gradient }}
        >
          <EndingFX endingType={endingType} />

          <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-md w-full">
            {/* Emoji */}
            <div style={{ fontSize: "clamp(3rem, 14vw, 5rem)", animation: "rank-pop 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}>
              {ending.emoji}
            </div>

            {/* Rank badge */}
            <div
              className="bg-white/25 rounded-full border-2 border-white/50 text-white font-black tracking-wider"
              style={{
                padding: "4px 20px",
                fontSize: "clamp(0.85rem, 3.5vw, 1.1rem)",
                animation: "rank-pop 0.6s 0.1s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              RANK {ending.rank}
            </div>

            {/* Title */}
            <div style={{ animation: "rank-pop 0.6s 0.2s cubic-bezier(0.34,1.56,0.64,1) both" }}>
              <h2
                className="text-white font-black leading-tight"
                style={{
                  fontSize: "clamp(1.4rem, 6vw, 2.2rem)",
                  textShadow: "0 2px 12px rgba(0,0,0,0.3)",
                }}
              >
                {ending.title}
              </h2>
              <div className="text-white/80 font-bold mt-1" style={{ fontSize: "clamp(0.8rem, 3vw, 0.95rem)" }}>
                {ending.subtitle}
              </div>
            </div>

            {/* Score */}
            <div
              className="bg-white/20 rounded-2xl border border-white/35 px-8 py-3"
              style={{ animation: "rank-pop 0.6s 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}
            >
              <div className="text-white/70 font-bold text-xs tracking-widest">SCORE</div>
              <div className="text-white font-black tabular-nums" style={{ fontSize: "clamp(1.6rem, 7vw, 2.2rem)" }}>
                {score.toLocaleString()}
              </div>
            </div>

            {/* Story text */}
            {isTrueEnding ? (
              <>
                {!showTrueEndScene ? (
                  <button
                    onClick={startTrueEndScene}
                    className="w-full rounded-2xl border border-white/25 bg-black/20 p-4 text-left transition hover:bg-white/10"
                    style={{ animation: "dialog-slide 0.5s 0.4s ease-out both" }}
                  >
                    <p className="text-white font-bold leading-relaxed" style={{ fontSize: "clamp(0.95rem, 3vw, 1rem)" }}>
                      ……おや！？モグラの様子が……！
                    </p>
                  </button>
                ) : (
                  <div className="relative w-full rounded-3xl overflow-hidden border border-white/25" style={{ minHeight: 320, animation: "dialog-slide 0.5s 0.4s ease-out both" }}>
                    <div className="relative h-[34vh] min-h-[240px] overflow-hidden bg-slate-950">
                      <img
                        src={trueEndStage === "mogura" ? moguraFullImg : princeImg}
                        alt={trueEndStage === "mogura" ? "mogura_full" : "prince"}
                        className="absolute left-1/2 top-0 h-full min-h-full object-cover object-top"
                        style={{ transform: "translateX(-50%)", width: "auto", minWidth: "100%" }}
                      />
                      {trueEndFlash && (
                        <div className="absolute inset-0 bg-white" style={{ opacity: 0.9, transition: "opacity 0.2s ease-out" }} />
                      )}
                    </div>
                    <div className="bg-black/25 p-4 cursor-pointer" onClick={advanceEndingDialog}>
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white/90">
                        {trueEndStage === "mogura"
                          ? "Narration"
                          : typeof endingLine === "object" && endingLine.speaker
                          ? endingLine.speaker
                          : "Narration"}
                      </div>
                      <p className="text-white font-bold leading-relaxed" style={{ fontSize: "clamp(0.95rem, 3vw, 1rem)" }}>
                        {typeof endingLine === "object" ? endingLine.text : endingLine}
                      </p>
                      <div className="text-right mt-3 text-pink-200/60 text-xs animate-pulse font-bold">
                        {endingDialogIdx < ending.lines.length - 1 ? "クリックで次へ ▼" : "タッチでエンディングを終了"}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : endingType === "S" || endingType === "NORMAL" ? (
              <div className="relative w-full rounded-3xl overflow-hidden border border-white/25" style={{ minHeight: 320, animation: "dialog-slide 0.5s 0.4s ease-out both" }}>
                <div className="relative h-[34vh] min-h-[240px] overflow-hidden bg-slate-950">
                  <img
                    src={endingSenpaiImage}
                    alt="senpai"
                    className="absolute left-1/2 top-0 h-full min-h-full object-cover object-top"
                    style={{ transform: "translateX(-50%)", width: "auto", minWidth: "100%" }}
                  />
                </div>
                <div className="bg-black/25 p-4 cursor-pointer" onClick={advanceEndingDialog}>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white/90">
                    {typeof endingLine === "object" && endingLine.speaker ? endingLine.speaker : "Narration"}
                  </div>
                  <p className="text-white font-bold leading-relaxed" style={{ fontSize: "clamp(0.95rem, 3vw, 1rem)" }}>
                    {typeof endingLine === "object" ? endingLine.text : endingLine}
                  </p>
                  <div className="text-right mt-3 text-pink-200/60 text-xs animate-pulse font-bold">
                    {endingDialogIdx < ending.lines.length - 1 ? "クリックで次へ ▼" : "タッチでエンディングを終了"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-black/20 rounded-2xl p-4 border border-white/25 text-left w-full" style={{ animation: "dialog-slide 0.5s 0.4s ease-out both" }}>
                {ending.lines.map((line, idx) => (
                  <div key={idx} className="text-white font-bold leading-relaxed mt-3" style={{ fontSize: "clamp(0.85rem, 3vw, 1rem)" }}>
                    {typeof line === "object" ? `${line.speaker}「${line.text}」` : line}
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 w-full max-w-xs" style={{ animation: "dialog-slide 0.5s 0.6s ease-out both" }}>
              <button
                onClick={toOpening}
                className="flex-1 rounded-full border-2 border-white/55 text-white font-black hover:bg-white/15 transition-colors"
                style={{ padding: "0.7rem 0.5rem", fontSize: "clamp(0.85rem, 3.5vw, 1rem)" }}
              >
                もう一度！
              </button>
              <button
                onClick={() => setPhase("title")}
                className="flex-1 rounded-full bg-white text-pink-600 font-black hover:bg-pink-50 transition-colors shadow-lg"
                style={{ padding: "0.7rem 0.5rem", fontSize: "clamp(0.85rem, 3.5vw, 1rem)" }}
              >
                タイトルへ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ HELP MODAL ══ */}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-white rounded-3xl border-2 border-pink-200 p-6 max-w-sm w-full shadow-2xl"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-pink-600 font-black text-center mb-4" style={{ fontSize: "clamp(1.1rem, 4vw, 1.4rem)" }}>
              ♥ 遊び方 ♥
            </h3>

            <div className="space-y-3 text-sm">
              {[
                { icon: <MoleHelpIcon />, title: "モグラを叩け！", body: "穴から飛び出したモグラをクリック/タップ！1匹100点！" },
                { icon: "⚡", title: "コンボでボーナス！", body: "連続ヒットでコンボ加算！空振りするとリセット。3コンボ以上で画面が揺れる！" },
                { icon: "⏱", title: "制限時間30秒", body: "時間が経つほどモグラが速くなる！集中して！" },
              ].map(({ icon, title, body }) => (
                <div key={title} className="flex gap-3 items-start">
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  <div>
                    <div className="font-black text-pink-700">{title}</div>
                    <div className="text-gray-500 leading-snug">{body}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-4 py-3 rounded-full bg-pink-500 text-white font-black hover:bg-pink-600 transition-colors"
            >
              よし！やってみる！
            </button>
          </div>
        </div>
      )}
      {showBonus && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={closeBonus}
        >
          <div
            className="w-full max-w-5xl rounded-3xl bg-white p-6 shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h2 className="text-3xl font-black text-slate-900">キャラクター設定</h2>
                <p className="text-slate-500 mt-1">TRUE END を達成すると見られるおまけ画面です。</p>
              </div>
              <button
                onClick={closeBonus}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                CLOSE
              </button>
            </div>
            <div className="grid gap-6">
              {selectedBonus ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedBonusCharacter(null)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    ◀ 戻る
                  </button>
                  <div className="grid gap-6 lg:grid-cols-[360px_1fr] items-start">
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setBonusImageExpanded((prev) => !prev)}
                        className="w-full rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 text-left shadow-sm transition hover:border-pink-300"
                        style={{ minHeight: 320, maxHeight: 420 }}
                      >
                        <div className="relative flex h-full min-h-[320px] items-center justify-center overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
                          <img
                            src={selectedBonusImage ?? selectedBonus?.image}
                            alt={selectedBonus?.name}
                            className="block h-full w-full transition-all duration-300"
                            style={{
                              display: "block",
                              opacity: selectedBonus?.name === "先輩" ? detailSenpaiOpacity : 1,
                              objectFit: "contain",
                              objectPosition: "center",
                              transform: bonusImageExpanded ? "scale(1.02)" : "scale(1)",
                              transition: "opacity 0.22s ease, transform 0.22s ease",
                            }}
                          />
                          <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white">
                            {bonusImageExpanded ? "expanded" : "tap to expand"}
                          </div>
                        </div>
                      </button>
                      {selectedBonus?.name === "先輩" && bonusImageExpanded && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={cycleSenpaiDetailPose}
                            className="rounded-full border border-pink-300 bg-pink-50 px-4 py-2 text-sm font-black text-pink-700 transition hover:bg-pink-100"
                          >
                            差分切り替え
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="text-3xl font-black text-slate-900">{selectedBonus.name}</div>
                      <p className="text-slate-600 leading-relaxed text-sm">{selectedBonus.desc}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {bonusCharacters.map((character) => (
                    <button
                      key={character.name}
                      onClick={() => setSelectedBonusCharacter(character.name)}
                      className="rounded-3xl border border-slate-200 p-4 text-left bg-white shadow-sm hover:border-pink-300 transition-colors"
                    >
                      <div className="text-lg font-black text-slate-900">{character.name}</div>
                      <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                        {character.desc.slice(0, 72)}...
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-pink-600">
                        詳細を見る
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
