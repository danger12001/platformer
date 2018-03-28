var game = new Phaser.Game(920, 600, Phaser.AUTO, 'game', { preload: preload, create: create });
// const firebase = require('firebase');
var config = {
  apiKey: "AIzaSyCTXy3Pvx_0bWbDhjyJ4gYxz5gpRswvsxs",
  authDomain: "platformer-74c54.firebaseapp.com",
  databaseURL: "https://platformer-74c54.firebaseio.com/",
  storageBucket: "platformer-74c54.appspot.com",
  messagingSenderId: "583391834790",
};
firebase.initializeApp(config);
const LEVEL_COUNT = 4;

function Hero(game, x, y) {
    // call Phaser.Sprite constructor
    Phaser.Sprite.call(this, game, x, y, 'hero');
    this.animations.add('stop', [0]);
   this.animations.add('run', [1, 2], 8, true); // 8fps looped
   this.animations.add('jump', [3]);
   this.animations.add('fall', [4]);
    this.anchor.set(0.5, 0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    // if(this.position.x )

};
function Spider(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spider');
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    // anchor
    this.anchor.set(0.5);
    // animation
    this.animations.add('crawl', [0, 1, 2], 8, true);
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    this.animations.play('crawl');

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Spider.SPEED;
}

Spider.SPEED = 100;

// inherit from Phaser.Sprite
Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;
Spider.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Spider.SPEED; // turn left
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Spider.SPEED; // turn right
    }


};
Spider.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;
Hero.prototype.move = function(direction) {

    // this.x += direction * 2.5; // 2.5 pixels each frame
    const SPEED = 200;
    this.body.velocity.x = direction * SPEED;

    if (this.body.velocity.x < 0) {
     this.scale.x = -1;
 }
 else if (this.body.velocity.x > 0) {
     this.scale.x = 1;
 }
};
Hero.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};
Hero.prototype._getAnimationName = function () {
    let name = 'stop'; // default animation

    // jumping
    if (this.body.velocity.y < 0) {
        name = 'jump';
    }
    // falling
    else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
        name = 'fall';
    }
    else if (this.body.velocity.x !== 0 && this.body.touching.down) {
        name = 'run';
    }

    return name;
};
Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
};
Hero.prototype.jump = function () {
    const JUMP_SPEED = 600;
    let canJump = this.body.touching.down;

    if (canJump) {
        this.body.velocity.y = -JUMP_SPEED;
    }

    return canJump;
};
var sideScroll = {state: false};
var levelData = {};
function preload(){

    game.load.json('level00', 'data/level00.json');
    game.load.json('level01', 'data/level01.json');
    game.load.json('level02', 'data/level02.json');
    game.load.json('level03', 'data/level03.json');
 game.load.image('background', 'images/background.png');
   game.load.image('ground', 'images/ground.png');
   game.load.image('grass:8x1', 'images/grass_8x1.png');
   game.load.image('grass:6x1', 'images/grass_6x1.png');
   game.load.image('grass:4x1', 'images/grass_4x1.png');
   game.load.image('grass:2x1', 'images/grass_2x1.png');
   game.load.image('grass:1x1', 'images/grass_1x1.png');
   game.load.image('grass:1x3', 'images/grass_1x3.png');
   game.load.image('invisible-wall', 'images/invisible_wall.png');
   game.load.image('icon:coin', 'images/coin_icon.png');
   game.load.image('font:numbers', 'images/numbers.png');
   game.load.image('key', 'images/key.png');
   game.load.image('heart', 'images/heart.png', 10, 10);


   game.load.spritesheet('door', 'images/door.png', 42, 66);
   game.load.spritesheet('hero', 'images/hero.png', 36, 42);
   game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
   game.load.spritesheet('spider', 'images/spider.png', 42, 32);

   game.load.spritesheet('icon:key', 'images/key_icon.png', 34, 30);


   game.load.audio('sfx:jump', 'audio/jump.wav');
   game.load.audio('sfx:stomp', 'audio/stomp.wav');
   game.load.audio('sfx:coin', 'audio/coin.wav');
   game.load.audio('sfx:key', 'audio/key.wav');
 game.load.audio('sfx:door', 'audio/door.wav');

var ref = firebase.database().ref('/');
ref.on('value', function(snapshot) {
  levelData.level = snapshot.val().level;
  levelData.coins = snapshot.val().coins;
  levelData.levels = snapshot.val().levels;
  levelData.lives = snapshot.val().lives;
});
ref.once('value', function(snapshot) {
   levelData.levels = snapshot.val().levels;
  fileComplete(levelData)
});
}
function create(){
  game.load.onLoadStart.add(loadStart, this);
  game.load.onFileComplete.add(fileComplete, this);
  game.load.onLoadComplete.add(loadComplete, this);
}
function loadStart() {

}
function fileComplete(data) {
if(data.levels[data.level].coins){
  loadComplete(data);
} else {
  console.log(data)
}
}

