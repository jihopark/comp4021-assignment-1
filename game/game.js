var level1_platform = 
[
"0000000000000000000000000030000000000000",
"0000000000000040000000000000000000000000",
"0000000003000000000000000000000000000000",
"0000000000000000000000055111111111100000",
"0000000005000000000000000000000000000000",
"0000000000000000000003000000000030000002",
"0000000000000000000000000000000000000000",
"0000000000000100000000000000000010000000",
"0000000000000000000001000000000000030000",
"0000000300000000000001000000000000000000",
"0000000000000000000000000000010000000000",
"0000000500000000000000300000000000400000",
"0000000000000000000000000000000000000000",
"0000000000000000005511111100000000000000",
"0000003004000000000000000000000000000000",
"0000000000000000000000000000000030000000",
"0000111111111100000000000000000000000000",
"0000000000000000000000000111111111111100",
"0000000000000000000000000000000000000000",
"0000000000000000000000300000000000000000",
"0000000000000000000000000000000000000000",
"0000000000000000000111111111000000000000",
"0000000030004000000000000000000000000000",
"0000000000000000000000000000000000000000",
"0000011111111110000000000040000000000000",
"0000000000000000000000000000000000000000",
"0000000000000000000001111111111000000000",
"0000000000040000000000000000001000000000",
"0000000000000000000000000000001000000000",
"1111111111111111111111111111111111110000"]


// The point and size class used in this program

function Bullet(obj, motion, point){
    this.svgObject = obj
    this.position = point
    this.motion = motion    
}

function Ghost(obj, motionType, x, y, size){
    this.svgObject = obj
    this.position = new Point((x)? parseFloat(x) : 0.0, (y)? parseFloat(y) : 0.0)
    this.original = new Point((x)? parseFloat(x) : 0.0, (y)? parseFloat(y) : 0.0)
    this.motion = motionType
    this.size = size
}

function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
    this.orientation = motionType.RIGHT
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    var count = 0
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "use") continue;

        var className = node.getAttribute("class")
        if (className!="platform" && className!="disappear_platform") continue;
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = PLATFORM_SIZE;
        var h = PLATFORM_SIZE;

        if (((this.position.x >= x-PLAYER_SIZE.w && this.position.x <= x + PLATFORM_SIZE) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + PLATFORM_SIZE) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y){
            if (className == "disappear_platform")
                setTimeout(removePlatform(node), DISAPPEARING_PLATFORM_TIMEOUT)
            return true;
        }
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

function removePlatform(node){
    node.parentNode.removeChild(node)
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "use") continue;

        var className = node.getAttribute("class")
        if (className!="platform" && className!="disappear_platform") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = PLATFORM_SIZE;
        var h = PLATFORM_SIZE;
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + PLATFORM_SIZE;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}

Player.prototype.findExit = function(position){
    return intersect(position,PLAYER_SIZE, exit_position, EXIT_SIZE)
}

Player.prototype.findCoin = function(position){
    var platforms = svgdoc.getElementById("platforms");

    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "use") continue;

        var className = node.getAttribute("class")
        if (className!="coin") continue;
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = COIN_SIZE;
        var h = COIN_SIZE;
        if (intersect(position, PLAYER_SIZE, new Point(x,y), COIN_SIZE))
            return node
    }

    return null;
}


//
// Below are constants used in the game
//
var xmlns = "http://www.w3.org/2000/svg",
    xlinkns = "http://www.w3.org/1999/xlink";

var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var EXIT_SIZE = new Size(40,40)
var SCREEN_SIZE = new Size(800, 600);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 0);     // The initial position of the player

var COIN_SIZE = new Size(20,20)
var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed
var PLATFORM_SIZE = 20
var GAME_INTERVAL = 25;                     // The time interval of running the game
var LEVEL_TOTAL_TIME = 100*1000                  // The total time in seconds
var GHOST_MOVEMENT =50
var GHOST_SIZE = new Size(PLATFORM_SIZE, PLATFORM_SIZE*2)
var BULLET_SIZE = new Size(10,10)
var DISAPPEARING_PLATFORM_TIMEOUT = 500

var GET_COIN_SCORE = 10
var GHOST_KILL_SCORE = 50
var LEVEL_PASS_SCORE = 1000
//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum
var exit_position
var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var gameClock = null;
var currentLevel = 1
var remaining_time = LEVEL_TOTAL_TIME
var total_coin = 0
var remaining_coin
var current_score = 0
var isGameOver = false
var ghost = []
var ghost_count = 0
var bullet = []
var bullet_count = 8

//
// The load function for the SVG document
//
function load(evt) {

    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);

    // Create the player
    player = new Player();

    //
    setUpPlatform(1);

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    gameClock = setInterval("gameClockPlay();", 1000)
}

