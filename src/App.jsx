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

const QUIZ_BANK = [
  {
    id: 1,
    prompt: "Võ sư Sáng tổ Vovinam là ai?",
    options: ["Nguyễn Lộc", "Lê Sáng", "Nguyễn Văn Chiếu", "Trần Huy Phong"],
    correct: "Nguyễn Lộc",
  },
  {
    id: 2,
    prompt: "Nghiên cứu Vovinam được hoàn thành vào năm nào?",
    options: ["1938", "1939", "1912", "1960"],
    correct: "1938",
  },
  {
    id: 3,
    prompt: "Vovinam có thể hiểu là gì?",
    options: [
      "Tên quốc tế hóa của Võ Việt Nam",
      "Một nhánh của Judo",
      "Môn võ bắt nguồn từ châu Âu",
      "Tên khác của Taekwondo",
    ],
    correct: "Tên quốc tế hóa của Võ Việt Nam",
  },
  {
    id: 4,
    prompt: "Chưởng môn cố Võ sư Lê Sáng mất vào năm nào?",
    options: ["2010", "2000", "1960", "1920"],
    correct: "2010",
  },
  {
    id: 5,
    prompt: "Bàn tay phải đặt lên tim trong nghiêm lễ tượng trưng điều gì?",
    options: [
      "Bàn tay thép trên trái tim từ ái",
      "Sức mạnh tuyệt đối",
      "Ưu tiên tấn công",
      "Chỉ luyện thể lực",
    ],
    correct: "Bàn tay thép trên trái tim từ ái",
  },
  {
    id: 6,
    prompt: "Thắt đai Vovinam chuẩn gồm mấy vòng?",
    options: ["2 vòng", "1 vòng", "3 vòng", "4 vòng"],
    correct: "2 vòng",
  },
  {
    id: 7,
    prompt: "Kỷ luật Việt võ đạo được nhấn mạnh là gì?",
    options: [
      "Kỷ luật tự giác",
      "Kỷ luật cưỡng chế",
      "Kỷ luật theo cấp bậc cứng",
      "Kỷ luật chỉ dành cho huấn luyện viên",
    ],
    correct: "Kỷ luật tự giác",
  },
  {
    id: 8,
    prompt: "Mục đích học Vovinam vượt ngoài tự vệ là gì?",
    options: [
      "Rèn thân - trí - tâm để phục vụ tổ quốc",
      "Thi đấu chuyên nghiệp bằng mọi giá",
      "Tập trung vào biểu diễn",
      "Chỉ để đạt đai nhanh",
    ],
    correct: "Rèn thân - trí - tâm để phục vụ tổ quốc",
  },
  {
    id: 9,
    prompt: "Vovinam có bao nhiêu màu đai chính?",
    options: ["4", "3", "5", "6"],
    correct: "4",
  },
  {
    id: 10,
    prompt: "Đai nào dành cho người lãnh đạo cao nhất môn phái?",
    options: ["Bạch đai", "Lam đai", "Hoàng đai", "Hồng đai"],
    correct: "Bạch đai",
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

const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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
    }
    nextFlashcard();
  };

  const nextFlashcard = () => {
    setFlipped(false);
    setFlashIndex((prev) => (prev + 1) % flashDeck.length);
  };

  const startQuiz = (dailyMode = false) => {
    const source = dailyMode
      ? dailyQuestions
      : shuffle(QUIZ_BANK).slice(0, quizLevel === "lam" ? 3 : 10);
    setQuizSession({
      questions: source,
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
    setWheelRound(shuffle(QUIZ_BANK)[0]);
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
            {[
              { key: "home", label: "Home" },
              { key: "learn", label: "Học" },
              { key: "play", label: "Chơi" },
              { key: "progress", label: "Tiến trình" },
            ].map((item) => (
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

      <main className="container py-4 main-content">
        <section className="status-bar mb-4">
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <p className="small text-muted mb-1">Điểm võ công</p>
                  <h4 className="mb-0">{progress.score}</h4>
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
                  <h4 className="mb-0">{progress.bestScore}</h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        {tab === "home" && (
          <section className="row g-4 align-items-stretch">
            <div className="col-lg-7">
              <div className="card h-100 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="mb-3">
                    Học Vovinam - Việt Võ Đạo theo kiểu vừa học vừa chơi
                  </h2>
                  <p>
                    Vovinam là tên gọi quốc tế hóa của Võ Việt Nam, gồm cả Việt
                    võ thuật và Việt võ đạo. Trang này giúp bạn thuộc nhanh 10
                    câu hỏi trọng tâm bằng flashcard, quiz giới hạn thời gian và
                    trò chơi tương tác.
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
                    onClick={() => startQuiz(true)}
                  >
                    Bắt đầu Daily Challenge
                  </button>
                </div>
              </div>
            </div>
          </section>
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
                  <p className="mb-0">{unlockedTip}</p>
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
                      <option value="lam">Lam đai (3 câu)</option>
                      <option value="hoang">Hoàng đai (10 câu)</option>
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
                              <span className="badge text-bg-dark">
                                ⏱ {quizTimer}s
                              </span>
                            </div>
                            <p className="mb-3">{current.prompt}</p>
                            <div className="row g-2">
                              {current.options.map((option) => (
                                <div className="col-md-6" key={option}>
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
                              <span>Điểm hiện tại: {quizSession.total}</span>
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
      </main>
    </div>
  );
}

export default App;
