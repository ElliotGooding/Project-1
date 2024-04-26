//Parent clipper class for reusing methods
class Clipper{
    //Structure of clipping
    clip(triangles){
        let triangleArr = [];
        triangles.forEach( triangle => {
            let vertices = [...triangle.vertexArr];
            const maxID = this.getMaxID(vertices);
            let clipVertices = this.getClipVertices(vertices);
            clipVertices = this.removeDuplicates(clipVertices);
            let clipedPoints = this.getClippedPoints(clipVertices, maxID);
            let unclippedPoints = this.getUnclippedPoints(vertices);
            let clippedVertexArr = clipedPoints.concat(unclippedPoints);
            clippedVertexArr = clippedVertexArr.sort((a,b)=>{
                return a.id-b.id
            });
            let clippedTriangles = reduceToTriangles(new Shape(clippedVertexArr,triangle.colour));
            clippedTriangles.forEach( triangle => {triangleArr.push(triangle) })
        });
        return triangleArr;
    }

    removeDuplicates(myArr){
        if (myArr.length === 0 || myArr.length === 2) {return myArr};
        let count = 0 
        let outputArr = [...myArr];
        let stringedArray = myArr.map((array)=>array.map(object=>{return object.x+", "+object.y+", "+object.z}).toString());
        let stringSet = new Set();
        stringedArray.forEach((element, idx) => {
            if (!stringSet.has(element)){
                stringSet.add(element)
            } else {
                stringSet.delete(element)
            }
        });
        const newArr = outputArr.filter((element,index,array)=>{
            return stringSet.has(element.map(object=>{return object.x+", "+object.y+", "+object.z}).toString())
        });
        return newArr;
    }

    getMaxID(vertices){
        return vertices.reduce((max, obj) => {
            return obj.id > max ? obj.id : max;
        }, -Infinity);
    }

    getID(id1, id2, maxID){
        if (
            ( id1=== 1 && id2 === maxID )||
            ( id1=== maxID && id2 === 1 )
        ){
            return maxID+1
        } else {
            return ( id1 + id2 ) / 2
        }
    }

}

class ClipperNearPlane extends Clipper{
    getClipVertices(vertices){
        let clipVertices = [];
        vertices.forEach((vertex, index) => {
            if (vertex.z < cam.nearPlane){
                let currentVert = vertex;
                let prevVert = vertices.slice(index - 1)[0];
                let nextVert = vertices[index + 1];
                if (nextVert === undefined){
                    nextVert = vertices[0];
                }
                clipVertices.push([prevVert, currentVert]);
                clipVertices.push([currentVert, nextVert]);
            }
        });
        return clipVertices;
    }
    
    
    getClippedPoints(clipVertices, maxID){
        const clippedPoints = [];
        clipVertices.forEach(vertexSet => {
            const { x: x1, y: y1, z: z1, u: u1, v: v1, id: id1 } = vertexSet[0];
            const { x: x2, y: y2, z: z2, u: u2, v: v2, id: id2 } = vertexSet[1];
            const np = cam.nearPlane 
            const x = x1 + ( (np - z1) / (z1 - z2) ) * (x1 - x2);
            const y = y1 + ( (np - z1) / (z1 - z2) ) * (y1 - y2);
            const z = np;
            const u = u1 + ( (np - z1) / (z1 - z2) ) * (u1 - u2);
            const v = v1 + ( (np - z1) / (z1 - z2) ) * (v1 - v2);
            const id = this.getID(id1, id2, maxID);
            const clippedPoint = new Vertex3([x, y, z], id, [u,v]);
            clippedPoints.push(clippedPoint);
        });
        return clippedPoints;
    }
    
    
    getUnclippedPoints(vertices){
        const unclippedPoints = [];
        vertices.forEach((vertex) => {
            if (vertex.z > cam.nearPlane){
                unclippedPoints.push(vertex);
            }
        });
        return unclippedPoints;
    }
}

class ClipperRightPlane extends Clipper{    
    getClipVertices(vertices){
        let clipVertices = [];
        vertices.forEach((vertex,index) => {
            if (this.testOutsideRightPlane(vertex)){
                let currentVert = vertex;
                let prevVert = vertices.slice(index-1)[0];
                let nextVert = vertices[index+1];
                if (nextVert===undefined){
                    nextVert=vertices[0];
                }
                clipVertices.push([prevVert,currentVert]);
                clipVertices.push([currentVert,nextVert]);
            }
        });
        return clipVertices;
    }

