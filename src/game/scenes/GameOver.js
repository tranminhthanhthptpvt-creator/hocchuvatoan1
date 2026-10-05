import { Scene } from 'phaser';
import { soundManager } from '../utils/SoundManager';
import { voiceSpeaker } from '../utils/VoiceSpeaker';

const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export class GameOver extends Scene {
    constructor () {
        super('GameOver');
    }

    init (data) {
        this.score = data.score || 0;
        this.totalQuestions = data.totalQuestions || 8;
        this.mode = data.mode || 'word';
        this.gameplayType = data.gameplayType || 'drag';
    }

    create () {
        const { width, height } = this.scale;

        soundManager.playWin();

        // Nền màu tím than ấm áp
        const bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x1e1b4b, 0x1e1b4b, 0x0f172a, 0x0f172a, 1);
        bgGraphics.fillRect(0, 0, width, height);

        this.createCelebrationParticles(width, height);

        // Bảng kết quả
        const panelW = 660;
        const panelH = 520;
        const panelContainer = this.add.container(width / 2, height / 2 - 15);

        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x1e293b, 0.95);
        panelBg.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 24);
        panelBg.lineStyle(3, 0xfacc15, 1);
        panelBg.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 24);
        panelContainer.add(panelBg);

        // Biểu tượng Cúp vàng
        const trophy = this.add.text(0, -185, '🏆', {
            fontSize: '80px'
        }).setOrigin(0.5);
        panelContainer.add(trophy);

        this.tweens.add({
            targets: trophy,
            y: -195,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Tiêu đề
        const titleText = this.add.text(0, -100, 'HOAN HÔ BÉ ĐÃ HOÀN THÀNH!', {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#fef08a',
            stroke: '#0f172a',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);
        panelContainer.add(titleText);

        // Đánh giá sao
        let stars = '⭐⭐⭐';
        let compliment = '🌟 THIÊN TÀI NHÍ! Bé trả lời quá xuất sắc! 🌟';
        let voiceCompliment = 'Hoan hô bé! Bé học thật là xuất sắc!';

        if (this.score < 400) {
            stars = '⭐';
            compliment = '💪 Rất cố gắng! Bé hãy chơi lại để ghi thêm điểm nhé!';
            voiceCompliment = 'Bé rất cố gắng! Chúng mình cùng chơi lại nhé!';
        } else if (this.score < 700) {
            stars = '⭐⭐';
            compliment = '🎉 BÉ RẤT GIỎI! Cố thêm chút nữa là đạt điểm tối đa!';
            voiceCompliment = 'Bé giỏi quá! Bé trả lời rất nhiều câu đúng!';
        }

        const starsText = this.add.text(0, -45, stars, {
            fontSize: '48px'
        }).setOrigin(0.5);
        panelContainer.add(starsText);

        // Phát giọng khen ngợi
        this.time.delayedCall(500, () => {
            voiceSpeaker.speakFinish();
        });

        // Hộp điểm
        const scoreBox = this.add.graphics();
        scoreBox.fillStyle(0x0f172a, 0.85);
        scoreBox.fillRoundedRect(-240, -10, 480, 80, 16);
        panelContainer.add(scoreBox);

        const scoreInfo = this.add.text(0, 14, `⭐ TỔNG ĐIỂM: ${this.score}`, {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '30px',
            fontStyle: 'bold',
            color: '#facc15'
        }).setOrigin(0.5);
        panelContainer.add(scoreInfo);

        const countInfo = this.add.text(0, 46, `Bé đã hoàn thành xuất sắc ${this.totalQuestions}/${this.totalQuestions} câu hỏi`, {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '16px',
            color: '#94a3b8'
        }).setOrigin(0.5);
        panelContainer.add(countInfo);

        // Lời khen ngợi
        const complimentText = this.add.text(0, 105, compliment, {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#38bdf8',
            align: 'center'
        }).setOrigin(0.5);
        panelContainer.add(complimentText);

        // Hai nút tương tác lớn
        const btnY = 185;
        const targetScene = this.gameplayType === 'reflex' ? 'ReflexGame' : 'Game';
        this.createButton(panelContainer, -145, btnY, '🔄 Chơi Lại', 0x059669, 0x10b981, () => {
            voiceSpeaker.stop();
            soundManager.playClick();
            this.scene.start(targetScene, {
                mode: this.mode,
                score: 0,
                questionIndex: 1,
                totalQuestions: this.totalQuestions,
                streak: 0,
                gameplayType: this.gameplayType
            });
        });

        this.createButton(panelContainer, 145, btnY, '🏠 Menu Chính', 0x2563eb, 0x3b82f6, () => {
            voiceSpeaker.stop();
            soundManager.playClick();
            this.scene.start('MainMenu');
        });

        panelContainer.setScale(0.7);
        panelContainer.setAlpha(0);
        this.tweens.add({
            targets: panelContainer,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }

    createButton(container, x, y, label, baseColor, hoverColor, onClick) {
        const btn = this.add.container(x, y);
        const w = 240;
        const h = 64;
        btn.setSize(w, h);

        const bg = this.add.graphics();
        const drawBg = (color) => {
            bg.clear();
            bg.fillStyle(color, 1);
            bg.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
            bg.lineStyle(2.5, 0xffffff, 0.85);
            bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
        };
        drawBg(baseColor);
        btn.add(bg);

        const text = this.add.text(0, 0, label, {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        btn.add(text);

        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            drawBg(hoverColor);
            this.tweens.add({
                targets: btn,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 120
            });
            soundManager.playPickup();
        });

        btn.on('pointerout', () => {
            drawBg(baseColor);
            this.tweens.add({
                targets: btn,
                scaleX: 1,
                scaleY: 1,
                duration: 120
            });
        });

        btn.on('pointerdown', onClick);

        container.add(btn);
    }

    createCelebrationParticles(width, height) {
        const colors = [0xfacc15, 0x38bdf8, 0x4ade80, 0xf472b6, 0xa78bfa];

        for (let i = 0; i < 35; i++) {
            const x = randBetween(40, width - 40);
            const startY = randBetween(-50, height / 2);
            const color = colors[i % colors.length];
            const size = randBetween(5, 10);

            const rect = this.add.rectangle(x, startY, size, size, color);

            this.tweens.add({
                targets: rect,
                y: height + 20,
                x: x + randBetween(-40, 40),
                angle: 360,
                duration: randBetween(2500, 5000),
                repeat: -1,
                delay: randBetween(0, 2000),
                ease: 'Linear'
            });
        }
    }
}
