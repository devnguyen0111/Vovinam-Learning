import { useEffect, useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import logoVovinam from "./assets/vovinam_logo.png";
import qrSupport from "./assets/gopquy.png";
import questions from "../assets/question.json";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const STORAGE_KEY = "vovinam_quiz_master_state";
const TIPS = [
  "Nhớ Nguyễn Lộc: 8/4/1912 và mất 4/4/1960 để dễ thuộc cột mốc lịch sử.",
  "Cương Nhu phối triển: vòng trong Âm (Nhu), vòng ngoài Dương (Cương).",
  "4 màu đai theo tiến trình ngấm sâu: Xanh → Vàng → Đỏ → Trắng.",
  "Câu lịch sử chính nằm ở nhóm 1-4, ôn kỹ để lên cấp Hoàng đai.",
];

const QUESTION_TIPS = {
  1: "Nhớ mốc 8/4/1912 và 4/4/1960 theo cặp số 8-4 / 4-4 để thuộc nhanh tiểu sử Sáng tổ.",
  2: "Ghi nhớ chuỗi 38-39: hoàn thành nghiên cứu 1938, biểu diễn lớn đầu tiên 1939 tại Nhà hát Lớn Hà Nội.",
  3: "Tách nghĩa thành 2 tầng: Vovinam = Võ Việt Nam (gốc), Việt võ đạo = phần đạo (hoa trái).",
  4: "Mẹo mốc thời gian: Lê Sáng sinh 1920, mất 2010; hai đầu 20 và 10 rất dễ liên tưởng.",
  5: "Cụm khóa cần thuộc: Bàn tay thép - trái tim từ ái, tức võ mạnh nhưng luôn nhân ái.",
  6: "Nhớ đai 2 vòng = Âm Dương; vòng trong Nhu, vòng ngoài Cương để tránh nhầm thứ tự.",
  7: "Kỷ luật Việt võ đạo là tự giác: nhìn gương người trên, tự sửa mình trước khi bị kỷ luật.",
  8: "Mục đích học gồm 3 trụ: khỏe thân, sáng trí, cao tâm - rồi mới phục vụ tổ quốc.",
  9: "Nhớ công thức 4 màu theo mức độ ngấm: Xanh (hy vọng) → Vàng (da thịt) → Đỏ (máu huyết) → Trắng (xương tủy).",
  10: "Mẹo hệ đai: Lam 4 cấp, Hoàng 4 cấp, Hồng 7 cấp, Bạch 1 cấp lãnh đạo cao nhất.",
};

const QUESTION_TEXT_BY_ID = Object.fromEntries(
  questions.map((item) => [item.id, item.question]),
);
const NAV_ITEMS = [
  { key: "home", label: "Home" },
  { key: "learn", label: "Học" },
  { key: "play", label: "Chơi" },
  { key: "qa", label: "Q&A" },
  { key: "progress", label: "Tiến trình" },
  { key: "support", label: "Ủng hộ" },
];
const FIREWORK_PARTICLE_COUNT = 26;

const createFireworkParticles = (direction) =>
  Array.from({ length: FIREWORK_PARTICLE_COUNT }, (_, index) => {
    const distance = 36 + Math.random() * 140;
    const spread = Math.random() * 0.95;
    const xSign = direction === "left" ? 1 : -1;
    const offsetX = xSign * (18 + distance * spread);
    const offsetY = -(48 + distance * (1 - spread * 0.3));
    const size = 4 + Math.random() * 5;
    const hue = (index * 23 + Math.random() * 55) % 360;

    return {
      id: `${direction}-${index}-${Math.random()}`,
      x: `${offsetX.toFixed(2)}px`,
      y: `${offsetY.toFixed(2)}px`,
      size: `${size.toFixed(2)}px`,
      color: `hsl(${hue.toFixed(0)}, 100%, 60%)`,
      delay: `${(Math.random() * 0.09).toFixed(3)}s`,
      duration: `${(1 + Math.random() * 0.35).toFixed(2)}s`,
    };
  });

const QUIZ_LEVEL_SETS = {
  lam: { label: "Lam đai", questionIds: [1, 2, 3], count: 3 },
  hoang: { label: "Hoàng đai", questionIds: [1, 2, 3, 4, 5, 6], count: 6 },
  hong: { label: "Hồng đai", questionIds: [1, 2, 3, 4, 5, 6, 7, 8], count: 8 },
  bach: {
    label: "Bạch đai",
    questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    count: 10,
  },
};

const QUIZ_BANK = [
  {
    id: 1,
    prompt: QUESTION_TEXT_BY_ID[1],
    options: [
      "Nguyễn Lộc, sinh 1912 tại Sơn Tây và mất 1960 tại Sài Gòn",
      "Lê Sáng, sinh 1920 tại Hà Nội và mất 2010 tại TP. Hồ Chí Minh",
      "Nguyễn Văn Chiếu, sinh 1938 tại Hà Nội và mất 2020 tại TP. Hồ Chí Minh",
      "Trần Huy Phong, sinh 1912 tại Huế và mất 1965 tại Đà Nẵng",
    ],
    correct: "Nguyễn Lộc, sinh 1912 tại Sơn Tây và mất 1960 tại Sài Gòn",
  },
  {
    id: 2,
    prompt: QUESTION_TEXT_BY_ID[2],
    options: [
      "Năm 1938; biểu diễn đầu tiên tại Nhà hát Lớn Hà Nội năm 1939",
      "Năm 1939; biểu diễn đầu tiên tại Huế năm 1940",
      "Năm 1912; biểu diễn đầu tiên tại Sài Gòn năm 1920",
      "Năm 1960; biểu diễn đầu tiên tại Đà Nẵng năm 1961",
    ],
    correct: "Năm 1938; biểu diễn đầu tiên tại Nhà hát Lớn Hà Nội năm 1939",
  },
  {
    id: 3,
    prompt: QUESTION_TEXT_BY_ID[3],
    options: [
      "Tên quốc tế hóa của Võ Việt Nam, gồm Việt võ thuật và Việt võ đạo",
      "Một nhánh của Judo dùng trong thi đấu Olympic",
      "Môn võ lai giữa Karate và Taekwondo",
      "Tên gọi khác của quyền Anh Việt Nam",
    ],
    correct:
      "Tên quốc tế hóa của Võ Việt Nam, gồm Việt võ thuật và Việt võ đạo",
  },
  {
    id: 4,
    prompt: QUESTION_TEXT_BY_ID[4],
    options: [
      "Cố Võ sư Lê Sáng; sinh 1920 tại Hà Nội, mất 2010 tại TP. Hồ Chí Minh",
      "Cố Võ sư Nguyễn Lộc; sinh 1920 tại Hà Nội, mất 2010 tại TP. Hồ Chí Minh",
      "Cố Võ sư Trần Huy Phong; sinh 1912 tại Sơn Tây, mất 1960 tại Sài Gòn",
      "Cố Võ sư Nguyễn Văn Chiếu; sinh 1938 tại Hà Nội, mất 2000 tại Huế",
    ],
    correct:
      "Cố Võ sư Lê Sáng; sinh 1920 tại Hà Nội, mất 2010 tại TP. Hồ Chí Minh",
  },
  {
    id: 5,
    prompt: QUESTION_TEXT_BY_ID[5],
    options: [
      "Bàn tay thép đặt lên trái tim từ ái, võ đi cùng đạo",
      "Luôn ưu tiên tấn công để áp đảo đối thủ",
      "Chỉ tập trung vào sức mạnh cơ bắp",
      "Dùng võ để trả thù khi bị xúc phạm",
    ],
    correct: "Bàn tay thép đặt lên trái tim từ ái, võ đi cùng đạo",
  },
  {
    id: 6,
    prompt: QUESTION_TEXT_BY_ID[6],
    options: [
      "Thắt 2 vòng: vòng trong Âm (Nhu), vòng ngoài Dương (Cương)",
      "Thắt 1 vòng để biểu trưng sức mạnh tuyệt đối",
      "Thắt 3 vòng tượng trưng Tam tài Thiên-Địa-Nhân",
      "Thắt 4 vòng tượng trưng 4 màu đai",
    ],
    correct: "Thắt 2 vòng: vòng trong Âm (Nhu), vòng ngoài Dương (Cương)",
  },
  {
    id: 7,
    prompt: QUESTION_TEXT_BY_ID[7],
    options: [
      "Kỷ luật tự giác, người trên làm gương và người dưới tự tôn trọng",
      "Kỷ luật cưỡng chế tuyệt đối, không cần giải thích",
      "Kỷ luật theo thành tích thi đấu là chính",
      "Chỉ huấn luyện viên mới cần giữ kỷ luật",
    ],
    correct: "Kỷ luật tự giác, người trên làm gương và người dưới tự tôn trọng",
  },
  {
    id: 8,
    prompt: QUESTION_TEXT_BY_ID[8],
    options: [
      "Rèn sức khỏe, trí tuệ, tâm hồn để phục vụ tổ quốc và lẽ phải",
      "Chỉ để tự vệ trong mọi tình huống",
      "Mục tiêu chính là đạt đai thật nhanh",
      "Chủ yếu để biểu diễn và giải trí",
    ],
    correct: "Rèn sức khỏe, trí tuệ, tâm hồn để phục vụ tổ quốc và lẽ phải",
  },
  {
    id: 9,
    prompt: QUESTION_TEXT_BY_ID[9],
    options: [
      "Có 4 màu đai: Xanh, Vàng, Đỏ, Trắng",
      "Có 3 màu đai: Xanh, Đỏ, Trắng",
      "Có 5 màu đai: Đen, Xanh, Vàng, Đỏ, Trắng",
      "Có 6 màu đai theo hệ võ quốc tế",
    ],
    correct: "Có 4 màu đai: Xanh, Vàng, Đỏ, Trắng",
  },
  {
    id: 10,
    prompt: QUESTION_TEXT_BY_ID[10],
    options: [
      "Lam đai 4 cấp, Hoàng đai 4 cấp, Hồng đai 7 cấp, Bạch đai 1 cấp",
      "Lam đai 3 cấp, Hoàng đai 5 cấp, Hồng đai 2 cấp, Bạch đai 1 cấp",
      "Chỉ có Lam đai và Bạch đai",
      "Hệ đai không có quy định cấp bậc",
    ],
    correct: "Lam đai 4 cấp, Hoàng đai 4 cấp, Hồng đai 7 cấp, Bạch đai 1 cấp",
  },
];

const FILL_BLANKS = [
  {
    id: 1,
    sentence: "Vovinam có __ màu đai: Xanh, Vàng, Đỏ, Trắng.",
    options: ["2", "3", "4", "5"],
    answer: "4",
  },
  {
    id: 2,
    sentence: "Sáng tổ Nguyễn Lộc hoàn thành nghiên cứu Vovinam năm __.",
    options: ["1938", "1939", "1912", "1960"],
    answer: "1938",
  },
  {
    id: 3,
    sentence: "Nghiêm lễ đặt bàn tay thép lên trái tim __.",
    options: ["từ ái", "giận dữ", "kiêu hãnh", "quyền lực"],
    answer: "từ ái",
  },
  {
    id: 4,
    sentence: "Đai Vovinam thắt __ vòng để biểu trưng âm dương.",
    options: ["1", "2", "3", "4"],
    answer: "2",
  },
  {
    id: 5,
    sentence: "Sáng tổ môn phái Vovinam là võ sư __.",
    options: ["Nguyễn Lộc", "Lê Sáng", "Nguyễn Văn Chiếu", "Trần Huy Phong"],
    answer: "Nguyễn Lộc",
  },
  {
    id: 6,
    sentence: "Cuộc biểu diễn Vovinam đầu tiên tổ chức tại __.",
    options: ["Nhà hát Lớn Hà Nội", "Huế", "Đà Nẵng", "Cần Thơ"],
    answer: "Nhà hát Lớn Hà Nội",
  },
  {
    id: 7,
    sentence: "Kỷ luật Việt võ đạo là kỷ luật __.",
    options: ["tự giác", "cưỡng chế", "trừng phạt", "bắt buộc"],
    answer: "tự giác",
  },
  {
    id: 8,
    sentence: "Đai lãnh đạo cao nhất trong môn phái là __ đai.",
    options: ["Bạch", "Lam", "Hoàng", "Hồng"],
    answer: "Bạch",
  },
  {
    id: 9,
    sentence: "Nghiên cứu Vovinam hoàn thành vào năm __.",
    options: ["1938", "1939", "1912", "1960"],
    answer: "1938",
  },
  {
    id: 10,
    sentence: "Nghiêm lễ nhấn mạnh bàn tay thép trên trái tim __.",
    options: ["từ ái", "quyền lực", "giận dữ", "hào nhoáng"],
    answer: "từ ái",
  },
];

const WHEEL_BANK = [
  ...QUIZ_BANK,
  {
    id: 11,
    prompt: "Sáng tổ Nguyễn Lộc qua đời ở đâu?",
    options: ["Sài Gòn", "Hà Nội", "Huế", "Đà Nẵng"],
    correct: "Sài Gòn",
  },
  {
    id: 12,
    prompt: "Màu đai tượng trưng cho máu và lửa sống hào hùng là màu nào?",
    options: ["Đỏ", "Xanh", "Vàng", "Trắng"],
    correct: "Đỏ",
  },
  {
    id: 13,
    prompt: "Hoàng đai đệ Nhị cấp có thời gian tập khoảng bao lâu?",
    options: ["3 năm", "2 năm", "4 năm", "6 năm"],
    correct: "3 năm",
  },
  {
    id: 14,
    prompt: "Cụm nào đúng với nghiêm lễ Việt võ đạo?",
    options: [
      "Bàn tay thép, trái tim từ ái",
      "Tấn công là trên hết",
      "Sức mạnh không cần đạo lý",
      "Thắng bằng mọi giá",
    ],
    correct: "Bàn tay thép, trái tim từ ái",
  },
  {
    id: 15,
    prompt: "Trong 4 màu đai chính, màu nào biểu trưng cho xương?",
    options: ["Trắng", "Đỏ", "Xanh", "Vàng"],
    correct: "Trắng",
  },
  {
    id: 16,
    prompt: "Ý nghĩa 'kỷ luật tự giác' nhấn mạnh điều gì?",
    options: [
      "Tự hiểu và tôn trọng kỷ luật",
      "Chỉ nghe mệnh lệnh từ trên",
      "Kỷ luật bằng phạt nặng",
      "Kỷ luật chỉ dành cho huấn luyện viên",
    ],
    correct: "Tự hiểu và tôn trọng kỷ luật",
  },
];

const LEVELS = [
  { key: "lam", label: "Lam đai", threshold: 0 },
  { key: "hoang", label: "Hoàng đai", threshold: 120 },
  { key: "hong", label: "Hồng đai", threshold: 240 },
  { key: "bach", label: "Bạch đai", threshold: 360 },
];

const defaultProgress = {
  score: 0,
  bestScore: 0,
  known: {},
  reviewCounts: {},
  quizAttempts: 0,
  quizWins: 0,
  badges: [],
  daily: {
    date: "",
    questionIds: [],
    completed: false,
    rewardClaimed: false,
  },
};

const shortText = (text) =>
  text.length > 70 ? `${text.slice(0, 67)}...` : text;

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const shuffleQuestionOptions = (question, avoidCorrectIndex = -1) => {
  let bestOptions = shuffle(question.options);
  let bestIndex = bestOptions.indexOf(question.correct);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = shuffle(question.options);
    const candidateIndex = candidate.indexOf(question.correct);
    if (candidateIndex !== avoidCorrectIndex) {
      return {
        ...question,
        options: candidate,
        correctIndex: candidateIndex,
      };
    }
    bestOptions = candidate;
    bestIndex = candidateIndex;
  }

  return {
    ...question,
    options: bestOptions,
    correctIndex: bestIndex,
  };
};

