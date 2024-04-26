class Pixel{
    constructor([x,y], z=0, colour="black", [u = 0, v = 0] = []){
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.z = Math.round(z*10);
        this.u = u;
        this.v = v;
        this.flatMat = [x,y,z];
        this.textureVertices = [u,v];
        this.colour = colour;
    }
}

class Vertex{
    add(operandVertex) {
        const resultVertex = [];
        if (this.flatMat.length === operandVertex.flatMat.length){
            for (let i = 0; i<this.flatMat.length; i++){
                resultVertex.push(this.flatMat[i]+operandVertex.flatMat[i]);
            }
        } else {
            console.log("Dimension error");
            return NaN;
        }
        return new this.constructor(resultVertex);
    }

    subtract(operandVertex) {
        const resultVertex = [];
        if (this.flatMat.length === operandVertex.flatMat.length){
            for (let i = 0; i<this.flatMat.length; i++){
                resultVertex.push(this.flatMat[i]-operandVertex.flatMat[i]);
            }
        } else {
            console.log("Dimension error");
            return NaN;
        }
        return new this.constructor(resultVertex);
    }
}

class Vertex3 extends Vertex{
    constructor([x,y,z], id=0, [u = 0, v = 0] = []){
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.u = u;
        this.v = v;
        this.matrix = [
            [x],
            [y],
            [z]
        ];
        this.flatMat = [x,y,z];
        this.textureVertices = [u,v];
        this.id = id;
    }
}

class Vertex2 extends Vertex{
    constructor([x,y], z = 0, [u = 0, v = 0] = []){
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.u = u;
        this.v = v;
        this.matrix = [
            [x],    
            [y]
        ];
        this.flatMat = [x,y];
        this.textureVertices = [u,v];
    }
}

class Mat{
    constructor(arrayOfValues){
        this.matrix=arrayOfValues;
    }

    multiply(operand){
        if (operand.matrix.length == this.matrix[0].length){
            let result = [];
            for (let i = 0; i < this.matrix.length; i++){
                result[i] = [];
                for (let j = 0; j < operand.matrix[0].length; j++){
                    result[i][j] = 0;
                    for (let k = 0; k < this.matrix.length; k++){
                        result[i][j] += this.matrix[i][k] * operand.matrix[k][j];
                    }
                }
            }
            const resMat = result.map((element)=>element[0]);
            return new Vertex3(resMat);
        } else {
            console.log("Dimension error");
            return NaN;
        }
    }
}

class Mat2 extends Mat{
    constructor(arrayOfValues){
        super(arrayOfValues);
    }
}

class Mat3 extends Mat{
    constructor(arrayOfValues){
        super(arrayOfValues);
    }
}

class Shape{
    constructor(vertices, texture, id){
        this.vertexArr = vertices;
        this.texture = texture;
        for (let i = 0; i < this.vertexArr.length; i++) {
            this.vertexArr[i].id = i+1; //Sets vertex ID as its position in vertexArr
        }
    }
}

class Triangle extends Shape{
    constructor(vertices, texture, id){
        super(vertices, texture, id);
        this.texture = "Plane_diffuse.png"
    }
}

class DebugCube{
    constructor(size, position, colour, sceneObjects){
        this.size = size;
        this.halfSize = size/2;
        this.colour = colour;
        this.sceneObjects = sceneObjects;
        
        this.position = position;
        this.yaw = 0;
        this.pitch = 0;

        this.setPos(position);
    }

    setPos(pos, isNew=false){
        this.position = pos;
        this.v1 = new Vertex3([pos.x+this.halfSize, pos.y+this.halfSize, pos.z+this.halfSize]);
        this.v2 = new Vertex3([pos.x-this.halfSize, pos.y+this.halfSize, pos.z+this.halfSize]);
        this.v3 = new Vertex3([pos.x-this.halfSize, pos.y-this.halfSize, pos.z+this.halfSize]);
        this.v4 = new Vertex3([pos.x+this.halfSize, pos.y-this.halfSize, pos.z+this.halfSize]);
        this.v5 = new Vertex3([pos.x+this.halfSize, pos.y+this.halfSize, pos.z-this.halfSize]);
        this.v6 = new Vertex3([pos.x-this.halfSize, pos.y+this.halfSize, pos.z-this.halfSize]);
        this.v7 = new Vertex3([pos.x-this.halfSize, pos.y-this.halfSize, pos.z-this.halfSize]);
        this.v8 = new Vertex3([pos.x+this.halfSize, pos.y-this.halfSize, pos.z-this.halfSize]);

        this.faces = [
            new Shape([this.v1, this.v2, this.v3, this.v4], this.colour, "wall1"),
            new Shape([this.v5, this.v6, this.v7, this.v8], this.colour, "wall2"),
            new Shape([this.v1, this.v2, this.v6, this.v5], this.colour, "wall3"),
            new Shape([this.v4, this.v3, this.v7, this.v8], this.colour, "wall4"),
            new Shape([this.v1, this.v4, this.v8, this.v5], this.colour, "wall5"),
            new Shape([this.v2, this.v3, this.v7, this.v6], this.colour, "wall6")
        ]

        if (isNew){
            this.sceneObjects.splice(0, 6, ...this.faces);
        } else {
            this.sceneObjects.push(...this.faces);
        }
    }
}




//Trig functions that take degrees
class DegreeMaths{
    sin(angle){
        return Math.sin( angle * Math.PI / 180 );
    };
    cos(angle){
        return Math.cos( angle * Math.PI / 180 );
    };
    tan(angle){
        return Math.tan( angle * Math.PI / 180 );
    };
    asin(angle){
        return Math.asin( angle * Math.PI / 180 );
    };
    acos(angle){
        return Math.acos( angle * Math.PI / 180 );
    };
    atan(angle){
        return Math.atan( angle * Math.PI / 180 );
    };
    toDegrees(angle){
        return angle*180/Math.PI;
    };
}