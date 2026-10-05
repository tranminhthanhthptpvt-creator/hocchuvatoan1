import { Scene } from 'phaser';
import { getQuestion } from '../utils/QuestionBank';
import { soundManager } from '../utils/SoundManager';
import { voiceSpeaker } from '../utils/VoiceSpeaker';

// Các hàm toán học thuần tránh lỗi phụ thuộc
const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => Math.random() * (max - min) + min;

export class ReflexGame extends Scene {
    constructor () {
        super('ReflexGame');
    }

    init (data) {
        this.mode = data.mode || 'word';
        this.score = data.score || 0;
        this.questionIndex = data.questionIndex || 1;
        this.totalQuestions = data.totalQuestions || 8;
        this.streak = data.streak || 0;

        this.currentQuestion = null;
        this.targets = [];
        this.bubbles = [];
        this.isLevelTransitioning = false;
    }

    create () {
        const { width, height } = this.scale;

        // Nền bầu trời biển xanh tím mộng mơ phù hợp bé 4 - 6 tuổi
        const bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x0c4a6e, 0x0c4a6e, 0x1e1b4b, 0x1e1b4b, 1);
        bgGraphics.fillRect(0, 0, width, height);

        this.createFloatingSkyClouds(width, height);
        this.createParticleTexture();
        this.createHeaderUI(width);

