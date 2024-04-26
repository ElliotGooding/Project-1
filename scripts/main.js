let sceneObjects;

async function start(){
    sceneObjects = await buildScene()
    requestAnimationFrame(refreshCycle);
}

function refreshCycle(){
    drawFrame();
    requestAnimationFrame(refreshCycle);
}

function drawFrame(){
    graphicsPipeline()
}

start();