import { getDataSet } from "./requests.js";
let deletedCanvasIds = JSON.parse(localStorage.getItem("deletedCanvasIds")) || [];


export function getColorFromPercentage(coef) {

    let colorValue = (1 - coef) * 255;
    
    return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
}

export function drawCell(ctx, x, y, w, h, color="black") {

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

export function createCanvas(addContainer, array, index = false, canvasWidth = 180) {
    const canvasWrapper = document.createElement("div");
    canvasWrapper.classList.add("canvas-wrapper");

    const canvasToAdd = document.createElement("canvas");
    canvasToAdd.classList.add("canvas-case");
    canvasToAdd.width = canvasWidth;
    canvasToAdd.height = canvasWidth;

    if (index !== false) {
        canvasToAdd.dataset.index = index;
    }

    const step = canvasWidth / 30;
    const ctx = canvasToAdd.getContext('2d');

    for (let i = 0; i < 30; i++) {
        for (let j = 0; j < 30; j++) {
            drawCell(ctx, j * step, i * step, step, step, getColorFromPercentage(array[i * 30 + j]));
        }
    }

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-canvas");
    deleteButton.textContent = "✖";

    canvasWrapper.addEventListener('click', (event) => {
        if (event.target === canvasWrapper || event.target === canvasToAdd) {
            const canvasId = canvasToAdd.dataset.index;
            if (deletedCanvasIds.includes(canvasId.toString())) {
                return;
            }
            showModalWithCases(canvasWrapper, modal, modalTitle, canvasId);
            modal.classList.add('active');
        }
    });

    canvasWrapper.appendChild(canvasToAdd);
    canvasWrapper.appendChild(deleteButton);
    addContainer.appendChild(canvasWrapper);
}


export function clear(canvas) {

    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

}

export function returnFullPicture(canvasFront, canvasBack) {

    let ctxf = canvasFront.getContext('2d');
    let ctxb = canvasBack.getContext('2d');

    clear(canvasBack);
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

    _draw = [];

    return arr;
}

export function showModalWithCases(canvasContainer, modal, modalTitle, number) {
    modal.style.userSelect = 'none';
    window.selectedNumber = number;

    modalTitle.textContent = `Case: ${number}`;
    modal.classList.add('active'); 

    canvasContainer.innerHTML = '';

    getDataSet(ai_name, number.toString())
    .then(response => {
        if (!response.ok) {
            alert(`${response.status} : ${response.detail}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.status == 'success') {
            for (let index in data.data) {
                const currentCase = data.data[index];
                if (!deletedCanvasIds.includes(currentCase.index.toString())) {
                    createCanvas(
                        canvasContainer, 
                        currentCase.picture, 
                        currentCase.index
                    );
                }
            }
        } else if (data.status == 'notExist') {
            alert(data.message);
        } else {
            alert('Unknown status:', data.status);
        }
    })
    .catch(error => {
        console.error('Error during the getDataSet: ', error);
    });
}



function isCanvasEmpty(canvas) {

    const context = canvas.getContext('2d');

    const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);

    return !pixelBuffer.some(color => color !== 0);

}


export function getInterpolatedColor(percent) {

    percent = Math.min(100, Math.max(1, percent));

    const startColor = { r: 255, g: 112, b: 67 };
    const endColor = { r: 153, g: 242, b: 200 }; 

    let r = Math.round(startColor.r + (endColor.r - startColor.r) * (percent / 100));
    let g = Math.round(startColor.g + (endColor.g - startColor.g) * (percent / 100));
    let b = Math.round(startColor.b + (endColor.b - startColor.b) * (percent / 100));

    return `rgb(${r}, ${g}, ${b})`;
}