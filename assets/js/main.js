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
const LEVEL_COUNT = 3;
var mainState = {
    preload: function() {
      this.game.load.json('level:0', 'data/level00.json');
      this.game.load.json('level:1', 'data/level01.json');
      this.game.load.json('level:2', 'data/level02.json');

      this.game.load.image('background', 'images/background.png');
        this.game.load.image('ground', 'images/ground.png');
        this.game.load.image('grass:8x1', 'images/grass_8x1.png');
        this.game.load.image('grass:6x1', 'images/grass_6x1.png');
        this.game.load.image('grass:4x1', 'images/grass_4x1.png');
        this.game.load.image('grass:2x1', 'images/grass_2x1.png');
        this.game.load.image('grass:1x1', 'images/grass_1x1.png');
        this.game.load.image('invisible-wall', 'images/invisible_wall.png');
        this.game.load.image('icon:coin', 'images/coin_icon.png');
        this.game.load.image('font:numbers', 'images/numbers.png');
        this.game.load.image('key', 'images/key.png');


        this.game.load.spritesheet('door', 'images/door.png', 42, 66);
        this.game.load.spritesheet('hero', 'images/hero.png', 36, 42);
        this.game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
        this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);

        this.game.load.spritesheet('icon:key', 'images/key_icon.png', 34, 30);


        this.game.load.audio('sfx:jump', 'audio/jump.wav');
        this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
        this.game.load.audio('sfx:coin', 'audio/coin.wav');
        this.game.load.audio('sfx:key', 'audio/key.wav');
  this.game.load.audio('sfx:door', 'audio/door.wav');


    },
    _spawnKey : function (x, y) {
    this.key = this.bgDecoration.create(x, y, 'key');
    this.key.anchor.set(0.5, 0.5);
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;
    this.key.y -= 3;
    this.game.add.tween(this.key)
        .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();
},
    init: function(data) {
      this.coinPickupCount = 0;
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
        console.log(this.level);


    },
    _createHud : function () {
    // let coinIcon = this.game.make.image(0, 0, 'icon:coin');
    this.keyIcon = this.game.make.image(0, 19, 'icon:key');
    this.keyIcon.anchor.set(0, 0.5);
    // ...
     let coinIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:coin');

    this.hud = this.game.add.group();
    this.hud.add(this.keyIcon);
    this.hud.add(coinIcon);
    this.hud.position.set(10, 10);

    const NUMBERS_STR = '0123456789X ';
 this.coinFont = this.game.add.retroFont('font:numbers', 20, 26,
     NUMBERS_STR, 6);

     let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width,
        coinIcon.height / 2, this.coinFont);
    coinScoreImg.anchor.set(0, 0.5);

    // ...
    this.hud.add(coinScoreImg);

},
    create: function() {

        this.game.add.image(0, 0, 'background');
        this._createHud();

        this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));
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
  this.keyIcon.frame = this.hasKey ? 1 : 0;


    },
    _spawnCharacters: function(data) {
        // spawn hero
        this.hero = new Hero(this.game, data.hero.x, data.hero.y);
        this.game.add.existing(this.hero);
        data.spiders.forEach(function (spider) {
       let sprite = new Spider(this.game, spider.x, spider.y);
       this.spiders.add(sprite);
   }, this);
    },
    _spawnCoin : function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
},
    _loadLevel: function(data) {
      const GRAVITY = 1200;
      this.coins = this.game.add.group();
      this.spiders = this.game.add.group();
      this.bgDecoration = this.game.add.group();
          this.enemyWalls = this.game.add.group();
          this.platforms = this.game.add.group();
        console.log(data);        data.platforms.forEach(this._spawnPlatform, this);
        this._spawnCharacters({hero: data.hero, spiders: data.spiders});

        data.coins.forEach(this._spawnCoin, this);
    this.game.physics.arcade.gravity.y = GRAVITY;
    this.enemyWalls.visible = false;
    this._spawnDoor(data.door.x, data.door.y);
    this._spawnKey(data.key.x, data.key.y);




    },
    _spawnDoor : function (x, y) {
    this.door = this.bgDecoration.create(x, y, 'door');
    this.door.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.door);
    this.door.body.allowGravity = false;
},
    _handleCollisions : function () {
    this.game.physics.arcade.collide(this.hero, this.platforms);
    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin,
    null, this);
    this.game.physics.arcade.collide(this.spiders, this.platforms);
       this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
       this.game.physics.arcade.overlap(this.hero, this.spiders,
       this._onHeroVsEnemy, null, this);
       this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey,
       null, this)
       this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
        // ignore if there is no key or the player is on air
        function (hero, door) {
            return this.hasKey && hero.body.touching.down;
        }, this);

},
_onHeroVsKey :function (hero, key) {
    this.sfx.key.play();
    key.kill();
    this.hasKey = true;
},
_onHeroVsDoor: function (hero, door) {
    this.sfx.door.play();
    // this.game.state.restart();
    this.game.state.restart(true, false, { level: this.level + 1 });

    // TODO: go to the next level instead
},
_onHeroVsEnemy : function (hero, enemy) {
  if (hero.body.velocity.y > 0) { // kill enemies when hero is falling
    hero.bounce();
    enemy.die()

        this.sfx.stomp.play();
    }
    else { // game over -> restart the game
        this.sfx.stomp.play();
        this.game.state.restart(true, false, {level: this.level});

        // this.game.state.restart();
    }
},
_onHeroVsCoin :function (hero, coin) {
    coin.kill();
    this.sfx.coin.play();
    this.coinPickupCount++;


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
var game = new Phaser.Game(920, 600, Phaser.AUTO, 'game');

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState);

// Start the state to actually start the game
game.state.start('main', true, false, {level: 0});
