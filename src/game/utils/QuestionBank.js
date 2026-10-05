// Ngân hàng câu hỏi giáo dục cho trẻ 4 đến 6 tuổi (Tiền tiểu học / Mầm non)

// 1. Danh sách tìm chữ cái đơn lẻ (Mức cơ bản nhất dành cho bé mới bắt đầu)
export const SINGLE_LETTERS = [
    { letter: 'A', name: 'A', emoji: '🍎', word: 'Quả Táo', prompt: 'Bé hãy tìm chữ A' },
    { letter: 'B', name: 'Bờ', emoji: '🐮', word: 'Con Bò', prompt: 'Bé hãy tìm chữ B' },
    { letter: 'C', name: 'Cờ', emoji: '🐟', word: 'Con Cá', prompt: 'Bé hãy tìm chữ C' },
    { letter: 'D', name: 'Dờ', emoji: '🐐', word: 'Con Dê', prompt: 'Bé hãy tìm chữ D' },
    { letter: 'Đ', name: 'Đờ', emoji: '💡', word: 'Bóng Đèn', prompt: 'Bé hãy tìm chữ Đ' },
    { letter: 'E', name: 'E', emoji: '🚗', word: 'Chiếc Xe', prompt: 'Bé hãy tìm chữ E' },
    { letter: 'Ê', name: 'Ê', emoji: '🐸', word: 'Con Ếch', prompt: 'Bé hãy tìm chữ Ê' },
    { letter: 'G', name: 'Gờ', emoji: '🐔', word: 'Con Gà', prompt: 'Bé hãy tìm chữ G' },
    { letter: 'H', name: 'Hờ', emoji: '🌸', word: 'Bông Hoa', prompt: 'Bé hãy tìm chữ H' },
    { letter: 'I', name: 'I', emoji: '🦆', word: 'Con Vịt', prompt: 'Bé hãy tìm chữ I' },
    { letter: 'K', name: 'Ca', emoji: '🍬', word: 'Viên Kẹo', prompt: 'Bé hãy tìm chữ K' },
    { letter: 'L', name: 'Lờ', emoji: '🍃', word: 'Chiếc Lá', prompt: 'Bé hãy tìm chữ L' },
    { letter: 'M', name: 'Mờ', emoji: '🐱', word: 'Con Mèo', prompt: 'Bé hãy tìm chữ M' },
    { letter: 'N', name: 'Nờ', emoji: '🎀', word: 'Chiếc Nơ', prompt: 'Bé hãy tìm chữ N' },
    { letter: 'O', name: 'O', emoji: '🐓', word: 'Gà Trống', prompt: 'Bé hãy tìm chữ O' },
    { letter: 'Ô', name: 'Ô', emoji: '☂️', word: 'Cái Ô', prompt: 'Bé hãy tìm chữ Ô' },
    { letter: 'Ơ', name: 'Ơ', emoji: '🥑', word: 'Quả Bơ', prompt: 'Bé hãy tìm chữ Ơ' },
    { letter: 'P', name: 'Pờ', emoji: '🎈', word: 'Bóng Bay', prompt: 'Bé hãy tìm chữ P' },
    { letter: 'Q', name: 'Quy', emoji: '🍊', word: 'Quả Quýt', prompt: 'Bé hãy tìm chữ Q' },
    { letter: 'R', name: 'Rờ', emoji: '🐢', word: 'Con Rùa', prompt: 'Bé hãy tìm chữ R' },
    { letter: 'S', name: 'Sờ', emoji: '⭐', word: 'Ngôi Sao', prompt: 'Bé hãy tìm chữ S' },
    { letter: 'T', name: 'Tờ', emoji: '🪺', word: 'Tổ Chim', prompt: 'Bé hãy tìm chữ T' },
    { letter: 'U', name: 'U', emoji: '🧢', word: 'Cái Mũ', prompt: 'Bé hãy tìm chữ U' },
    { letter: 'Ư', name: 'Ư', emoji: '🦌', word: 'Con Hươu', prompt: 'Bé hãy tìm chữ Ư' },
    { letter: 'V', name: 'Vờ', emoji: '🦆', word: 'Con Vịt', prompt: 'Bé hãy tìm chữ V' },
    { letter: 'X', name: 'Xờ', emoji: '🚗', word: 'Xe Hơi', prompt: 'Bé hãy tìm chữ X' },
    { letter: 'Y', name: 'I dài', emoji: '🩺', word: 'Y Tá', prompt: 'Bé hãy tìm chữ Y' }
];

