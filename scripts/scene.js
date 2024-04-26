//Contains the objects to be displayed in the world

const green = "32A852"
const blue = "FF18A2"

async function buildScene(){
    objectsToRender = [];
    num=10;
    // const rect2 = new Shape([
    //     new Vertex3([num,num,-num]),
    //     new Vertex3([-num,num,-num]),
    //     new Vertex3([-num,-num,-num]),
    //     new Vertex3([num,-num,-num])
    // ],green, "wall1")
    // objectsToRender.push(rect2)

    // const rect3 = new Shape([
    //     new Vertex3([num,num,num]),
    //     new Vertex3([-num,num,num]),
    //     new Vertex3([-num,-num,num]),
    //     new Vertex3([num,-num,num])
    // ],green, "wall2")
    // objectsToRender.push(rect3)

    // const rect4 = new Shape([
    //     new Vertex3([num,num,num]),
    //     new Vertex3([num,num,-num]),
    //     new Vertex3([num,-num,-num]),
    //     new Vertex3([num,-num,num])
    // ],green, "wall3")
    // objectsToRender.push(rect4)

    // const rect5 = new Shape([
    //     new Vertex3([-num,num,num]),
    //     new Vertex3([-num,num,-num]),
    //     new Vertex3([-num,-num,-num]),
    //     new Vertex3([-num,-num,num])
    // ],green, "wall4")
    // objectsToRender.push(rect5)

    // objectsToRender.push(new Shape([
    //         new Vertex3([70,-30,55]),
    //         new Vertex3([10,15,55]),
    //         new Vertex3([10,-30,55])
    //     ], blue, "tri1"));

        // objectsToRender.push(new Shape([
        //     new Vertex3([10,15,62]),
        //     new Vertex3([100,-10,47]),
        //     new Vertex3([10,-30,50])
        // ], blue, "tri1"));
        
    // debugCube = new DebugCube(1, new Vertex3([0,0,0]), green, objectsToRender);

    // objectsToRender.push(new Shape([
    //     new Vertex3([-50, -5, -50]),
    //     new Vertex3([-50, -5, 50]),
    //     new Vertex3([50, -5, 50]),
    //     new Vertex3([50, -5, -50], blue, "floor")
    // ]))

    // const parsedObj1 = await parseObj("scissors.obj", "Plane_diffuse.png", 0.01, [0,0,0]);
    // objectsToRender.push(...parsedObj1);
    const parsedObj2 = await parseObj("LowPolyPlane01.obj", "metal.png", 1, [0, 0, 0]);
    objectsToRender.push(...parsedObj2);
    
    return objectsToRender;
}