function loadComplete(test) {
  console.log('Load Done!', test)
  game.state.start('main', true, false, {level: 0});

}
var ref = firebase.database().ref('/');
var mainState = {

    init: function(data) {
      this.coinPickupCount = levelData.coins;
      this.hasKey = false;

        this.keys = this.game.input.keyboard.addKeys({
          left: Phaser.KeyCode.LEFT,
          right: Phaser.KeyCode.RIGHT,
          up: Phaser.KeyCode.UP // add this line
        });

        this.keys.up.onDown.add(function () {
            let didJump = this.hero.jump();
            if (didJump) {
                this.sfx.jump.play();
            }
        }, this);
        this.game.renderer.renderSession.roundPixels = true;
        this.level = (data.level || 0) % LEVEL_COUNT;


    },
    _createHud : function () {

     let coinIcon = this.game.make.image(0, 0, 'icon:coin');
    this.hud = this.game.add.group();
    this.hearts = this.game.add.group();
    this.hud.position.set(10, 10);


    const NUMBERS_STR = '0123456789X ';
 this.coinFont = this.game.add.retroFont('font:numbers', 20, 26,
     NUMBERS_STR, 6);

     let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width,
        coinIcon.height / 2, this.coinFont);

    coinScoreImg.anchor.set(0, 0.5);
    var hearts = []
    var startPos = 915;
    for(var i = 0; i < levelData.lives; i++){
      startPos -= 50;
      let heartIcon = this.game.make.image(startPos, 10, 'heart');
      heartIcon.scale.setTo(0.35, 0.35);
      this.hud.add(heartIcon);
      this.hearts.add(heartIcon);
    }
    this.hud.add(coinScoreImg);
    this.hud.add(coinIcon);
},
addHeart: function(){
  let heartIcon = this.game.make.image(this.hearts.children[levelData.lives - 1].position.x - 50, 10, 'heart');
  heartIcon.scale.setTo(0.35, 0.35);
  this.hud.add(heartIcon);
  this.hearts.add(heartIcon);
  ref.update({lives: levelData.lives + 1});
},
    create: function() {
        this.game.add.image(0, 0, 'background');
        this._createHud();
        this.sideScroll = {state: false};
        this._loadLevel(levelData.levels[levelData.level]);
        // this._loadLevel(this.game.cache.getJSON('level:1'));
        this.sfx = {
     jump: this.game.add.audio('sfx:jump'),
     coin: this.game.add.audio('sfx:coin'),
     stomp: this.game.add.audio('sfx:stomp'),
     key: this.game.add.audio('sfx:key'),
        door: this.game.add.audio('sfx:door')

 };

    },

    _handleInput: function() {




        if (this.keys.left.isDown) { // move hero left
      // ...
      this.hero.move(-1);
  }
  else if (this.keys.right.isDown) { // move hero right
      // ...
      this.hero.move(1);
  }
  else { // stop
      this.hero.move(0);
  }
    },
    update: function() {
      this._handleCollisions();
  this._handleInput();
  this.coinFont.text = `x${this.coinPickupCount}`;
  // this.keyIcon.frame = this.hasKey ? 1 : 0;

if(this.hero.position.x <= 20){
if(levelData.level > 0){
  sideScroll.state = true;
  sideScroll.side = 'right';
  sideScroll.height = this.hero.position.y;
  ref.update({level: levelData.level - 1});
  this.game.state.restart(true, false, { level: this.level - 1 });
}
} else if(this.hero.position.x >= 900) {
  if(levelData.level < LEVEL_COUNT - 1){
  sideScroll.state = true;
  sideScroll.side = 'left';
  sideScroll.height = this.hero.position.y;
  ref.update({level: levelData.level + 1});
  this.game.state.restart(true, false, { level: this.level + 1 });
}

}

    },
    _spawnCharacters: function(data) {
        // spawn hero
        if(sideScroll.state === true){
          switch(sideScroll.side){
            case 'right':
            data.hero.x = 850;
            data.hero.y = sideScroll.height;
            break;
            case 'left':
            data.hero.x = 50;
            data.hero.y = sideScroll.height;
            break;
          }
        }
        this.hero = new Hero(this.game, data.hero.x, data.hero.y);
        this.game.add.existing(this.hero);
        if(data.spiders === undefined){
          data.spiders = [];
        }
        data.spiders.forEach(function (spider) {
          if(!spider.killed){
            let sprite = new Spider(this.game, spider.x, spider.y);
            this.spiders.add(sprite);
            sprite.data.id = spider.id;
          }
        }, this);
    },
    _spawnCoin : function (coin, coinId) {
      if(!coin.collected){

    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');
    sprite.data.id = coinId;
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
  }
},
    _loadLevel: function(data) {
      const GRAVITY = 1200;
      if(data.spiders === undefined){
        data.spiders = [];
      } else if( data.coins === undefined){
        data.coins = [];
      }
      this.coins = this.game.add.group();
      this.spiders = this.game.add.group();
      this.bgDecoration = this.game.add.group();
          this.enemyWalls = this.game.add.group();
          this.platforms = this.game.add.group();
        data.platforms.forEach(this._spawnPlatform, this);
        this._spawnCharacters({hero: data.hero, spiders: data.spiders});
        for(var i = 0; i < data.coins.length; i++){
          this._spawnCoin(data.coins[i], i);
        }
        // data.coins.forEach(this._spawnCoin, this);
    this.game.physics.arcade.gravity.y = GRAVITY;
    this.enemyWalls.visible = false;
    },

    _handleCollisions : function () {
    this.game.physics.arcade.collide(this.hero, this.platforms);
    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin,
    null, this);
    this.game.physics.arcade.collide(this.spiders, this.platforms);
       this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
       this.game.physics.arcade.overlap(this.hero, this.spiders,
       this._onHeroVsEnemy, null, this);

},
_onHeroVsEnemy : function (hero, enemy) {
  var enemyRef = firebase.database().ref('/levels/' + levelData.level + '/spiders/' + enemy.data.id );
  if (hero.body.velocity.y > 0) { // kill enemies when hero is falling
    hero.bounce();
    enemy.die()
        enemyRef.update({killed: true});
        this.sfx.stomp.play();
        this.coinPickupCount += 5;
        if(this.coinPickupCount >= 100){
          this.coinPickupCount -= 100;
          this.addHeart();
          ref.update({coins:this.coinPickupCount});
        } else {
          ref.update({coins:this.coinPickupCount});
        }


    }
    else { // game over -> restart the game
      var levels = [];
      for(var i = 0; i < LEVEL_COUNT;  i++){
        levels.push(game.cache.getJSON('level0' + i));
      }
        if(levelData.lives > 1){
          this.sfx.stomp.play();
          levelData.lives -= 1;
          ref.update({lives: levelData.lives});
          this.hearts.children[levelData.lives].kill();
          } else {
          this.sfx.stomp.play();
          this.game.state.restart(true, false, {level: this.level});
          for(var i = 0; i < levels.length; i ++){
            var levelRef = firebase.database().ref('levels/' + i);
            levelRef.update({coins:levels[i].coins, spiders: levels[i].spiders});
          }
          ref.update({level: 0});
          ref.update({lives: 3});
          ref.update({coins: 0});
        }
    }
},
_onHeroVsCoin :function (hero, coin) {
    coin.kill();
    var coinsRef = firebase.database().ref('/levels/' + levelData.level + '/coins/' + coin.data.id );
     coinsRef.update({collected: true});
     this.coinPickupCount++;
     if(this.coinPickupCount >= 100){
       this.sfx.coin.play();
       this.coinPickupCount -= 100;
       ref.update({coins:this.coinPickupCount});
       this.addHeart();
     } else {
    this.sfx.coin.play();
    ref.update({coins:this.coinPickupCount});
  }



},
_spawnEnemyWall : function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);

    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
},
    _spawnPlatform: function(platform) {
    // var sprite = this.game.add.sprite(platform.x, platform.y, platform.image);
    let sprite = this.platforms.create(
      platform.x, platform.y, platform.image);

        this.platforms.add(sprite);
        this.game.physics.enable(sprite);
        sprite.body.allowGravity = false;
        sprite.body.immovable = true;

        this._spawnEnemyWall(platform.x, platform.y, 'left');
   this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
    }



};

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState);



// Start the state to actually start the game