// 2. Danh sách từ ghép đúng 2 chữ cái có dấu quen thuộc nhất kèm hình ảnh sinh động
export const TWO_LETTER_WORDS = [
    { word: 'MẸ', letters: ['M', 'Ẹ'], emoji: '👩', hint: 'Mẹ yêu của bé', prompt: 'Bé hãy ghép chữ MẸ' },
    { word: 'BA', letters: ['B', 'A'], emoji: '👨', hint: 'Ba của bé', prompt: 'Bé hãy ghép chữ BA' },
    { word: 'BÉ', letters: ['B', 'É'], emoji: '👶', hint: 'Em bé đáng yêu', prompt: 'Bé hãy ghép chữ BÉ' },
    { word: 'CÁ', letters: ['C', 'Á'], emoji: '🐟', hint: 'Con cá bơi lội', prompt: 'Bé hãy ghép chữ CÁ' },
    { word: 'GÀ', letters: ['G', 'À'], emoji: '🐔', hint: 'Chú gà gáy ó ó o', prompt: 'Bé hãy ghép chữ GÀ' },
    { word: 'BÒ', letters: ['B', 'Ò'], emoji: '🐮', hint: 'Chú bò sữa hiền lành', prompt: 'Bé hãy ghép chữ BÒ' },
    { word: 'DÊ', letters: ['D', 'Ê'], emoji: '🐐', hint: 'Chú dê kêu be be', prompt: 'Bé hãy ghép chữ DÊ' },
    { word: 'CỎ', letters: ['C', 'Ỏ'], emoji: '🌿', hint: 'Bãi cỏ xanh mát', prompt: 'Bé hãy ghép chữ CỎ' },
    { word: 'LÁ', letters: ['L', 'Á'], emoji: '🍃', hint: 'Chiếc lá xanh tươi', prompt: 'Bé hãy ghép chữ LÁ' },
    { word: 'XE', letters: ['X', 'E'], emoji: '🚗', hint: 'Chiếc xe hơi bon bon', prompt: 'Bé hãy ghép chữ XE' },
    { word: 'CỜ', letters: ['C', 'Ờ'], emoji: '🇻🇳', hint: 'Lá cờ đỏ sao vàng', prompt: 'Bé hãy ghép chữ CỜ' },
    { word: 'BƠ', letters: ['B', 'Ơ'], emoji: '🥑', hint: 'Trái bơ béo ngậy', prompt: 'Bé hãy ghép chữ BƠ' },
    { word: 'HỔ', letters: ['H', 'Ổ'], emoji: '🐯', hint: 'Chú hổ dũng mãnh', prompt: 'Bé hãy ghép chữ HỔ' },
    { word: 'NƠ', letters: ['N', 'Ơ'], emoji: '🎀', hint: 'Chiếc nơ xinh xắn', prompt: 'Bé hãy ghép chữ NƠ' },
    { word: 'MŨ', letters: ['M', 'Ũ'], emoji: '🧢', hint: 'Chiếc mũ đội đầu che nắng', prompt: 'Bé hãy ghép chữ MŨ' },
    { word: 'TỔ', letters: ['T', 'Ổ'], emoji: '🪺', hint: 'Tổ chim ấm áp', prompt: 'Bé hãy ghép chữ TỔ' }
];

export const VIETNAMESE_ALPHABET = [
    'A', 'Ă', 'Â', 'B', 'C', 'D', 'Đ', 'E', 'Ê', 
    'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'Ô', 
    'Ơ', 'P', 'Q', 'R', 'S', 'T', 'U', 'Ư', 'V', 'X', 'Y'
];

