class Canvas {

    #width;
    #height;
    #canvas;
    #ctx;

    constructor(width, height, id, _class) {
        this.#width = width;
        this.#height = height;
        
        this.#canvas = document.createElement('canvas');
        this.#canvas.id = id;
        this.#canvas.classList.add(String(_class));
        
        this.#canvas.width = this.#width;
        this.#canvas.height = this.#height;
        
        this.#ctx = this.#canvas.getContext('2d');
    }

    _context() {
        return this.#ctx;
    }

    _size() {
        return { width: this.#width, height: this.#height };
    }

    appendIn(container) {
        container.appendChild(this.#canvas);
    }

    clear() {
        this.#ctx.clearRect(0, 0, this.#width, this.#height);
    }
}

export class Graph extends Canvas {

    #limits;
    #pointRadius;
    #pointColor;
    #prevX;
    #prevY;

    constructor({
        width, 
        height, 
        id='learn-graph', 
        _class='learn-graph', 
        limits,
        pointRadius = 4,
        pointColor = 'red'
    }) {
        super(width, height, id, _class);
        this.#limits = limits;
        this.#pointRadius = pointRadius;
        this.#pointColor = pointColor;
        this.#prevX = null;
        this.#prevY = null; 
    }

    drawAxes() {
        const ctx = this._context();
        const size = this._size();
        
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;

        ctx.moveTo(5, size.height - 5);
        ctx.lineTo(size.width - 5, size.height - 5);
        
        ctx.lineTo(size.width - 12, size.height - 10);
        ctx.moveTo(size.width - 5, size.height - 5);
        ctx.lineTo(size.width - 12, size.height);
        
        ctx.fillStyle = 'white';
        ctx.font = "17px Arial";
        ctx.fillText("Number of Iterations", size.width / 2, size.height - 40);
        
        ctx.moveTo(5, size.height - 5);
        ctx.lineTo(5, 5);
        
        ctx.lineTo(0, 12);
        ctx.moveTo(5, 5);
        ctx.lineTo(10, 12);
        
        ctx.fillText("Cross-Entropy Error", 80, 20);
        
        ctx.stroke();
        
        this.#drawGrid();
    }

    #drawGrid() {
        const ctx = this._context();
        const size = this._size();
        const stepsX = 10;
        const stepsY = 10;
        
        const stepX = (size.width - 20) / stepsX;
        const stepY = (size.height - 20) / stepsY;
        
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.font = "17px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        for (let i = 1; i <= stepsX; i++) {
            const x = i * stepX;
            ctx.beginPath();
            ctx.moveTo(x, size.height - 8);
            ctx.lineTo(x, size.height - 5);
            ctx.stroke();
            ctx.fillText((this.#limits.x / stepsX * i).toFixed(1), x, size.height - 25);
        }

        for (let i = 1; i <= stepsY; i++) {
            const y = size.height - i * stepY;
            ctx.beginPath();
            ctx.moveTo(5, y);
            ctx.lineTo(8, y);
            ctx.stroke();
            ctx.fillText((this.#limits.y / stepsY * i).toFixed(1), 25, y);
        }
    }
    point(x, y) {
        const ctx = this._context();
        const size = this._size();

        const realX = (x / this.#limits.x) * size.width + 5;
        const realY = size.height - (y / this.#limits.y) * size.height - 5;

        ctx.beginPath();
        ctx.arc(realX, realY, this.#pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.#pointColor;
        ctx.fill();
    }


    pointLineWithFill(x, y) {
        const ctx = this._context();
        const size = this._size();
    
        const realX = ((x / this.#limits.x) * size.width) + 5;
        const realY = (size.height - (y / this.#limits.y) * size.height) - 5;
    
        this.point(x, y);
    
        if (this.#prevX !== null && this.#prevY !== null) {
            const realPrevX = ((this.#prevX / this.#limits.x) * size.width) + 5;
            const realPrevY = (size.height - (this.#prevY / this.#limits.y) * size.height) - 5;
    
            ctx.beginPath();
            ctx.moveTo(realPrevX, realPrevY);
            ctx.lineTo(realX, realY);
            ctx.lineTo(realX, size.height - 5);
            ctx.lineTo(realPrevX, size.height - 5);
            ctx.closePath();
    
            if (this.#prevX !== this.#limits.x) { 
                ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
                ctx.fill();
            }
    
            ctx.beginPath();
            ctx.moveTo(realPrevX, realPrevY);
            ctx.lineTo(realX, realY);
            ctx.strokeStyle = this.#pointColor;
            ctx.lineWidth = this.#pointRadius - 1;
            ctx.stroke();
        }
    
        this.#prevX = x;
        this.#prevY = y;
    }
}