    testOutsideRightPlane(vertex){
        const maxX = vertex.z * m.tan( cam.hFOV / 2 );
        if (vertex.x > maxX){
            return true;
        } else {
            return false;
        }
    }
    
    
    getClippedPoints(clipVertices, maxID){
        const clippedPoints = [];
        clipVertices.forEach((vertexSet, count) => {

            const { x: x1, y: y1, z: z1, u: u1, v: v1, id: id1 } = vertexSet[0];
            const { x: x2, y: y2, z: z2, u: u2, v: v2, id: id2 } = vertexSet[1];
            
            const m = ( z1 - z2 ) / ( x1 - x2 );
            const c = z1 - ( m * x1 );

            const x = ( 3 * c ) / ( Math.sqrt(3) - ( 3 * m ) )
            const y = ( x1 - x ) / ( x1 - x2 ) * ( y2 - y1 ) + y1; //Interpolate y from x
            const z = ( Math.sqrt(3) * x ) / 3
            const u = ( x1 - x ) / ( x1 - x2 ) * ( u2 - u1 ) + u1;
            const v = ( x1 - x ) / ( x1 - x2 ) * ( v2 - v1 ) + v1;

            const id = this.getID(id1, id2, maxID);

            const clippedPoint = new Vertex3([x, y, z], id, [u,v]);
            clippedPoints.push(clippedPoint);
        });
        return clippedPoints;
    }
    
    
    getUnclippedPoints(vertices){
        const unclippedPoints = [];
        vertices.forEach((vertex)=>{
            if (!this.testOutsideRightPlane(vertex)){
                unclippedPoints.push(vertex);
            }
        });
        return unclippedPoints
    }
}

class ClipperLeftPlane extends Clipper{   
    getClipVertices(vertices){
        let clipVertices = [];
        vertices.forEach((vertex,index) => {
            if (this.testOutsideLeftPlane(vertex)){
                let currentVert = vertex;
                let prevVert = vertices.slice(index-1)[0];
                let nextVert = vertices[index+1];
                if (nextVert===undefined){
                    nextVert=vertices[0];
                }
                clipVertices.push([prevVert,currentVert]);
                clipVertices.push([currentVert,nextVert]);
            }
        });
        return clipVertices;
    }

    testOutsideLeftPlane(vertex){
        const minX = -1 * vertex.z * m.tan( cam.hFOV / 2 );
        if (vertex.x < minX){
            return true;
        } else {
            return false;
        }
    }
    
    
    getClippedPoints(clipVertices, maxID){
        const clippedPoints = [];
        clipVertices.forEach(vertexSet => {
            const { x: x1, y: y1, z: z1, u: u1, v: v1, id: id1 } = vertexSet[0];
            const { x: x2, y: y2, z: z2, u: u2, v: v2, id: id2 } = vertexSet[1];
            
            const m = ( z1 - z2 ) / ( x1 - x2 );
            const c = z1 - ( m * x1 );
            //ngl i just guessed a lot of this maths but it work so
            const x = (( 3 * c ) / ( - Math.sqrt(3) - ( 3 * m ) )) //hard coded for 120 hFOV
            const y = -( x1 - x ) / ( x1 - x2 ) * ( y1 - y2 ) + y1;
            const z = ( - Math.sqrt(3) * x ) / 3
            const u = ( x1 - x ) / ( x1 - x2 ) * ( u2 - u1 ) + u1;
            const v = ( x1 - x ) / ( x1 - x2 ) * ( v2 - v1 ) + v1; 

            const id = this.getID(id1, id2, maxID);

            const clippedPoint = new Vertex3([x, y, z], id, [u,v]);
            clippedPoints.push(clippedPoint);
        });
        return clippedPoints;
    }
    
    
    getUnclippedPoints(vertices){
        const unclippedPoints = [];
        vertices.forEach((vertex)=>{
            if (!this.testOutsideLeftPlane(vertex)){
                unclippedPoints.push(vertex);
            }
        });
        return unclippedPoints
    }
}