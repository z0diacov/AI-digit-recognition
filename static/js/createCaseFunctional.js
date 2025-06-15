import { createCase } from "./requests.js";

const canvasFront = document.getElementById('canvas-front');
const canvasBack = document.getElementById('canvas-back');

let ctxf = canvasFront.getContext('2d');
let ctxb = canvasBack.getContext('2d');

const flipButton = document.getElementById('flip-button');

ctxf.lineWidth = (36 * 3) / 2;
ctxb.lineWidth = (36 * 3) / 2;

const step = canvasBack.height / 30;
const middleX = canvasFront.width / 2;
const middleY = canvasFront.height / 2;
const pixelsPerStepSquare = step ** 2;

let lineWidth = 0;
let data;
let canWrite = true;
let mousedown = false;
let readyAllow = false;
let _draw = [];

let drawData = [];

let maxX = -Infinity,
    minX = Infinity,
    maxY = -Infinity,
    minY = Infinity;

//----------------------------------------------------------------

const canvasContainer = document.querySelector('.canvas-modal-container');
const createCaseBtn = document.getElementById('add-test-case-btn');
const closeCanvasModal = document.getElementById('closeCanvasModal');

//----------------------------------------------------------------

function isCanvasEmpty(canvas) {

    const context = canvas.getContext('2d');

    const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);

    return !pixelBuffer.some(color => color !== 0);

}

flipButton.addEventListener('click', () => {
    canvasContainer.classList.toggle('flipped');
    flipButton.textContent = flipButton.textContent == "View digit" ? "To NN digit" : "View digit";
});

flipButton.onclick = () => {

    if (flipButton.textContent == "View digit") {

        clear(ctxb);
        ctxb.beginPath();

        let k = Math.min((canvasFront.width - ctxb.lineWidth) / (maxX - minX), (canvasFront.height - ctxb.lineWidth) / (maxY - minY));

        const deltaX = middleX - ((minX + maxX) * k / 2);
        const deltaY = middleY - ((minY + maxY) * k / 2);

    
        for (let i = 0; i < drawData.length; i++) {

            let data = drawData[i];
            if (data[0] == false && data[1] == false) {

                ctxb.beginPath();

            } else {

                data = data.map(elem => elem * k);
                
                ctxb.lineTo(data[0] + deltaX, data[1] + deltaY);
                ctxb.stroke();
                ctxb.beginPath();
                ctxb.arc(data[0] + deltaX, data[1] + deltaY, ctxf.lineWidth / 2, 0, Math.PI * 2);

                ctxb.fill();
                ctxb.beginPath();
                ctxb.lineTo(data[0] + deltaX, data[1] + deltaY);
            }
        }

        let arr = [];
        _draw = [];

        for (let x = 0; x < canvasBack.width; x += step) {

            for (let y = 0; y < canvasBack.height; y += step) {

                let pixelCount = 0;
                data = ctxb.getImageData(y, x, step, step);

                for (let i = 0; i < data.data.length; i++) {

                    if(data.data[i] !== 0) {

                        pixelCount++;

                    }

                }

                let percentage_pixel_count = pixelCount / pixelsPerStepSquare;
                percentage_pixel_count = Math.ceil((percentage_pixel_count) * 10) / 10;
                
                if (pixelCount > 0) {

                    _draw.push([y, x, step, step, getColorFromPercentage(percentage_pixel_count)]);

                }

                arr.push(percentage_pixel_count);

            }
        }

        for (let _d in _draw) {

            drawCell(ctxb, ..._draw[_d]);

        }

        drawGrid(ctxb);

        _draw = [];
    }

    readyAllow = true;
    canWrite = true;

}