//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    if (isGameOver) return false
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();
    var SPACE = 32;

    switch (keyCode) {
        case "N".charCodeAt(0):
            player.motion = motionType.LEFT;
            break;

        case "M".charCodeAt(0):
            player.motion = motionType.RIGHT;
            break;
        case "Z".charCodeAt(0):
            if (player.isOnPlatform()){
                player.verticalSpeed = JUMP_SPEED
            }
            break;
        case SPACE:
            if (bullet_count > 0) shoot()
            evt.preventDefault()
            break;
        return false
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            player.orientation = motionType.LEFT
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "M".charCodeAt(0):
            player.orientation = motionType.RIGHT
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}

function gameClockPlay(){
    if (remaining_time == 0){ 
        gameOver()
        return ;
    }
    
    remaining_time -= 1000;

    var clock = svgdoc.getElementById("clock_text")
    clock.textContent = remaining_time/1000 
                    
}

function gameOver(){
    isGameOver = true
    var gameOverText = svgdoc.getElementById("game_over_text")
    gameOverText.setAttribute("style","visibility:visible;fill:black;font-size:100px;z-index:100;")
}

function shoot(){
    var _x = player.position.x 
    var _y = player.position.y

    if (player.orientation == motionType.RIGHT)
        _x += PLAYER_SIZE.w
    _y += (PLAYER_SIZE.h/2)
    
    bullet[8-bullet_count] = new Bullet(createBulletSVG(), player.orientation, new Point(_x,_y))
    updateBulletCount()
}

function createBulletSVG(){
    var platforms = svgdoc.getElementById("platforms");

    var bullet=svgdoc.createElementNS(xmlns,"use");
    bullet.setAttributeNS(null, "class", "bullet");
    bullet.setAttributeNS(xlinkns, "xlink:href", "#bullet");
    platforms.appendChild(bullet)
    return bullet
} 

function updateBulletCount(){
    var text = svgdoc.getElementById("bullet_left")
    text.textContent = --bullet_count + "/8" 
}  

//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    updateScreen();

    processCoin(player.findCoin(player.position))
    if(bumpIntoGhost(player.position)!=-1){
        gameOver()
    }

    if (player.findExit(player.position)){
        proceedToNextRound()
    }
}

function updateGhostPosition(){
    var move = MOVE_DISPLACEMENT/2

    for (var i=0; i<ghost_count; i++){
        if (!ghost[i]) continue
        if (ghost[i].motion== motionType.LEFT){
            move *= -1
            if (ghost[i].position.x + move >= ghost[i].original.x - GHOST_MOVEMENT)
                ghost[i].position.x += move
            else{
                ghost[i].motion = motionType.RIGHT
                ghost[i].position.x = ghost[i].original.x - GHOST_MOVEMENT
            }
        }
        else{
            if (ghost[i].position.x + move <= ghost[i].original.x + GHOST_MOVEMENT)
                ghost[i].position.x += move
            else{
                ghost[i].motion = motionType.LEFT
                ghost[i].position.x = ghost[i].original.x + GHOST_MOVEMENT
            }
        }
    }
}

function updateBulletPosition(){
    for (var i=0; i<8-bullet_count; i++){
        var move = MOVE_DISPLACEMENT*3
        if (!bullet[i]) continue
        if (bullet[i].motion== motionType.LEFT) bullet[i].position.x -= move
        else bullet[i].position.x += move
        
        var ghost_n = bumpIntoGhost(bullet[i].position)
        if (ghost_n!=-1){
            killGhost(ghost_n)
            removeBullet(i)
        }
        else if (collidePlatform(bullet[i].position, BULLET_SIZE))
            removeBullet(i)
        else if (bullet[i].position.x < 0 || bullet[i].position.x > SCREEN_SIZE.w 
            || bullet[i].position.y < 0 || bullet[i].position.y > SCREEN_SIZE.h)
            removeBullet(i)
    }    
}

function removeBullet(n){
    bullet[n].svgObject.parentNode.removeChild(bullet[n].svgObject)
    bullet[n] = null  
}

function proceedToNextRound(){
    if (remaining_coin!=0)
        return ;
    var clock = svgdoc.getElementById("level_text")
    player.position = PLAYER_INIT_POS
    updateScore(remaining_time/100 + currentLevel*LEVEL_PASS_SCORE)
    clock.textContent = "Level " + ++currentLevel 
    
    remaining_time = LEVEL_TOTAL_TIME

}

function processCoin(coin){
    if (!coin) return ;

    coin.parentNode.removeChild(coin)
    remaining_coin--;
    console.log("Remaining coin " + remaining_coin)

    updateScore(GET_COIN_SCORE)
}

function killGhost(n){
    ghost[n].svgObject.parentNode.removeChild(ghost[n].svgObject)
    ghost[n] = null
    updateScore(GHOST_KILL_SCORE)
}

