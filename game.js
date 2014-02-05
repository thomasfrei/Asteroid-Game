/**
 Author: Thomas Frei
 Datum: 24.11.2013
 Source: game.js
*/
window.onload=function(){

	// Canvas variabeln
	var canvas = document.getElementById("canvas");
	var backgroundCanvas = document.getElementById("backgroundCanvas");
	var context = canvas.getContext("2d");
	var bcontext = backgroundCanvas.getContext("2d");

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	backgroundCanvas.width = canvas.width;
	backgroundCanvas.height = canvas.height

	var canvasWidth = canvas.width;
	var canvasHeight = canvas.height;

	var introAni = true;
	var introPos = 0;

	// keyboard tasten
	var keyDown = 83;
	var keyUp = 87;
	var keyRight = 68;
	var keyLeft = 65;
	var keyPause = 80;
	var keyStart = 32;


	// Bilder
	var ship = new Image();
	ship.src = "img/ship.png";

	var flame = new Image();
	flame.src = "img/flame.png";

	var background = new Image();
	background.src = "img/space.png";

	

	// Hintergrund
	var backgroundVX = 0;

	// User Interface variabeln
	var ui = document.getElementById("gameUi");
	var uiIntro  = document.getElementById("gameIntro");
	var uiStats = document.getElementById("gameStats");
	var uiScore = document.getElementById("gameScore");
	var uiOver = document.getElementById("gameOver");
	var uiSuccess = document.getElementById("gameSuccess");
	var uiPlay = document.getElementById("gamePlay");
	var uiPause = document.getElementById("gamePause");
	var uiReset = document.getElementById("gameReset");
	var uiLog = document.getElementById("logText");
	var gameScore = 0;
	var playGame = false;

	// Game objekte
	var asteroids = new Array();
	var shots = new Array();
	var numAsteroids = 15;
	var rotation = 0;
	var player;
	var shotTimer = 1;

	// Sounds
	var laserSound = document.getElementById("laser");
	var afterburnerSound = document.getElementById("afterburner");
	var rumbleSound = document.getElementById("rumble");
	

	// Asteroiden Objekz
	var Asteroid = function(x,y,radius, speed, image){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.speed = speed;
		this.image = new Image();
		this.image.src = image;
	}

	// Spieler objekt
	var Player = function(x,y){
		this.x = x;
		this.y = y;

		this.width = 144;
		this.height = 50;

		this.speedX = 0;
		this.speedY = 0;

		this.moveUp = false;
		this.moveDown = false;
		this.moveRight = false;
		this.moveLeft = false;
	}

	var Shot = function(x,y){
		this.x = x;
		this.y = y;
	}

	// Asteroiden generieren
	for (var i=0; i< numAsteroids; i++){

		// Asteroid generieren und ins Array pushen
		tmpAsteroid = getAsteroid();
		asteroids.push(tmpAsteroid);
	}

	// Generiert einer Asteroiden und gibt ihn zurück
	function getAsteroid(){

		var radius = 0
		var image;
		var tmpRadius = 1 + Math.floor(Math.random()*3);
		
		if(tmpRadius == 1) {
		 	radius = 10;
		 	image = "img/asteroid_20.png";
		} else if (tmpRadius == 2){
		 	radius = 15;
		 	image = "img/asteroid_30.png";
		} else {
		 	radius = 25;
		 	image = "img/asteroid_50.png";
		}

		var x = canvasWidth + radius + Math.floor(Math.random()*canvasWidth );
		var y = Math.floor(Math.random()*canvasHeight);
		var speed = -5 -(Math.random()*5);
		return new Asteroid(x,y,radius,speed,image);
	}


	// Startet das spiel
	function startGame(){
		
		// Canvas einblenden
		backgroundCanvas.style.display = "block";
		canvas.style.display = "block";

		// Spieler erstellen
		player = new Player(50, canvasHeight/2);

		// Abzahl Asteroiden
		numAsteroids = 10;
		reset();

		// Intro Animation 
		intro();
		
	}

	// Spiel Intro Animation ab
	function intro(){
		afterburnerSound.play();
		context.clearRect(0,0,canvasWidth,canvasHeight);
		context.beginPath(); 
		context.drawImage(ship, 0 - player.width + introPos - 20, canvasHeight/2 -50 );
		context.closePath();
		context.fill();
		introPos += 2;

		if(introPos > player.width-5) {
			introAni = false;
		}

	
		if (introAni){
			setTimeout(intro, 30);
		} else {
			clearTimeout(intro);

			// Stats einblenden 
			uiStats.style.display = "block";
			uiScore.textContent = gameScore;
			gameScore = 0;

			// Spiel zeichen
			drawGame();
			afterburnerSound.pause();
		}
	}

	// initialisieren
	function init(){
		var keyCode;

		// Ui Elemente die nicht gebraucht werden ausblenden
		uiIntro.style.display = 'block';
		uiOver.style.display = "none";
		uiSuccess.style.display = "none";
		uiStats.style.display = "none";
		canvas.style.display = "none";
		backgroundCanvas.style.display = "none";
		uiPause.style.display = "none";
		
		// Event Listener für spiel start
		uiPlay.addEventListener("mousedown", function(){
			uiIntro.style.display = 'none';
			uiOver.style.display = 'none';
			uiSuccess.style.display = 'none';
			reset();
			playGame = true;
			startGame();
		});

		// Event Listener für spiel neustart
		uiReset.addEventListener("mousedown", function(){	
			uiIntro.style.display = 'none';
			uiOver.style.display = 'none';
			uiSuccess.style.display = 'none';
			playGame = true;
			reset();
			startGame();
		});

		// Tastatur Event Listener
		document.addEventListener("keydown", function(e){
			keyCode = e.keyCode;
			if(keyCode == keyDown){
				player.moveDown = true;
			}

			if(keyCode == keyUp){
				player.moveUp = true;
			}

			if(keyCode == keyLeft){
				player.moveLeft = true;
			}

			if(keyCode == keyRight){
				player.moveRight = true;
				rumbleSound.play();
			}

			if(keyCode == keyPause) {
				if (uiOver.style.display == "none" && uiIntro.style.display == "none"){
					if(uiPause.style.display == "block"){
						uiPause.style.display = "none";
					} else{
						uiPause.style.display = "block";
					}
					playGame = !playGame;
					drawGame();
				} 
			}

			if(keyCode == keyStart  && playGame == false
				&& uiOver.style.display == "block" || uiIntro.style.display == "block") 
			{
					uiIntro.style.display = 'none';
					uiOver.style.display = 'none';
					uiSuccess.style.display = 'none';
					reset();
					playGame = true;
					startGame();
			}

			if(keyCode == keyStart && playGame == true && introAni == false){
				var x = player.x + player.width/2;
				var y = player.y + 8;

				// Nur 1 Schuss pro Sekunde erlauben
				if(shotTimer == 0){
					shots.push(new Shot(x,y));
					laserSound.play();
					shotTimer = shotTimer + 1;	
				} 
			}
		});

		// Ist dafür notwendig dass sich der spieler nur bewegt wenn 
		// die taste gedrückt bleibt
		document.addEventListener("keyup", function(e){
			keyCode = e.keyCode;

			if(keyCode == keyDown){
				player.moveDown = false;
			}

			if(keyCode == keyUp){
				player.moveUp = false;
			}

			if(keyCode == keyLeft){
				player.moveLeft = false;
			}

			if(keyCode == keyRight){
				player.moveRight = false;
				rumbleSound.pause();
				rumbleSound.currentTime = 0;
			}

		});
	}

	// Asteroiden und Scrore zurücksetzten
	function reset(){

		if(asteroids.length > 10) {
			asteroids = asteroids.splice(numAsteroids, numAsteroids-10);
		}

		for (var i = 0; i < shots.length; i++){
			shots[i].x = canvasWidth + 1;
		}
		// Asteroiden generieren
		for (var i=0; i< numAsteroids; i++){

			// Asteroid generieren und ins Array pushen
			tmpAsteroid = getAsteroid();
			asteroids.push(tmpAsteroid);
		}
		
	}

	// Animiert den Hintergrund
	function renderBackground(){
	    bcontext.clearRect(0, 0, canvasWidth, canvasHeight);
		bcontext.drawImage(background, backgroundVX, 0);
		bcontext.drawImage(background, background.width-Math.abs(backgroundVX), 0);
		
		if (Math.abs(backgroundVX) > background.width) {
			backgroundVX = 0;
		}
		backgroundVX -= 2;
	}

	// Ist ein Asteroid von einem Schuss getroffen worden
	function isHit(asteroid){

		for(var i = 0; i < shots.length; i++){

			tmpShot = shots[i];
				
			var distanzX = tmpShot.x - asteroid.x - asteroid.radius;
			var distanzY = tmpShot.y - asteroid.y - asteroid.radius;
				
			if( distanzY + 3 + asteroid.radius > 0 && distanzY < 3 
				&& distanzX + 15 + asteroid.radius > 0 && distanzX < 15) {
					shots.splice(i,1);
					return true;
			}	
		}
	}

	function log(message){
		uiLog.textContent = message;
	}

	// Spiel Zeichnen
	function drawGame() {
		
		var asteroidsLength = asteroids.length;
		context.clearRect(0,0,canvasWidth,canvasHeight);

		// Den Score aktualisieren
		uiScore.textContent = gameScore;
		
		window.requestAnimationFrame(renderBackground);

		// bewegungsrichtung  festlegen
		player.speedX = 0;
		player.speedY = 0;

		if(player.moveRight){
			player.speedX = 4;

			// Die AntriebsFlamme zeichnen wenn sich der Spieler nach
			// Rechts bewegt
			context.save();
			context.translate(player.x-player.width/2, player.y);
			context.beginPath();
			context.drawImage(flame,-75 , -28);
			context.closePath();
			context.restore();
		}

		if(player.moveUp){
			player.speedY = -4;
		}

		if(player.moveDown){
			player.speedY = 4;
		}

		if(player.moveLeft){
			player.speedX = -4;
		}

		// Der Spieler sollte sich Vertikal nicht aus dem Fenster bewegen können
		if((player.x + player.speedX) < player.width/2) {
			player.x = player.width/2;
		} else if( (player.x + player.speedX) > (canvasWidth - player.width/2)) {
			player.x = canvasWidth - player.width/2;
		} else {
			player.x += player.speedX;
		}
		
		// Der Spieler sollte sich Horizontal nicht aus dem Fenster bewegen können
		if((player.y + player.speedY) < player.height/2 ) {
			player.y = player.height/2;
		} else if ( (player.y + player.speedY) > (canvasHeight - player.height/2) ) {
			player.y = canvasHeight - player.height/2;
		} else {
			player.y += player.speedY;
		}

		// Den Spieler zeichnen
		context.fillStyle = "white";
		context.beginPath();
		// context.fillRect(player.x-player.width/2 , player.y-player.height/2 , player.width-20, player.height);
		context.drawImage(ship, (player.x+player.width/2)-170, player.y-50);
		context.closePath();
		context.fill();

		// Die Asteroiden zeichnen
		for (var i=0; i < asteroids.length; i++){
			var tmpAsteroid = asteroids[i];
			tmpAsteroid.x += tmpAsteroid.speed;

			// Kollision abfangen
			var distanzX = player.x - tmpAsteroid.x - tmpAsteroid.radius;
			var distanzY = player.y - tmpAsteroid.y - tmpAsteroid.radius;

			if( distanzY + player.height/2 + tmpAsteroid.radius > 0 && distanzY < player.height
				&& distanzX + player.width/2-20 + tmpAsteroid.radius > 0 && distanzX < player.width-20) {
				reset();
				uiStats.style.display = "none";
				document.getElementById("gameOverMessage").textContent = "Du hast " + gameScore + " sekunden überlebt";
				uiOver.style.display = "block";	
				playGame = false;
			}

			// Asteroid ist ausser sichtweite und kann wieder hinten
			// angehängt werden.
			if( (tmpAsteroid.x + tmpAsteroid.radius) < 0 ){
				tmpAsteroid = getAsteroid();
				asteroids[i] = tmpAsteroid;
			}
			
			context.fillStyle = "red";
			context.beginPath();
			// context.arc(tmpAsteroid.x, tmpAsteroid.y, tmpAsteroid.radius, 0, 2*Math.PI, true);

			// Asteroiden drehung
			context.globalCompositeOperation = 'destination-under';
			context.save();
			context.translate(tmpAsteroid.x + tmpAsteroid.radius , tmpAsteroid.y + tmpAsteroid.radius);
			rotation += 0.2;
            context.rotate(rotation*Math.PI/180);
            context.translate( -(tmpAsteroid.x+tmpAsteroid.radius), -(tmpAsteroid.y+tmpAsteroid.radius));
            context.drawImage(tmpAsteroid.image,tmpAsteroid.x, tmpAsteroid.y);
            context.restore();
            context.closePath();
			context.fill();

			if(isHit(tmpAsteroid)){
				asteroids.splice(i, 1);
			}
		}

		// Schüsse zeichnen
		for (var i=0; i < shots.length; i++){
			tmpShot = shots[i];
			tmpShot.x += 20;

			if(tmpShot.x > canvasWidth){
				shots.splice(i, 1);
			}

			context.fillStyle = "green";
			context.beginPath();
			context.fillRect(tmpShot.x, tmpShot.y, 25, 3);
			context.closePath();
			context.fill();
		}

		if(playGame){
			setTimeout(drawGame, 30);
		}
	}

	init();

	// Gamescore zählen
	setInterval(function(){
		if(playGame){
			gameScore = gameScore + 1;
		}

		// Schwierigkeit immer nach 10 sekunden erhöhen (Asteroiden anzahl erhöhen)
		if (gameScore % 10 == 0 && gameScore != 0  && playGame) {
			numAsteroids += 10;
			for(var i=0; i < 10; i++){
				tmpAsteroid = getAsteroid();
				asteroids.push(tmpAsteroid);
				
			} 
		}

		// Shot timer aktualisieren
		if (shotTimer > 0){
			shotTimer = shotTimer - 1;
		}
	}, 1000)
}

window.requestAnimationFrame = function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		function(f) {
			window.setTimeout(f,1e3/60);
		}
}();