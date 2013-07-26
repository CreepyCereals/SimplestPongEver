var CANVAS_WIDTH = 640;
var CANVAS_HEIGHT = 480;
var BALL_SPEED = 300; // 300 px per second

document.addEventListener('keydown', function(e){
	if (e.keyCode == 32){ // Space
		init();
	}

});

var player = {
	pos: [0, 215],
	speed: [0, 350],
	sprite: new  Sprite([10, 50])

};

var cpu = {
	pos: [630, 215],
	speed: [0, 300],
	sprite: new Sprite([10, 50])

}

var ball = {
	pos: [(CANVAS_WIDTH / 2) - 10, (CANVAS_HEIGHT / 2) - 10],
	speed: [BALL_SPEED, BALL_SPEED],
	sprite: new Sprite([10, 10])
}



var gameState = 0;
/*
	0 -> Stopped,
	1 -> Running

*/

var players = [player, cpu];


var score = [0, 0];
/*
	score[0] -> Score of player
	score[1] -> Score of cpu
*/

var ctx, lastUpdate, log, buffer, bufferContext;

var sound = new Audio("wav/sound.wav"); // At colliding ball with player or cpu.

var requestAnimFrame = (function(){ // RequestAnimationFrame multi-browser
    return window.mozRequestAnimationFrame 
    || window.webkitRequestAnimationFrame 
    || window.requestAnimationFrame 
    || window.oRequestAnimationFrame      
    || window.msRequestAnimationFrame     
    || function(callback){ window.setTimeout(callback, 1000 / 60); };
})();

function init(){ // Function called by Start button or space

	if (gameState == 0){
		

		lastUpdate = Date.now();

		gameState = 1;
		gameLoop();
	}

}

function createCanvas(){ // Function called by body.onload

	log = document.getElementById("log");


	var canvas = document.createElement("canvas");

	canvas.width = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;

	document.getElementById("canvas-container").appendChild(canvas);
	ctx = canvas.getContext("2d");
	
	// Buffer
	buffer = document.createElement("canvas");
	buffer.width = CANVAS_WIDTH;
	buffer.height = CANVAS_HEIGHT;
	bufferContext = buffer.getContext("2d");
	bufferContext.shadowColor = "white";	

	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	pauseGame();


}

function gameLoop(){
		var now = Date.now();
		var diff = (now - lastUpdate) / 1000;

		update(diff); // Game Logic
		draw(); // Render objects


		lastUpdate = now;
	if (gameState == 1){
		requestAnimFrame(gameLoop); // Wait for another loop.
	}else{
		pauseGame();
	}
}


function update(diff){


	updateBall(diff);
	updatePlayers(diff);
	collisions();

	// Updates the data displayed.
	log.innerHTML = "FPS: "+Math.round(1/ diff);
	log.innerHTML += "<br>X: "+ball.pos[0] +", Y: "+ball.pos[1];
	log.innerHTML += "<br>"+score[0] + " - " + score[1];


}

function updateBall(diff){


	if (ball.pos[1] >= 470){
		ball.speed[1] = -BALL_SPEED;
	}

	if (ball.pos[1] <= 0){
		ball.speed[1] = BALL_SPEED;
	}

	/*
	ball.pos[0] += Math.round(ball.speed[0] * diff);
	ball.pos[1] += Math.round(ball.speed[1] * diff);
	*/
	ball.pos[0] += ball.speed[0] * diff;
	ball.pos[1] += ball.speed[1] * diff;

}


