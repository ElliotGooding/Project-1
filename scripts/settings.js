//Sets initial conditions

const mySlider = document.getElementById('mySlider');

let pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; };
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; };

const cam = new Camera(120, 0.000001, 500, 640, 10);
document.addEventListener('mousedown', (e) => cam.onMouseDown(e));
document.addEventListener('mouseup',   ( ) => cam.onMouseUp());
document.addEventListener('mousemove', (e) => cam.onMouseMove(e));
document.addEventListener('wheel',     (e) => cam.onWheel(e));
mySlider.addEventListener('input',     (e) => cam.changeFOV(e.target.value));

let debugCube;

//Creating maths and clipper objects
const m = new DegreeMaths();
const clipperNP = new ClipperNearPlane();
const clipperR = new ClipperRightPlane();
const clipperL = new ClipperLeftPlane();
const rasteriser = new Rasteriser(["Plane_diffuse.png"]);