import StartGame from './game/main';

document.addEventListener('DOMContentLoaded', () => {

    const game = StartGame('game-container');

    // Đảm bảo canvas tính toán đúng tâm ngay sau khi load
    setTimeout(() => {
        if (game && game.scale) {
            game.scale.refresh();
        }
    }, 100);

    // Tự động canh chỉnh canvas vừa khít và chính giữa màn hình khi thay đổi kích thước
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
        }, 150);
    });

});