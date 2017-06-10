function Hero(game, x, y) {
    // call Phaser.Sprite constructor
    Phaser.Sprite.call(this, game, x, y, 'hero');
    this.anchor.set(0.5, 0.5);

};

Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;
Hero.prototype.move = function(direction) {
    this.x += direction * 2.5; // 2.5 pixels each frame
};
var mainState = {
    preload: function() {
        this.game.load.image('background', 'images/background.png');
        this.game.load.json('level:1', 'data/level01.json');

        this.game.load.image('ground', 'images/ground.png');
        this.game.load.image('grass:8x1', 'images/grass_8x1.png');
        this.game.load.image('grass:6x1', 'images/grass_6x1.png');
        this.game.load.image('grass:4x1', 'images/grass_4x1.png');
        this.game.load.image('grass:2x1', 'images/grass_2x1.png');
        this.game.load.image('hero', 'images/hero_stopped.png');
        this.game.load.image('grass:1x1', 'images/grass_1x1.png');
    },
    init: function() {
        this.keys = this.game.input.keyboard.addKeys({
            left: Phaser.KeyCode.LEFT,
            right: Phaser.KeyCode.RIGHT
        });
    },
    create: function() {
        this.game.add.image(0, 0, 'background');

        this._loadLevel(this.game.cache.getJSON('level:1'));

    },

    _handleInput: function() {
        if (this.keys.left.isDown) { // move hero left
            this.hero.move(-1);
        } else if (this.keys.right.isDown) { // move hero right
            this.hero.move(1);
        }
    },
    update: function() {
        this._handleInput();
    },
    _spawnCharacters: function(data) {
        // spawn hero
        this.hero = new Hero(this.game, data.hero.x, data.hero.y);
        this.game.add.existing(this.hero);
    },
    _loadLevel: function(data) {
        console.log(data);
        data.platforms.forEach(this._spawnPlatform, this);
        this._spawnCharacters({
            hero: data.hero
        });


    },
    _spawnPlatform: function(platform) {
        this.game.add.sprite(platform.x, platform.y, platform.image);
    }



};
var game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState);

// Start the state to actually start the game
game.state.start('main');
