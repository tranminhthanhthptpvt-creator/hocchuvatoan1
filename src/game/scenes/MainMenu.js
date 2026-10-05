import { Scene } from 'phaser';
import { soundManager } from '../utils/SoundManager';
import { voiceSpeaker } from '../utils/VoiceSpeaker';

export class MainMenu extends Scene {
    constructor () {
        super('MainMenu');
    }

    create () {
        const { width, height } = this.scale;

        // Mặc định hình thức chơi: 'drag' (Kéo Thả) hoặc 'reflex' (Bắt Bóng Phản Xạ)
        this.selectedGameplayType = 'drag';

        // Nền màu tím than xanh ấm áp
        const bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x1e1b4b, 0x1e1b4b, 0x0f172a, 0x0f172a, 1);
        bgGraphics.fillRect(0, 0, width, height);

        this.createFloatingBubbles(width, height);

        // Banner Tiêu đề chính
        const titleBanner = this.add.container(width / 2, 58);

        const titleBg = this.add.graphics();
        titleBg.fillStyle(0xffffff, 0.12);
        titleBg.fillRoundedRect(-400, -36, 800, 72, 18);
        titleBg.lineStyle(2.5, 0xfacc15, 0.9);
        titleBg.strokeRoundedRect(-400, -36, 800, 72, 18);
        titleBanner.add(titleBg);

        const titleText = this.add.text(0, -12, '🎒 BÉ VUI HỌC CHỮ & TOÁN 🎒', {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '26px',
            fontStyle: 'bold',
            color: '#fef08a',
            stroke: '#0f172a',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);
        titleBanner.add(titleText);

        const subTitleText = this.add.text(0, 16, 'Dành Cho Bé 4 - 6 Tuổi • Phát Âm Tiếng Việt Chuẩn', {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '15px',
            fontStyle: 'bold',
            color: '#38bdf8',
            align: 'center'
        }).setOrigin(0.5);
        titleBanner.add(subTitleText);

        // Nút chuyển đổi HÌNH THỨC CHƠI (Tab Switcher)
        this.createGameplayTypeSelector(width / 2, 126);

        // 5 Nút Lộ trình học tập từng bước cho bé
        const startY = 196;
        const spacing = 86;

        this.createModeButton(
            width / 2,
            startY,
            '🔤  BƯỚC 1: BÉ TÌM CHỮ CÁI ĐƠN GIẢN (A, B, C...)',
            'Đơn giản nhất: Nhận biết mặt chữ cái & hình ảnh bắt đầu (A-Táo, B-Bò, C-Cá...)',
            0x0284c7,
            0x38bdf8,
            () => this.startGame('single_letter')
        );

        this.createModeButton(
            width / 2,
            startY + spacing,
            '📝  BƯỚC 2: BÉ GHÉP TỪ 2 CHỮ CÁI (MẸ, BA, BÉ, CÁ...)',
            'Ghép từ 2 chữ cái có dấu quen thuộc kèm hình ảnh & giọng đánh vần chuẩn',
            0x059669,
            0x34d399,
            () => this.startGame('word')
        );

        this.createModeButton(
            width / 2,
            startY + spacing * 2,
            '🔢  BƯỚC 3: BÉ LÀM QUEN CHỮ SỐ (1 ĐẾN 50)',
            'Nhận diện mặt số, nghe phát âm & điền số trong dãy 1 - 50',
            0xd97706,
            0xfbbf24,
            () => this.startGame('number')
        );

        this.createModeButton(
            width / 2,
            startY + spacing * 3,
            '🍎  BƯỚC 4: BÉ LÀM TOÁN CỘNG TRỪ (TRONG PHẠM VI 10)',
            'Đếm hoa quả, ngôi sao trực quan & tìm kết quả đúng',
            0x7c3aed,
            0xc084fc,
            () => this.startGame('math')
        );

        this.createModeButton(
            width / 2,
            startY + spacing * 4,
            '🌟  BƯỚC 5: THỬ THÁCH BÉ YÊU (TỔNG HỢP)',
            'Lộ trình toàn diện: từ tìm chữ, ghép từ đến con số & phép tính',
            0xdb2777,
            0xf472b6,
            () => this.startGame('mixed')
        );

        // Hướng dẫn ở chân trang
        this.footerText = this.add.text(width / 2, height - 32, '💡 Hình thức Kéo Thả: Bấm giữ và kéo thẻ chữ/số thả vào ô thích hợp', {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '15px',
            color: '#cbd5e1',
            align: 'center'
        }).setOrigin(0.5);

        // Nút bật/tắt âm thanh
        this.createMuteButton(width - 55, 45);

        // Phát lời chào khi tương tác lần đầu
        this.input.once('pointerdown', () => {
            voiceSpeaker.speakWelcome();
        });
    }

