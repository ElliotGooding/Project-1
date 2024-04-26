// Orbital camera controls
class Camera{
    constructor(fov, nearPlane, farPlane, resolution, radius){
        this.fov = fov;
        this.hFOV = fov;
        this.vFOV = fov;
        this.nearPlane = nearPlane;
        this.farPlane = farPlane;
        this.resolution = resolution;
        this.r = radius;

        this.minR = 1;
        this.maxR = 1000;
        this.rActual = 10;
        this.rTarget = 10;

        this.yaw = 180;
        this.pitch = 0;
        this.roll = 0;
        this.maxPitch = 80;

        this.yawPos = 0;
        this.pitchPos = 0;

        this.vel = {x:0, y:0};
        this.mouseSpeed = 0.3;
        this.zoomSpeed = 0.01;
        this.deccel = 0.9;
        this.moveDelay = 0.1;
        this.maxSpeed = 10;

        this.position = {x:0, y:0, z:0};

        this.dragging = false
        this.lastMouse = {x:0, y:0};
        this.currentMouse = {x:0, y:0};
        this.offset = {x:0, y:0};
        this.oldAngles = {x:0, y:0};
        this.currentAngles = {x:0, y:0};

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }

    onMouseDown(e){
        this.dragging = true;
        this.offset.x = this.currentAngles.x / this.mouseSpeed - e.clientX;
        this.offset.y = this.currentAngles.y / this.mouseSpeed - e.clientY;
    }

    onMouseUp(){
        this.dragging = false;
    }

    onMouseMove(e){
        this.lastMouse.x = this.currentMouse.x;
        this.lastMouse.y = this.currentMouse.y;
        this.currentMouse.x = e.clientX;
        this.currentMouse.y = e.clientY;
    }

    onWheel(e){
        this.rTarget += e.deltaY * this.zoomSpeed;
        if (this.rTarget < this.minR) this.rTarget = this.minR;
        if (this.rTarget > this.maxR) this.rTarget = this.maxR;
        this.calcPosFromAngles();
    }

    changeFOV(newFOV){
        this.dragging = false;
        const r0 = this.rActual;
        const theta0 = this.hFOV;
        const theta1 = newFOV;
    
        const r1 = ( r0 * m.tan(theta0/2) ) / ( m.tan(theta1/2) );
        this.rActual = r1;
        this.rTarget = r1;
        this.hFOV = theta1;
        this.vFOV = theta1;
        this.calcPosFromAngles();
    
        this.zoomSpeed = 0.01 * (120/this.hFOV);
    }

    orbitalMove(){
        if (this.dragging){
            this.calcAngles();
            this.calcSpeed();
        } else {
            this.yawPos += this.vel.x;
            this.pitchPos += this.vel.y;
    
            this.currentAngles.x = this.yawPos;
            this.currentAngles.y = this.pitchPos;
    
            this.vel.x *= this.deccel;
            this.vel.y *= this.deccel;
        }

        this.clampPitch();
        this.calcPosFromAngles();
        this.applyAngles();
    }

    calcAngles(){
        const targetX = this.currentMouse.x + this.offset.x;
        const targetY = this.currentMouse.y + this.offset.y;

        const currentX = this.currentAngles.x / this.mouseSpeed;
        const currentY = this.currentAngles.y / this.mouseSpeed;

        const diffX = targetX - currentX;
        const diffY = targetY - currentY;

        const newX = currentX + diffX * this.moveDelay;
        const newY = currentY + diffY * this.moveDelay;

        this.lastMouse.x = this.currentMouse.x;
        this.lastMouse.y = this.currentMouse.y;

        this.oldAngles.x = this.currentAngles.x;
        this.oldAngles.y = this.currentAngles.y;

        this.currentAngles.x = newX * this.mouseSpeed;
        this.currentAngles.y = newY * this.mouseSpeed;

        this.yawPos = this.currentAngles.x;
        this.pitchPos = this.currentAngles.y;
    }

    calcSpeed(){
        this.vel.x = this.currentAngles.x - this.oldAngles.x;
        this.vel.y = this.currentAngles.y - this.oldAngles.y;

        if ( this.vel.x >  this.maxSpeed ) this.vel.x =  this.maxSpeed;
        if ( this.vel.y >  this.maxSpeed ) this.vel.y =  this.maxSpeed;
        if ( this.vel.x < -this.maxSpeed ) this.vel.x = -this.maxSpeed;
        if ( this.vel.y < -this.maxSpeed ) this.vel.y = -this.maxSpeed;
    }

    clampPitch(){
        if (this.currentAngles.y>this.maxPitch){
            this.currentAngles.y = this.maxPitch;
            this.pitchPos = this.maxPitch;
        };
        if (this.currentAngles.y<-this.maxPitch){
            this.currentAngles.y = -this.maxPitch;
            this.pitchPos = -this.maxPitch;
        };
    }

    calcPosFromAngles(){
        this.rActual += (this.rTarget - this.rActual) * 0.1;
        const r1 = this.rActual;
        const r2 = r1 * m.cos(this.pitchPos);

        this.position.x = r2 * m.sin(this.yawPos);
        this.position.y = r1 * m.sin(this.pitchPos);
        this.position.z = r2 * m.cos(this.yawPos);

        console.log(this.position.x, this.position.y, this.position.z)
    };

    applyAngles(){
        this.yaw = this.yawPos + 180;
        this.pitch = this.pitchPos;
    }
        
}