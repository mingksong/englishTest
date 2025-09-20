const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'problems/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

let wordsDatabase = {};

function loadCSV(filename) {
    return new Promise((resolve, reject) => {
        const words = [];
        const filepath = path.join(__dirname, 'problems', filename);
        
        if (!fs.existsSync(filepath)) {
            reject(new Error('File not found'));
            return;
        }
        
        fs.createReadStream(filepath)
            .pipe(csv())
            .on('data', (row) => {
                if (row.word && row['meaning(KOR)']) {
                    words.push({
                        word: row.word.trim(),
                        meaning: row['meaning(KOR)'].trim()
                    });
                }
            })
            .on('end', () => {
                console.log(`Loaded ${words.length} words from ${filename}`);
                resolve(words);
            })
            .on('error', reject);
    });
}

app.get('/api/files', (req, res) => {
    const problemsDir = path.join(__dirname, 'problems');
    fs.readdir(problemsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        const csvFiles = files.filter(file => file.endsWith('.csv'));
        res.json(csvFiles);
    });
});

app.post('/api/upload', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ message: 'File uploaded successfully', filename: req.file.originalname });
});

app.get('/api/quiz/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const numQuestions = parseInt(req.query.count) || 20;
        
        if (!wordsDatabase[filename]) {
            wordsDatabase[filename] = await loadCSV(filename);
        }
        
        const words = wordsDatabase[filename];
        if (words.length === 0) {
            return res.status(400).json({ error: 'No words available' });
        }
        
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(numQuestions, words.length));
        
        const quiz = selected.map((item, index) => ({
            id: index + 1,
            firstLetter: item.word[0].toLowerCase(),
            meaning: item.meaning,
            answer: item.word.toLowerCase()
        }));
        
        res.json(quiz);
    } catch (error) {
        console.error('Error loading quiz:', error);
        res.status(500).json({ error: 'Failed to load quiz' });
    }
});

app.post('/api/submit', (req, res) => {
    const { answers, quiz } = req.body;
    
    let correct = 0;
    const results = [];
    
    quiz.forEach((question, index) => {
        const userAnswer = (answers[index] || '').toLowerCase().trim();
        const isCorrect = userAnswer === question.answer;
        
        if (isCorrect) {
            correct++;
        }
        
        results.push({
            id: question.id,
            userAnswer: userAnswer,
            correctAnswer: question.answer,
            meaning: question.meaning,
            isCorrect: isCorrect
        });
    });
    
    res.json({
        score: correct,
        total: quiz.length,
        percentage: Math.round((correct / quiz.length) * 100),
        results: results
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Loading default problems.csv...');
    loadCSV('problems.csv').catch(err => {
        console.log('Default problems.csv not found');
    });
});