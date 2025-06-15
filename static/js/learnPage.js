import { showModalWithCases } from "./canvasFunctions.js";
import { Popup } from "./popupClass.js";
import { deleteCase } from "./requests.js";
const canvasFront = document.getElementById('canvas-front');
const canvasBack = document.getElementById('canvas-back');

let ctxf = canvasFront.getContext('2d');
let ctxb = canvasBack.getContext('2d');

function getColorFromPercentage(coef) {
    let colorValue = (1 - coef) * 255;
    return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
}

function drawCell(ctx, x, y, w, h, color="black") {
    const lineWidthBefore = ctx.lineWidth,
          strokeStyleBefore = ctx.strokeStyle,
          fillStyleBefore = ctx.fillStyle;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.lineWidth = lineWidthBefore;
    ctx.strokeStyle = strokeStyleBefore;
    ctx.fillStyle = fillStyleBefore;
}

const numberItems = document.querySelectorAll('.number-item');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const closeModal = document.getElementById('closeModal');
const canvasContainer = document.querySelector(".canvas-container");
const createCaseBtn = document.getElementById("createModal");

const url = new URL(window.location.href);
const ai_name = url.pathname.split("/")[2];

window.ai_name = ai_name;

let createPopup = null;
let deletePopup = null;
let targetCanvas = null;

document.addEventListener('DOMContentLoaded', () => {
    numberItems.forEach(item => {
        item.addEventListener('click', () => {
            const number = item.getAttribute('data-number');
            window.selectedNumber = number;
            showModalWithCases(canvasContainer, modal, modalTitle, number);
            modal.classList.add('active');
        });
    });

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-canvas")) {
            targetCanvas = event.target.closest(".canvas-wrapper");

                if (!deletePopup) {
                    deletePopup = new Popup(
                        "deleteModal",
                        "confirm",
                        "Delete Canvas",
                        "Are you sure you want to delete this canvas?",
                        "Yes",
                        "No",
                        "",
                        () => {
                            deleteCase(
                                window.ai_name,
                                window.selectedNumber,
                                targetCanvas.querySelector('.canvas-case').getAttribute('data-index')
                            )
                            .then(response => {
                                if (!response.ok) {
                                    alert(`${response.status} : ${response.detail}`)
                                }
                                return response.json();
                            })
                            .then(data => {
                                if (data.status == 'success') {

                                    targetCanvas.parentNode.removeChild(targetCanvas);
                                    deletePopup.close();
                                    const spanToDecrement = document.querySelector('div[data-number="' + window.selectedNumber + '"]').querySelector("span");
                                    spanToDecrement.textContent = Number(spanToDecrement.textContent) - 1;

                                } else if (data.status == 'notExist') {
                        
                                    alert(data.message);
                        
                                } else {
                        
                                    alert('Unknown status:', data.status);
                        
                                }
                    
                            })
                            .catch(error => {
                                console.error('Error during the createCase: ', error);
                            });
                        }
                    );                    
                }
                deletePopup.open();
        }
    });
});
