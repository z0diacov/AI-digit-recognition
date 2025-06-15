import { clear, showModalWithCases} from "./canvasFunctions.js";
document.addEventListener('DOMContentLoaded', () => {

    const canvasFront = document.getElementById('canvas-front');
    const canvasBack = document.getElementById('canvas-back');

    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModal = document.getElementById('closeModal');
    const canvasModal = document.getElementById('canvasModal');
    const closeCanvasModal = document.getElementById('closeCanvasModal');
    const createModalButton = document.getElementById('createModal');
    const canvasContainer = document.querySelector(".canvas-container");

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
        modal.style.userSelect = 'auto';
    });


    createModalButton.addEventListener('click', () => {
        modal.classList.remove('active');
        canvasModal.classList.add('active');
    });


    closeCanvasModal.addEventListener('click', () => {
        canvasModal.classList.remove('active');
        clear(canvasFront);
        clear(canvasBack);
        showModalWithCases(canvasContainer, modal, modalTitle, window.selectedNumber);
    });
});
