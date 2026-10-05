import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('public/audio');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Danh sách các phát âm cần tải
const AUDIO_LIST = {
    // Chữ cái
    'letter_a': 'A',
    'letter_ă': 'Á ngắn',
    'letter_â': 'Ớ',
    'letter_b': 'Bờ',
    'letter_c': 'Cờ',
    'letter_d': 'Dờ',
    'letter_đ': 'Đờ',
    'letter_e': 'E',
    'letter_ê': 'Ê',
    'letter_g': 'Gờ',
    'letter_h': 'Hờ',
    'letter_i': 'I',
    'letter_k': 'Ca',
    'letter_l': 'Lờ',
    'letter_m': 'Mờ',
    'letter_n': 'Nờ',
    'letter_o': 'O',
    'letter_ô': 'Ô',
    'letter_ơ': 'Ơ',
    'letter_p': 'Pờ',
    'letter_q': 'Quy',
    'letter_r': 'Rờ',
    'letter_s': 'Sờ',
    'letter_t': 'Tờ',
    'letter_u': 'U',
    'letter_ư': 'Ư',
    'letter_v': 'Vờ',
    'letter_x': 'Xờ',
    'letter_y': 'I dài',
    'letter_á': 'Á',
    'letter_à': 'À',
    'letter_é': 'É',
    'letter_ẹ': 'Ẹ',
    'letter_ò': 'Ò',
    'letter_ỏ': 'Ỏ',
    'letter_ờ': 'Ờ',
    'letter_ũ': 'Ũ',
    'letter_ổ': 'Ổ',

    // Từ ghép 2 chữ cái đánh vần chuẩn sư phạm
    'word_me': 'Mờ - ẹ - mẹ - nặng - mẹ! Mẹ yêu!',
    'word_ba': 'Bờ - a - ba! Ba yêu!',
    'word_be': 'Bờ - e - be - sắc - bé! Em bé!',
    'word_ca': 'Cờ - a - ca - sắc - cá! Con cá!',
    'word_ga': 'Gờ - a - ga - huyền - gà! Con gà!',
    'word_bo': 'Bờ - o - bo - huyền - bò! Con bò sữa!',
    'word_de': 'Dờ - ê - dê! Con dê con!',
    'word_co': 'Cờ - o - co - hỏi - cỏ! Bãi cỏ xanh!',
    'word_la': 'Lờ - a - la - sắc - lá! Chiếc lá cây!',
    'word_xe': 'Xờ - e - xe! Chiếc xe hơi!',
    'word_co_vn': 'Cờ - ơ - cơ - huyền - cờ! Lá cờ đỏ sao vàng!',
    'word_bo_fruit': 'Bờ - ơ - bơ! Quả bơ thơm ngon!',
    'word_ho': 'Hờ - ô - hô - hỏi - hổ! Con hổ!',
    'word_no': 'Nờ - ơ - nơ! Chiếc nơ xinh!',
    'word_mu': 'Mờ - u - mu - ngã - mũ! Cái mũ!',
    'word_to': 'Tờ - ô - tô - hỏi - tổ! Tổ chim!',

    // Lời khen & hướng dẫn
    'welcome': 'Chào mừng bé đến với trò chơi Bé Vui Học Chữ và Toán!',
    'correct': 'Hoan hô bé, rất chính xác!',
    'wrong': 'Chưa đúng rồi, bé thử lại nhé!',
    'good_job': 'Bé thông minh lắm!',
    'finish': 'Hoan hô bé! Bé học thật là xuất sắc!'
};

// Thêm các số từ 1 đến 50
for (let i = 1; i <= 50; i++) {
    AUDIO_LIST[`num_${i}`] = `Số ${i}`;
}

async function downloadAudio(key, text) {
    const filePath = path.join(OUTPUT_DIR, `${key}.mp3`);
    if (fs.existsSync(filePath)) {
        return;
    }

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (!res.ok) {
            console.error(`Failed ${key}: status ${res.status}`);
            return;
        }
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));
        console.log(`Saved: ${key}.mp3 (${text})`);
    } catch (e) {
        console.error(`Error ${key}:`, e.message);
    }
}

async function run() {
    console.log(`Bắt đầu tải ${Object.keys(AUDIO_LIST).length} file âm thanh tiếng Việt chuẩn...`);
    for (const [key, text] of Object.entries(AUDIO_LIST)) {
        await downloadAudio(key, text);
        // Tránh flood request
        await new Promise(r => setTimeout(r, 60));
    }
    console.log('Hoàn thành tải toàn bộ âm thanh tiếng Việt!');
}

run();
