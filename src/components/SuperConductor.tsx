import React from "react";
import dynamic from "next/dynamic";
import p5Types from "p5";

const Sketch = dynamic(
    () => {
        return import("react-p5");
    },
    { ssr: false }
);

export const SuperConductor = (): JSX.Element => {
    let slider;
    let xCanvas = 600;
    let yCanvas = 600;

    const xSize = 25;
    const ySize = 25;
    const N = xSize * ySize;

    // Populating the arrays
    // setup x and y arrays
    const xArr = new Array(N);
    const yArr = new Array(N);
    // init x and y position of nth item
    for (let i = 0; i < N; i++) {
        xArr[i] = i % xSize;
        yArr[i] = (i - (i % xSize)) / xSize;
    }

    // setup theta array with random values
    const thetaArr = new Array(N);
    for (let i = 0; i < N; i++) {
        const r = 2 * Math.PI * Math.random();
        thetaArr[i] = r;
    }

    // setup array to hold relative energies of rotors
    const colorArr = new Array(N);
    colorArr.fill(0);

    // init 2d array of nearest neighbours
    const nnArr = new Array(N);

    for (let i = 0; i < N; i++) {
        // init array for 4 neighbours
        nnArr[i] = new Array(4);

        // determine n of right neighbour
        if (xArr[i] != xSize - 1) {
            nnArr[i][0] = i + 1;
        } else {
            nnArr[i][0] = i + 1 - xSize;
        }
        // determine n of up neighbour
        if (yArr[i] != ySize - 1) {
            nnArr[i][1] = i + xSize;
        } else {
            nnArr[i][1] = i + xSize - N;
        }

        // determine n of the left neighbour
        if (xArr[i] != 0) {
            nnArr[i][2] = i - 1;
        } else {
            nnArr[i][2] = i - 1 + xSize;
        }

        // determine th n of the right neighbour
        if (yArr[i] != 0) {
            nnArr[i][3] = i - xSize;
        } else {
            nnArr[i][3] = i - xSize + N;
        }
    }

    /**
     * Monte Carlo step algorithm.
     *
     * @param {p5Types} p5
     * @param {number} temp
     */
    const mcStep = (p5: p5Types, temp: number) => {
        for (let i = 0; i < N; i++) {
            // make N random changes
            const s = Math.floor(Math.random() * N);
            const thetaOld = thetaArr[s];
            const thetaNew = thetaOld + (Math.random() - 0.5);

            // determine wether to accept change
            let eDiff = 0;
            for (let j = 0; j < 4; j++) {
                const nnSite = nnArr[s][j];
                const cosOld = Math.cos(thetaOld - thetaArr[nnSite]);
                const cosNew = Math.cos(thetaNew - thetaArr[nnSite]);
                eDiff = eDiff - (cosNew - cosOld);
            }

            // if criteria fulfilled accept change
            if (eDiff <= 0 || Math.random() < Math.exp((-eDiff * 5) / temp)) {
                thetaArr[s] = thetaNew;
                colorArr[s] = Math.abs(eDiff) * 200; // update color for relative energy
            }
        }

        // draw all arrows and determine color
        for (let i = 0; i < N; i++) {
            const xPos = xArr[i] * (xCanvas / xSize) * 0.95 + xCanvas * 0.05;
            const yPos = yArr[i] * (yCanvas / ySize) * 0.95 + yCanvas * 0.05;
            const length = Math.min(xCanvas, yCanvas) / Math.min(xSize, ySize) / 2.5;
            const color = `rgb(${Math.floor(colorArr[i])}, 0, 0)`;
            drawArrowCentered(p5, xPos, yPos, length, thetaArr[i], color);
        }
    };

    function drawArrowCentered(p5, x, y, length, theta, color) {
        // setup drawing environment
        p5.push();
        p5.stroke(color);
        p5.strokeWeight(2);
        p5.fill(color);

        // create line
        p5.line(
            x - (length * Math.cos(theta)) / 2,
            y - (length * Math.sin(theta)) / 2,
            x + (length * Math.cos(theta)) / 2,
            y + (length * Math.sin(theta)) / 2
        );

        // create triangle
        const arrowSize = 6;
        p5.translate(x, y);
        p5.translate((length * Math.cos(theta)) / 2, (length * Math.sin(theta)) / 2);
        p5.rotate(theta);
        p5.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);

        // return original drawing status
        p5.pop();
    }

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        const top = canvasParentRef.getBoundingClientRect().top;
        const left = canvasParentRef.getBoundingClientRect().left;
        xCanvas = canvasParentRef.getBoundingClientRect().width;
        yCanvas = xCanvas;
        p5.createCanvas(xCanvas, yCanvas).parent(canvasParentRef);
        slider = p5.createSlider(0, 10, 5, 0.00001);
        slider.position(left, top);
        p5.textSize(20);
    };

    const draw = (p5: p5Types) => {
        p5.background(100);
        p5.fill(255);
        const temp = slider.value();
        p5.text(`Temp: ${temp} K`, 150, 17);
        mcStep(p5, temp);
    };

    return <Sketch setup={setup} draw={draw} />;
};

export default SuperConductor;
