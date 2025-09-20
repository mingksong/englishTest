import csv
import random
from typing import List, Tuple
import os

def load_words(filename: str = 'problems.csv') -> List[Tuple[str, str]]:
    """CSV 파일에서 단어와 의미를 로드합니다."""
    words = []
    with open(filename, 'r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row['word'] and row['meaning(KOR)']:  # 빈 값 제외
                words.append((row['word'], row['meaning(KOR)']))
    return words

def create_quiz(words: List[Tuple[str, str]], num_questions: int = 20) -> List[Tuple[int, str, str]]:
    """랜덤하게 선택한 단어로 문제를 생성합니다."""
    if num_questions > len(words):
        num_questions = len(words)
    
    selected_words = random.sample(words, num_questions)
    quiz = []
    
    for i, (word, meaning) in enumerate(selected_words, 1):
        first_letter = word[0].lower()
        quiz.append((i, first_letter, meaning))
    
    return quiz

def generate_html_quiz(quiz: List[Tuple[int, str, str]], quiz_number: int) -> str:
    """HTML 형식의 문제지를 생성합니다."""
    html = f"""
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>영어 단어 퀴즈 {quiz_number}</title>
    <style>
        @page {{
            size: A4;
            margin: 20mm;
        }}
        body {{
            font-family: 'Malgun Gothic', sans-serif;
            margin: 0;
            padding: 20px;
            max-width: 210mm;
            margin: 0 auto;
        }}
        h1 {{
            text-align: center;
            margin-bottom: 30px;
            font-size: 24px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}
        th, td {{
            border: 1px solid #333;
            padding: 10px;
            text-align: center;
        }}
        th {{
            background-color: #f0f0f0;
            font-weight: bold;
        }}
        td.number {{
            width: 15%;
            font-weight: bold;
        }}
        td.first-letter {{
            width: 25%;
            font-size: 18px;
            font-weight: bold;
            text-align: left;
            padding-left: 15px;
        }}
        td.meaning {{
            width: 60%;
            text-align: left;
            padding-left: 20px;
        }}
        @media print {{
            body {{
                padding: 0;
            }}
        }}
    </style>
</head>
<body>
    <h1>영어 단어 퀴즈 #{quiz_number}</h1>
    <table>
        <thead>
            <tr>
                <th>문제번호</th>
                <th>단어 첫글자</th>
                <th>한글 뜻</th>
            </tr>
        </thead>
        <tbody>
"""
    
    for num, first_letter, meaning in quiz:
        html += f"""
            <tr>
                <td class="number">{num}</td>
                <td class="first-letter">{first_letter}</td>
                <td class="meaning">{meaning}</td>
            </tr>
"""
    
    html += """
        </tbody>
    </table>
</body>
</html>
"""
    return html

def main():
    try:
        # 단어 로드
        words = load_words('problems.csv')
        print(f"총 {len(words)}개의 단어를 로드했습니다.")
        
        # 사용자로부터 생성할 문제지 개수 입력받기
        while True:
            try:
                num_quizzes = int(input("\n생성할 문제지 개수를 입력하세요: "))
                if num_quizzes <= 0:
                    print("1개 이상의 문제지를 생성해야 합니다.")
                    continue
                break
            except ValueError:
                print("올바른 숫자를 입력해주세요.")
        
        # output 디렉토리 생성
        if not os.path.exists('output'):
            os.makedirs('output')
        
        # 문제지 생성
        for i in range(1, num_quizzes + 1):
            quiz = create_quiz(words)
            html_content = generate_html_quiz(quiz, i)
            
            # HTML 파일 저장
            filename = f'output/quiz_{i}.html'
            with open(filename, 'w', encoding='utf-8') as file:
                file.write(html_content)
            
            print(f"문제지 {i} 생성 완료: {filename}")
        
        print(f"\n총 {num_quizzes}개의 문제지가 'output' 폴더에 생성되었습니다.")
        print("HTML 파일을 브라우저에서 열어 인쇄하거나 PDF로 저장할 수 있습니다.")
        
    except FileNotFoundError:
        print("problems.csv 파일을 찾을 수 없습니다.")
    except Exception as e:
        print(f"오류가 발생했습니다: {e}")

if __name__ == "__main__":
    main()