const buildQuizQuestions = (source) => {
  let previousCorrectIndex = -1;
  return source.map((question) => {
    const randomized = shuffleQuestionOptions(question, previousCorrectIndex);
    previousCorrectIndex = randomized.correctIndex;
    return randomized;
  });
};

const getToday = () => new Date().toISOString().slice(0, 10);

const ensureDailyState = (state) => {
  const today = getToday();
  if (state.daily?.date === today) return state;
  return {
    ...state,
    daily: {
      date: today,
      questionIds: shuffle(QUIZ_BANK.map((item) => item.id)).slice(0, 5),
      completed: false,
      rewardClaimed: false,
    },
  };
};

const getLevel = (score) => {
  let current = LEVELS[0];
  LEVELS.forEach((level) => {
    if (score >= level.threshold) {
      current = level;
    }
  });
  return current;
};

const loadProgress = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return ensureDailyState(defaultProgress);
  try {
    return ensureDailyState({ ...defaultProgress, ...JSON.parse(raw) });
  } catch {
    return ensureDailyState(defaultProgress);
  }
};

const buildMatchingCards = () =>
  shuffle(
    questions.flatMap((item) => [
      {
        key: `q-${item.id}`,
        id: item.id,
        type: "q",
        text: shortText(item.question),
      },
      {
        key: `a-${item.id}`,
        id: item.id,
        type: "a",
        text: shortText(item.answer),
      },
    ]),
  );

