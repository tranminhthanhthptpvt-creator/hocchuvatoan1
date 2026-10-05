import StartGame from './game/main';

document.addEventListener('DOMContentLoaded', () => {

    const game = StartGame('game-container');

    const rotatePrompt = document.getElementById('rotate-prompt');
    const closeBtn = document.getElementById('close-rotate-btn');
    const forceLandscapeBtn = document.getElementById('force-landscape-btn');
    const floatingRotateBtn = document.getElementById('landscape-toggle-floating');

    // Hàm kích hoạt xoay ngang (Fullscreen + Screen Orientation Lock + CSS Fallback)
    const enableLandscapeMode = async () => {
        try {
            // 1. Yêu cầu toàn màn hình (Fullscreen)
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen().catch(() => {});
            }

            // 2. Thử khóa hướng màn hình sang ngang bằng Screen Orientation API
            if (screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock('landscape').catch(() => {});
            }
        } catch (e) {
            console.log('Orientation lock not supported by browser, falling back to CSS transform');
        }

        // 3. Nếu màn hình vẫn đang ở chiều dọc (do người dùng khóa xoay dọc trên điện thoại)
        // Áp dụng CSS transform xoay 90 độ ép buộc nằm ngang toàn màn hình
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isPortrait) {
            document.body.classList.toggle('force-landscape');
        } else {
            document.body.classList.remove('force-landscape');
        }

        if (rotatePrompt) {
            rotatePrompt.classList.add('dismissed');
        }

        // Kích hoạt Phaser tính toán lại kích thước
        setTimeout(() => {
            if (game && game.scale) {
                game.scale.refresh();
            }
        }, 300);
    };

    if (forceLandscapeBtn) {
        forceLandscapeBtn.addEventListener('click', enableLandscapeMode);
    }

    if (floatingRotateBtn) {
        floatingRotateBtn.addEventListener('click', () => {
            document.body.classList.toggle('force-landscape');
            setTimeout(() => {
                if (game && game.scale) {
                    game.scale.refresh();
                }
            }, 300);
        });
    }

    if (closeBtn && rotatePrompt) {
        closeBtn.addEventListener('click', () => {
            rotatePrompt.classList.add('dismissed');
        });
    }

    // Tự động hủy CSS xoay giả khi người dùng thực sự nghiêng điện thoại nằm ngang
    window.addEventListener('resize', () => {
        if (window.innerWidth > window.innerHeight) {
            document.body.classList.remove('force-landscape');
            if (game && game.scale) {
                game.scale.refresh();
            }
        }
    });

});