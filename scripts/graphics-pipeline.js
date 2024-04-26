//Renders all scene objects
function graphicsPipeline(){
    cam.orbitalMove(); //Application stage
    // move();
    const projectedTriangles = geometryPipeline();
    rasterise(projectedTriangles);
}

//Calculates the position of all 2D Screen Space vertices
function geometryPipeline(){
    let triangles;
    triangles = reduceSceneObjects(sceneObjects);
    triangles = triangles.map( toRelative );
    triangles = clip(triangles);
    triangles = triangles.map( toNDC );
    return triangles;
}

function reduceSceneObjects(sceneObjects){
    triangles = []
    sceneObjects.forEach(shape=>{
        reducedTriangles = reduceToTriangles(shape)
        triangles.push(...reducedTriangles);
    });
    return triangles
}

//Handler for triangle transformations
function toRelative(triangle){
    const characterPosition = new Vertex3([cam.position.x,cam.position.y,cam.position.z]);
    // const vertices = triangle.vertexArr;
    const newVertices = triangle.vertexArr.map(vertex => transform(vertex, characterPosition));
    const relativeTriangle = new Triangle(newVertices, triangle.colour);
    return relativeTriangle;
}

//Returns transformed vertex with the player at the origin
function transform(vertex, characterPosition){
    //calculate coordinates relative to the player
    const transVertex = vertex.subtract(characterPosition);

    //Apply rotation matrix - YAW
    const yawMat = new Mat3([
        [m.cos(cam.yaw), 0, -m.sin(cam.yaw)],
        [       0,       1,        0       ],
        [m.sin(cam.yaw), 0,  m.cos(cam.yaw)]
    ])
    rotatedVertex = yawMat.multiply(transVertex);

    //Apply rotation matrix - PITCH
    const pitchMat = new Mat3([
        [1,        0,         0       ],
        [0, m.cos(cam.pitch), m.sin(cam.pitch)],
        [0, -m.sin(cam.pitch), m.cos(cam.pitch)]
    ])
    rotatedVertex = pitchMat.multiply(rotatedVertex);

    return new Vertex3(rotatedVertex.flatMat, vertex.id, vertex.textureVertices);
}

//Handler for triangle projection
function toNDC(triangle){
    const vertices = triangle.vertexArr;
    const newVertices = vertices.map(project);
    const projectedTriangle = new Triangle(newVertices, triangle.colour);
    return projectedTriangle;
}

//The projection algorithm
//Converts to NDC - (scale from -1 to 1 representing how far across the screen in each dimension a pixel is)
function project(vertex){
    const maxX = vertex.z * m.tan(cam.hFOV / 2);
    const maxY = vertex.z * m.tan(cam.vFOV / 2);
    const x = ((vertex.x ) / (maxX) );
    const y = ((vertex.y ) / (maxY) );
    const z = vertex.z/cam.farPlane;

    const NDCVertex = new Vertex2([x, y], z, vertex.textureVertices)
    return NDCVertex;
}

//Clips each triangle to the frustum
function clip(triangles){    
    triangles = clipperNP.clip(triangles); //Near plane
    // triangles = clipperR.clip(triangles);  //Right plane
    // triangles = clipperL.clip(triangles); //Left plane
    return triangles
}

// function rasterise(triangles){
//     rasteriser.gl.clear(rasteriser.gl.COLOR_BUFFER_BIT | rasteriser.gl.DEPTH_BUFFER_BIT);
//     triangles.forEach( triangle => {
//         if (triangle.vertexArr !== undefined && triangle.vertexArr.length === 3){
//             rasteriser.rasterise(triangle);
//         }
//     });
// }

function rasterise(triangles){
    rasteriser.rasteriseAll(triangles);
}