const safeBeep = (type = "correct") => {
  try {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = type === "correct" ? 660 : 240;
    gain.gain.value = 0.1;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.18);
  } catch {
    return null;
  }
  return null;
};

function App() {
  const [tab, setTab] = useState("home");
  const [progress, setProgress] = useState(loadProgress);

  const [flashIndex, setFlashIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewOnly, setReviewOnly] = useState(false);

  const [quizLevel, setQuizLevel] = useState("lam");
  const [quizSession, setQuizSession] = useState(null);
  const [quizTimer, setQuizTimer] = useState(30);

  const [matchingCards, setMatchingCards] = useState(buildMatchingCards);
  const [openedCards, setOpenedCards] = useState([]);
  const [matchedKeys, setMatchedKeys] = useState([]);

  const [fillIndex, setFillIndex] = useState(0);
  const [fillPicked, setFillPicked] = useState("");

  const [wheelRound, setWheelRound] = useState(null);
  const [wheelAnswer, setWheelAnswer] = useState("");
  const [qaSelection, setQaSelection] = useState("all");
  const [fireworkBursts, setFireworkBursts] = useState([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (!quizSession || quizSession.finished) return undefined;
    const timer = setInterval(() => {
      setQuizTimer((prev) => {
        if (prev <= 1) {
          setQuizSession((last) => {
            if (!last || last.finished) return last;
            const current = last.questions[last.current];
            const alreadyAnswered = last.answers[current.id];
            if (alreadyAnswered) return last;

            safeBeep("wrong");
            const nextAnswers = {
              ...last.answers,
              [current.id]: { selected: "Hết giờ", correct: false },
            };
            const nextCurrent = last.current + 1;
            const finished = nextCurrent >= last.questions.length;
            const nextSession = {
              ...last,
              current: finished ? last.current : nextCurrent,
              finished,
              answers: nextAnswers,
              total: Math.max(0, last.total - 5),
            };
            if (finished) {
              finalizeQuiz(nextSession.total, nextSession);
            }
            return nextSession;
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizSession]);

  const masteredCount = useMemo(
    () => questions.filter((item) => progress.known[item.id]).length,
    [progress.known],
  );

  const currentLevel = getLevel(progress.score);
  const unlockedTip =
    TIPS[Math.min(TIPS.length - 1, Math.floor(progress.score / 60))];

  const dailyQuestions = useMemo(
    () =>
      QUIZ_BANK.filter((item) => progress.daily.questionIds.includes(item.id)),
    [progress.daily.questionIds],
  );

  const flashDeck = useMemo(() => {
    if (!reviewOnly) return questions;
    const unknown = questions.filter((item) => !progress.known[item.id]);
    return unknown.length ? unknown : questions;
  }, [reviewOnly, progress.known]);

  const currentFlashcard = flashDeck[flashIndex % flashDeck.length];
  const currentQuestionTip = currentFlashcard
    ? QUESTION_TIPS[currentFlashcard.id]
    : unlockedTip;

  const qaItems = useMemo(() => {
    if (qaSelection === "all") return questions;
    const selectedId = Number(qaSelection);
    return questions.filter((item) => item.id === selectedId);
  }, [qaSelection]);

  const updateScore = (delta) => {
    setProgress((prev) => {
      const score = Math.max(0, prev.score + delta);
      return {
        ...prev,
        score,
        bestScore: Math.max(prev.bestScore, score),
      };
    });
  };

  const updateReview = (id) => {
    setProgress((prev) => ({
      ...prev,
      reviewCounts: {
        ...prev.reviewCounts,
        [id]: (prev.reviewCounts[id] ?? 0) + 1,
      },
    }));
  };

  const triggerFireworks = () => {
    const burstId = `${Date.now()}-${Math.random()}`;
    const burst = {
      id: burstId,
      leftParticles: createFireworkParticles("left"),
      rightParticles: createFireworkParticles("right"),
    };
    setFireworkBursts((prev) => [...prev, burst]);
    window.setTimeout(() => {
      setFireworkBursts((prev) => prev.filter((item) => item.id !== burstId));
    }, 1500);
  };

  const markCard = (known) => {
    setProgress((prev) => ({
      ...prev,
      known: {
        ...prev.known,
        [currentFlashcard.id]: known,
      },
    }));
    updateReview(currentFlashcard.id);
    if (known) {
      updateScore(3);
      safeBeep("correct");
      triggerFireworks();
    }
    nextFlashcard();
  };

  const nextFlashcard = () => {
    setFlipped(false);
    setFlashIndex((prev) => (prev + 1) % flashDeck.length);
  };

  const startQuiz = (dailyMode = false) => {
    const selectedLevel = QUIZ_LEVEL_SETS[quizLevel] ?? QUIZ_LEVEL_SETS.lam;
    const levelQuestions = QUIZ_BANK.filter((item) =>
      selectedLevel.questionIds.includes(item.id),
    );
    const source = dailyMode
      ? dailyQuestions
      : shuffle(levelQuestions).slice(0, selectedLevel.count);
    const randomizedSource = buildQuizQuestions(source);
    setQuizSession({
      questions: randomizedSource,
      current: 0,
      total: 0,
      answers: {},
      finished: false,
      dailyMode,
    });
    setQuizTimer(30);
  };

  const finalizeQuiz = (total, sessionData) => {
    setProgress((prev) => {
      const wins = total >= Math.round(sessionData.questions.length * 8);
      const highEnough =
        sessionData.questions.length > 0 &&
        total >= sessionData.questions.length * 8;
      const badges = [...prev.badges];
      if (highEnough && !badges.includes("Huy hiệu Võ sư")) {
        badges.push("Huy hiệu Võ sư");
      }
      const nextDaily = sessionData.dailyMode
        ? {
            ...prev.daily,
            completed: true,
          }
        : prev.daily;

      return {
        ...prev,
        score: Math.max(0, prev.score + total),
        bestScore: Math.max(prev.bestScore, prev.score + total),
        quizAttempts: prev.quizAttempts + 1,
        quizWins: prev.quizWins + (wins ? 1 : 0),
        badges,
        daily: nextDaily,
      };
    });
  };

  const answerQuiz = (option) => {
    setQuizSession((prev) => {
      if (!prev || prev.finished) return prev;
      const current = prev.questions[prev.current];
      if (prev.answers[current.id]) return prev;

      const isCorrect = option === current.correct;
      const total = Math.max(0, prev.total + (isCorrect ? 10 : -5));
      const answers = {
        ...prev.answers,
        [current.id]: { selected: option, correct: isCorrect },
      };
      safeBeep(isCorrect ? "correct" : "wrong");
      return {
        ...prev,
        answers,
        total,
      };
    });
  };

  const nextQuizQuestion = () => {
    setQuizSession((prev) => {
      if (!prev || prev.finished) return prev;
      const nextCurrent = prev.current + 1;
      const finished = nextCurrent >= prev.questions.length;
      const nextSession = {
        ...prev,
        current: finished ? prev.current : nextCurrent,
        finished,
      };
      if (finished) {
        finalizeQuiz(prev.total, nextSession);
      }
      return nextSession;
    });
    setQuizTimer(30);
  };

  const initMatching = () => {
    const cards = buildMatchingCards();
    setMatchingCards(cards);
    setOpenedCards([]);
    setMatchedKeys([]);
  };

  const openCard = (card) => {
    if (
      openedCards.some((item) => item.key === card.key) ||
      matchedKeys.includes(card.key)
    )
      return;
    if (openedCards.length === 2) return;

    const nextOpened = [...openedCards, card];
    setOpenedCards(nextOpened);
    if (nextOpened.length === 2) {
      const [first, second] = nextOpened;
      const isMatch = first.id === second.id && first.type !== second.type;
      if (isMatch) {
        safeBeep("correct");
        updateScore(15);
        setMatchedKeys((prev) => [...prev, first.key, second.key]);
      } else {
        safeBeep("wrong");
      }
      setTimeout(() => setOpenedCards([]), 700);
    }
  };

  const submitFill = (value) => {
    setFillPicked(value);
    const current = FILL_BLANKS[fillIndex];
    const isCorrect = value === current.answer;
    updateScore(isCorrect ? 8 : -3);
    safeBeep(isCorrect ? "correct" : "wrong");
  };

  const nextFill = () => {
    setFillPicked("");
    setFillIndex((prev) => (prev + 1) % FILL_BLANKS.length);
  };

  const spinWheel = () => {
    setWheelAnswer("");
    const selected = shuffle(WHEEL_BANK)[0];
    setWheelRound({
      ...selected,
      options: shuffle(selected.options),
    });
  };

  const answerWheel = (option) => {
    if (!wheelRound || wheelAnswer) return;
    const correct = option === wheelRound.correct;
    setWheelAnswer(option);
    updateScore(correct ? 12 : -4);
    safeBeep(correct ? "correct" : "wrong");
  };

  const claimDailyBonus = () => {
    if (!progress.daily.completed || progress.daily.rewardClaimed) return;
    setProgress((prev) => ({
      ...prev,
      score: prev.score + 20,
      bestScore: Math.max(prev.bestScore, prev.score + 20),
      daily: {
        ...prev.daily,
        rewardClaimed: true,
      },
    }));
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress(ensureDailyState(defaultProgress));
    setFlashIndex(0);
    setFlipped(false);
    setReviewOnly(false);
    setQuizSession(null);
    setMatchingCards(buildMatchingCards());
    setOpenedCards([]);
    setMatchedKeys([]);
    setFillIndex(0);
    setFillPicked("");
    setWheelRound(null);
    setWheelAnswer("");
  };

  const chartData = {
    labels: questions.map((item) => `Câu ${item.id}`),
    datasets: [
      {
        label: "Số lần ôn tập",
        data: questions.map((item) => progress.reviewCounts[item.id] ?? 0),
        backgroundColor: "rgba(13, 110, 253, 0.65)",
      },
    ],
  };

  const weakHistory = [1, 2, 3, 4].filter((id) => !progress.known[id]).length;

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg bg-primary navbar-dark shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold d-flex align-items-center gap-2">
            <img src={logoVovinam} className="brand-logo" alt="Logo Vovinam" />
            Vovinam Quiz Master
          </span>
          <div className="d-flex gap-2 flex-wrap mobile-nav-tabs">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`btn btn-sm ${tab === item.key ? "btn-light" : "btn-outline-light"}`}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container py-4 main-content app-main">
        {tab !== "qa" && tab !== "support" && (
          <section className="status-bar mb-4">
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <div className="card h-100">
                  <div className="card-body">
                    <p className="small text-muted mb-1">Điểm võ công</p>
                    <h4 className="mb-0" aria-live="polite" aria-atomic="true">
                      {progress.score}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card h-100">
                  <div className="card-body">
                    <p className="small text-muted mb-1">Cấp độ hiện tại</p>
                    <h4 className="mb-0">{currentLevel.label}</h4>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card h-100">
                  <div className="card-body">
                    <p className="small text-muted mb-1">Đã thuộc</p>
                    <h4 className="mb-0">{masteredCount}/10</h4>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card h-100">
                  <div className="card-body">
                    <p className="small text-muted mb-1">Điểm cao nhất</p>
                    <h4 className="mb-0" aria-live="polite" aria-atomic="true">
                      {progress.bestScore}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "home" && (
          <>
            <section className="row g-4 align-items-stretch">
              <div className="col-lg-7">
                <div className="card h-100 shadow-sm">
                  <div className="card-body p-4">
                    <h2 className="mb-3">
                      Học Vovinam - Việt Võ Đạo theo kiểu vừa học vừa chơi
                    </h2>
                    <p className="readable-text">
                      Vovinam là tên gọi quốc tế hóa của Võ Việt Nam, gồm cả
                      Việt võ thuật và Việt võ đạo. Trang này giúp bạn thuộc
                      nhanh 10 câu hỏi trọng tâm bằng flashcard, quiz giới hạn
                      thời gian và trò chơi tương tác.
                    </p>
                    <div className="d-flex flex-wrap gap-2 mt-4 hero-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setTab("learn")}
                      >
                        Bắt đầu học
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => setTab("play")}
                      >
                        Thử thách bản thân
                      </button>
                    </div>
                    <div className="alert alert-info mt-4 mb-0">
                      Bí kíp đã mở khóa: <strong>{unlockedTip}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="card h-100 shadow-sm">
                  <img
                    src={logoVovinam}
                    className="card-img-top hero-image"
                    alt="Biểu tượng Vovinam"
                  />
                  <div className="card-body">
                    <p className="mb-1 fw-semibold">Thử thách hằng ngày</p>
                    <p className="small text-muted mb-3">
                      5 câu ngẫu nhiên mỗi ngày, hoàn thành để nhận +20 điểm.
                    </p>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={() => {
                        setTab("play");
                        startQuiz(true);
                      }}
                    >
                      Bắt đầu Daily Challenge
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="row g-4 mt-1">
              <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h4 className="mb-3">Hướng dẫn học nhanh</h4>
                    <ol className="mb-0 guide-list readable-content">
                      <li>
                        Vào tab Học, lật thẻ để đọc câu hỏi và tự trả lời trước
                        khi xem đáp án.
                      </li>
                      <li>
                        Dùng nút Đã thuộc hoặc Chưa thuộc để hệ thống biết câu
                        nào cần lặp lại.
                      </li>
                      <li>
                        Sau 1 vòng flashcard, chuyển sang tab Chơi để kiểm tra
                        tốc độ ghi nhớ.
                      </li>
                      <li>
                        Cuối ngày, xem tab Tiến trình để biết phần còn yếu và ôn
                        bù có trọng tâm.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h4 className="mb-3">Hướng dẫn sử dụng tính năng</h4>
                    <ul className="mb-0 guide-list readable-content">
                      <li>
                        <strong>Flashcard:</strong> Click vào thẻ để lật, bật
                        chế độ chỉ ôn câu chưa thuộc khi cần.
                      </li>
                      <li>
                        <strong>Quiz:</strong> Mỗi câu 30 giây, đúng +10, sai
                        -5, đạt 80% để mở huy hiệu.
                      </li>
                      <li>
                        <strong>Mini games:</strong> Matching, Điền khuyết, Vòng
                        quay giúp ôn theo kiểu trò chơi.
                      </li>
                      <li>
                        <strong>Daily challenge:</strong> Mỗi ngày 5 câu ngẫu
                        nhiên, hoàn thành nhận điểm thưởng.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {tab === "learn" && currentFlashcard && (
          <section className="row g-4">
            <div className="col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <h3 className="mb-0">Flashcards</h3>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={reviewOnly}
                        id="reviewSwitch"
                        onChange={(event) => {
                          setReviewOnly(event.target.checked);
                          setFlashIndex(0);
                          setFlipped(false);
                        }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="reviewSwitch"
                      >
                        Chỉ ôn câu chưa thuộc
                      </label>
                    </div>
                  </div>
                  <div
                    className={`flashcard p-4 ${flipped ? "is-flipped" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setFlipped((prev) => !prev);
                      updateReview(currentFlashcard.id);
                    }}
                    onKeyUp={(event) => {
                      if (event.key === "Enter") {
                        setFlipped((prev) => !prev);
                        updateReview(currentFlashcard.id);
                      }
                    }}
                  >
                    <p className="text-muted mb-2">Câu {currentFlashcard.id}</p>
                    <p className="mb-0 fs-5 white-space-preline">
                      {flipped
                        ? currentFlashcard.answer
                        : currentFlashcard.question}
                    </p>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-3 flash-actions">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => markCard(true)}
                    >
                      Đã thuộc (+3)
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={() => markCard(false)}
                    >
                      Chưa thuộc
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={nextFlashcard}
                    >
                      Tiếp theo
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card shadow-sm mb-3">
                <div className="card-body">
                  <h5>Mẹo nhớ nhanh</h5>
                  <p className="small text-muted mb-2">
                    Mẹo cho câu {currentFlashcard.id}
                  </p>
                  <p className="mb-0">{currentQuestionTip}</p>
                </div>
              </div>
              <div className="card shadow-sm mb-3">
                <div className="card-body">
                  <h5>Hướng dẫn Flashcard</h5>
                  <ul className="mb-0 guide-list">
                    <li>Lật thẻ rồi tự nhẩm đáp án trước khi đọc mặt sau.</li>
                    <li>
                      Đánh dấu Chưa thuộc cho câu khó để được lặp lại nhiều hơn.
                    </li>
                    <li>
                      Ôn theo cụm 3-5 câu và nghỉ ngắn 1 phút để nhớ lâu hơn.
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5>Biểu tượng đai</h5>
                  <div className="d-flex gap-2 flex-wrap">
                    <span className="badge text-bg-primary">Lam</span>
                    <span className="badge text-bg-warning">Hoàng</span>
                    <span className="badge text-bg-danger">Hồng</span>
                    <span className="badge text-bg-light border">Bạch</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "play" && (
          <section className="d-grid gap-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <h3 className="mb-0">Quiz trắc nghiệm (30 giây/câu)</h3>
                  <div className="d-flex align-items-center gap-2 quiz-controls">
                    <select
                      className="form-select"
                      value={quizLevel}
                      onChange={(event) => setQuizLevel(event.target.value)}
                    >
                      {Object.entries(QUIZ_LEVEL_SETS).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label} ({config.count} câu)
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => startQuiz(false)}
                    >
                      Bắt đầu quiz
                    </button>
                  </div>
                </div>

                {quizSession && (
                  <div className="quiz-panel p-3 rounded border">
                    {quizSession.finished ? (
                      <>
                        <h5>Hoàn thành!</h5>
                        <p className="mb-2">
                          Điểm vòng này: {quizSession.total}
                        </p>
                        <p className="mb-0">
                          {quizSession.total >= quizSession.questions.length * 8
                            ? "Bạn đã mở khóa Huy hiệu Võ sư nếu đạt từ 80% trở lên."
                            : "Cố gắng thêm để đạt 80% và mở khóa huy hiệu."}
                        </p>
                      </>
                    ) : (
                      (() => {
                        const current =
                          quizSession.questions[quizSession.current];
                        const answered = quizSession.answers[current.id];
                        return (
                          <>
                            <div className="d-flex justify-content-between mb-2">
                              <strong>
                                Câu {quizSession.current + 1}/
                                {quizSession.questions.length}
                              </strong>
                              <span
                                className="badge text-bg-dark"
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                              >
                                ⏱ {quizTimer}s
                              </span>
                            </div>
                            <p className="mb-3">{current.prompt}</p>
                            <div
                              className="row g-2"
                              key={`options-${current.id}`}
                            >
                              {current.options.map((option, optionIndex) => (
                                <div
                                  className="col-md-6"
                                  key={`${current.id}-${option}-${optionIndex}`}
                                >
                                  <button
                                    type="button"
                                    className={`btn w-100 text-start ${
                                      answered
                                        ? option === current.correct
                                          ? "btn-success"
                                          : answered.selected === option
                                            ? "btn-danger"
                                            : "btn-outline-secondary"
                                        : "btn-outline-primary"
                                    }`}
                                    onClick={() => answerQuiz(option)}
                                  >
                                    {option}
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 d-flex justify-content-between align-items-center flex-column flex-sm-row gap-2">
                              <span
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                              >
                                Điểm hiện tại: {quizSession.total}
                              </span>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-dark"
                                disabled={!answered}
                                onClick={nextQuizQuestion}
                              >
                                Câu tiếp theo
                              </button>
                            </div>
                          </>
                        );
                      })()
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <h3 className="mb-0">Matching Game</h3>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={initMatching}
                  >
                    Trộn thẻ mới
                  </button>
                </div>
                <div className="row g-2">
                  {matchingCards.map((card) => {
                    const visible =
                      matchedKeys.includes(card.key) ||
                      openedCards.some((item) => item.key === card.key);
                    return (
                      <div className="col-md-3 col-6" key={card.key}>
                        <button
                          type="button"
                          className={`btn w-100 matching-card ${visible ? "btn-light" : "btn-outline-secondary"}`}
                          onClick={() => openCard(card)}
                        >
                          {visible ? card.text : "Lật thẻ"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h3 className="mb-3">Fill in the Blank</h3>
                    <p className="mb-3">{FILL_BLANKS[fillIndex].sentence}</p>
                    <div className="d-grid gap-2">
                      {FILL_BLANKS[fillIndex].options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={`btn ${
                            fillPicked
                              ? option === FILL_BLANKS[fillIndex].answer
                                ? "btn-success"
                                : fillPicked === option
                                  ? "btn-danger"
                                  : "btn-outline-secondary"
                              : "btn-outline-primary"
                          }`}
                          onClick={() => submitFill(option)}
                          disabled={Boolean(fillPicked)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-dark mt-3"
                      onClick={nextFill}
                    >
                      Câu khuyết tiếp theo
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h3 className="mb-3">Wheel of Võ Công</h3>
                    <button
                      type="button"
                      className="btn btn-warning mb-3"
                      onClick={spinWheel}
                    >
                      Quay bánh xe
                    </button>
                    {wheelRound ? (
                      <>
                        <p className="mb-2 fw-semibold">{wheelRound.prompt}</p>
                        <div className="d-grid gap-2">
                          {wheelRound.options.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={`btn ${
                                wheelAnswer
                                  ? option === wheelRound.correct
                                    ? "btn-success"
                                    : wheelAnswer === option
                                      ? "btn-danger"
                                      : "btn-outline-secondary"
                                  : "btn-outline-primary"
                              }`}
                              onClick={() => answerWheel(option)}
                              disabled={Boolean(wheelAnswer)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-muted mb-0">
                        Nhấn quay để nhận câu hỏi ngẫu nhiên.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "progress" && (
          <section className="row g-4">
            <div className="col-lg-7">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h3 className="mb-3">Bảng theo dõi tiến trình</h3>
                  <p className="mb-2">
                    Tỉ lệ thuộc bài: {Math.round((masteredCount / 10) * 100)}%
                  </p>
                  <p className="mb-2">Số lần quiz: {progress.quizAttempts}</p>
                  <p className="mb-2">Lần đạt từ 80%: {progress.quizWins}</p>
                  <p className="mb-3">Cấp độ hiện tại: {currentLevel.label}</p>
                  <div className="chart-wrap">
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: "top" },
                          title: { display: false },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card shadow-sm mb-3">
                <div className="card-body">
                  <h5>Gợi ý cá nhân hóa</h5>
                  <p className="mb-0">
                    {weakHistory > 0
                      ? "Ôn lại phần sáng tổ và lịch sử (câu 1-4) để lên cấp Hoàng đai nhanh hơn."
                      : "Bạn đang làm tốt nhóm lịch sử. Hãy tập trung thêm hệ thống đai để chinh phục cấp cao."}
                  </p>
                </div>
              </div>

              <div className="card shadow-sm mb-3">
                <div className="card-body">
                  <h5>Phần thưởng</h5>
                  <img
                    src={logoVovinam}
                    alt="Huy hiệu Vovinam"
                    className="reward-logo mb-2"
                  />
                  {progress.badges.length ? (
                    progress.badges.map((badge) => (
                      <span key={badge} className="badge text-bg-success me-2">
                        {badge}
                      </span>
                    ))
                  ) : (
                    <p className="mb-0 text-muted">
                      Chưa có huy hiệu. Đạt 80% quiz để mở khóa.
                    </p>
                  )}
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="card-body">
                  <h5>Daily Challenge</h5>
                  <p className="mb-2">Câu hôm nay: {dailyQuestions.length}/5</p>
                  <p className="mb-3">
                    Trạng thái:{" "}
                    {progress.daily.completed
                      ? "Đã hoàn thành"
                      : "Chưa hoàn thành"}
                  </p>
                  <div className="d-flex gap-2 flex-wrap action-group">
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm"
                      onClick={claimDailyBonus}
                    >
                      Nhận bonus +20
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={resetAll}
                    >
                      Reset tiến trình
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "qa" && (
          <section className="row justify-content-center">
            <div className="col-xl-10">
              <div className="card shadow-sm mb-4 qa-hero-card">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                    <div>
                      <h3 className="mb-2">Ngân hàng câu hỏi Vovinam</h3>
                      <p className="text-muted mb-0 readable-text">
                        Tổng hợp đầy đủ câu hỏi và đáp án để ôn tập nhanh, rõ
                        ràng, dễ tra cứu.
                      </p>
                    </div>
                    <span className="badge text-bg-primary fs-6 px-3 py-2">
                      {qaItems.length}/{questions.length} câu đang hiển thị
                    </span>
                  </div>
                  <div className="d-flex flex-wrap gap-2 qa-meta-chips">
                    <span className="badge rounded-pill text-bg-light border">
                      Có đáp án chi tiết
                    </span>
                    <span className="badge rounded-pill text-bg-light border">
                      Phù hợp ôn thi đai
                    </span>
                    <span className="badge rounded-pill text-bg-light border">
                      Nội dung chuẩn hóa
                    </span>
                  </div>

                  <div className="row g-2 align-items-end mt-2 qa-filter-row">
                    <div className="col-md-5">
                      <label className="form-label small text-muted mb-1">
                        Loại hiển thị
                      </label>
                      <select
                        className="form-select qa-select"
                        value={qaSelection}
                        onChange={(event) => setQaSelection(event.target.value)}
                      >
                        <option value="all">Hiển thị tất cả câu hỏi</option>
                        {questions.map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            Câu {item.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-7">
                      <label className="form-label small text-muted mb-1">
                        Chọn nhanh
                      </label>
                      <div className="d-flex flex-wrap gap-2 qa-quick-picker">
                        <button
                          type="button"
                          className={`btn btn-sm ${qaSelection === "all" ? "btn-primary" : "btn-outline-primary"}`}
                          onClick={() => setQaSelection("all")}
                        >
                          Tất cả
                        </button>
                        {questions.map((item) => (
                          <button
                            key={`qa-${item.id}`}
                            type="button"
                            className={`btn btn-sm ${qaSelection === String(item.id) ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setQaSelection(String(item.id))}
                          >
                            {item.id}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-3 qa-list-wrap">
                {qaItems.map((item) => (
                  <article
                    key={item.id}
                    className="card shadow-sm qa-item-card"
                  >
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="badge text-bg-primary qa-number-badge">
                          Câu {item.id}
                        </span>
                        <span className="text-muted small">
                          Hỏi đáp kiến thức
                        </span>
                      </div>

                      <div className="qa-question-block mb-3">
                        <p className="mb-0 fw-semibold readable-text">
                          {item.question}
                        </p>
                      </div>

                      <div className="qa-answer-block">
                        <p className="mb-1 text-muted small">Đáp án</p>
                        <p className="mb-0 white-space-preline readable-text">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === "support" && (
          <section className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body p-4 text-center">
                  <h3 className="mb-3">Ủng hộ tác giả</h3>
                  <p className="text-muted mb-4 support-subtitle">
                    Nếu bạn thấy dự án hữu ích, có thể quét mã QR bên dưới để
                    góp quỹ nuôi Nguyên. Mọi ủng hộ đều là động lực để phát
                    triển thêm nhiều nội dung học Vovinam miễn phí.
                  </p>
                  <div className="support-qr-wrap mx-auto mb-3">
                    <img
                      src={qrSupport}
                      alt="Mã QR ủng hộ tác giả"
                      className="img-fluid support-qr"
                    />
                  </div>
                  <div className="alert alert-warning mb-0">
                    Mở camera hoặc ứng dụng ngân hàng để quét mã QR và chuyển
                    khoản nhanh.
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Điều hướng nhanh">
        {NAV_ITEMS.map((item) => (
          <button
            key={`bottom-${item.key}`}
            type="button"
            className={`btn mobile-bottom-nav-btn ${tab === item.key ? "is-active" : ""}`}
            onClick={() => setTab(item.key)}
            aria-current={tab === item.key ? "page" : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="fireworks-layer" aria-hidden="true">
        {fireworkBursts.map((burst) => (
          <div key={burst.id} className="fireworks-instance">
            <div className="firework-corner firework-corner-left">
              {burst.leftParticles.map((particle) => (
                <span
                  key={particle.id}
                  className="firework-particle"
                  style={{
                    "--x": particle.x,
                    "--y": particle.y,
                    "--size": particle.size,
                    "--delay": particle.delay,
                    "--duration": particle.duration,
                    backgroundColor: particle.color,
                  }}
                />
              ))}
            </div>
            <div className="firework-corner firework-corner-right">
              {burst.rightParticles.map((particle) => (
                <span
                  key={particle.id}
                  className="firework-particle"
                  style={{
                    "--x": particle.x,
                    "--y": particle.y,
                    "--size": particle.size,
                    "--delay": particle.delay,
                    "--duration": particle.duration,
                    backgroundColor: particle.color,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
