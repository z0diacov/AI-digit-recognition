import { Graph } from "./learnGraph.js";
import { learnCheck } from "./requests.js";
import { getInterpolatedColor } from "./canvasFunctions.js";

const urlParts = window.location.href.split("/");
const aiName = urlParts[urlParts.indexOf("AI") + 1];

const statusSpan = document.getElementById("status");
const progressSpan = document.getElementById("progress");
const graphContainer = document.getElementById('graph');

document.getElementById('send').onclick = function() {

    learnCheck(aiName)
    .then(response => {
        if (!response.ok) {
            alert(`Error in learnCheck: status ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'accepted') {
            statusSpan.textContent = 'preparing';
            statusSpan.style.color = '#FFC04D';
            progressSpan.textContent = '';

            let sum = 0;
            const per = 100;

            const iterations = Number(document.getElementById('iterations').value);
            const LR = Number(document.getElementById('learningRate').value);

            const amountOfOnePersent = Math.floor(iterations / per);

            // websocket
            const ws = new WebSocket(`ws://127.0.0.1:8000/${data.name}/learning`);

            const canvas = graphContainer.querySelector('canvas');

            if (canvas) {
                graphContainer.removeChild(canvas);
            }

            const graph = new Graph({
                width: 1500, 
                height: 1000,
                limits: {
                    x: iterations,
                    y: 3
                },
                pointRadius: 4,
                pointColor: 'red'
            });
            
            graph.drawAxes();
            graph.appendIn(graphContainer);

            ws.onopen = function(event) {
                ws.send(JSON.stringify({
                    iterations: iterations,
                    learning_rate: LR
                }));
            };

            ws.onmessage = async function(event) {
                let message = JSON.parse(await event.data);

                statusSpan.textContent = 'learning';
                statusSpan.style.color = '#ff7043';

                if (message.type === 'learned') {
                    ws.close(1000, 'learning ends');

                    statusSpan.textContent = 'ready';
                    statusSpan.style.color = '#99f2c8';

                    progressSpan.textContent = `100%`;
                    progressSpan.style.color = '#99f2c8';
                }

                if (message.x % amountOfOnePersent == 0) {
                    graph.pointLineWithFill(message.x, message.x === 0 ? message.y: sum / amountOfOnePersent);
                    let progress = Math.floor(message.x / amountOfOnePersent);
                    
                    progressSpan.textContent = `${progress}%`;
                    progressSpan.style.color = getInterpolatedColor(progress);
                    sum = 0;
                } else {
                    sum += message.y;
                }
            };

            window.addEventListener("beforeunload", () => {
                console.log("Page is unloading");
                ws.close(1001, "Page is unloading");

            });

        } else if (data.status === 'notExist') {
            alert(data.message);
        } else if (data.status === 'denied') {
            alert(data.message);
        } else {
            alert(`Unknown status : ${data.status}`);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
};

