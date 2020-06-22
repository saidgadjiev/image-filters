const fs = require("fs");
const {createCanvas, loadImage} = require('canvas');

const inFile = process.argv[2];
const outFile = process.argv[3];
console.log('In file ' + inFile + ' out file ' + outFile);

const decel = (x) => 1 - (x - 1) * (x - 1);

loadImage(inFile).then(function (img) {
    const HEIGHT = 750;

    const imageWidth = Math.floor(img.width * HEIGHT / img.height);
    const imageHeight = HEIGHT;

    const sourceCanvas = createCanvas(imageWidth, imageHeight);
    const resultCanvas = createCanvas(imageWidth, imageHeight);
    const sourceCtx = sourceCanvas.getContext('2d');
    const resultCtx = resultCanvas.getContext('2d');

    sourceCtx.drawImage(img, 0, 0, imageWidth, imageHeight);

    const imgd = sourceCtx.getImageData(0, 0, imageWidth, imageHeight);
    const pix = imgd.data;
    const n = pix.length;

    for (let i = 0; i < n; i += 4) {
        const grayscale = pix[i + 3] === 0 ? 255 : pix[i] * .3 + pix[i + 1] * .59 + pix[i + 2] * .11;
        pix[i] = grayscale;
        pix[i + 1] = grayscale;
        pix[i + 2] = grayscale;
        pix[i + 3] = 255
    }

    for (let y = 0; y < 50; ++y) {
        resultCtx.beginPath();
        resultCtx.lineWidth = 2;
        resultCtx.lineJoin = 'round';

        let l = 0;

        for (let x = 0; x < imageWidth; ++x) {
            const c = pix[((y * imageHeight / 50 + 6) * imageWidth + x) * 4];

            l += (255 - c) / 255;

            const m = (255 - c) / 255;

            resultCtx.lineTo(
                x,
                (y + 0.5) * imageHeight / 50 + Math.sin(l * Math.PI / 2) * 5 * decel(m)
            )
        }
        resultCtx.stroke()
    }

    const resultBuffer = resultCanvas.toBuffer();
    fs.writeFileSync(outFile, resultBuffer);
}).catch(function (e) {
    console.log(e);
});