        // Nạp câu hỏi đầu tiên
        this.loadNextQuestion();
    }

    createParticleTexture() {
        if (!this.textures.exists('star_particle')) {
            const starGfx = this.make.graphics({ x: 0, y: 0, add: false });
            starGfx.fillStyle(0xfacc15, 1);
            starGfx.beginPath();
            const cx = 16, cy = 16, outerR = 14, innerR = 6;
            for (let i = 0; i < 10; i++) {
                const r = i % 2 === 0 ? outerR : innerR;
                const angle = (i * Math.PI) / 5 - Math.PI / 2;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                if (i === 0) starGfx.moveTo(x, y);
                else starGfx.lineTo(x, y);
            }
            starGfx.closePath();
            starGfx.fillPath();
            starGfx.generateTexture('star_particle', 32, 32);
        }
    }

    createHeaderUI(width) {
        const headerY = 46;

        const headerBg = this.add.graphics();
        headerBg.fillStyle(0x1e293b, 0.92);
        headerBg.fillRoundedRect(20, 14, width - 40, 64, 16);
        headerBg.lineStyle(2, 0x38bdf8, 0.9);
        headerBg.strokeRoundedRect(20, 14, width - 40, 64, 16);

        // Nút về Menu
        const homeBtn = this.add.container(60, headerY);
        homeBtn.setSize(48, 48);
        const homeBg = this.add.graphics();
        homeBg.fillStyle(0x334155, 1);
        homeBg.fillCircle(0, 0, 22);
        homeBtn.add(homeBg);
        const homeIcon = this.add.text(0, 0, '🏠', { fontSize: '22px' }).setOrigin(0.5);
        homeBtn.add(homeIcon);
        homeBtn.setInteractive({ useHandCursor: true });
        homeBtn.on('pointerdown', () => {
            voiceSpeaker.stop();
            soundManager.playClick();
            this.scene.start('MainMenu');
        });

        // Nhãn hình thức chơi & nội dung
        let modeLabel = '🎈 Bắt Bóng: Tìm Chữ Cái';
        if (this.mode === 'word') modeLabel = '🎈 Bắt Bóng: Ghép Chữ 2 Ký Tự';
        if (this.mode === 'letter_course') modeLabel = '🎈 Bắt Bóng: Khóa Học Chữ';
        if (this.mode === 'number') modeLabel = '🎈 Bắt Bóng: Số 1 - 50';
        if (this.mode === 'math') modeLabel = '🎈 Bắt Bóng: Toán 10';
        if (this.mode === 'mixed') modeLabel = '🎈 Bắt Bóng: Tổng Hợp';

        this.add.text(100, headerY, modeLabel, {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#38bdf8'
        }).setOrigin(0, 0.5);

        // Tiến trình câu hỏi
        this.progressText = this.add.text(width / 2, headerY, `Câu ${this.questionIndex}/${this.totalQuestions}`, {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#f8fafc'
        }).setOrigin(0.5);

        // Điểm số
        this.scoreText = this.add.text(width - 240, headerY, `⭐ Điểm: ${this.score}`, {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#fbbf24'
        }).setOrigin(0.5);

        // Chuỗi combo phản xạ
        this.streakText = this.add.text(width - 110, headerY, `🔥 ${this.streak}`, {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#f97316'
        }).setOrigin(0.5);

        // Nút tắt âm thanh
        const muteBtn = this.add.container(width - 50, headerY);
        muteBtn.setSize(44, 44);
        const muteBg = this.add.graphics();
        muteBg.fillStyle(0x334155, 1);
        muteBg.fillCircle(0, 0, 20);
        muteBtn.add(muteBg);
        const muteIcon = this.add.text(0, 0, soundManager.isMuted ? '🔇' : '🔊', { fontSize: '18px' }).setOrigin(0.5);
        muteBtn.add(muteIcon);
        muteBtn.setInteractive({ useHandCursor: true });
        muteBtn.on('pointerdown', () => {
            const muted = soundManager.toggleMute();
            voiceSpeaker.setMuted(muted);
            muteIcon.setText(muted ? '🔇' : '🔊');
            soundManager.playClick();
        });
    }

    loadNextQuestion() {
        if (this.questionGroup) {
            this.questionGroup.destroy(true);
        }

        this.isLevelTransitioning = false;
        this.targets = [];
        this.bubbles = [];

        this.currentQuestion = getQuestion(this.mode, this.questionIndex, 'reflex');
        this.progressText.setText(`Câu ${this.questionIndex}/${this.totalQuestions}`);

        const { width } = this.scale;
        this.questionGroup = this.add.group();

        // Khung bảng câu hỏi
        const board = this.add.graphics();
        board.fillStyle(0x0f172a, 0.78);
        board.fillRoundedRect(50, 90, width - 100, 240, 24);
        board.lineStyle(2, 0x0284c7, 0.8);
        board.strokeRoundedRect(50, 90, width - 100, 240, 24);
        this.questionGroup.add(board);

        // Hiển thị nội dung câu hỏi
        if (this.currentQuestion.mode === 'single_letter') {
            const emojiIcon = this.add.text(width / 2, 140, this.currentQuestion.emoji, {
                fontSize: '70px'
            }).setOrigin(0.5);
            this.questionGroup.add(emojiIcon);

            this.tweens.add({
                targets: emojiIcon,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 900,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            const qTitle = this.add.text(width / 2, 210, `${this.currentQuestion.word}, chữ ${this.currentQuestion.letterName}`, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#fef08a',
                stroke: '#0f172a',
                strokeThickness: 5
            }).setOrigin(0.5);
            this.questionGroup.add(qTitle);

            const qSub = this.add.text(width / 2, 260, `🎈 Bé hãy bắt bóng chữ "${this.currentQuestion.letter}"`, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#38bdf8',
                stroke: '#0f172a',
                strokeThickness: 3
            }).setOrigin(0.5);
            this.questionGroup.add(qSub);

        } else if (this.currentQuestion.mode === 'word') {
            const emojiIcon = this.add.text(width / 2, 145, this.currentQuestion.emoji, {
                fontSize: '70px'
            }).setOrigin(0.5);
            this.questionGroup.add(emojiIcon);

            this.tweens.add({
                targets: emojiIcon,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 900,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            const qTitle = this.add.text(width / 2, 215, `Bé hãy bắt bóng chữ: "${this.currentQuestion.word}"`, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#fef08a',
                stroke: '#0f172a',
                strokeThickness: 4
            }).setOrigin(0.5);
            this.questionGroup.add(qTitle);

            const qSub = this.add.text(width / 2, 260, `🎈 Bấm vào bong bóng chứa chữ đúng đang bay bên dưới!`, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '18px',
                fontStyle: 'bold',
                color: '#38bdf8'
            }).setOrigin(0.5);
            this.questionGroup.add(qSub);

        } else if (this.currentQuestion.mode === 'math') {
            const visualText = this.add.text(width / 2, 145, this.currentQuestion.subtitle, {
                fontSize: '36px',
                align: 'center'
            }).setOrigin(0.5);
            this.questionGroup.add(visualText);

            const mathEquation = this.add.text(width / 2, 215, this.currentQuestion.title, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#fef08a',
                stroke: '#0f172a',
                strokeThickness: 4
            }).setOrigin(0.5);
            this.questionGroup.add(mathEquation);

            const mathHint = this.add.text(width / 2, 265, '🎈 Bắt quả bóng mang số kết quả chính xác nhé!', {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '18px',
                fontStyle: 'bold',
                color: '#38bdf8'
            }).setOrigin(0.5);
            this.questionGroup.add(mathHint);

        } else {
            // Chế độ nhận biết số (1 - 50)
            if (this.currentQuestion.subType === 'missing_seq') {
                const qTitle = this.add.text(width / 2, 130, '🔢 Số nào còn thiếu trong dãy số?', {
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    fontSize: '26px',
                    fontStyle: 'bold',
                    color: '#93c5fd',
                    stroke: '#0f172a',
                    strokeThickness: 3
                }).setOrigin(0.5);
                this.questionGroup.add(qTitle);

                const seqBox = this.add.graphics();
                seqBox.fillStyle(0x0f172a, 0.7);
                seqBox.fillRoundedRect(width / 2 - 340, 165, 680, 80, 20);
                seqBox.lineStyle(2.5, 0x38bdf8, 0.9);
                seqBox.strokeRoundedRect(width / 2 - 340, 165, 680, 80, 20);
                this.questionGroup.add(seqBox);

                const seqText = this.add.text(width / 2, 205, this.currentQuestion.displaySeq, {
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    fontSize: '44px',
                    fontStyle: 'bold',
                    color: '#fef08a',
                    stroke: '#0f172a',
                    strokeThickness: 5
                }).setOrigin(0.5);
                this.questionGroup.add(seqText);

                const subHint = this.add.text(width / 2, 265, '🎈 Hãy bắt quả bóng chứa số còn thiếu đang bay!', {
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    fontSize: '18px',
                    fontStyle: 'bold',
                    color: '#38bdf8'
                }).setOrigin(0.5);
                this.questionGroup.add(subHint);
            } else {
                const numberBadge = this.add.text(width / 2, 140, `🔢`, {
                    fontSize: '56px'
                }).setOrigin(0.5);
                this.questionGroup.add(numberBadge);

                const qTitle = this.add.text(width / 2, 210, this.currentQuestion.title, {
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    fontSize: '34px',
                    fontStyle: 'bold',
                    color: '#fef08a',
                    stroke: '#0f172a',
                    strokeThickness: 4
                }).setOrigin(0.5);
                this.questionGroup.add(qTitle);

                const qSub = this.add.text(width / 2, 265, '🎈 Hãy bắt đúng quả bóng số yêu cầu đang bay nhé!', {
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    fontSize: '18px',
                    fontStyle: 'bold',
                    color: '#38bdf8'
                }).setOrigin(0.5);
                this.questionGroup.add(qSub);
            }
        }

        // Nút loa phát thanh 📢
        this.createSpeakerButton(width / 2 + 380, 185);

        // Nút gợi ý 💡
        this.createHintButton(width / 2, 305);

        // Đọc đề bài bằng giọng đọc chuẩn
        this.time.delayedCall(400, () => {
            if (this.currentQuestion) {
                voiceSpeaker.playQuestionPrompt(this.currentQuestion, 'reflex');
            }
        });

        // Tạo các Ô Nhận Thu Thập (Target Slots)
        this.createTargetSlots(width);

        // Tạo các Quả Bóng Bay Lượn Phản Xạ (Flying Bubbles)
        this.createFloatingBubbles(width);
    }

    createSpeakerButton(x, y) {
        const speakerBtn = this.add.container(x, y);
        speakerBtn.setSize(56, 56);

        const bg = this.add.graphics();
        bg.fillStyle(0x0284c7, 0.9);
        bg.fillCircle(0, 0, 26);
        bg.lineStyle(2, 0x38bdf8, 1);
        bg.strokeCircle(0, 0, 26);
        speakerBtn.add(bg);

        const icon = this.add.text(0, 0, '📢', { fontSize: '24px' }).setOrigin(0.5);
        speakerBtn.add(icon);

        speakerBtn.setInteractive({ useHandCursor: true });
        speakerBtn.on('pointerdown', () => {
            soundManager.playClick();
            this.tweens.add({
                targets: speakerBtn,
                scaleX: 1.15,
                scaleY: 1.15,
                duration: 100,
                yoyo: true
            });
            if (this.currentQuestion) {
                voiceSpeaker.playQuestionPrompt(this.currentQuestion, 'reflex');
            }
        });
        this.questionGroup.add(speakerBtn);
    }

    createHintButton(x, y) {
        const hintBtn = this.add.container(x, y);
        hintBtn.setSize(180, 36);

        const bg = this.add.graphics();
        bg.fillStyle(0x4338ca, 0.85);
        bg.fillRoundedRect(-90, -18, 180, 36, 12);
        bg.lineStyle(1.5, 0x818cf8, 1);
        bg.strokeRoundedRect(-90, -18, 180, 36, 12);
        hintBtn.add(bg);

        const text = this.add.text(0, 0, '💡 Gợi ý cho bé', {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '15px',
            fontStyle: 'bold',
            color: '#e0e7ff'
        }).setOrigin(0.5);
        hintBtn.add(text);

        hintBtn.setInteractive({ useHandCursor: true });
        hintBtn.on('pointerdown', () => {
            soundManager.playClick();
            this.showHintAnimation();
        });
        this.questionGroup.add(hintBtn);
    }

    showHintAnimation() {
        const unresolvedTarget = this.targets.find(t => !t.resolved);
        if (!unresolvedTarget) return;

        // Hiện mờ chữ gợi ý trong ô
        if (unresolvedTarget.ghostHint) {
            this.tweens.add({
                targets: unresolvedTarget.ghostHint,
                alpha: 0.38,
                duration: 400,
                ease: 'Sine.easeOut'
            });
        }

        // Làm nổi bật quả bóng đúng đang bay
        const matchingBubble = this.bubbles.find(b => !b.popped && b.value === unresolvedTarget.expected);
        if (matchingBubble) {
            this.tweens.add({
                targets: matchingBubble.container,
                scaleX: 1.25,
                scaleY: 1.25,
                duration: 250,
                yoyo: true,
                repeat: 3,
                ease: 'Sine.easeInOut'
            });

            if (this.currentQuestion.mode === 'word') {
                voiceSpeaker.speakLetter(matchingBubble.value);
            } else {
                voiceSpeaker.speakNumber(matchingBubble.value);
            }
        }
    }

    createTargetSlots(width) {
        const targetList = this.currentQuestion.targets;
        const count = targetList.length;
        const slotWidth = 100;
        const slotHeight = 100;
        const gap = 36;
        const totalW = count * slotWidth + (count - 1) * gap;
        const startX = (width - totalW) / 2 + slotWidth / 2;
        const targetY = 385;

        targetList.forEach((item, index) => {
            const posX = startX + index * (slotWidth + gap);
            const container = this.add.container(posX, targetY);
            container.setSize(slotWidth, slotHeight);

            const bgGfx = this.add.graphics();
            this.drawTargetSlotGraphics(bgGfx, slotWidth, slotHeight, false);
            container.add(bgGfx);

            // Chữ mờ gợi ý (ẩn mặc định, chỉ hiện khi click gợi ý)
            const ghostHint = this.add.text(0, -4, item.hint, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '40px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5).setAlpha(0);
            container.add(ghostHint);

            const labelText = this.add.text(0, slotHeight / 2 + 16, `Ô số ${index + 1}`, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#94a3b8'
            }).setOrigin(0.5);
            container.add(labelText);

            const targetObj = {
                id: item.id,
                expected: item.expected,
                container,
                bgGfx,
                labelText,
                ghostHint,
                x: posX,
                y: targetY,
                width: slotWidth,
                height: slotHeight,
                resolved: false
            };

            this.targets.push(targetObj);
            this.questionGroup.add(container);
        });
    }

    drawTargetSlotGraphics(gfx, w, h, isCorrect = false) {
        gfx.clear();
        if (isCorrect) {
            gfx.fillStyle(0x059669, 0.35);
            gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
            gfx.lineStyle(3, 0x10b981, 1);
            gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
        } else {
            gfx.fillStyle(0x0f172a, 0.65);
            gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
            gfx.lineStyle(2, 0x38bdf8, 0.7);
            gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
        }
    }

    createFloatingBubbles(width) {
        const cardList = this.currentQuestion.cards;
        const count = cardList.length;
        const bubbleRadius = 48;

        // Vùng bay lượn của bong bóng: từ y = 470 đến y = 710
        const minX = 70;
        const maxX = width - 70;
        const minY = 480;
        const maxY = 700;

        const bubbleColors = [0xec4899, 0x06b6d4, 0x8b5cf6, 0xf59e0b, 0x10b981, 0x3b82f6];

        cardList.forEach((item, index) => {
            // Phân bổ vị trí ban đầu tách biệt nhau
            const startX = minX + ((maxX - minX) / (count + 1)) * (index + 1) + randBetween(-20, 20);
            const startY = minY + randBetween(10, maxY - minY - 10);

            const container = this.add.container(startX, startY);
            container.setSize(bubbleRadius * 2, bubbleRadius * 2);

            const color = bubbleColors[index % bubbleColors.length];

            // Thân bong bóng nước thủy tinh trong suốt
            const bubbleGfx = this.add.graphics();
            bubbleGfx.fillStyle(color, 0.45);
            bubbleGfx.fillCircle(0, 0, bubbleRadius);
            bubbleGfx.lineStyle(3, 0xffffff, 0.85);
            bubbleGfx.strokeCircle(0, 0, bubbleRadius);

            // Điểm sáng phản chiếu bóng nước (highlight shine)
            bubbleGfx.fillStyle(0xffffff, 0.75);
            bubbleGfx.fillCircle(-bubbleRadius * 0.35, -bubbleRadius * 0.35, bubbleRadius * 0.22);
            bubbleGfx.fillStyle(0xffffff, 0.5);
            bubbleGfx.fillCircle(-bubbleRadius * 0.15, -bubbleRadius * 0.5, bubbleRadius * 0.1);
            container.add(bubbleGfx);

            // Chữ cái hoặc số bên trong bong bóng
            const text = this.add.text(0, 0, item.value, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: item.value.length > 2 ? '30px' : '40px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#0f172a',
                strokeThickness: 4
            }).setOrigin(0.5);
            container.add(text);

            container.setInteractive({ useHandCursor: true });

            // Vận tốc bay bồng bềnh
            const vx = (Math.random() < 0.5 ? 1 : -1) * randFloat(35, 65);
            const vy = (Math.random() < 0.5 ? 1 : -1) * randFloat(30, 55);

            const bubbleObj = {
                id: item.id,
                value: item.value,
                container,
                bubbleGfx,
                text,
                color,
                radius: bubbleRadius,
                vx,
                vy,
                popped: false,
                baseY: startY,
                timeOffset: randFloat(0, Math.PI * 2)
            };

            // Sự kiện tương tác click/bắt bóng
            this.setupBubbleEvents(bubbleObj);

            this.bubbles.push(bubbleObj);
            this.questionGroup.add(container);
        });
    }

    setupBubbleEvents(bubble) {
        const { container } = bubble;

        container.on('pointerover', () => {
            if (bubble.popped || this.isLevelTransitioning) return;
            this.tweens.add({
                targets: container,
                scaleX: 1.12,
                scaleY: 1.12,
                duration: 100,
                ease: 'Quad.easeOut'
            });
        });

        container.on('pointerout', () => {
            if (bubble.popped || this.isLevelTransitioning) return;
            this.tweens.add({
                targets: container,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 100,
                ease: 'Quad.easeOut'
            });
        });

        container.on('pointerdown', () => {
            if (bubble.popped || this.isLevelTransitioning) return;

            // Kiểm tra xem chữ/số trong bóng có khớp với ô đích nào đang cần điền không
            const matchingTarget = this.targets.find(t => !t.resolved && t.expected === bubble.value);

            if (matchingTarget) {
                this.handleCorrectBubblePop(bubble, matchingTarget);
            } else {
                this.handleWrongBubblePop(bubble);
            }
        });
    }

    handleCorrectBubblePop(bubble, target) {
        bubble.popped = true;
        target.resolved = true;
        bubble.container.disableInteractive();

        // Âm thanh nổ bóng nước
        soundManager.playPop();

        // Phát âm thanh giọng đọc chữ cái hoặc số ngay khi bắt trúng
        if (this.currentQuestion.mode === 'single_letter' || this.currentQuestion.mode === 'word') {
            voiceSpeaker.speakLetter(bubble.value);
        } else {
            voiceSpeaker.speakNumber(bubble.value);
        }

        // Bắn hiệu ứng hạt vỡ bong bóng
        this.emitStarParticles(bubble.container.x, bubble.container.y);

        // Hiệu ứng bóng vỡ: bóng nở to rồi biến mất
        this.tweens.add({
            targets: bubble.bubbleGfx,
            scaleX: 1.4,
            scaleY: 1.4,
            alpha: 0,
            duration: 150,
            ease: 'Quad.easeOut'
        });

        // Chữ cái bay vút mượt mà vào ô đích thu thập
        this.tweens.add({
            targets: bubble.container,
            x: target.x,
            y: target.y,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 380,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Ô đích sáng lên hoàn thành
                this.drawTargetSlotGraphics(target.bgGfx, target.width, target.height, true);
                target.labelText.setText('✔ Thu thập').setColor('#10b981');
                this.emitStarParticles(target.x, target.y);
            }
        });

        // Điểm thưởng phản xạ
        this.score += 100;
        this.streak += 1;
        this.scoreText.setText(`⭐ Điểm: ${this.score}`);
        this.streakText.setText(`🔥 ${this.streak}`);
        this.showFloatingNotice(target.x, target.y - 45, '+100 ĐIỂM 🎉', '#34d399');

        // Kiểm tra xem đã thu thập đủ tất cả mục tiêu chưa
        const allResolved = this.targets.every(t => t.resolved);
        if (allResolved) {
            this.handleQuestionComplete();
        }
    }

    handleWrongBubblePop(bubble) {
        soundManager.playError();
        voiceSpeaker.speakTryAgain();

        // Rung lắc báo bóng không phải mục tiêu
        this.tweens.add({
            targets: bubble.container,
            x: bubble.container.x + 12,
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut'
        });

        this.showFloatingNotice(bubble.container.x, bubble.container.y - 45, 'Chưa đúng, thử bóng khác nhé! ❌', '#f87171');

        this.streak = 0;
        this.streakText.setText(`🔥 ${this.streak}`);
    }

    emitStarParticles(x, y) {
        for (let i = 0; i < 14; i++) {
            const particle = this.add.image(x, y, 'star_particle');
            const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
            const speed = randBetween(60, 150);
            const destX = x + Math.cos(angle) * speed;
            const destY = y + Math.sin(angle) * speed;

            particle.setScale(randFloat(0.5, 1.1));
            particle.setDepth(1100);

            this.tweens.add({
                targets: particle,
                x: destX,
                y: destY,
                alpha: 0,
                scale: 0.1,
                angle: randBetween(90, 360),
                duration: randBetween(450, 750),
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    showFloatingNotice(x, y, text, color) {
        const notice = this.add.text(x, y, text, {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '20px',
            fontStyle: 'bold',
            color: color,
            stroke: '#0f172a',
            strokeThickness: 4
        }).setOrigin(0.5);
        notice.setDepth(1200);

        this.tweens.add({
            targets: notice,
            y: y - 40,
            alpha: 0,
            duration: 900,
            ease: 'Cubic.easeOut',
            onComplete: () => notice.destroy()
        });
    }

    handleQuestionComplete() {
        this.isLevelTransitioning = true;
        soundManager.playWin();

        // Phát âm từ ghép hoàn chỉnh hoặc phép toán
        if (this.currentQuestion.mode === 'single_letter') {
            voiceSpeaker.speakLetter(this.currentQuestion.letter);
            this.time.delayedCall(1100, () => {
                voiceSpeaker.speakEncouragement();
            });
        } else if (this.currentQuestion.mode === 'word') {
            voiceSpeaker.speakWordWithSpelling(this.currentQuestion.word);
        } else if (this.currentQuestion.mode === 'math') {
            voiceSpeaker.speakMathSuccess(
                this.currentQuestion.a,
                this.currentQuestion.op,
                this.currentQuestion.b,
                this.currentQuestion.result
            );
        } else {
            voiceSpeaker.speakEncouragement();
        }

        const { width } = this.scale;

        // Pháo hoa sao
        for (let i = 0; i < 3; i++) {
            this.time.delayedCall(i * 180, () => {
                const rx = randBetween(200, width - 200);
                const ry = randBetween(250, 420);
                this.emitStarParticles(rx, ry);
            });
        }

        // Biểu ngữ chúc mừng ở vị trí y = 190 (KHÔNG che khuất bài làm của bé)
        const congratsBanner = this.add.container(width / 2, 190);
        congratsBanner.setDepth(1500);

        const bannerBg = this.add.graphics();
        bannerBg.fillStyle(0x0f172a, 0.95);
        bannerBg.fillRoundedRect(-240, -48, 480, 96, 22);
        bannerBg.lineStyle(3, 0xfacc15, 1);
        bannerBg.strokeRoundedRect(-240, -48, 480, 96, 22);
        congratsBanner.add(bannerBg);

        const bannerText = this.add.text(0, 0, '🌟 BÉ BẮT BÓNG CỰC GIỎI! 🌟', {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '30px',
            fontStyle: 'bold',
            color: '#fef08a',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);
        congratsBanner.add(bannerText);

        congratsBanner.setScale(0);
        this.tweens.add({
            targets: congratsBanner,
            scaleX: 1,
            scaleY: 1,
            duration: 350,
            ease: 'Back.easeOut'
        });

        this.time.delayedCall(2800, () => {
            congratsBanner.destroy();

            if (this.questionIndex >= this.totalQuestions) {
                this.scene.start('GameOver', {
                    score: this.score,
                    totalQuestions: this.totalQuestions,
                    mode: this.mode,
                    gameplayType: 'reflex'
                });
            } else {
                this.questionIndex += 1;
                this.loadNextQuestion();
            }
        });
    }

    // Cập nhật chuyển động bay lơ lửng của các quả bong bóng
    update (time, delta) {
        if (this.isLevelTransitioning) return;

        const dt = delta / 1000;
        const { width } = this.scale;
        const minX = 60;
        const maxX = width - 60;
        const minY = 460;
        const maxY = 720;

        this.bubbles.forEach(b => {
            if (b.popped) return;

            b.container.x += b.vx * dt;
            b.container.y += b.vy * dt;

            // Bồng bềnh nhẹ theo sóng sin
            b.container.y += Math.sin(time / 400 + b.timeOffset) * 0.4;

            // Nảy lại khi chạm biên
            if (b.container.x <= minX) {
                b.container.x = minX;
                b.vx = Math.abs(b.vx);
            } else if (b.container.x >= maxX) {
                b.container.x = maxX;
                b.vx = -Math.abs(b.vx);
            }

            if (b.container.y <= minY) {
                b.container.y = minY;
                b.vy = Math.abs(b.vy);
            } else if (b.container.y >= maxY) {
                b.container.y = maxY;
                b.vy = -Math.abs(b.vy);
            }
        });
    }

    createFloatingSkyClouds(width, height) {
        for (let i = 0; i < 18; i++) {
            const x = randBetween(30, width - 30);
            const y = randBetween(40, height - 40);
            const radius = randBetween(3, 6);
            const dot = this.add.circle(x, y, radius, 0x38bdf8, randFloat(0.15, 0.35));

            this.tweens.add({
                targets: dot,
                alpha: randFloat(0.4, 0.8),
                duration: randBetween(1500, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
}
