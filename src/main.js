import StartGame from './game/main';

document.addEventListener('DOMContentLoaded', () => {

    const game = StartGame('game-container');

    // Tự động canh chỉnh canvas vừa khít màn hình khi thay đổi kích thước
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