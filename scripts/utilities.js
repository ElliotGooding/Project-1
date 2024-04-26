//Converts any (non-concave) 2D/3D shape into triangles
function reduceToTriangles(shape){
    let vertices;
    if (Array.isArray(shape)){
        vertices = [...shape]
    } else {
        vertices = [...shape.vertexArr]
    }

    const triangles = [];
    while (vertices.length > 3){
        let removedVertex = vertices.pop();
        let triangle = new Triangle([removedVertex,vertices[0],vertices[vertices.length-1]], shape.colour);
        triangles.push(triangle);
    }
    triangles.push(new Triangle(vertices, shape.colour));
    return triangles;
}

const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });
}