# Vovinam Learning

Website học Vovinam - Việt Võ Đạo theo hướng **vừa học vừa chơi**, tập trung vào 10 câu hỏi trọng tâm, flashcard, quiz giới hạn thời gian và mini-game tương tác.

## Source code

- Repository: https://github.com/devnguyen0111/Vovinam-Learning

## Tính năng chính

- Flashcard lật thẻ câu hỏi/đáp án, đánh dấu đã thuộc/chưa thuộc
- Quiz theo cấp đai (Lam, Hoàng, Hồng, Bạch) với timer mỗi câu
- Daily Challenge nhận thưởng điểm
- Mini game: Matching, Fill in the Blank, Wheel of Võ Công
- Tab Q&A tra cứu toàn bộ câu hỏi và đáp án (chọn từng câu hoặc tất cả)
- Theo dõi tiến trình: điểm, cấp độ, biểu đồ số lần ôn tập, huy hiệu
- Hiệu ứng pháo hoa khi đánh dấu đã thuộc

## Công nghệ sử dụng

- React 19
- Vite 7
- Bootstrap 5
- Chart.js + react-chartjs-2
- ESLint

## Cài đặt và chạy dự án

### 1) Cài dependencies

```bash
npm install
```

### 2) Chạy môi trường development

```bash
npm run dev
```

### 3) Build production

```bash
npm run build
```

### 4) Preview bản build

```bash
npm run preview
```

## Cấu trúc thư mục chính

```text
src/
	App.jsx
	index.css
	main.jsx
assets/
	question.json
public/
```

## Dữ liệu câu hỏi

- Bộ câu hỏi gốc được lưu tại: `assets/question.json`
- Ứng dụng đọc và dùng dữ liệu này cho Flashcard/Q&A/Quiz.

## Góp ý và đóng góp

Bạn có thể tạo Issue hoặc Pull Request tại repository để đề xuất tính năng mới, báo lỗi hoặc cải tiến UX/UI.
