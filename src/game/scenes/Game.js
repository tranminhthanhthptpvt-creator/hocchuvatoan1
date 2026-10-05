import { Scene } from 'phaser';
import { getQuestion } from '../utils/QuestionBank';
import { soundManager } from '../utils/SoundManager';
import { voiceSpeaker } from '../utils/VoiceSpeaker';

// Hàm toán học thuần tránh lỗi phụ thuộc
const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => Math.random() * (max - min) + min;
const distanceBetween = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

export class Game extends Scene {
    constructor () {
        super('Game');
    }

    init (data) {
        this.mode = data.mode || 'word';
        this.score = data.score || 0;
        this.questionIndex = data.questionIndex || 1;
        this.totalQuestions = data.totalQuestions || 8;
        this.streak = data.streak || 0;

        this.currentQuestion = null;
        this.targets = [];
        this.cards = [];
        this.isLevelTransitioning = false;
    }

    create () {
        const { width, height } = this.scale;

        // Nền tối xanh gradient dịu mắt
        const bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x0f172a, 0x0f172a, 0x1e293b, 0x1e293b, 1);
        bgGraphics.fillRect(0, 0, width, height);

        this.createBackgroundDecorations(width, height);
        this.createParticleTexture();
        this.createHeaderUI(width);

        // Bắt đầu câu hỏi
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
        headerBg.lineStyle(2, 0x334155, 1);
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

