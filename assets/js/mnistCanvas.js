async function runModel(canvas) {
  // Load a static MNIST model from Amazon S3.
  const model = await tf.loadLayersModel('https://danielhallinan-mnist.s3.us-east-2.amazonaws.com/mnist-model/model.json');

  // Convert the canvas into a one dimensional image that tensorflow can read.
  const image = tf.browser.fromPixels(canvas).mean(2).toFloat().expandDims(-1);

  // Reshape the image to an array size that is needed as input to the model.
  const resizedImage = tf.image.resizeBilinear(image, [28,28]).reshape([1,28,28]);

  // Make a prediction.
  const prediction = model.predict(resizedImage);

  // The prediction returns an array of size 10, each showing the likelyhood of which digit was predicted. Run Argmax to return the max.
  const answer = tf.argMax(prediction, 1).dataSync()[0];

  result = document.getElementById('canvasDigitResult');
  result.innerText = '';
  result.innerText = "Prediction: " + answer;
  result.style.fontWeight = 'bold';
}

function draw(e) {
  // Left mouse button must be pressed
  if (e.buttons !== 1) return;

  ctx.beginPath(); // begin
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#FFFFFF';

  ctx.moveTo(pos.x, pos.y); // from
  setPosition(e);
  ctx.lineTo(pos.x, pos.y); // to
  ctx.stroke(); // draw
}

function setPosition(e) {
  pos.x = e.offsetX;
  pos.y = e.offsetY;
}

function canvasToImg(canvas) {
  const answer = runModel(canvas);
  console.log(answer);
}

function clearCanvas(ctx, canvas) {
  clearBtn = document.getElementById('clearBtn');
  clearBtn.addEventListener('click', function(e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  });
}

function submitCanvas(canvas) {
  submitBtn = document.getElementById('submitBtn');
  submitBtn.addEventListener('click', function (e) {
    // canvasToImg(canvas);
    runModel(canvas);
  });
}

const canvas = document.getElementById('mnistCanvas');
const ctx = canvas.getContext('2d');
const pos = {x: 0, y: 0};

document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mouseenter', setPosition);

clearCanvas(ctx, canvas);
submitCanvas(canvas);
