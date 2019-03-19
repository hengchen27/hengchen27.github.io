window.onload = function(){

var progressDivElement = document.getElementById('currentProgress');

var manifest = [
	{src: "assets/fruit.json", id: "sheet1", type: "spritesheet"},	
	{src: "assets/Game-Break.mp3", id: "soundBreak", type: "sound"},
	{src: "https://upload.wikimedia.org/wikipedia/commons/f/fe/A_Different_Slant_on_Carina.jpg", id: "image1", type: "image"},
	{src: "assets/Game-Shot.mp3", id: "soundShot",type: "sound"},
	{src: "assets/Game-Death.mp3", id: "soundDeath",type: "sound"}
];

//Create loader
var loader = new createjs.LoadQueue(true, "./");

loader.on("fileload", handleFileLoad);
loader.on("progress",handleOverallProgress);
loader.on("complete",handleComplete);
loader.installPlugin(createjs.Sound);

loader.loadManifest(manifest);

var assets = []; //To store the asset files from manifest
var AudioContext; //For audio context
var audioCtx;
var loadingCompleted = false; //Only allow game start after loading is complete

var appleArray = []; //power up for longer paddle
var bananaArray = []; //power up for second ball
var spriteSheet;

function handleFileLoad(event)
{
	console.log("File loaded");
	assets.push(event);
}

function handleOverallProgress(event)
{
	console.log('TOTAL: '+ loader.progress);
	progressDivElement.style.width = (loader.progress * 100) + "%"; 
}

function handleComplete()
{
	console.log('Loaded all files in the manifest.');
	
	for (var i = 0; i < assets.length; i++)
	{
		var event = assets[i];
		var result = event.result;

		switch (event.item.id)
		{
			case 'sheet1':
				spriteSheet = result;
				break;
		}
	}

	loadingCompleted = true;
}	



//define paddle and bricks width and height here
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const BRICKS_WIDTH = 60;
const BRICKS_HEIGHT = 30;
const BALL_RADIUS = 8;
const FULL_X_SPEED = 7;
var stage;
var paddle;
var ball;
var ball2; //second ball
var bricks = [];
//configure game levels
var levelArray = [
	{rowCount:1, rowbreak:false, timelimit:90, leftSpaceStartIndex:3, leftSpaceEndIndex:3, rightSpaceStartIndex:10, rightSpaceEndIndex:10},
	{rowCount:5, rowbreak:false, timelimit:120, leftSpaceStartIndex:2, leftSpaceEndIndex:5, rightSpaceStartIndex:8, rightSpaceEndIndex:11},
	{rowCount:7, rowbreak:false, timelimit:200, leftSpaceStartIndex:0, leftSpaceEndIndex:5, rightSpaceStartIndex:7, rightSpaceEndIndex:13},
	{rowCount:11, rowbreak:true, timelimit:30, leftSpaceStartIndex:0, leftSpaceEndIndex:5, rightSpaceStartIndex:8, rightSpaceEndIndex:13},
]
var currentGameLevel = 1; //make level 1 as default for the game
var score = 0;
var lives = 3;
var scoreText;
var gameStarted = false;
//set keyboard left and right movements' initial state
var keyboardMoveLeft = false;
var keyboardMoveRight = false;
//use local storage to store data in between sessions, we add a variable to store the scores data.
var highScore = 0;
var timer;
var timerLength = 100;
var timerText;



//check if this browser supports local storage
if(typeof(Storage) !== "undefined") {
	if(localStorage.highScore==undefined) //if its not in the localstorage, then set it to 0
	{
		localStorage.highScore = 0;
	}
	highScore = localStorage.highScore; //if it does, add it to the declared variable
} else {
	highScore = 0;
}

stage = new createjs.Stage("testCanvas");
createjs.Touch.enable(stage);
createjs.Ticker.setFPS(60);

//createjs.Ticker.addEventListener("tick", tick);

createjs.Ticker.addEventListener("tick", stage);
createjs.Ticker.on("tick", tick);

createScoreText();
createTimerText();
addToScore(0);

createPaddle(); //create paddle before creating ball
createBall();
createBrickGrid();


//keyboard handlers
window.onkeyup = keyUpHandler;
window.onkeydown = keyDownHandler;


//if the user clicks the mouse and when the game is in the pause state, start the game.
stage.on("stagemousedown", function(event) 
{ 
	
	if(loadingCompleted){
		startLevel();
	}else{
		alert("Please wait until loading complete");
	}
});
stage.on("stagemousemove", function (event) //move the paddle only if the mouse is moved.
{
	if(loadingCompleted){
		paddle.x = stage.mouseX;
	}
});				
//enlarge the stage for mobile users to finger move the paddle
stage.canvas.height = window.innerHeight;

function startLevel()
{
	if(!gameStarted)
	{
				console.log("Start Game");

				AudioContext = window.AudioContext || window.webkitAudioContext;
				audioCtx = new AudioContext();
				
				if (audioCtx.state !== 'running') {
					audioCtx.resume();
				}

				paddle.scaleX = 1.0;
				paddle.width = 100;
				gameStarted = true; 
				ball.xSpeed = 5; 
				ball.ySpeed = 5;
				ball.up = true;
				ball.right = true;
				timerLength = levelArray[currentGameLevel-1].timelimit;	//timer length for each level
				timer = setInterval(countDownOnGame, 1000);
	}
	
}				

function countDownOnGame(){
	timerLength--;
	console.log(timerLength);
	updateTimerLine();
	
	if(timerLength<1){
		clearTimeout(timer);
		loseLife();
	}
}

function keyDownHandler(e)
{
	//hit left arrow
	if(e.key =="Left" || e.key =="ArrowLeft"){
		if(loadingCompleted){
			keyboardMoveLeft = true;
		}
	}
	//hit right arrow
	if(e.key =="Right" || e.key =="ArrowRight"){
		if(loadingCompleted){
			keyboardMoveRight = true;
		}	
	}
	if(e.key ==" "){
		if(loadingCompleted){
			startLevel();
		}else{
			alert("Please wait until loading complete");
		}
	}
	
}

function keyUpHandler(e)
{
	//release left arrow
	if(e.key =="Left" || e.key =="ArrowLeft"){
		keyboardMoveLeft = false;
	}
	//release right arrow
	if(e.key =="Right" || e.key =="ArrowRight"){
		keyboardMoveRight = false;
	}	
 
}

function addToScore(points)
{
	console.log("score added");
	score+=points;
	if(score > highScore){
		highScore = score;
	}
	updateStatusLine();
}

function updateStatusLine()
{
	scoreText.text = "Score: "+score + " / Lives: "+lives+" / High Score: "+highScore;
}


function createScoreText()
{
	scoreText = new createjs.Text("Score: 0", "16px Arial", "#000000");
	addToScore(0);
	scoreText.x = stage.canvas.width/2 - 150;
	scoreText.y = stage.canvas.height - 36;
	stage.addChild(scoreText);
}

function updateTimerLine() //for display timer on the page
{
	timerText.text = "Timer: "+ timerLength ;
}

function createTimerText(){
	timerText = new createjs.Text("Timer: 90", "16px Arial", "#000000");
	timerText.x = stage.canvas.width/2 - 100;
	timerText.y = stage.canvas.height - 15;
	stage.addChild(timerText);
}

function loseLife()
{
	console.log("Lost a life");

	stage.removeChild(ball);
	ball = null;
	stage.removeChild(ball2);
	ball2 = null;

	createjs.Sound.play("soundDeath");

	clearTimeout(timer);
	timerLength = levelArray[currentGameLevel-1].timelimit;
	updateTimerLine();
	lives--;
	updateStatusLine();

	createBall();

	ball.xSpeed = 0;
	ball.ySpeed = 0;
	ball.x = paddle.x;
	ball.y = paddle.y - PADDLE_HEIGHT/2 - BALL_RADIUS;
	gameStarted = false; //switch to game pause state again 

	//reset high score for every life lost
	localStorage.highScore = score;

	//remove all the power ups
	for(var i=0;i<appleArray.length;i++){
		var apple = appleArray[i];
		//remove the apple
		stage.removeChild(apple);
	}
	appleArray = [];	

	for(var i=0;i<bananaArray.length;i++){
		var banana = bananaArray[i];
		//remove the banana
		stage.removeChild(banana);
	}
	bananaArray = [];	

    //handle when the life is 0, reset the score and restart game
	if(lives==0)
	{
				if(highScore<score)
				{
					highScore = score;
					localStorage.highScore = score;
				}
				lives = 3; //reset the lives
				score = 0; //reset the score
				createBrickGrid(); //reset bricks
	}
	
	updateStatusLine();	
}
        
function tick(event) //custom tick function
{
	// stage.update(); //update the stage manually
	//move paddle based on left and right key 
	if(keyboardMoveLeft)
		{
			console.log("Keyboard- Left");
			paddle.x-=5;
		}
	if(keyboardMoveRight)
		{
			console.log("Keyboard- Right");
			paddle.x+=5;
		}

	// one fix to make sure paddle not moving through the walls of stage
	if(paddle.x+PADDLE_WIDTH/2>stage.canvas.width)
	{
		paddle.x = stage.canvas.width - PADDLE_WIDTH/2;
	}

	if(paddle.x-PADDLE_WIDTH/2<0)
	{
		paddle.x = PADDLE_WIDTH/2;
	}

	//make sure ball is in the middle surface of paddle and no action taken when its paused in every tick
	if(!gameStarted)
	{
		ball.x = paddle.x;
		ball.y = paddle.y - PADDLE_HEIGHT/2  - BALL_RADIUS;
		stage.update();
		return;
	}

	if(ball != null){
		if(ball.up) // y axis value starts 0 at the top, so have ball's x and y value removed by 1 in each tick.
		{
			ball.y -= ball.ySpeed;
			
		}
		else
		{
			ball.y += ball.ySpeed; //if its going down ,move to the bottom of the screen
		}
		if(ball.right)//if its going right,move to the right.
		{
			ball.x += ball.xSpeed;
		}
		else
		{
			ball.x -= ball.xSpeed;
		}
	}

	if(ball2 != null){
		if(ball2.up) // y axis value starts 0 at the top, so have ball's x and y value removed by 1 in each tick.
		{
			ball2.y -= ball2.ySpeed;
			
		}
		else
		{
			ball2.y += ball2.ySpeed; //if its going down ,move to the bottom of the screen
		}
		if(ball2.right)//if its going right,move to the right.
		{
			ball2.x += ball2.xSpeed;
		}
		else
		{
			ball2.x -= ball2.xSpeed;
		}
	}

	//move the power up down 
	for(var i=0;i<appleArray.length;i++){
		var apple = appleArray[i];
		apple.y++;
	}

	for(var i=0;i<bananaArray.length;i++){
		var banana = bananaArray[i];
		banana.y++;
	}

	//check if each brick in the array collides with the ball
	for(var i=0;i<bricks.length;i++)
	{
		if(ball != null && checkCollision(ball,bricks[i]))
		{
			addToScore(100);
			createjs.Sound.play("soundBreak");//add sound when hit happens
			console.log("Brick hit  / New Score: "+score);
			var brickColor = bricks[i].name;
			//Destroy the brick only if this is blue brick, otherwise lower the brick color by 1
			if(brickColor == "blue"){
				destroyBrick(bricks[i]); //if there is collision, destroy the brick
				bricks.splice(i,1); //remove the brick from array
				i--; //minus array element index to get the following brick to move to the disappeared bricks position
			}else{
				if(brickColor == "black"){
					brickColor = "orange";
					//drop apple power up only when the paddle is at original length
					if(paddle.scaleX == 1){
						dropApple(bricks[i]);
					}
				}
				else if(brickColor == "orange"){
					brickColor = "yellow";
					//drop banana power up only when the second ball does not exist
					if(ball2 == null){
						dropBanana(bricks[i]);
					}
				}
				else if(brickColor == "yellow"){
					brickColor = "blue";
				}	
				bricks[i].name = brickColor;	
				bricks[i].graphics.beginFill(brickColor);
				bricks[i].graphics.drawRect(0, 0, BRICKS_WIDTH, BRICKS_HEIGHT);
				bricks[i].graphics.endFill(); //complete the drawing of the shape
			}	
		}	
	}

	for(var i=0;i<bricks.length;i++)
	{
		if(ball2!=null && checkCollision(ball2,bricks[i]))
		{
			addToScore(100);
			createjs.Sound.play("soundBreak");
			console.log("Brick hit  / New Score: "+score);
			var brickColor = bricks[i].name;
			//Destroy the brick only if this is blue brick, otherwise lower the brick color by 1
			if(brickColor == "blue"){
				destroyBrick(bricks[i]); //if there is collision, destroy the brick
				bricks.splice(i,1); //remove the brick from array
				i--; //minus array element index to get the following brick to move to the disappeared bricks position
			}else{
				if(brickColor == "black"){
					brickColor = "orange";
					//drop apple power up only when the paddle is at original length
					if(paddle.scaleX == 1){ //when the paddle length is not increased yet
						dropApple(bricks[i]);
					}
				}
				else if(brickColor == "orange"){
					brickColor = "yellow";
					//drop banana power up only when the second ball does not exist
					if(ball2 == null){ //when there is no second ball
						dropBanana(bricks[i]);
					}
				}
				else if(brickColor == "yellow"){
					brickColor = "blue";
				}
				bricks[i].name = brickColor;	
				bricks[i].graphics.beginFill(brickColor);
				bricks[i].graphics.drawRect(0, 0, BRICKS_WIDTH, BRICKS_HEIGHT);
				bricks[i].graphics.endFill(); //complete the drawing of the shape
			}	
		}	
	}	

	//If no bricks left, you win
	if(bricks.length == 0){
		stage.update();
		createjs.Sound.play("soundDeath");
		clearTimeout(timer);
		gameStarted = false;
		alert("You won!");
		window.location.href = "win.html";
	}
    //if the red ball exists
	if(ball != null){

		if(checkCollision(ball,paddle))
		{
			createjs.Sound.play("soundShot");
			newBallXSpeedAfterCollision(ball,paddle);
		}

		//Check if we've reached the walls
		if(ball.x+BALL_RADIUS>=stage.canvas.width) //if the ball's right part hits the right side of the screen
		{
			ball.x = stage.canvas.width-BALL_RADIUS;//to solve the problem of ball passing by a few pixels of entire width of stage
			ball.right = false; //we should change the direction of ball to left
		}

		if(ball.x-BALL_RADIUS<=0) //ball hits the left side of wall
		{
			ball.x = BALL_RADIUS;
			ball.right = true; //move it to the right
		}

		if(ball.y-BALL_RADIUS<=0) //arrive the top
		{
			ball.y = BALL_RADIUS;
			ball.up = false; //move it down
		}
		if(ball.y+BALL_RADIUS>=stage.canvas.height) 
		{
			stage.removeChild(ball);
			ball = null;
			//loseLife();
		}else{
			ball.lastX = ball.x; //set ball's last x value to current x value
			ball.lastY = ball.y;
		}
	}
	if(ball2 != null){

		if(checkCollision(ball2,paddle))
		{
			createjs.Sound.play("soundShot");
			newBallXSpeedAfterCollision(ball2,paddle);
		}

		if(ball2.x+BALL_RADIUS>=stage.canvas.width) //if the ball's right part hits the right side of the screen
		{
			ball2.x = stage.canvas.width-BALL_RADIUS;//to solve the problem of ball passing by a few pixels of entire width of stage
			ball2.right = false; //we should change the direction of ball to left
		}

		if(ball2.x-BALL_RADIUS<=0) //ball hits the left side of wall
		{
			ball2.x = BALL_RADIUS;
			ball2.right = true; //move it to the right
		}

		if(ball2.y-BALL_RADIUS<=0) //arrive the top
		{
			ball2.y = BALL_RADIUS;
			ball2.up = false; //move it down
		}
		if(ball2.y+BALL_RADIUS>=stage.canvas.height) 
		{
			stage.removeChild(ball2);
			ball2 = null;
		}else{
			ball2.lastX = ball2.x; //set ball's last x value to current x value
			ball2.lastY = ball2.y;
		}
	}

	if(ball == null && ball2 == null){
		loseLife();
	}



	//Check if the paddle catch the power up (apple)
	for(var i = 0; i < appleArray.length ; i++){
		var apple = appleArray[i];
		if(checkCollisionForPowerUps(apple,paddle)){
			
			//remove the apple
			stage.removeChild(apple);
			appleArray.splice(i,1);
			//extend the paddle width
			paddle.width = 150;
			paddle.scaleX = 1.5;
			
			stage.update();
		}
	}

	//Check if the paddle hit the power up (banana)
	for(var i = 0; i < bananaArray.length ; i++){
		var banana = bananaArray[i];
		if(checkCollisionForPowerUps(banana,paddle)){
			
			//remove the banana
			stage.removeChild(banana);
			bananaArray.splice(i,1);
			//shot another ball when there is not a second ball on the screen
			if(ball2 == null){
				ball2 = new createjs.Shape();
				ball2.graphics.beginFill("Green").drawCircle(0,0, BALL_RADIUS); //circle radius is 8px
				ball2.x = paddle.x;
				ball2.y = paddle.y - PADDLE_HEIGHT/2 - BALL_RADIUS;
				ball2.xSpeed = 3; 
				ball2.ySpeed = 3;
				ball2.up = true;
				ball2.right = true;
				stage.addChild(ball2);
			}
			stage.update();
		}
	}

	stage.update();
	
}

function checkCollisionForPowerUps(powerUpElement,hitElement)
{   
	//for the hit element  ;get bounds to get the rectangle of a general element
	var leftBorder = (hitElement.x - hitElement.getBounds().width/2); //get the left border
	var rightBorder = (hitElement.x + hitElement.getBounds().width/2);
	var topBorder = (hitElement.y - hitElement.getBounds().height/2);
	var bottomBorder = (hitElement.y + hitElement.getBounds().height/2);
	
	//current left,right top and bottom border of powerUpElement
	var powerUpLeftBorder = powerUpElement.x - 20;
	var powerUpRightBorder = powerUpElement.x + 20;
	//var powerUpTopBorder = powerUpElement.y - 20;
	var powerUpBottomBorder = powerUpElement.y + 50;

	// if the statement is true, the power up is inside of rectangle of the hit element
	if((powerUpLeftBorder<=rightBorder) && (powerUpRightBorder >= leftBorder) && (powerUpBottomBorder <= bottomBorder) && (powerUpBottomBorder >= topBorder))
	{
		return true;
	}
	return false;
}

 function checkCollision(ballElement,hitElement)
{   
	//for the hit element  ;get bounds to get the rectangle of a general element
	var leftBorder = (hitElement.x - hitElement.getBounds().width/2); //get the left border
	var rightBorder = (hitElement.x + hitElement.getBounds().width/2);
	var topBorder = (hitElement.y - hitElement.getBounds().height/2);
	var bottomBorder = (hitElement.y + hitElement.getBounds().height/2);
	
	var previousBallLeftBorder = ballElement.lastX - BALL_RADIUS;
	var previousBallRightBorder = ballElement.lastX + BALL_RADIUS;
	var previousBallTopBorder = ballElement.lastY - BALL_RADIUS;
	var previousBallBottomBorder = ballElement.lastY + BALL_RADIUS;
	//current left,right top and bottom border of ball
	var ballLeftBorder = ballElement.x - BALL_RADIUS;
	var ballRightBorder = ballElement.x + BALL_RADIUS;
	var ballTopBorder = ballElement.y - BALL_RADIUS;
	var ballBottomBorder = ballElement.y + BALL_RADIUS;

	
	// if the statement is true, the ball is inside of rectangle of the hit element
	if((ballLeftBorder<=rightBorder) && (ballRightBorder >= leftBorder) && (ballTopBorder <= bottomBorder) && (ballBottomBorder >= topBorder))
	{


		if((ballTopBorder <= bottomBorder)&&(previousBallTopBorder > bottomBorder))
		{
			//the if statement above ensures that ball Hit from the bottom
			ballElement.up = false;
			ballElement.y = bottomBorder + BALL_RADIUS; //to make sure ball not entering the inside
		}

		if((ballBottomBorder >= topBorder)&&(previousBallBottomBorder<topBorder))
		{
			//Hit from the top
			ballElement.up = true;
			ballElement.y = topBorder - BALL_RADIUS;
		}
		if((ballLeftBorder<=rightBorder)&&(previousBallLeftBorder>rightBorder))
		{
			//Hit from the right
			ballElement.right = true;
			ballElement.x = rightBorder + BALL_RADIUS;
		}

		if((ballRightBorder >= leftBorder)&&(previousBallRightBorder < leftBorder))
		{
			//Hit from the left
			ballElement.right = false;
			ballElement.x = leftBorder - BALL_RADIUS;
		}
		//update the lastx and lasty
		ballElement.lastX = ballElement.x;
		ballElement.lastY = ballElement.y;
		return true;
	}
	return false;
}

function dropApple(hitElement){
	//create new apple based on the location of the brick
	var apple = new createjs.Sprite(spriteSheet, "apple");
	apple.x = hitElement.x;
	apple.y = hitElement.y + 20;
	stage.addChild(apple);
	appleArray.push(apple);
}

function dropBanana(hitElement){
	//create new banana base on the location of the brick
	var banana = new createjs.Sprite(spriteSheet, "banana");
	banana.x = hitElement.x ;
	banana.y = hitElement.y + 20;
	stage.addChild(banana);
	bananaArray.push(banana);
}

function newBallXSpeedAfterCollision(ballElement,hitElement)
{
	var startPoint = hitElement.x - hitElement.getBounds().width/2;
	var midPoint =  hitElement.x;
	var endPoint = hitElement.x + hitElement.getBounds().width/2;

	if(ballElement.x<midPoint) //once we hit left part
	{
		ballElement.right = false;
		ballElement.xSpeed = FULL_X_SPEED - ((ballElement.x - startPoint)/(midPoint-startPoint)) * FULL_X_SPEED
	}
	else  //once we hit the right part
	{
		ballElement.xSpeed = FULL_X_SPEED - ((endPoint - ballElement.x)/(endPoint-midPoint)) * FULL_X_SPEED
		ballElement.right = true;	
	}
}

function createBrickGrid()
{
	removeAllBricks();

	var currentLevelConfig = levelArray[currentGameLevel-1];

	for(var i = 0;i<14;i++) //i value is in charge of x value, means column

		for(var j = 0;j<currentLevelConfig.rowCount;j++) //j value in charge of y value, means row
		{

 
			//If line break is set, and current row index is on even number, skip this row
			if(currentLevelConfig.rowbreak == true && j%2 == 0){
				continue;
			}

			//Only draw the columns of bricks as per the level configuration
			if( (i>=currentLevelConfig.leftSpaceStartIndex && i<=currentLevelConfig.leftSpaceEndIndex) ||
				(i>=currentLevelConfig.rightSpaceStartIndex && i<=currentLevelConfig.rightSpaceEndIndex)
			){				
				var randomColor = getBrickColor(); //
				//10 is the space between each brick
				createBrick(i*(BRICKS_WIDTH+10)+40,j*(BRICKS_HEIGHT+5)+20, randomColor);
			}

		}
}

function getBrickColor(){

	//Use math random to decide the color of this brick
	var randomNumber = Math.random();

	//if 0.6 - 1 return blue, 0.4-0.6 return yellow, 0.2-0.4 return orange, 0-0.2 return black
	if(randomNumber > 0.6){
		return "blue"; //level 1 brick
	}else if(randomNumber > 0.4){
		return "yellow"; //level 2 brick
	}else if(randomNumber > 0.2){
		return "orange"; //level 3 brick
	}else{
		return "black"; //level 4 brick
	}

}

//Create single brick
function createBrick(x,y,color)
{
	var brick = new createjs.Shape();
    brick.graphics.beginFill(color);
    brick.graphics.drawRect(0, 0, BRICKS_WIDTH, BRICKS_HEIGHT);
    brick.graphics.endFill(); //complete the drawing of the shape
   
	//Set the name with color, so that we can use the name to determine the processing of brick hit
	brick.name = color;
	
    //change the brick registration point to let it shrink from center instead of top left corner
    brick.regX = BRICKS_WIDTH/2;
    brick.regY = BRICKS_HEIGHT/2;
    //move the brick to see the entire brick
    brick.x = x;
    brick.y = y;
	brick.setBounds(brick.regX,brick.regY,BRICKS_WIDTH,BRICKS_HEIGHT);
	
	stage.addChild(brick); //add created object to the stage
    bricks.push(brick); //push each brick to bricks array
}

function removeAllBricks(){
	//destroy all bricks
	for(var i=0;i<bricks.length;i++){
		destroyBrickInstantly(bricks[i]); 
		bricks.splice(i,1); 
		i--; 
	}
}

function createBall()
{
    ball = new createjs.Shape();
    ball.graphics.beginFill("Red").drawCircle(0,0, BALL_RADIUS); //circle radius is 8px
    //move the ball to the middle of the paddle for initial position
    ball.x = paddle.x;
    ball.y = paddle.y- PADDLE_HEIGHT/2  - BALL_RADIUS; //make sure deduct half of paddle height and ball radius
    stage.addChild(ball);

    ball.up = true;
	ball.right = true; //determine whether ball goes up or down
	ball.xSpeed = 0; // initial state
	ball.ySpeed = 0;  //initial state
	//save the previous location of ball
	ball.lastX = 0;
	ball.lastY = 0;

}

function destroyBrick(brick) //even if its destroyed, brick is still there and in the array.
{
    createjs.Tween.get(brick,{}).to({scaleX:0,scaleY:0},500) //scale default value is 1 for display object 100% ;set time of animation to 0.5 sec
    setTimeout(removeBrickFromScreen,500,brick)
}

function destroyBrickInstantly(brick) //even if its destroyed, brick is still there and in the array.
{
    createjs.Tween.get(brick,{}).to({scaleX:0,scaleY:0},1) //scale default value is 1 for display object 100% ;set time of animation to 0.5 sec
    setTimeout(removeBrickFromScreen,500,brick)
}

function removeBrickFromScreen(brick)
{
	stage.removeChild(brick)
}

function createPaddle()
{
    paddle = new createjs.Shape();
    paddle.width = PADDLE_WIDTH;
    paddle.height = PADDLE_HEIGHT;
    paddle.graphics.beginFill('#000000').drawRect(0, 0, paddle.width, paddle.height); //chain the commands
    
  //  paddle.y = 200;
    paddle.x = stage.canvas.width/2 - PADDLE_WIDTH/2; //make sure its in the exact middle
	paddle.y = stage.canvas.height * 0.9; //leave some space at the bottom for the ball to fall
	paddle.regX = PADDLE_WIDTH/2; //add the registration point to the paddle;exact the middle of paddle
	paddle.regY = PADDLE_HEIGHT/2;
	paddle.setBounds(paddle.regX,paddle.regY,PADDLE_WIDTH,PADDLE_HEIGHT); //to set this to use getbounds later
    stage.addChild(paddle);
}

function changeLevel(level){
	//do not allow change level during game play
	if(!gameStarted){
		currentGameLevel = level; 
		createBrickGrid();
		timerLength = levelArray[currentGameLevel-1].timelimit; //different time length for different level
		updateTimerLine();
	}	
}
//add button event handler to change levels
document.getElementById("buttonLv1").addEventListener("click", function(){ changeLevel(1); });
document.getElementById("buttonLv2").addEventListener("click", function(){ changeLevel(2); });
document.getElementById("buttonLv3").addEventListener("click", function(){ changeLevel(3); });
document.getElementById("buttonLv4").addEventListener("click", function(){ changeLevel(4); });


};