    createGameplayTypeSelector(x, y) {
        const tabW = 340;
        const tabH = 54;
        const gap = 24;

        // Container Tab 1: Kéo thả
        this.dragTab = this.add.container(x - tabW / 2 - gap / 2, y);
        this.dragTab.setSize(tabW, tabH);
        this.dragTabBg = this.add.graphics();
        this.dragTab.add(this.dragTabBg);

        this.dragTabTxt = this.add.text(0, 0, '🖐️  KÉO THẢ THÔNG THÁI', {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.dragTab.add(this.dragTabTxt);

        // Container Tab 2: Bắt bóng phản xạ
        this.reflexTab = this.add.container(x + tabW / 2 + gap / 2, y);
        this.reflexTab.setSize(tabW, tabH);
        this.reflexTabBg = this.add.graphics();
        this.reflexTab.add(this.reflexTabBg);

        this.reflexTabTxt = this.add.text(0, 0, '🎈  BẮT BÓNG PHẢN XẠ', {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.reflexTab.add(this.reflexTabTxt);

        this.updateTabStyles();

        this.dragTab.setInteractive({ useHandCursor: true });
        this.dragTab.on('pointerdown', () => {
            if (this.selectedGameplayType !== 'drag') {
                this.selectedGameplayType = 'drag';
                soundManager.playClick();
                this.updateTabStyles();
                this.footerText.setText('💡 Hình thức Kéo Thả: Bấm giữ và kéo thẻ chữ/số thả vào ô thích hợp');
            }
        });

        this.reflexTab.setInteractive({ useHandCursor: true });
        this.reflexTab.on('pointerdown', () => {
            if (this.selectedGameplayType !== 'reflex') {
                this.selectedGameplayType = 'reflex';
                soundManager.playClick();
                this.updateTabStyles();
                this.footerText.setText('🎈 Hình thức Bắt Bóng: Quan sát nhanh và bấm vào bong bóng bay mang đáp án đúng!');
            }
        });
    }

    updateTabStyles() {
        const tabW = 340;
        const tabH = 54;

        // Vẽ Tab Kéo Thả
        this.dragTabBg.clear();
        if (this.selectedGameplayType === 'drag') {
            this.dragTabBg.fillStyle(0x0284c7, 1);
            this.dragTabBg.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 16);
            this.dragTabBg.lineStyle(3, 0xfacc15, 1);
            this.dragTabBg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 16);
            this.dragTabTxt.setColor('#fef08a');
        } else {
            this.dragTabBg.fillStyle(0x1e293b, 0.7);
            this.dragTabBg.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 16);
            this.dragTabBg.lineStyle(1.5, 0x475569, 0.8);
            this.dragTabBg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 16);
            this.dragTabTxt.setColor('#94a3b8');
        }

        // Vẽ Tab Bắt Bóng Phản Xạ
        this.reflexTabBg.clear();
        if (this.selectedGameplayType === 'reflex') {
            this.reflexTabBg.fillStyle(0xd97706, 1);
            this.reflexTabBg.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 16);
            this.reflexTabBg.lineStyle(3, 0xfacc15, 1);
            this.reflexTabBg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 16);
            this.reflexTabTxt.setColor('#fef08a');
        } else {
            this.reflexTabBg.fillStyle(0x1e293b, 0.7);
            this.reflexTabBg.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 16);
            this.reflexTabBg.lineStyle(1.5, 0x475569, 0.8);
            this.reflexTabBg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 16);
            this.reflexTabTxt.setColor('#94a3b8');
        }
    }

    createModeButton(x, y, title, desc, baseColor, hoverColor, onClick) {
        const btnContainer = this.add.container(x, y);
        const w = 760;
        const h = 82;

        btnContainer.setSize(w, h);

        const bg = this.add.graphics();
        const drawBg = (color, strokeCol) => {
            bg.clear();
            bg.fillStyle(color, 0.95);
            bg.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
            bg.lineStyle(2.5, strokeCol, 1);
            bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
        };
        drawBg(baseColor, 0xffffff);
        btnContainer.add(bg);

        const titleTxt = this.add.text(0, -14, title, {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '21px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        btnContainer.add(titleTxt);

        const descTxt = this.add.text(0, 16, desc, {
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '15px',
            color: '#e2e8f0'
        }).setOrigin(0.5);
        btnContainer.add(descTxt);

        btnContainer.setInteractive({ useHandCursor: true });

        btnContainer.on('pointerover', () => {
            drawBg(hoverColor, 0xffeb3b);
            this.tweens.add({
                targets: btnContainer,
                scaleX: 1.02,
                scaleY: 1.02,
                duration: 120,
                ease: 'Back.easeOut'
            });
            soundManager.playPickup();
        });

        btnContainer.on('pointerout', () => {
            drawBg(baseColor, 0xffffff);
            this.tweens.add({
                targets: btnContainer,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 120,
                ease: 'Quad.easeOut'
            });
        });

        btnContainer.on('pointerdown', () => {
            soundManager.playClick();
            this.tweens.add({
                targets: btnContainer,
                scaleX: 0.97,
                scaleY: 0.97,
                duration: 80,
                yoyo: true,
                onComplete: onClick
            });
        });
    }

    createMuteButton(x, y) {
        const muteContainer = this.add.container(x, y);
        muteContainer.setSize(50, 50);

        const bg = this.add.graphics();
        bg.fillStyle(0x334155, 0.85);
        bg.fillCircle(0, 0, 24);
        bg.lineStyle(2, 0x94a3b8, 0.9);
        bg.strokeCircle(0, 0, 24);
        muteContainer.add(bg);

        const iconText = this.add.text(0, 0, soundManager.isMuted ? '🔇' : '🔊', {
            fontSize: '22px'
        }).setOrigin(0.5);
        muteContainer.add(iconText);

        muteContainer.setInteractive({ useHandCursor: true });
        muteContainer.on('pointerdown', () => {
            const isMuted = soundManager.toggleMute();
            voiceSpeaker.setMuted(isMuted);
            iconText.setText(isMuted ? '🔇' : '🔊');
            soundManager.playClick();
        });
    }

    createFloatingBubbles(width, height) {
        const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        for (let i = 0; i < 20; i++) {
            const x = randBetween(40, width - 40);
            const y = randBetween(40, height - 40);
            const radius = randBetween(6, 24);
            const circle = this.add.circle(x, y, radius, 0x38bdf8, 0.12);

            this.tweens.add({
                targets: circle,
                y: y - randBetween(30, 80),
                alpha: 0.28,
                duration: randBetween(2500, 5000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    startGame(mode) {
        voiceSpeaker.stop();
        const targetScene = this.selectedGameplayType === 'reflex' ? 'ReflexGame' : 'Game';
        this.scene.start(targetScene, {
            mode,
            score: 0,
            questionIndex: 1,
            totalQuestions: 8,
            streak: 0,
            gameplayType: this.selectedGameplayType
        });
    }
}
