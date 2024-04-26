async function parseObj(fileName, texture, size, offset) {
    const vertices = [];
    const triangles = [];
    const textureVertices = [];
    let objFile
    try {
        objFile = await fetchTextFile(fileName);
    } catch (error) {
        console.error('Error parsing obj file:', error);
    }
    const lines = objFile.split("\n")
    lines.forEach(line => {
        const parts = line.trim().split(" ");
        if (parts[0] === "v") {
            const vertex = createVertex(parts, size, offset);
            vertices.push(vertex);
        } else if (parts[0] === "vt"){
            const textureVertex = createTextureVertex(parts, size, offset);
            textureVertices.push(textureVertex);
        }else if (parts[0] === "f") {
            const triangle = createTriangle(vertices, textureVertices, line, texture);
            triangles.push(triangle);
        }
    });
    return triangles;
}

async function fetchTextFile(filename) {
    try {
        const response = await fetch(filename);
        const text = await response.text();
        return text;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function createVertex(data,size,offset){
    const position = data.slice(1).map((v, i) => v*size + offset[i]);
    // const position = data.slice(1);
    return new Vertex3(position);
}

function createTextureVertex(data){
    const position = data.slice(1).map(Number);
    if (position.length = 3) {position.pop()};
    position[1] = 1 - position[1]
    return new Vertex2(position);
}

function createTriangle(vertices, textureVertices, line, texture){
    const parts = line.match(/\d+/g).map(Number);
    vertexArr = [];
    for (let i = 0; i < parts.length/3; i++){
        vertexArr.push(new Vertex3(vertices[parts[i*3]-1].flatMat, 0, textureVertices[parts[i*3+1]-1].flatMat));
    }
    const colour = [randomBetween(0,255)/255,randomBetween(0,255)/255,randomBetween(0,255)/255];
    return new Shape(vertexArr, colour)
}