// Hệ thống âm thanh giọng đọc tiếng Việt chuẩn dành cho bé 4 - 6 tuổi
// Sử dụng file MP3 chất lượng cao trực tiếp trong dự án + dynamic endpoint cho phép toán

class VoiceSpeaker {
    constructor() {
        this.currentAudio = null;
        this.isMuted = false;
        this.audioCache = new Map();

        // Bản đồ file âm thanh từ ghép 2 chữ cái
        this.wordAudioMap = {
            'MẸ': 'word_me',
            'BA': 'word_ba',
            'BÉ': 'word_be',
            'CÁ': 'word_ca',
            'GÀ': 'word_ga',
            'BÒ': 'word_bo',
            'DÊ': 'word_de',
            'CỎ': 'word_co',
            'LÁ': 'word_la',
            'XE': 'word_xe',
            'CỜ': 'word_co_vn',
            'BƠ': 'word_bo_fruit',
            'HỔ': 'word_ho',
            'NƠ': 'word_no',
            'MŨ': 'word_mu',
            'TỔ': 'word_to'
        };
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (muted) {
            this.stop();
        }
    }

    stop() {
        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            } catch (e) {
                // Ignore audio interrupt
            }
            this.currentAudio = null;
        }
    }

    // Phát một file audio từ URL/đường dẫn
    playAudioUrl(url, onEnd = null) {
        if (this.isMuted) {
            if (onEnd) onEnd();
            return;
        }

        this.stop();

        try {
            let audio = this.audioCache.get(url);
            if (!audio) {
                audio = new Audio(url);
                this.audioCache.set(url, audio);
            }

            this.currentAudio = audio;
            audio.currentTime = 0;

            const handleEnd = () => {
                audio.removeEventListener('ended', handleEnd);
                audio.removeEventListener('error', handleError);
                if (this.currentAudio === audio) {
                    this.currentAudio = null;
                }
                if (onEnd) onEnd();
            };

            const handleError = (e) => {
                audio.removeEventListener('ended', handleEnd);
                audio.removeEventListener('error', handleError);
                if (onEnd) onEnd();
            };

            audio.addEventListener('ended', handleEnd);
            audio.addEventListener('error', handleError);

            const promise = audio.play();
            if (promise !== undefined) {
                promise.catch(() => {
                    handleError();
                });
            }
        } catch (err) {
            if (onEnd) onEnd();
        }
    }

    // Đọc văn bản tự do qua Proxy endpoint
    speak(text, onEnd = null) {
        if (!text || this.isMuted) {
            if (onEnd) onEnd();
            return;
        }
        const url = `/api/tts?text=${encodeURIComponent(text.trim())}`;
        this.playAudioUrl(url, onEnd);
    }

    // Phát âm chuẩn từng chữ cái khi chạm vào (từ file MP3 cục bộ)
    speakLetter(char) {
        const cleanChar = char.toLowerCase();
        const url = `audio/letter_${encodeURIComponent(cleanChar)}.mp3`;
        this.playAudioUrl(url);
    }

    // Đánh vần và đọc trơn từ 2 chữ cái chuẩn sư phạm mầm non (từ file MP3 cục bộ)
    speakWordWithSpelling(word) {
        const key = this.wordAudioMap[word.toUpperCase()];
        if (key) {
            this.playAudioUrl(`audio/${key}.mp3`);
        } else {
            this.speak(`${word}! Bé rất giỏi!`);
        }
    }

    // Đọc số (1 đến 50) từ file MP3 cục bộ
    speakNumber(num) {
        const n = parseInt(num, 10);
        if (n >= 1 && n <= 50) {
            this.playAudioUrl(`audio/num_${n}.mp3`);
        } else {
            this.speak(`Số ${num}`);
        }
    }

    // Đọc yêu cầu đề bài cho bé bằng 100% file MP3 cục bộ (hoạt động hoàn hảo trên cả Vercel & di động)
    playQuestionPrompt(question, gameplayType = 'drag') {
        if (this.isMuted || !question) return;

        const isReflex = gameplayType === 'reflex';

        if (question.mode === 'single_letter') {
            const prefix = isReflex ? 'audio/prompt_catch_letter.mp3' : 'audio/prompt_find_letter.mp3';
            const letterAudio = `audio/letter_${encodeURIComponent(question.letter.toLowerCase())}.mp3`;
            this.playAudioUrl(prefix, () => {
                setTimeout(() => {
                    this.playAudioUrl(letterAudio);
                }, 120);
            });
        } else if (question.mode === 'word') {
            const prefix = isReflex ? 'audio/prompt_catch_word.mp3' : 'audio/prompt_find_word.mp3';
            const wordKey = this.wordAudioMap[question.word.toUpperCase()];
            const wordAudio = wordKey ? `audio/${wordKey}.mp3` : null;
            this.playAudioUrl(prefix, () => {
                if (wordAudio) {
                    setTimeout(() => {
                        this.playAudioUrl(wordAudio);
                    }, 150);
                }
            });
        } else if (question.mode === 'number') {
            if (question.subType === 'missing_seq') {
                const prefix = isReflex ? 'audio/prompt_catch_seq.mp3' : 'audio/prompt_find_seq.mp3';
                this.playAudioUrl(prefix);
            } else {
                const prefix = isReflex ? 'audio/prompt_catch_num.mp3' : 'audio/prompt_find_num.mp3';
                const numAudio = `audio/num_${question.targetNumber}.mp3`;
                this.playAudioUrl(prefix, () => {
                    setTimeout(() => {
                        this.playAudioUrl(numAudio);
                    }, 120);
                });
            }
        } else if (question.mode === 'math') {
            this.playAudioUrl('audio/prompt_calc.mp3');
        } else {
            if (question.voicePrompt) {
                this.speak(question.voicePrompt);
            }
        }
    }

    // Đọc lời chào mở đầu
    speakWelcome() {
        this.playAudioUrl('audio/welcome.mp3');
    }

    // Lời khen khi làm đúng
    speakEncouragement() {
        const compliments = ['audio/correct.mp3', 'audio/good_job.mp3'];
        const pick = compliments[Math.floor(Math.random() * compliments.length)];
        this.playAudioUrl(pick);
    }

    // Nhắc nhở khi chưa đúng
    speakTryAgain() {
        this.playAudioUrl('audio/wrong.mp3');
    }

    // Chúc mừng khi kết thúc
    speakFinish() {
        this.playAudioUrl('audio/finish.mp3');
    }

    // Đọc phép tính cộng trừ phạm vi 10
    speakMathQuestion(a, op, b) {
        const opWord = op === '+' ? 'cộng' : 'trừ';
        this.speak(`${a} ${opWord} ${b} bằng mấy bé nhỉ?`);
    }

    speakMathSuccess(a, op, b, result) {
        const opWord = op === '+' ? 'cộng' : 'trừ';
        this.speak(`Chính xác! ${a} ${opWord} ${b} bằng ${result}!`);
    }
}

export const voiceSpeaker = new VoiceSpeaker();
