import StartGame from './game/main';

document.addEventListener('DOMContentLoaded', () => {

    const game = StartGame('game-container');

    const rotatePrompt = document.getElementById('rotate-prompt');
    const closeBtn = document.getElementById('close-rotate-btn');
    const forceLandscapeBtn = document.getElementById('force-landscape-btn');
    const floatingRotateBtn = document.getElementById('landscape-toggle-floating');

    // Hàm yêu cầu Toàn Màn Hình & Xoay Ngang chuẩn của trình duyệt (đảm bảo cảm ứng 100% chuẩn)
    const requestFullscreenLandscape = async () => {
        try {
            // Yêu cầu Fullscreen trên toàn bộ trang
            const docEl = document.documentElement;
            if (docEl.requestFullscreen) {
                await docEl.requestFullscreen().catch(() => {});
            } else if (docEl.webkitRequestFullscreen) {
                await docEl.webkitRequestFullscreen().catch(() => {});
            }

            // Yêu cầu xoay ngang thiết bị
            if (screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock('landscape').catch(() => {});
            }
        } catch (err) {
            console.log('Fullscreen/Orientation request error:', err);
        }

        if (rotatePrompt) {
            rotatePrompt.classList.add('dismissed');
        }

        setTimeout(() => {
            if (game && game.scale) {
                game.scale.refresh();
            }
        }, 200);
    };

    if (forceLandscapeBtn) {
        forceLandscapeBtn.addEventListener('click', requestFullscreenLandscape);
    }

    if (floatingRotateBtn) {
        floatingRotateBtn.addEventListener('click', requestFullscreenLandscape);
    }

    if (closeBtn && rotatePrompt) {
        closeBtn.addEventListener('click', () => {
            rotatePrompt.classList.add('dismissed');
            setTimeout(() => {
                if (game && game.scale) {
                    game.scale.refresh();
                }
            }, 100);
        });
    }

    // Khi người dùng xoay điện thoại hoặc thoát toàn màn hình, cập nhật lại canvas
    window.addEventListener('resize', () => {
        if (game && game.scale) {
            game.scale.refresh();
        }
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            if (game && game.scale) {
                game.scale.refresh();
            }
        }, 200);
    });

});