function updatePlayers(diff){

    if((input.isDown('DOWN') || input.isDown('s')) && (player.pos[1] + player.sprite.size[1]) <= CANVAS_HEIGHT) {
        player.pos[1] += player.speed[1] * diff;
        player.pos[1] = Math.round(player.pos[1] * 10) / 10;
    }

    if((input.isDown('UP') || input.isDown('w')) && player.pos[1] >= 0) {
        player.pos[1] -= player.speed[1] * diff;
        player.pos[1] = Math.round(player.pos[1] * 10) / 10;
    }

	// CPU AI:
	if (ball.pos[1] < (cpu.pos[1] + (cpu.sprite.size[1] / 2))){
		cpu.pos[1] -= Math.round(cpu.speed[1] * diff);

	}

	if (ball.pos[1] > (cpu.pos[1] + (cpu.sprite.size[1] /2))){
		cpu.pos[1] += Math.round(cpu.speed[1] *diff);
	}


}



function collisions(){

	if ((ball.pos[0] + ball.sprite.size[0]) >= 630){

		if ((ball.pos[1] >= cpu.pos[1]) && ((cpu.pos[1] + cpu.sprite.size[1]) >= ball.pos[1]) || ((cpu.pos[1] + cpu.sprite.size[1]) >= ball.pos[1]) && ((ball.pos[1] + ball.sprite.size[1]) >= cpu.pos[1])){// || (ball.pos[1] + ball.sprite.size[1]) <= player.pos[1]){
			sound.play();
			ball.speed[0] = -BALL_SPEED;
			return;
		}else{
			++score[0]; // The point goes to the player.
			newRound();
			return;
		}

	}

	if (ball.pos[0] <= 10){


		if ((ball.pos[1] >= player.pos[1]) && ((player.pos[1] + player.sprite.size[1]) >= ball.pos[1]) || ((player.pos[1] + player.sprite.size[1]) >= ball.pos[1]) && ((ball.pos[1] + ball.sprite.size[1]) >= player.pos[1])){// || (ball.pos[1] + ball.sprite.size[1]) <= player.pos[1]){
			sound.play();
			ball.speed[0] = BALL_SPEED;
		}else{
			++score[1]; //The point goes to the cpu.
			newRound();
		}


	}	
}

function newRound(){

	ball.pos = [(CANVAS_WIDTH / 2) - ball.sprite.size[1], (CANVAS_HEIGHT / 2) - ball.sprite.size[1]];
	ball.speed[0] = BALL_SPEED;

	for (var i = 0; i < players.length; i++){
		players[i].pos[1] = (CANVAS_HEIGHT / 2) - (players[i].sprite.size[1] /2);
	}
	gameState = 0;
}


function draw(){


	// Cleans the buffer
	bufferContext.fillStyle = "black"
	bufferContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	// Redraws the players.
	renderPlayers();

	// Redraws the ball.
	renderBall();


	ctx.drawImage(buffer, 0, 0);


}

function renderPlayers(){

	bufferContext.fillStyle = "white";
	for (var i = 0; i < players.length; i++){
		bufferContext.save(); // Since the bufferContext needs to be translated, save() & restore() are needed.
		bufferContext.translate(players[i].pos[0], players[i].pos[1]);
		players[i].sprite.render(bufferContext);
		bufferContext.restore();
	}
}

function renderBall(){

	bufferContext.save();
	bufferContext.shadowBlur = 15;
	bufferContext.translate(ball.pos[0], ball.pos[1]);
	//bufferContext.shadowOffsetX = -(ball.speed[0]) / 200;
	//bufferContext.shadowOffsetY = -(ball.speed[1]) / 200;
	ball.sprite.render(bufferContext);
	bufferContext.restore();
}




function pauseGame(){
	gameState = 0; // <- Lets the loop end but the next one will need to wait until space is pressed.
	ctx.save();
	ctx.fillStyle = "white";
	ctx.fillText("Press 'space'", 300, 260);
	ctx.restore();
	document.getElementById("stop_but").blur();
}


function mute_unmute(){
	if (sound.muted){
		sound.muted = false;
	}else{
		sound.muted = true;
	}
}

function setHardness(level){
	switch(level){
		case 1:
			cpu.speed[1] = 300;
			break;
		case 2:
			cpu.speed[1] = 350;
			break;
		case 3:
			cpu.speed[1] = 1000;
			break;
	}
}