function bumpIntoGhost(position){
    for (var i=0; i<ghost_count; i++){
        if (ghost[i] && intersect(position, PLAYER_SIZE, ghost[i].position, GHOST_SIZE))
            return i
    }
    return -1
}

function updateScore(addition){
    var score = svgdoc.getElementById("score")
    current_score += addition
    score.textContent = current_score
}

function collidePlatform(position, size){        
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "use") continue;

        var className = node.getAttribute("class")
        if (className!="platform" && className!="disappear_platform") continue;
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        if (intersect(position, size, new Point(x, y), new Size(PLATFORM_SIZE, PLATFORM_SIZE)))
            return true
    }
    return false
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    if (isGameOver) return ;

    updateGhostPosition()
    updateBulletPosition()

    // Transform the player
    player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    
    // ghost
    for (var i=0; i<ghost_count; i++){
        if (ghost[i]) ghost[i].svgObject.setAttribute("transform", "translate(" + ghost[i].position.x + "," + ghost[i].position.y + ")");    
    }

    //bullet
    for (var i=0; i<8-bullet_count; i++){
        if (bullet[i])
            bullet[i].svgObject.setAttribute("transform", "translate(" + bullet[i].position.x + "," + bullet[i].position.y + ")");    
    }
    // Calculate the scaling and translation factors	
    
    // Add your code here
    
}

function getValueFromPlatform(x, y){
    return level1_platform[SCREEN_SIZE.h/PLATFORM_SIZE-y-1].charAt(x)  
}

function setUpPlatform(level){
    var PLATFORM = '1'
    var EXIT = '2'
    var COIN = '3'
    var GHOST ='4'
    var DISAPPEARING_PLATFORM = '5'
    var platforms = svgdoc.getElementById("platforms");
    var x,y

    if (level == 1){
        for (y=0;y<SCREEN_SIZE.h/PLATFORM_SIZE;y++){
            for(x=0;x<SCREEN_SIZE.w/PLATFORM_SIZE;x++){
                if (getValueFromPlatform(x,y)==PLATFORM || getValueFromPlatform(x,y)==DISAPPEARING_PLATFORM){
                    var newPlatform=svgdoc.createElementNS(xmlns,"use");
                    if (getValueFromPlatform(x,y)==DISAPPEARING_PLATFORM)
                        newPlatform.setAttributeNS(null, "class", "disappear_platform");
                    else
                        newPlatform.setAttributeNS(null, "class", "platform");
                    newPlatform.setAttributeNS(xlinkns, "xlink:href", "#platform_square");
                    newPlatform.setAttribute("x",PLATFORM_SIZE*x)
                    newPlatform.setAttribute("y",PLATFORM_SIZE*(SCREEN_SIZE.h/PLATFORM_SIZE-y-1))   
                    platforms.appendChild(newPlatform)
                }
                else if (getValueFromPlatform(x,y)==EXIT){
                    var newPlatform=svgdoc.createElementNS(xmlns,"use");
                    newPlatform.setAttributeNS(null, "class", "level_exit");
                    newPlatform.setAttributeNS(xlinkns, "xlink:href", "#level_exit");
                    newPlatform.setAttribute("x",PLATFORM_SIZE*x)
                    newPlatform.setAttribute("y",PLATFORM_SIZE*(SCREEN_SIZE.h/PLATFORM_SIZE-y-1))   
                    platforms.appendChild(newPlatform)
                    exit_position = new Point(PLATFORM_SIZE*x-PLATFORM_SIZE, PLATFORM_SIZE*(SCREEN_SIZE.h/PLATFORM_SIZE-y-1))
                }
                else if (getValueFromPlatform(x,y)==COIN){
                    total_coin++
                    var newPlatform=svgdoc.createElementNS(xmlns,"use");
                    newPlatform.setAttributeNS(null, "class", "coin");
                    newPlatform.setAttributeNS(xlinkns, "xlink:href", "#coin");
                    newPlatform.setAttribute("x",PLATFORM_SIZE*x)
                    newPlatform.setAttribute("y",PLATFORM_SIZE*(SCREEN_SIZE.h/PLATFORM_SIZE-y-1))   
                    platforms.appendChild(newPlatform)
                }
                else if (getValueFromPlatform(x,y)==GHOST){
                    var _x = PLATFORM_SIZE*x;
                    var _y = PLATFORM_SIZE*(SCREEN_SIZE.h/PLATFORM_SIZE-y-1)
                    var newPlatform=svgdoc.createElementNS(xmlns,"use");
                    newPlatform.setAttributeNS(null, "class", "ghost");
                    newPlatform.setAttributeNS(xlinkns, "xlink:href", "#ghost");
                    platforms.appendChild(newPlatform)
                    ghost[ghost_count++] = new Ghost(newPlatform, (ghost_count%2)+1,_x,_y, new Size(PLATFORM_SIZE, PLAYER_SIZE*2))
                }
            }
        }
        remaining_coin = total_coin    
    }
}

