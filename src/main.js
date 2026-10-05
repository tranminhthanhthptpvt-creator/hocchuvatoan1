import StartGame from './game/main';

document.addEventListener('DOMContentLoaded', () => {

    StartGame('game-container');

    const rotatePrompt = document.getElementById('rotate-prompt');
    const closeBtn = document.getElementById('close-rotate-btn');
    if (closeBtn && rotatePrompt) {
        closeBtn.addEventListener('click', () => {
            rotatePrompt.classList.add('dismissed');
        });
    }

});