class PlayerWarship{
    constructor(){
        this.width= 100;
        this.height= 50;
        this.speed = 5;
        this.warshipAction = document.getElementById("player-warship");
        this.container = this.warshipAction?.parentElement || document.body;
        this.positionX = Math.max(0, (this.container.clientWidth / 2) - (this.width / 2));
        this.positionY = Math.max(0, this.container.clientHeight - this.height - 10);
        this.motion();

    }

   motion() {
   

    this.warshipAction.style.left = this.positionX + "px";
    this.warshipAction.style.top = this.positionY + "px";

    this.warshipAction.style.width = this.width + "px";
    this.warshipAction.style.height = this.height + "px";
}

motionLeft(){
   
    const minX = 0;
    this.positionX = Math.max(minX, this.positionX - this.speed);
    this.motion();
}
motionRight(){
   
    const maxX = this.container.clientWidth - this.width;
    this.positionX = Math.min(maxX, this.positionX + this.speed);
    this.motion();
}

motionUp(){
    this.positionY = Math.max(0, this.positionY - this.speed);
    this.motion();
}
motionDown(){
    const maxY = this.container.clientHeight - this.height;
    this.positionY = Math.min(maxY, this.positionY + this.speed);
    this.motion();
}


}






const newPlayer= new PlayerWarship()



document.addEventListener("keydown", (e)=>{
    console.log(e);
    // Prevent the page from scrolling when using arrow keys
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
    }

    if(e.code==="ArrowRight"){
        newPlayer.motionRight()
    }
    else if(e.code==="ArrowLeft"){
        newPlayer.motionLeft()
    }
    else if(e.code==="ArrowUp"){
        newPlayer.motionUp()
    }
    else if(e.code==="ArrowDown"){
        newPlayer.motionDown()
    }
})

