let x, y, pointX, pointY, theta;

const svg = document.getElementById('s');
const radius = 25;

let start: number | undefined;

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

function hexPoints(x: number, y: number, radius: number) {
    let points = [];
    for (let theta = 0; theta < Math.PI * 2; theta += Math.PI / 3) {
        let pointX, pointY;

        pointX = x + radius * Math.sin(theta);
        pointY = y + radius * Math.cos(theta);

        points.push(pointX + ',' + pointY);
    }

    return points.join(' ');
}

function renderSvg(svg: HTMLElement | null) {

    if (svg) {
        svg.innerHTML = '';
        const maxCol = (svg.clientWidth / radius);
        const maxRow = (svg.clientHeight / radius);

        for (let col = 0; col < maxCol; col++) {
            for (let row = 0; row < maxRow; row++) {
                const redColorValue = getRandomInt(150) + 106;
                const greenColorValue = getRandomInt(10);
                const blueColorValue = getRandomInt(50);
                const fill = `rgb(${redColorValue}, ${greenColorValue}, ${redColorValue} `;// new Array(6).fill(colorValue, 0, 6).join('');
                var offset = (Math.sqrt(3) * radius) / 2;
                x = 40 + offset * col * 2;
                y = 40 + offset * row * Math.sqrt(3);

                if (row % 2 !== 0) x += offset;

                var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                polygon.style.fill = fill;
                polygon.style.stroke = 'black';
                polygon.style.strokeWidth = '4px';
                polygon.setAttribute('points', hexPoints(x, y, radius));

                if (svg !== null) {
                    svg.appendChild(polygon);
                }
            }
        }
    }
}

function step(timestamp: number) {
    if (start === undefined)
        start = timestamp;
    const elapsed = timestamp - start;

    if (elapsed > 750) {
        start = timestamp;
        renderSvg(svg);
    }
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);