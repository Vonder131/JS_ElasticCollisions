//-----------------------------------------------------------------------------
//global variables
//-----------------------------------------------------------------------------
const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d");
const ObjContainer = [];
const times = [];
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
var fps;
var lastCalledTime;

//-----------------------------------------------------------------------------
//classes
//-----------------------------------------------------------------------------


//classic 2D vector to store data like position and velocity
class Vector2{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    add(other){
        this.x += other.x;
        this.y += other.y;
    }

    sub(other){
        this.x -= other.x;
        this.y -= other.y;
    }

    mult(other){
        this.x = this.x * other.x;
        this.y = this.y * other.y;
    }

    div(other){
        this.x = this.x / other.x;
        this.y = this.y / other.y;
    }

    reverse(){
        this.x = this.x * -1;
        this.y = this.y * -1;
    }

    copy(){
        let newObject = new Vector2(this.x,this.y);
        return newObject;
    }

    equals(other){
        this.x = other.x;
        this.y = other.y;
    }

    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }    
    
    getDirectionX(){
        if(this.x > 0){
            return 1;
        }else{
            return -1;
        }
    }

    setMagnitude(value) {
        const mag = this.magnitude();
        if (mag === 0) return; // avoid division by zero
        this.x = (this.x / mag) * value;
        this.y = (this.y / mag) * value;
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    getDirectionY(){
        if(this.y > 0){
            return 1;
        }else{
            return -1;
        }
    }    

}

//the main object
class PhysicsObject {
    constructor(position){
        this.position = position;
        this.velocity = new Vector2((Math.random()*10) - 5, (Math.random()*10) - 5)
        this.radius = Math.random()*40 + 10;
        //this.radius = 40;
    }
    //every object draws itself
    draw(){
        ctx.arc(this.position.x,this.position.y,this.radius,0,2 * Math.PI);
    }

    updatePosition(){
        this.position.add(this.velocity);
    }

    collideWithBoundaries(){
        
        if(this.position.x < this.radius){//check left margin
            this.position.x = this.radius;
            this.velocity.x = this.velocity.x * -1;
        }
        if(this.position.x > canvasWidth - this.radius){//check right margin
            this.position.x = canvasWidth - this.radius;
            this.velocity.x = this.velocity.x * -1;
        }
        if(this.position.y < this.radius){//check top margin
            this.position.y = this.radius;
            this.velocity.y = this.velocity.y * -1;
        }
        if(this.position.y > canvasHeight - this.radius){//check bottom margin
            this.position.y = canvasHeight - this.radius;
            this.velocity.y = this.velocity.y * -1;
        }
    }



    checkCollisions(other){  
        let radiusSum = this.radius + other.radius;
        let collisionVector = other.position.copy();
        collisionVector.sub(this.position);

        let distance = collisionVector.magnitude();
        if (distance<(radiusSum)){

            // Push the particles out so that they are not overlapping
            let overlap = distance - (radiusSum);
            let dir = collisionVector.copy();
            dir.setMagnitude(overlap * 0.5);
            this.position.add(dir);
            other.position.sub(dir);
            
            // Correct the distance!
            distance = this.radius + other.radius;
            collisionVector.setMagnitude(distance);
            
            let mSum = this.radius + other.radius;
            let vDiff = other.velocity.copy();
            vDiff.sub(this.velocity)
            // Particle A (this)
            let num = vDiff.dot(collisionVector);
            let den = mSum * distance * distance;
            let deltaVA = collisionVector.copy();
            deltaVA.x = deltaVA.x * (2 * other.radius * num / den);
            deltaVA.y = deltaVA.y * (2 * other.radius * num / den);
            this.velocity.add(deltaVA);
            // Particle B (other)
            let deltaVB = collisionVector.copy();
            deltaVB.x = deltaVB.x * (-2 * this.radius * num / den);
            deltaVB.y = deltaVB.y * (-2 * this.radius * num / den);
            other.velocity.add(deltaVB);

        }
    }

    //method that will be called every single frame
    tick(){
        this.collideWithBoundaries();
        this.updatePosition();
    }
}

//-----------------------------------------------------------------------------
//functions
//-----------------------------------------------------------------------------

function checkCollisions(){//the loop that check all the objects against all other (very slow aproach but good enough for this)
    for(let i=0;i<ObjContainer.length;i++){
        for(let j=i+1;j<ObjContainer.length;j++){
            ObjContainer[i].checkCollisions(ObjContainer[j]);
        }
    }    
}

function draw(){//this will call the draw method inside all objects
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0;i<ObjContainer.length;i++){
        ctx.moveTo(ObjContainer[i].position.x,ObjContainer[i].position.y);
        ObjContainer[i].draw();
    }
    ctx.fillStyle = "#613f70";
    ctx.fill();    
}

function tick(){//the function that update the physics.
        checkCollisions();
        for(let i=0;i<ObjContainer.length;i++){
        ObjContainer[i].tick();
    }
}



function getFps(timestamp){//calculate and update the fps counter.
    //if the fps drops below the monitor refresh rate, a better collision detection is recommended

    if(!lastCalledTime) {
        lastCalledTime = Date.now();
        fps = 0;
        return;
    }
        delta = (Date.now() - lastCalledTime)/1000;
        lastCalledTime = Date.now();
        fps = 1/delta;
        document.getElementById("fps").innerHTML = "fps: " + Math.floor(fps);
}

function createNewElement(canvas, event) {
            let rect = canvas.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;
            const po = new PhysicsObject(new Vector2(x,y)); //a new object is created at mouse position
            ObjContainer.push(po);
            draw();
}

//the loop function that animates the canvas
function animation(){//main loop
    tick();
    draw();
    getFps();
    requestAnimationFrame(animation);
}

//-----------------------------------------------------------------------------
//calls
//-----------------------------------------------------------------------------

canvas.addEventListener("mousedown", function (e) {//the listener for the createNewElement
    createNewElement(canvas, e);
});

animation();