        // Nhãn chế độ
        let modeLabel = '🔤 Bé Tìm Chữ Cái';
        if (this.mode === 'word') modeLabel = '📝 Bé Ghép Chữ 2 Ký Tự';
        if (this.mode === 'letter_course') modeLabel = '🔤 Khóa Học Chữ Cái';
        if (this.mode === 'number') modeLabel = '🔢 Chữ Số (1 Đến 50)';
        if (this.mode === 'math') modeLabel = '🍎 Toán Cộng Trừ Trong Phạm Vi 10';
        if (this.mode === 'mixed') modeLabel = '🌟 Thử Thách Bé Yêu';

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
        }).setOrigin(0, 0.5);

        // Chuỗi đúng (Streak)
        this.streakText = this.add.text(width - 110, headerY, `🔥 ${this.streak}`, {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#f97316'
        }).setOrigin(0, 0.5);

        // Nút bật/tắt âm thanh
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
        this.cards = [];

        this.currentQuestion = getQuestion(this.mode, this.questionIndex);
        this.progressText.setText(`Câu ${this.questionIndex}/${this.totalQuestions}`);

        const { width } = this.scale;
        this.questionGroup = this.add.group();

        // Khung bảng câu hỏi
        const board = this.add.graphics();
        board.fillStyle(0x1e293b, 0.75);
        board.fillRoundedRect(50, 92, width - 100, 250, 24);
        board.lineStyle(2, 0x3b82f6, 0.6);
        board.strokeRoundedRect(50, 92, width - 100, 250, 24);
        this.questionGroup.add(board);

        // Hiển thị nội dung trực quan cho bé 4 - 6 tuổi
        if (this.currentQuestion.mode === 'single_letter') {
            // MỤC 1: TÌM CHỮ CÁI ĐƠN LẺ KÈM HÌNH ẢNH MINH HỌA
            const emojiIcon = this.add.text(width / 2, 150, this.currentQuestion.emoji, {
                fontSize: '74px'
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

            const qTitle = this.add.text(width / 2, 220, `Bé hãy tìm chữ: "${this.currentQuestion.letter}"`, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#fef08a',
                stroke: '#0f172a',
                strokeThickness: 5
            }).setOrigin(0.5);
            this.questionGroup.add(qTitle);

            const qSub = this.add.text(width / 2, 268, `${this.currentQuestion.word} • Chữ ${this.currentQuestion.letterName}`, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '22px',
                fontStyle: 'bold',
                color: '#93c5fd'
            }).setOrigin(0.5);
            this.questionGroup.add(qSub);

        } else if (this.currentQuestion.mode === 'word') {
            // MỤC 2: GHÉP TỪ 2 CHỮ CÁI CÓ DẤU
            const emojiIcon = this.add.text(width / 2, 160, this.currentQuestion.emoji, {
                fontSize: '76px'
            }).setOrigin(0.5);
            this.questionGroup.add(emojiIcon);

            // Hiệu ứng nhịp tim cho emoji
            this.tweens.add({
                targets: emojiIcon,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 900,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Tiêu đề từ ghép
            const qTitle = this.add.text(width / 2, 235, `Bé hãy ghép chữ: "${this.currentQuestion.word}"`, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#fef08a',
                stroke: '#0f172a',
                strokeThickness: 4
            }).setOrigin(0.5);
            this.questionGroup.add(qTitle);

            const qSub = this.add.text(width / 2, 275, this.currentQuestion.subtitle, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '18px',
                color: '#93c5fd'
            }).setOrigin(0.5);
            this.questionGroup.add(qSub);

        } else if (this.currentQuestion.mode === 'math') {
            // Hình ảnh đếm quả/sao trực quan cho phép toán phạm vi 10
            const visualText = this.add.text(width / 2, 150, this.currentQuestion.subtitle, {
                fontSize: '38px',
                align: 'center'
            }).setOrigin(0.5);
            this.questionGroup.add(visualText);

            const mathEquation = this.add.text(width / 2, 225, this.currentQuestion.title, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#fef08a',
                stroke: '#0f172a',
                strokeThickness: 4
            }).setOrigin(0.5);
            this.questionGroup.add(mathEquation);

            const mathHint = this.add.text(width / 2, 275, 'Bé hãy đếm hình và kéo số kết quả vào ô trống nhé!', {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '18px',
                color: '#93c5fd'
            }).setOrigin(0.5);
            this.questionGroup.add(mathHint);

        } else {
            // Chế độ nhận biết số (1 đến 50)
            if (this.currentQuestion.subType === 'missing_seq') {
                const qTitle = this.add.text(width / 2, 135, '🔢 Số nào còn thiếu trong dãy số?', {
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    fontSize: '26px',
                    fontStyle: 'bold',
                    color: '#93c5fd',
                    stroke: '#0f172a',
                    strokeThickness: 3
                }).setOrigin(0.5);
                this.questionGroup.add(qTitle);

                // DÃY SỐ VỚI KÍCH CỠ CHỮ CỰC LỚN (46px) ĐẬM RÕ NÉT CHO BÉ
                const seqBox = this.add.graphics();
                seqBox.fillStyle(0x0f172a, 0.7);
                seqBox.fillRoundedRect(width / 2 - 340, 175, 680, 84, 20);
                seqBox.lineStyle(2.5, 0x38bdf8, 0.9);
                seqBox.strokeRoundedRect(width / 2 - 340, 175, 680, 84, 20);
                this.questionGroup.add(seqBox);

                const seqText = this.add.text(width / 2, 217, this.currentQuestion.displaySeq, {
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    fontSize: '44px',
                    fontStyle: 'bold',
                    color: '#fef08a',
                    stroke: '#0f172a',
                    strokeThickness: 5
                }).setOrigin(0.5);
                this.questionGroup.add(seqText);

                const subHint = this.add.text(width / 2, 280, '👉 Kéo số thích hợp vào ô mục tiêu bên dưới', {
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    fontSize: '18px',
                    fontStyle: 'bold',
                    color: '#38bdf8'
                }).setOrigin(0.5);
                this.questionGroup.add(subHint);
            } else {
                const numberBadge = this.add.text(width / 2, 145, `🔢`, {
                    fontSize: '60px'
                }).setOrigin(0.5);
                this.questionGroup.add(numberBadge);

                const qTitle = this.add.text(width / 2, 215, this.currentQuestion.title, {
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    fontSize: '34px',
                    fontStyle: 'bold',
                    color: '#fef08a',
                    stroke: '#0f172a',
                    strokeThickness: 4
                }).setOrigin(0.5);
                this.questionGroup.add(qTitle);

                const qSub = this.add.text(width / 2, 270, this.currentQuestion.subtitle, {
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    fontSize: '22px',
                    color: '#93c5fd'
                }).setOrigin(0.5);
                this.questionGroup.add(qSub);
            }
        }

        // Nút nghe lại giọng đọc câu hỏi (Loa phát thanh 📢)
        this.createSpeakerButton(width / 2 + 380, 200);

        // Nút gợi ý 💡
        this.createHintButton(width / 2, 315);

        // Phát âm câu hỏi tự động
        this.time.delayedCall(400, () => {
            if (this.currentQuestion && this.currentQuestion.voicePrompt) {
                voiceSpeaker.speak(this.currentQuestion.voicePrompt);
            }
        });

        // Tạo các Ô Nhận Thẻ (Drop Targets)
        this.createDropTargets(width);

        // Tạo các Thẻ Kéo Thả (Draggable Cards)
        this.createDraggableCards(width);
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
            if (this.currentQuestion && this.currentQuestion.voicePrompt) {
                voiceSpeaker.speak(this.currentQuestion.voicePrompt);
            }
        });
        this.questionGroup.add(speakerBtn);
    }

    createHintButton(x, y) {
        const hintBtn = this.add.container(x, y);
        hintBtn.setSize(180, 38);

        const bg = this.add.graphics();
        bg.fillStyle(0x4338ca, 0.85);
        bg.fillRoundedRect(-90, -19, 180, 38, 12);
        bg.lineStyle(1.5, 0x818cf8, 1);
        bg.strokeRoundedRect(-90, -19, 180, 38, 12);
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

        const matchingCard = this.cards.find(c => !c.locked && c.value === unresolvedTarget.expected);

        // HIỆN MỜ Ô GỢI Ý KHI CLICK VÀO "GỢI Ý CHO BÉ"
        if (unresolvedTarget && unresolvedTarget.ghostHint) {
            this.tweens.add({
                targets: unresolvedTarget.ghostHint,
                alpha: 0.38,
                duration: 400,
                ease: 'Sine.easeOut'
            });
        }

        if (unresolvedTarget) {
            this.tweens.add({
                targets: unresolvedTarget.container,
                scaleX: 1.15,
                scaleY: 1.15,
                duration: 250,
                yoyo: true,
                repeat: 2,
                ease: 'Sine.easeInOut'
            });
        }

        if (matchingCard) {
            this.tweens.add({
                targets: matchingCard.container,
                scaleX: 1.18,
                scaleY: 1.18,
                duration: 250,
                yoyo: true,
                repeat: 2,
                ease: 'Sine.easeInOut'
            });
            // Đọc lại âm thanh của thẻ gợi ý
            if (this.currentQuestion.mode === 'word') {
                voiceSpeaker.speakLetter(matchingCard.value);
            } else {
                voiceSpeaker.speakNumber(matchingCard.value);
            }
        }
    }

    createDropTargets(width) {
        const targetList = this.currentQuestion.targets;
        const count = targetList.length;
        const slotWidth = 110;
        const slotHeight = 110;
        const gap = 40;
        const totalW = count * slotWidth + (count - 1) * gap;
        const startX = (width - totalW) / 2 + slotWidth / 2;
        const targetY = 415;

        targetList.forEach((item, index) => {
            const posX = startX + index * (slotWidth + gap);
            const container = this.add.container(posX, targetY);
            container.setSize(slotWidth, slotHeight);

            // Viền ô nhận thẻ
            const bgGfx = this.add.graphics();
            this.drawTargetSlotGraphics(bgGfx, slotWidth, slotHeight, false);
            container.add(bgGfx);

            // Chữ gợi ý bên trong ô: mặc định ẨN HOÀN TOÀN (alpha = 0), chỉ hiện khi click Gợi ý cho bé
            const ghostHint = this.add.text(0, -4, item.hint, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '44px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5).setAlpha(0);
            container.add(ghostHint);

            // Nhãn số thứ tự ô
            const labelText = this.add.text(0, slotHeight / 2 + 18, `Ô số ${index + 1}`, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: '15px',
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

    drawTargetSlotGraphics(gfx, w, h, isHovered, isCorrect = false) {
        gfx.clear();
        if (isCorrect) {
            gfx.fillStyle(0x059669, 0.35);
            gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
            gfx.lineStyle(3, 0x10b981, 1);
            gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
        } else if (isHovered) {
            gfx.fillStyle(0x38bdf8, 0.3);
            gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
            gfx.lineStyle(3, 0x38bdf8, 1);
            gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
        } else {
            gfx.fillStyle(0x0f172a, 0.7);
            gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
            gfx.lineStyle(2.5, 0x475569, 0.9);
            gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
        }
    }

    createDraggableCards(width) {
        const cardList = this.currentQuestion.cards;
        const count = cardList.length;
        const cardWidth = 100;
        const cardHeight = 100;
        const gap = 28;
        const totalW = count * cardWidth + (count - 1) * gap;
        const startX = (width - totalW) / 2 + cardWidth / 2;
        const cardY = 600;

        // Băng giá đựng thẻ bên dưới
        const shelfBg = this.add.graphics();
        shelfBg.fillStyle(0x0f172a, 0.55);
        shelfBg.fillRoundedRect(width / 2 - (totalW + 64) / 2, cardY - 65, totalW + 64, 130, 22);
        shelfBg.lineStyle(2, 0x334155, 0.85);
        shelfBg.strokeRoundedRect(width / 2 - (totalW + 64) / 2, cardY - 65, totalW + 64, 130, 22);
        this.questionGroup.add(shelfBg);

        const cardColors = [0x0284c7, 0x059669, 0xd97706, 0x7c3aed, 0xdb2777, 0x2563eb];

        cardList.forEach((item, index) => {
            const posX = startX + index * (cardWidth + gap);
            const container = this.add.container(posX, cardY);
            container.setSize(cardWidth, cardHeight);

            const color = cardColors[index % cardColors.length];

            // Bóng đổ
            const shadow = this.add.graphics();
            shadow.fillStyle(0x000000, 0.4);
            shadow.fillRoundedRect(-cardWidth / 2 + 4, -cardHeight / 2 + 6, cardWidth, cardHeight, 18);
            container.add(shadow);

            // Nền thẻ bài
            const cardBg = this.add.graphics();
            this.drawCardBackground(cardBg, cardWidth, cardHeight, color, false);
            container.add(cardBg);

            // Chữ cái hoặc số (chữ cực to, đậm)
            const text = this.add.text(0, 0, item.value, {
                fontFamily: 'Segoe UI, Arial, sans-serif',
                fontSize: item.value.length > 2 ? '34px' : '44px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#0f172a',
                strokeThickness: 3
            }).setOrigin(0.5);
            container.add(text);

            container.setInteractive({ draggable: true, useHandCursor: true });

            const cardObj = {
                id: item.id,
                value: item.value,
                container,
                cardBg,
                shadow,
                text,
                color,
                startX: posX,
                startY: cardY,
                width: cardWidth,
                height: cardHeight,
                locked: false
            };

            this.setupCardDragEvents(cardObj);
            this.cards.push(cardObj);
            this.questionGroup.add(container);
        });
    }

    drawCardBackground(gfx, w, h, color, isDragging) {
        gfx.clear();
        gfx.fillStyle(color, 1);
        gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 18);

        gfx.lineStyle(3, 0xffffff, isDragging ? 1 : 0.65);
        gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
    }

    setupCardDragEvents(card) {
        const { container } = card;

        container.on('pointerover', () => {
            if (card.locked || this.isLevelTransitioning) return;
            this.tweens.add({
                targets: container,
                scaleX: 1.06,
                scaleY: 1.06,
                duration: 100,
                ease: 'Quad.easeOut'
            });
        });

        container.on('pointerout', () => {
            if (card.locked || this.isLevelTransitioning) return;
            this.tweens.add({
                targets: container,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 100,
                ease: 'Quad.easeOut'
            });
        });

        container.on('dragstart', () => {
            if (card.locked || this.isLevelTransitioning) return;
            soundManager.playPickup();

            // ĐỌC ÂM THANH CHỮ CÁI HOẶC SỐ KHI BÉ CHẠM VÀO KÉO
            if (this.currentQuestion.mode === 'word') {
                voiceSpeaker.speakLetter(card.value);
            } else {
                voiceSpeaker.speakNumber(card.value);
            }

            container.setDepth(1000);
            this.drawCardBackground(card.cardBg, card.width, card.height, card.color, true);

            this.tweens.add({
                targets: container,
                scaleX: 1.12,
                scaleY: 1.12,
                angle: randBetween(-4, 4),
                duration: 120,
                ease: 'Back.easeOut'
            });
        });

        container.on('drag', (pointer, dragX, dragY) => {
            if (card.locked || this.isLevelTransitioning) return;
            container.x = dragX;
            container.y = dragY;

            this.targets.forEach(target => {
                if (target.resolved) return;
                const dist = distanceBetween(container.x, container.y, target.x, target.y);
                const isHovered = dist < 75;
                this.drawTargetSlotGraphics(target.bgGfx, target.width, target.height, isHovered, false);
            });
        });

        container.on('dragend', () => {
            if (card.locked || this.isLevelTransitioning) return;
            this.drawCardBackground(card.cardBg, card.width, card.height, card.color, false);

            let matchedTarget = null;
            let minDist = 80;

            this.targets.forEach(target => {
                if (target.resolved) return;
                const dist = distanceBetween(container.x, container.y, target.x, target.y);
                if (dist < minDist) {
                    minDist = dist;
                    matchedTarget = target;
                }
            });

            if (matchedTarget) {
                if (card.value === matchedTarget.expected) {
                    this.handleCorrectDrop(card, matchedTarget);
                } else {
                    this.handleWrongDrop(card, matchedTarget);
                }
            } else {
                soundManager.playDrop();
                this.returnCardToHome(card);
            }

            this.targets.forEach(t => {
                if (!t.resolved) {
                    this.drawTargetSlotGraphics(t.bgGfx, t.width, t.height, false, false);
                }
            });
        });
    }

    handleCorrectDrop(card, target) {
        card.locked = true;
        target.resolved = true;
        card.container.disableInteractive();

        soundManager.playSuccess();

        // Ẩn chữ mờ gợi ý
        if (target.ghostHint) {
            target.ghostHint.setAlpha(0);
        }

        // Khóa thẻ vào ô đích
        this.tweens.add({
            targets: card.container,
            x: target.x,
            y: target.y,
            scaleX: 1.0,
            scaleY: 1.0,
            angle: 0,
            duration: 180,
            ease: 'Back.easeOut'
        });

        // Vẽ ô đích hoàn thành
        this.drawTargetSlotGraphics(target.bgGfx, target.width, target.height, false, true);
        target.labelText.setText('✔ Đúng rồi').setColor('#10b981');

        this.emitStarParticles(target.x, target.y);
        this.showFloatingNotice(target.x, target.y - 50, '+100 ĐIỂM 🎉', '#34d399');

        this.score += 100;
        this.streak += 1;
        this.scoreText.setText(`⭐ Điểm: ${this.score}`);
        this.streakText.setText(`🔥 ${this.streak}`);

        this.tweens.add({
            targets: [this.scoreText, this.streakText],
            scaleX: 1.25,
            scaleY: 1.25,
            duration: 120,
            yoyo: true,
            ease: 'Sine.easeOut'
        });

        // Kiểm tra xem đã hoàn thành câu hỏi chưa
        const allResolved = this.targets.every(t => t.resolved);
        if (allResolved) {
            this.handleQuestionComplete();
        }
    }

    handleWrongDrop(card, target) {
        soundManager.playError();
        voiceSpeaker.speakTryAgain();

        this.tweens.add({
            targets: card.container,
            x: card.container.x + 12,
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.returnCardToHome(card);
            }
        });

        this.showFloatingNotice(target.x, target.y - 50, 'Thử lại nhé bé! ❌', '#f87171');

        this.streak = 0;
        this.streakText.setText(`🔥 ${this.streak}`);
    }

    returnCardToHome(card) {
        card.container.setDepth(10);
        this.tweens.add({
            targets: card.container,
            x: card.startX,
            y: card.startY,
            scaleX: 1.0,
            scaleY: 1.0,
            angle: 0,
            duration: 280,
            ease: 'Quad.easeOut'
        });
    }

    emitStarParticles(x, y) {
        for (let i = 0; i < 14; i++) {
            const particle = this.add.image(x, y, 'star_particle');
            const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
            const speed = randBetween(70, 160);
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
                duration: randBetween(500, 800),
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    showFloatingNotice(x, y, text, color) {
        const notice = this.add.text(x, y, text, {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '22px',
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

        // PHÁT ÂM THANH ĐỌC TỪ HOÀN CHỈNH HOẶC KẾT QUẢ PHÉP TOÁN
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

        const { width, height } = this.scale;

        // Pháo hoa sao
        for (let i = 0; i < 3; i++) {
            this.time.delayedCall(i * 180, () => {
                const rx = randBetween(200, width - 200);
                const ry = randBetween(250, 420);
                this.emitStarParticles(rx, ry);
            });
        }

        // Biểu ngữ chúc mừng (đặt ở phía trên cao để KHÔNG che khuất phần kết quả bài làm của bé)
        const congratsBanner = this.add.container(width / 2, 190);
        congratsBanner.setDepth(1500);

        const bannerBg = this.add.graphics();
        bannerBg.fillStyle(0x0f172a, 0.95);
        bannerBg.fillRoundedRect(-240, -48, 480, 96, 22);
        bannerBg.lineStyle(3, 0xfacc15, 1);
        bannerBg.strokeRoundedRect(-240, -48, 480, 96, 22);
        congratsBanner.add(bannerBg);

        const bannerText = this.add.text(0, 0, '🌟 BÉ GIỎI LẮM! 🌟', {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '34px',
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

        // Chuyển câu hỏi tiếp theo sau 2.8 giây (đủ thời gian nghe trọn vẹn giọng đọc chuẩn)
        this.time.delayedCall(2800, () => {
            congratsBanner.destroy();

            if (this.questionIndex >= this.totalQuestions) {
                this.scene.start('GameOver', {
                    score: this.score,
                    totalQuestions: this.totalQuestions,
                    mode: this.mode,
                    gameplayType: 'drag'
                });
            } else {
                this.questionIndex += 1;
                this.loadNextQuestion();
            }
        });
    }

    createBackgroundDecorations(width, height) {
        for (let i = 0; i < 25; i++) {
            const x = randBetween(30, width - 30);
            const y = randBetween(30, height - 30);
            const radius = randBetween(2, 4);
            const dot = this.add.circle(x, y, radius, 0x38bdf8, randFloat(0.1, 0.3));

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