// Hàm hỗ trợ
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 🔤 MỤC 1 (ĐƠN GIẢN NHẤT): TÌM CHỮ CÁI ĐƠN LẺ KÈM HÌNH ẢNH MINH HỌA
export function generateSingleLetterQuestion() {
    const item = SINGLE_LETTERS[randInt(0, SINGLE_LETTERS.length - 1)];
    const targetLetter = item.letter;

    // 1 ô nhận thẻ mục tiêu
    const targets = [{
        id: 'target_0',
        expected: targetLetter,
        label: '⭐',
        hint: targetLetter
    }];

    // Tạo 3 chữ cái gây nhiễu
    const distractors = [];
    const pool = VIETNAMESE_ALPHABET.filter(c => c !== targetLetter);
    while (distractors.length < 3) {
        const pick = pool[randInt(0, pool.length - 1)];
        if (!distractors.includes(pick)) {
            distractors.push(pick);
        }
    }

    const cards = shuffle([targetLetter, ...distractors]).map((val, idx) => ({
        id: `card_${idx}`,
        value: val
    }));

    return {
        mode: 'single_letter',
        category: 'letters',
        letter: targetLetter,
        letterName: item.name,
        emoji: item.emoji,
        word: item.word,
        voicePrompt: `${item.prompt} trong từ ${item.word}!`,
        title: `Bé hãy tìm chữ: "${targetLetter}"`,
        subtitle: `${item.emoji} ${item.word} • Chữ ${item.name}`,
        targets,
        cards
    };
}

// 📝 MỤC 2: GHÉP TỪ 2 CHỮ CÁI CÓ DẤU & TÌM CHỮ TƯƠNG ỨNG HÌNH ẢNH
export function generateWordQuestion() {
    const item = TWO_LETTER_WORDS[randInt(0, TWO_LETTER_WORDS.length - 1)];
    const [c1, c2] = item.letters;

    // 2 ô nhận thẻ rõ ràng
    const targets = [
        { id: 'target_0', expected: c1, label: '1', hint: c1 },
        { id: 'target_1', expected: c2, label: '2', hint: c2 }
    ];

    // Tạo 2 chữ cái đúng + 2 chữ cái gây nhiễu đơn giản để bé dễ nhìn
    const distractors = [];
    const pool = VIETNAMESE_ALPHABET.filter(c => c !== c1 && c !== c2);
    while (distractors.length < 2) {
        const pick = pool[randInt(0, pool.length - 1)];
        if (!distractors.includes(pick)) {
            distractors.push(pick);
        }
    }

    const cards = shuffle([c1, c2, ...distractors]).map((val, idx) => ({
        id: `card_${idx}`,
        value: val
    }));

    return {
        mode: 'word',
        category: 'letters',
        word: item.word,
        emoji: item.emoji,
        voicePrompt: `${item.prompt}! ${item.hint}`,
        title: `Bé hãy ghép chữ: "${item.word}"`,
        subtitle: `${item.emoji} ${item.hint}`,
        targets,
        cards
    };
}

// 🔢 TẠO CÂU HỎI NHẬN BIẾT SỐ TỪ 1 ĐẾN 50
export function generateNumberQuestion() {
    const isFindNumber = Math.random() < 0.6;

    if (isFindNumber) {
        // Dạng: Bé lắng nghe và tìm đúng con số (1 đến 50)
        const targetNum = randInt(1, 50);

        const targets = [{
            id: 'target_0',
            expected: String(targetNum),
            label: '⭐',
            hint: String(targetNum)
        }];

        // Tạo 3 số gây nhiễu gần với số mục tiêu hoặc ngẫu nhiên trong 1..50
        const distractors = [];
        while (distractors.length < 3) {
            const offset = randInt(-4, 4);
            const n = Math.max(1, Math.min(50, targetNum + offset));
            if (n !== targetNum && !distractors.includes(n)) {
                distractors.push(n);
            }
        }
        while (distractors.length < 3) {
            const n = randInt(1, 50);
            if (n !== targetNum && !distractors.includes(n)) {
                distractors.push(n);
            }
        }

        const cards = shuffle([targetNum, ...distractors]).map((val, idx) => ({
            id: `card_${idx}`,
            value: String(val)
        }));

        return {
            mode: 'number',
            subType: 'find_number',
            category: 'numbers',
            targetNumber: targetNum,
            voicePrompt: `Bé hãy tìm và kéo số ${targetNum} vào ô ngôi sao!`,
            title: `Bé hãy tìm số: ${targetNum}`,
            subtitle: `Kéo số ${targetNum} vào ô mục tiêu`,
            targets,
            cards
        };
    } else {
        // Dạng: Dãy số liên tiếp 3 số đơn giản trong 1..50
        const start = randInt(1, 48);
        const seq = [start, start + 1, start + 2];
        const missingIdx = randInt(0, 2);
        const targetNum = seq[missingIdx];

        const targets = [{
            id: 'target_0',
            expected: String(targetNum),
            label: '?',
            hint: String(targetNum)
        }];

        const distractors = [];
        while (distractors.length < 3) {
            const n = randInt(1, 50);
            if (n !== targetNum && !distractors.includes(n)) {
                distractors.push(n);
            }
        }

        const cards = shuffle([targetNum, ...distractors]).map((val, idx) => ({
            id: `card_${idx}`,
            value: String(val)
        }));

        const displaySeq = seq.map((num, i) => i === missingIdx ? '[ ? ]' : String(num)).join('   ➜   ');

        return {
            mode: 'number',
            subType: 'missing_seq',
            category: 'numbers',
            targetNumber: targetNum,
            voicePrompt: `Bé hãy tìm số còn thiếu trong dãy số!`,
            title: `Số nào còn thiếu trong dãy số?`,
            displaySeq,
            subtitle: displaySeq,
            targets,
            cards
        };
    }
}

