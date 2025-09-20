# English Test - 영어 단어 시험 시스템

온라인 영어 단어 학습 및 시험 시스템입니다. CSV 파일로 단어장을 관리하고, 웹 브라우저에서 시험을 볼 수 있습니다.

## 🌟 주요 기능

### 1. 단어장 관리
- **CSV 파일 업로드**: 사용자 정의 단어장 업로드 지원
- **기본 단어장**: problems.csv (40개 영어 단어 포함)
- **형식**: `word,meaning(KOR)` 구조의 CSV 파일

### 2. 시험 시스템
- **랜덤 출제**: 전체 단어 중 20개 무작위 선택
- **문제 형식**: 단어의 첫 글자와 한글 뜻 제시
- **실시간 타이머**: 시험 시간 추적

### 3. 시간 제한 기능
- **5분 경고**: 타이머가 화면 중앙으로 이동하며 빨간색으로 변경
- **6분 자동 종료**: 
  - 모든 입력 비활성화
  - 화면 블러 처리
  - 강제 제출 팝업 표시

### 4. 채점 및 결과
- **즉시 채점**: 제출 즉시 점수 계산
- **상세 피드백**: 모든 문제의 정답/오답 표시
- **재시험**: 동일 단어장으로 재시험 가능

## 🚀 설치 및 실행

### 필요 사항
- Node.js (v14 이상)
- npm

### 설치
```bash
git clone https://github.com/MinkSong/englishTest.git
cd englishTest
npm install
```

### 실행
```bash
npm start
```

브라우저에서 `http://localhost:3000` 접속

## 📁 프로젝트 구조

```
englishTest/
├── server.js           # Express 서버
├── package.json        # 프로젝트 설정
├── problems.csv        # 기본 단어장
├── problems/           # 업로드된 단어장 저장
├── public/            # 프론트엔드 파일
│   ├── index.html     # 메인 페이지
│   └── app.js         # 클라이언트 로직
└── output/            # 생성된 문제지 (선택사항)
```

## 🎯 사용 방법

### 1. 단어장 준비
CSV 파일 형식:
```csv
no,word,meaning(KOR)
1,hygiene,위생
2,tempting,솔깃한
...
```

### 2. 시험 시작
1. 단어장 선택 또는 업로드
2. "시험 시작" 클릭
3. 20개 문제에 답변 입력
4. 제출 또는 6분 후 자동 제출

### 3. 결과 확인
- 점수 및 백분율 표시
- 각 문제별 정답/오답 확인
- 틀린 답안과 정답 비교

## 🛠️ 기술 스택

### Backend
- **Node.js**: 서버 런타임
- **Express**: 웹 프레임워크
- **Multer**: 파일 업로드 처리
- **csv-parser**: CSV 파일 파싱
- **CORS**: Cross-Origin 요청 처리

### Frontend
- **HTML5/CSS3**: 구조 및 스타일링
- **Vanilla JavaScript**: 클라이언트 로직
- **Responsive Design**: 반응형 디자인

## 📋 API 엔드포인트

### GET /api/files
업로드된 CSV 파일 목록 조회

### POST /api/upload
CSV 파일 업로드

### GET /api/quiz/:filename
지정된 파일로 퀴즈 생성
- Query: `count` - 문제 개수 (기본: 20)

### POST /api/submit
답안 제출 및 채점

## ⚙️ 설정

### 포트 변경
`server.js`에서 PORT 변수 수정:
```javascript
const PORT = 3000; // 원하는 포트로 변경
```

### 시간 제한 변경
`app.js`에서 시간 설정 수정:
```javascript
// 5분 경고 (300초)
if (elapsed === 300) { ... }

// 6분 종료 (360초)
if (elapsed >= 360) { ... }
```

## 📝 라이선스

ISC License

## 👨‍💻 개발자

MinkSong (randolfson@me.com)

## 🤝 기여

이슈 및 풀 리퀘스트 환영합니다!

## 📌 추가 개발 예정

- [ ] 사용자 계정 시스템
- [ ] 시험 기록 저장
- [ ] 통계 및 분석 기능
- [ ] 난이도 조절
- [ ] 다국어 지원
- [ ] 음성 발음 기능