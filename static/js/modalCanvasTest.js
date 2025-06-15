document.addEventListener('DOMContentLoaded', () => {
    const canvasFront = document.getElementById('canvas-front');
    const canvasBack = document.getElementById('canvas-back');
    const flipButton = document.getElementById('flip-button');
    const readyButton = document.getElementById('ready');

    let ctxf = canvasFront.getContext('2d');
    let ctxb = canvasBack.getContext('2d');

    const middleX = canvasFront.width / 2;
    const middleY = canvasFront.height / 2;

    const canvasContainer = document.querySelector('.canvas-container');

    if (readyButton) {
        readyButton.addEventListener('click', () => {
            if (readyAllow) {
                let arr = [];
                _draw = [];

                for (let x = 0; x < canvasBack.width; x += step) {
                    for (let y = 0; y < canvasBack.height; y += step) {
                        let pixelCount = 0;
                        let data = ctxb.getImageData(y, x, step, step);

                        for (let i = 0; i < data.data.length; i++) {
                            if (data.data[i] !== 0) {
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

                console.log(_draw);

                for (let _d in _draw) {
                    drawCell(ctxb, ..._draw[_d]);
                }

                drawGrid(ctxb);

                readyAllow = false;
                canWrite = false;
            }
        });
    }

    flipButton.addEventListener('click', () => {
        if (flipButton.textContent === "View digit") {
            clear(ctxb);
            ctxb.beginPath();

            let k = Math.min((canvasFront.width - ctxb.lineWidth) / (maxX - minX), (canvasFront.height - ctxb.lineWidth) / (maxY - minY));
            console.log(k);

            const deltaX = middleX - ((minX + maxX) * k / 2);
            const deltaY = middleY - ((minY + maxY) * k / 2);

            for (let i = 0; i < drawData.length; i++) {
                let data = drawData[i];

                if (data[0] === false && data[1] === false) {
                    ctxb.beginPath();
                } else {
                    data = data.map(elem => elem * k);
                    data[0] += deltaX;
                    data[1] += deltaY;

                    ctxb.lineTo(data[0], data[1]);
                }
            }

            ctxb.stroke();
        }
    });
});