// 🧮 TẠO BÀI TOÁN CỘNG TRỪ TRONG PHẠM VI 10 (CHO BÉ 4-6 TUỔI)
export function generateMathQuestion() {
    const isAddition = Math.random() < 0.6;
    let a, b, result, op, opSymbol;

    const items = ['🍎', '🍬', '⭐', '🎈', '🐥', '🍓'];
    const emoji = items[randInt(0, items.length - 1)];

    if (isAddition) {
        op = '+';
        opSymbol = '+';
        a = randInt(1, 7);
        b = randInt(1, 10 - a);
        result = a + b;
    } else {
        op = '-';
        opSymbol = '−';
        a = randInt(2, 10);
        b = randInt(1, a - 1);
        result = a - b;
    }

    const visualA = emoji.repeat(a);
    const visualB = emoji.repeat(b);

    const targets = [{
        id: 'target_0',
        expected: String(result),
        label: '?',
        hint: String(result)
    }];

    const distractors = [];
    while (distractors.length < 3) {
        const offset = randInt(-3, 3);
        const n = Math.max(0, Math.min(10, result + offset));
        if (n !== result && !distractors.includes(n)) {
            distractors.push(n);
        }
    }
    while (distractors.length < 3) {
        const n = randInt(0, 10);
        if (n !== result && !distractors.includes(n)) {
            distractors.push(n);
        }
    }

    const cards = shuffle([result, ...distractors]).map((val, idx) => ({
        id: `card_${idx}`,
        value: String(val)
    }));

    const mathText = `${a}  ${opSymbol}  ${b}  =  ?`;
    const visualText = isAddition 
        ? `${visualA}   ${opSymbol}   ${visualB}`
        : `${visualA}   bớt đi   ${visualB}`;

    return {
        mode: 'math',
        category: 'math',
        a,
        b,
        op,
        result,
        voicePrompt: `${a} ${op === '+' ? 'cộng' : 'trừ'} ${b} bằng mấy bé nhỉ?`,
        title: `Phép tính: ${mathText}`,
        subtitle: `🎨 ${visualText}`,
        targets,
        cards
    };
}

// Lấy câu hỏi theo chế độ được chọn và số thứ tự câu
export function getQuestion(mode, questionIndex = 1) {
    if (mode === 'single_letter') {
        return generateSingleLetterQuestion();
    } else if (mode === 'word') {
        return generateWordQuestion();
    } else if (mode === 'letter_course') {
        // Lộ trình học chữ cái: 3 câu đầu tìm chữ cái đơn lẻ, sau đó ghép từ 2 chữ cái
        return questionIndex <= 3 ? generateSingleLetterQuestion() : generateWordQuestion();
    } else if (mode === 'number') {
        return generateNumberQuestion();
    } else if (mode === 'math') {
        return generateMathQuestion();
    } else {
        // Chế độ tổng hợp
        const rand = Math.random();
        if (rand < 0.25) return generateSingleLetterQuestion();
        if (rand < 0.50) return generateWordQuestion();
        if (rand < 0.75) return generateMathQuestion();
        return generateNumberQuestion();
    }
}
