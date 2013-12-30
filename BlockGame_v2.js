(function (window) {
    var _eventEnum = {
        pause: "pause",
        getScore: "getScore",
        gameover: "gameover",
        levelUp: "levelUp",
        newShape: "newShape"
    },
    _events = (function () {//Pub&Sub 
        var topics = {},
         uuid = 0,
         event = function () {
             this.listen = function (topic, callback) {
                 if (typeof topic !== "string" || typeof callback !== "function")
                     return this;
                 if (!topics[topic]) {
                     topics[topic] = [];
                 }
                 callback.uuid = uuid++;
                 topics[topic].push(callback);
                 return this;
             };
             this.trigger = function (src, topic, data) {
                 if (!topics[topic] || topics[topic].length === 0)
                     return this;
                 var callbacks = topics[topic],
                     i = 0,
                     length = callbacks.length;
                 for (; i < length; i++) {
                     callbacks[i].call(src, data);
                 }
                 return this;
             };
             this.remove = function (topic, callback) {
                 if (!topics[topic] || topics[topic].length === 0)
                     return this;
                 var callbacks = topics[topic],
                     i = 0,
                     length = callbacks.length;
                 for (; i < length; i++) {
                     if (callback.uuid === callbacks[i].uuid)
                         callbacks.splice(i, 1);
                 }
                 return this;
             };
         };
        return event;
    })();

    var _config = {
        levelCfg: [{ frame: 450, score: 100 }, { frame: 400, score: 300 }, { frame: 350, score: 600 },
            { frame: 300, score: 1000 }, { frame: 250, score: 1500 }, { frame: 200, score: 2100 },
            { frame: 150, score: 2800 }, { frame: 120, score: 3600 }, { frame: 100, score: 10000000 }],
        blockColors: ["yellow", "#9745D6", "#79BF5E", "#E06CAA", "#3ED6CF"],
        bgColor: "#D5DEDD"
    };

    var BlockGame = function (canvasId, cols, rows) {
        if (!(this instanceof BlockGame)) { // Allow instantiation without the 'new' keyword
            return new BlockGame(canvasId, cols, rows);
        }
        var _self = this;
        this.rows = rows;
        this.cols = cols;
        this.timerID = -1;
        this.events = new _events();

        this.shapeCan = document.getElementById(canvasId);
        this.shapeCtx = this.shapeCan.getContext("2d");
        this.bgCan = document.getElementById(canvasId + "Bg");
        this.bgCtx = this.bgCan.getContext("2d");

        this.blockLen = 15;
        this.shapeCan.width = this.cols * this.blockLen;
        this.shapeCan.height = this.rows * this.blockLen;
        this.bgCan.width = this.cols * this.blockLen;
        this.bgCan.height = this.rows * this.blockLen;

        document.body.addEventListener("keydown", function (e) {
            _self.KeydownHandler(e);
        }, false);
        document.body.addEventListener("keyup", function (e) {
            _self.KeyupHandler(e);
        }, false);
    };

    BlockGame.prototype.Start = function () {
        var _self = this;

        this.Init();

        this.Clear();
        this.ClearBg();

        this.CreateShape();

        clearTimeout(this.timerID);
        this.timerID = setTimeout(function () {
            _self.Update();
        }, this.frame);

    }

    BlockGame.prototype.Init = function () {
        var _self = this;
        this.level = 0;
        this.score = 0;

        this.isPause = false;
        this.isOver = false;
        this.shape = null;
        this.nextShape = null;

        this.frame = _config.levelCfg[this.level].frame;
        this.promoteScore = _config.levelCfg[this.level].score;
        this.bgCtx.fillStyle = _config.bgColor;

        this.blocksArr = [];
        for (var i = 0; i < this.rows; i++) {//Create stage array
            this.blocksArr[i] = [];
            for (var j = 0; j < this.cols; j++) {
                this.blocksArr[i][j] = 0;
            }
        }
    }

    BlockGame.prototype.ListenNewShapeEvents = function (fn) {
        this.events.listen(_eventEnum.newShape, fn);
        return this;
    }

    BlockGame.prototype.ListenGetscore = function (fn) {
        this.events.listen(_eventEnum.getScore, fn);
        return this;
    }

    BlockGame.prototype.ListenGameover = function (fn) {
        this.events.listen(_eventEnum.gameover, fn);
        return this;
    }

    BlockGame.prototype.ListenLevelUp = function (fn) {
        this.events.listen(_eventEnum.levelUp, fn);
        return this;
    }

    BlockGame.prototype.KeydownHandler = function (e) {
        switch (e.keyCode) {
            case 37:
                if (this.ShiftCollision(0, -1))
                    break;
                this.shape.Left();
                this.Draw();
                break;
            case 38:
                this.shape.Rotate(1);
                if (this.ShiftCollision(0, -1))
                    this.shape.Rotate(-1);
                this.Draw();
                break;
            case 39:
                if (this.ShiftCollision(0, 1))
                    break;
                this.shape.Right();
                this.Draw();
                break;
            case 40:
                this.frame = 20;
                break;
        }
    }

    BlockGame.prototype.KeyupHandler = function (e) {
        switch (e.keyCode) {
            case 40:
                this.frame = _config.levelCfg[this.level].frame;
                break;
        }
    }

    BlockGame.prototype.CreateShape = function () {
        if (this.nextShape != null) {
            this.shape = this.nextShape;
            this.nextShape = ShapeFactory.CreateShape(0, parseInt(this.blockLen / 2));
        } else {
            this.shape = ShapeFactory.CreateShape(0, parseInt(this.blockLen / 2));
            this.nextShape = ShapeFactory.CreateShape(0, parseInt(this.blockLen / 2));
        }
        if (this.ShiftCollision(0, 0)) {
            this.GameOver();
        }
        this.shapeCtx.fillStyle = this.shape.fillStyle;
        this.events.trigger(this, _eventEnum.newShape, this.nextShape);
    }

    BlockGame.prototype.Merge = function () {//merge shape blocks into background block array
        var i = j = x = y = score = 0,
            length = this.shape.blocks.length,
            flag = true,
            eliminateRows = 0;
        for (; i < length; i++) {
            x = this.shape.blocks[i].x;
            y = this.shape.blocks[i].y;
            if (x >= 0 && y >= 0 && x < this.rows && y < this.cols)
                this.blocksArr[x][y] = 1;
        }

        for (i = this.rows - 1; i >= 0; i--) {
            for (j = 0; j < this.cols - 1; j++) {//check whether all items in current have been filled
                if (this.blocksArr[i][j] == 0) {
                    flag = false
                    break;
                }
            }
            if (flag) {
                this.EliminateRow(i);
                eliminateRows++;
                i++;
            }
        }
        if (eliminateRows > 0) {//score: 5 15 35 60 105
            score = (10 * eliminateRows * (eliminateRows - 1) + 10) / 2;
            this.GetScore(score);
        }
    }

    BlockGame.prototype.GetScore = function (score) {
        this.score += score;
        this.events.trigger(this, _eventEnum.getScore, this.score);
        if (this.score > this.promoteScore) {
            this.LevelUp();
        }
    }

    BlockGame.prototype.LevelUp = function () {
        this.level++;
        this.frame = _config.levelCfg[this.level].frame;
        this.promoteScore = _config.levelCfg[this.level].score;
        this.events.trigger(this, _eventEnum.levelUp, this.level);
    }

    BlockGame.prototype.GameOver = function () {
        this.isOver = true;
        this.events.trigger(this, _eventEnum.gameover, null);
    }

    BlockGame.prototype.Pause = function () {
        this.isPause = true;
    }

    BlockGame.prototype.Resume = function () {
        this.isPause = false;
    }

    BlockGame.prototype.EliminateRow = function (index) {

        for (var i = index; i > 0; i--) {
            for (var j = 0; j < this.cols; j++) {
                this.blocksArr[i][j] = this.blocksArr[i - 1][j];
            }
        }
    }

    BlockGame.prototype.ShiftCollision = function (shiftX, shiftY) {//check whether collision after shift
        for (var i = 0; i < this.shape.blocks.length; i++) {
            var x = this.shape.blocks[i].x;
            var y = this.shape.blocks[i].y;
            if (x >= 0 && (x + shiftX >= this.blocksArr.length || y + shiftY < 0
                || y + shiftY >= this.blocksArr[0].length || this.blocksArr[x + shiftX][y + shiftY] == 1))
                return true;
        }
        return false;
    }

    BlockGame.prototype.Update = function () {
        var _self = this;
        if (this.isPause)
            return;
        if (this.ShiftCollision(1, 0)) {
            this.Merge();
            this.DrawBg();
            this.CreateShape()
        } else {
            this.shape.Down();
        }
        if (!this.isOver) {
            this.Draw();
            //this.DrawBg();
            this.timerID = setTimeout(function () {
                _self.Update();
            }, this.frame);
        }
    }

    BlockGame.prototype.Draw = function () {
        this.Clear();
        var blocks = this.shape.blocks;
        var l = this.blockLen;
        var ctx = this.shapeCtx;
        for (var i = 0; i < blocks.length; i++) {
            var y = blocks[i].x * l;
            var x = blocks[i].y * l;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.rect(x, y, l, l);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }

    BlockGame.prototype.DrawBg = function () {
        this.ClearBg();
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                if (this.blocksArr[i][j] == 1)
                    this.FillBlock(i, j, this.blockLen);
            }
        }
    }

    BlockGame.prototype.Clear = function () {
        this.shapeCtx.clearRect(0, 0, this.shapeCan.width, this.shapeCan.height);
    }

    BlockGame.prototype.ClearBg = function () {
        this.bgCtx.clearRect(0, 0, this.shapeCan.width, this.shapeCan.height);
    }

    BlockGame.prototype.FillBlock = function (y, x, l) {
        x = x * l;
        y = y * l;
        this.bgCtx.beginPath();
        this.bgCtx.moveTo(x, y);
        this.bgCtx.rect(x, y, l, l);
        this.bgCtx.closePath();
        this.bgCtx.fill();
        this.bgCtx.stroke();
    }

    Function.prototype.InheritFrom = function (parentFn) {//make every function inheritable
        if (typeof parentFn === "function") {
            if (arguments.length > 1) {
                var pStr = "new parentFn(";
                for (var i = 1; i < arguments.length; i++) {
                    pStr += arguments[i];
                    if (i != arguments.length - 1)
                        pStr += ",";
                }
                pStr += ")";
                this.prototype = eval(pStr);
            } else {
                this.prototype = new parentFn();
            }

            this.prototype.constructor = this;
        } else {
            this.prototype = parentFn;
            this.prototype.constructor = this;
        }
    }

    var Block = function (x, y) {
        this.x = x;
        this.y = y;
    }

    var ShapeFactory = (function () {//absolute factory
        var ShapeArr = [];
        return {
            CreateShape: function (x, y) {//create a random shape
                var random = Math.floor(Math.random() * 100);
                return new ShapeArr[random % ShapeArr.length](x, y);
            },
            AddShape: function (shape) {
                ShapeArr.push(shape);
            }
        };
    })();

    var Shape = function () { };

    Shape.prototype.Init = function () {
        this.blocks = [];
        var random = parseInt(Math.random() * 100);
        this.status = random % 4;
        eval("this.st" + this.status + "()");
        this.fillStyle = _config.blockColors[random % _config.blockColors.length];
    }

    Shape.prototype.Down = function () {
        this.x += 1;
        for (var i = 0; i < this.blocks.length; i++) {
            this.blocks[i].x += 1;
        }
    }

    Shape.prototype.Left = function () {
        this.y -= 1;
        for (var i = 0; i < this.blocks.length; i++) {
            this.blocks[i].y -= 1;
        }
    }

    Shape.prototype.Right = function () {
        this.y += 1
        for (var i = 0; i < this.blocks.length; i++) {
            this.blocks[i].y += 1;
        }
    }

    Shape.prototype.st0 = function () { };//abstract method
    Shape.prototype.st1 = function () { };
    Shape.prototype.st2 = function () { };
    Shape.prototype.st3 = function () { };
    Shape.prototype.Rotate = function (i) {
        var st = (this.status + i) % 4;
        this.status = st;
        switch (st) {
            case 0:
                this.st0();
                break;
            case 1:
                this.st1();
                break;
            case 2:
                this.st2();
                break;
            case 3:
                this.st3();
                break;
            default:
                this.st0();
                break;
        }

    }

    var Triangle = function (x, y) {
        this.x = x;
        this.y = y;
        this.Init();
    };
    Triangle.InheritFrom(Shape, null, null);
    ShapeFactory.AddShape(Triangle);

    Triangle.prototype.st0 = function () {
        this.blocks[0] = new Block(this.x - 1, this.y, 1);
        this.blocks[1] = new Block(this.x, this.y - 1, 1);
        this.blocks[2] = new Block(this.x, this.y, 1);
        this.blocks[3] = new Block(this.x, this.y + 1, 1);
    }

    Triangle.prototype.st1 = function () {
        this.blocks[0] = new Block(this.x, this.y + 1, 1);
        this.blocks[1] = new Block(this.x - 1, this.y, 1);
        this.blocks[2] = new Block(this.x, this.y, 1);
        this.blocks[3] = new Block(this.x + 1, this.y, 1);
    }

    Triangle.prototype.st2 = function () {
        this.blocks[0] = new Block(this.x + 1, this.y, 1);
        this.blocks[1] = new Block(this.x, this.y + 1, 1);
        this.blocks[2] = new Block(this.x, this.y, 1);
        this.blocks[3] = new Block(this.x, this.y - 1, 1);
    }

    Triangle.prototype.st3 = function () {
        this.blocks[0] = new Block(this.x, this.y - 1, 1);
        this.blocks[1] = new Block(this.x + 1, this.y, 1);
        this.blocks[2] = new Block(this.x, this.y, 1);
        this.blocks[3] = new Block(this.x - 1, this.y, 1);
    }

    var Line = function (x, y) {
        this.x = x;
        this.y = y;
        this.Init();
    }
    Line.InheritFrom(Shape, null, null);
    ShapeFactory.AddShape(Line);

    Line.prototype.st0 = function () {
        this.blocks[0] = new Block(this.x, this.y - 2, 1);
        this.blocks[1] = new Block(this.x, this.y - 1, 1);
        this.blocks[2] = new Block(this.x, this.y, 1);
        this.blocks[3] = new Block(this.x, this.y + 1, 1);
        this.blocks[4] = new Block(this.x, this.y + 2, 1);
    }

    Line.prototype.st1 = function () {
        this.blocks[0] = new Block(this.x - 2, this.y, 1);
        this.blocks[1] = new Block(this.x - 1, this.y, 1);
        this.blocks[2] = new Block(this.x, this.y, 1);
        this.blocks[3] = new Block(this.x + 1, this.y, 1);
        this.blocks[4] = new Block(this.x + 2, this.y, 1);
    }

    Line.prototype.st2 = function () {
        this.st0();
    }

    Line.prototype.st3 = function () {
        this.st1();
    }

    var Square = function (x, y) {
        this.x = x;
        this.y = y;
        this.Init();
    }
    Square.InheritFrom(Shape, null, null);
    ShapeFactory.AddShape(Square);

    Square.prototype.st0 = function () {
        this.blocks[0] = new Block(this.x, this.y);
        this.blocks[1] = new Block(this.x, this.y + 1);
        this.blocks[2] = new Block(this.x + 1, this.y + 1);
        this.blocks[3] = new Block(this.x + 1, this.y);
    }

    Square.prototype.st1 = function () {
        this.st0();
    }

    Square.prototype.st2 = function () {
        this.st0();
    }

    Square.prototype.st3 = function () {
        this.st0();
    }

    var Cross = function (x, y) {
        this.x = x;
        this.y = y;
        this.Init();
    }
    Cross.InheritFrom(Shape, null, null);
    ShapeFactory.AddShape(Cross);

    Cross.prototype.st0 = function () {
        this.blocks[0] = new Block(this.x, this.y);
        this.blocks[1] = new Block(this.x, this.y + 1);
        this.blocks[2] = new Block(this.x + 1, this.y + 1);
        this.blocks[3] = new Block(this.x + 1, this.y);
    }

    Cross.prototype.st1 = function () {
        this.st0();
    }

    Cross.prototype.st2 = function () {
        this.st0();
    }

    Cross.prototype.st3 = function () {
        this.st0();
    }

    var LShape = function (x, y) {
        this.x = x;
        this.y = y;
        this.Init();
    }
    LShape.InheritFrom(Shape, null, null);
    ShapeFactory.AddShape(LShape);

    LShape.prototype.st0 = function () {
        this.blocks[0] = new Block(this.x, this.y);
        this.blocks[1] = new Block(this.x, this.y - 1);
        this.blocks[2] = new Block(this.x, this.y + 1);
        this.blocks[3] = new Block(this.x - 1, this.y - 1);
    }

    LShape.prototype.st1 = function () {
        this.blocks[0] = new Block(this.x, this.y);
        this.blocks[1] = new Block(this.x - 1, this.y);
        this.blocks[2] = new Block(this.x + 1, this.y);
        this.blocks[3] = new Block(this.x + 1, this.y - 1);
    }

    LShape.prototype.st2 = function () {
        this.blocks[0] = new Block(this.x, this.y);
        this.blocks[1] = new Block(this.x, this.y - 1);
        this.blocks[2] = new Block(this.x, this.y + 1);
        this.blocks[3] = new Block(this.x + 1, this.y + 1);
    }

    LShape.prototype.st3 = function () {
        this.blocks[0] = new Block(this.x - 1, this.y + 1, 1);
        this.blocks[1] = new Block(this.x + 1, this.y, 1);
        this.blocks[2] = new Block(this.x, this.y, 1);
        this.blocks[3] = new Block(this.x - 1, this.y, 1);
    }

    var PositiveL = function (x, y) {
        this.x = x;
        this.y = y;
        this.Init();
    }
    PositiveL.InheritFrom(Shape, null, null);
    ShapeFactory.AddShape(PositiveL);

    PositiveL.prototype.st0 = function () {
        this.blocks[0] = new Block(this.x, this.y);
        this.blocks[1] = new Block(this.x, this.y - 1);
        this.blocks[2] = new Block(this.x, this.y + 1);
        this.blocks[3] = new Block(this.x - 1, this.y + 1);
    }

    PositiveL.prototype.st1 = function () {
        this.blocks[0] = new Block(this.x, this.y);
        this.blocks[1] = new Block(this.x - 1, this.y);
        this.blocks[2] = new Block(this.x + 1, this.y);
        this.blocks[3] = new Block(this.x - 1, this.y - 1);
    }

    PositiveL.prototype.st2 = function () {
        this.blocks[0] = new Block(this.x, this.y);
        this.blocks[1] = new Block(this.x, this.y - 1);
        this.blocks[2] = new Block(this.x, this.y + 1);
        this.blocks[3] = new Block(this.x + 1, this.y - 1);
    }

    PositiveL.prototype.st3 = function () {
        this.blocks[0] = new Block(this.x, this.y);
        this.blocks[1] = new Block(this.x - 1, this.y);
        this.blocks[2] = new Block(this.x + 1, this.y);
        this.blocks[3] = new Block(this.x + 1, this.y + 1);
    }

    window.BlockGame = BlockGame;
})(window)