createCaseBtn.onclick = () => {
    
    if (!isCanvasEmpty(canvasFront)) {

        clear(ctxb);
        ctxb.beginPath();

        let k = Math.min((canvasFront.width - ctxb.lineWidth) / (maxX - minX), (canvasFront.height - ctxb.lineWidth) / (maxY - minY));

        const deltaX = middleX - ((minX + maxX) * k / 2);
        const deltaY = middleY - ((minY + maxY) * k / 2);

    
        for (let i = 0; i < drawData.length; i++) {

            let data = drawData[i];
            if (data[0] == false && data[1] == false) {

                ctxb.beginPath();

            } else {

                data = data.map(elem => elem * k);
                
                ctxb.lineTo(data[0] + deltaX, data[1] + deltaY);
                ctxb.stroke();
                ctxb.beginPath();
                ctxb.arc(data[0] + deltaX, data[1] + deltaY, ctxf.lineWidth / 2, 0, Math.PI * 2);

                ctxb.fill();
                ctxb.beginPath();
                ctxb.lineTo(data[0] + deltaX, data[1] + deltaY);
            }
        }

        let picture = [];

        let _draw = [];

        for (let x = 0; x < canvasBack.width; x += step) {

            for (let y = 0; y < canvasBack.height; y += step) {

                let pixelCount = 0;
                data = ctxb.getImageData(y, x, step, step);

                for (let i = 0; i < data.data.length; i++) {

                    if(data.data[i] !== 0) {

                        pixelCount++;

                    }

                }

                let percentage_pixel_count = pixelCount / pixelsPerStepSquare;
                percentage_pixel_count = Math.ceil((percentage_pixel_count) * 10) / 10;
                
                if (pixelCount > 0) {

                    _draw.push([y, x, step, step, getColorFromPercentage(percentage_pixel_count)]);

                }

                picture.push(percentage_pixel_count);

            }
        }

        for (let _d in _draw) {

            drawCell(ctxb, ..._draw[_d]);

        }

        drawGrid(ctxb);

        _draw = [];
        drawData = [];

        createCase(
            window.ai_name, 
            window.selectedNumber.toString(), 
            picture
        )
        .then(response => {
            if (!response.ok) {
                alert(`${response.status} : ${response.detail}`)
            }
            return response.json();
        })
        .then(data => {

            if (data.status == 'success') {
            
                const spanToIncrement = document.querySelector(`div.number-item[data-number="${window.selectedNumber}"]`).querySelector("span");
                spanToIncrement.textContent = Number(spanToIncrement.textContent) + 1;
                console.log(document.querySelector(`div.number-item[data-number="${window.selectedNumber}"]`));

        } else if (data.status == 'notExist') {

            alert(data.message);

        } else {

            alert('Unknown status:', data.status);

        }

        })
        .catch(error => {
            console.error('Error during the createCase: ', error);
        });

        clear(ctxb);
        clear(ctxf);
    } else {

        alert("Canvas is empty!");

    }
    maxX = -Infinity,
    minX = Infinity,
    maxY = -Infinity,
    minY = Infinity;
};

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


function drawGrid(ctx) {

    let lineWidth = ctx.lineWidth;
    ctx.lineWidth = 1;

    for (let x = step; x < canvasFront.height; x += step) {

        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasFront.height);
        ctx.stroke();

    }

    for (let y = step; y < canvasFront.width; y += step) {

        ctx.moveTo(0, y);
        ctx.lineTo(canvasFront.width, y);
        ctx.stroke();

    }

    ctx.lineWidth = lineWidth;

}

function clear(ctx) {

    canWrite = true;
    ctx.clearRect(0, 0, canvasFront.width, canvasFront.height);

}


document.getElementById('clear').onclick = () => {

    clear(ctxf);
    clear(ctxb);
    drawGrid(ctxb);
    
    if (canvasContainer.classList.contains('flipped')) {

        canvasContainer.classList.remove('flipped');
        flipButton.textContent = flipButton.textContent == "View digit" ? "To NN digit" : "View digit";
    }

    readyAllow = false;
    drawData = [];
    maxX = -Infinity;
    minX = Infinity;
    maxY = -Infinity;
    minY = Infinity;
}

canvasFront.addEventListener('mousedown', () => {
    mousedown = true;
    ctxf.beginPath();
});

canvasFront.addEventListener('mouseout', () => {
    mousedown = false;
    drawData.push([false, false]);
    ctxf.beginPath();
});

canvasFront.addEventListener('mouseup', (e) => {
    mousedown = false;
    drawData.push([false, false]);
    ctxf.beginPath();
});

canvasFront.addEventListener('mousemove', (e) => {

    if (mousedown) {

        if (canWrite) {

            ctxf.lineTo(e.offsetX, e.offsetY);
            ctxf.stroke();
            ctxf.beginPath();
            ctxf.arc(e.offsetX, e.offsetY, ctxf.lineWidth / 2, 0, Math.PI * 2);

            drawData.push([e.offsetX, e.offsetY]);

            ctxf.fill();
            ctxf.beginPath();
            ctxf.lineTo(e.offsetX, e.offsetY);
            readyAllow = true;

            if (maxX < e.offsetX) {
                maxX = e.offsetX;
            }
        
            if (maxY < e.offsetY) {
                maxY = e.offsetY;
            }
        
            if(minX > e.offsetX) {
                minX = e.offsetX;
            }
        
            if(minY > e.offsetY) {
                minY = e.offsetY;
            }

        }
    }
});

closeCanvasModal.addEventListener('click', () => {
    drawData = []; //отчистка данных рисования так как мы закрыли окно

    maxX = -Infinity;
    minX = Infinity;
    maxY = -Infinity;
    minY = Infinity;
    
})