(function (window) {
    var _eventEnum = {
        pause: 0,
        getScore: 1,
        gameover: 2,
        levelUp: 3,
        newShape: 4
    };

    var BlockGame = function (canvasId, cols, rows) {
        var _self = this;
        this.timerID = -1;
        this.getScoreEvents = [];
        this.gameoverEvents = [];
        this.levelUpEvents = [];
        this.newShapeEvents = [];
        this.rows = rows;
        this.cols = cols;
        this.blocksArr = [];
        this.shape = null;
        this.nextShape = null;
        this.shapeCan = document.getElementById(canvasId);
        this.shapeCtx = this.shapeCan.getContext("2d");
        this.bgCan = document.getElementById(canvasId + "Bg");
        this.bgCtx = this.bgCan.getContext("2d");
        this.blockLen = 15;
        this.shapeCan.width = this.cols * this.blockLen;
        this.shapeCan.height = this.rows * this.blockLen;
        this.bgCan.width = this.cols * this.blockLen;
        this.bgCan.height = this.rows * this.blockLen;
        this.level = 0;
        this.score = 0;
        document.body.addEventListener("keydown", function (e) {
            _self.KeydownHandler(e);
        }, false);
        document.body.addEventListener("keyup", function (e) {
            _self.KeyupHandler(e);
        }, false);
    };

    BlockGame.prototype.Config = {
        levelCfg: [{ frame: 450, score: 100 }, { frame: 400, score: 300 }, { frame: 350, score: 600 },
            { frame: 300, score: 1000 }, { frame: 250, score: 1500 }, { frame: 200, score: 2100 },
            { frame: 150, score: 2800 }, { frame: 120, score: 3600 }, { frame: 100, score: 10000000 }],
        blockColors: ["yellow", "#9745D6", "#79BF5E", "#E06CAA", "#3ED6CF"],
        bgColor: "#D5DEDD"
    }

    BlockGame.prototype.Start = function () {
        var _self = this;
        this.level = 0;
        this.score = 0;
        this.isPause = false;
        this.isOver = false;
        this.Init();
        this.GetNextShape();
        
        clearTimeout(this.timerID);
        this.Clear();
        this.ClearBg();
        this.timerID = setTimeout(function () {
            _self.Draw();
        }, this.frame);

    }

    BlockGame.prototype.Init = function () {
        var _self = this;
        this.frame = this.Config.levelCfg[this.level].frame;
        this.promoteScore = this.Config.levelCfg[this.level].score;
        this.bgCtx.fillStyle = this.Config.bgColor;
        for (var i = 0; i < this.rows; i++) {
            this.blocksArr[i] = [];
            for (var j = 0; j < this.cols; j++) {
                this.blocksArr[i][j] = 0;
            }
        }
    }

    BlockGame.prototype.TriggerEvent = function (type) {//invoke corresponding event handlers
        switch (type) {
            case _eventEnum.getScore:
                for (var i = 0; i < this.getScoreEvents.length; i++) {
                    if (typeof this.getScoreEvents[i] == "function") {
                        this.getScoreEvents[i].call(this, this.score);
                    }
                }
                break;
            case _eventEnum.gameover:
                for (var i = 0; i < this.gameoverEvents.length; i++) {
                    if (typeof this.gameoverEvents[i] == "function") {
                        this.gameoverEvents[i].call(this, this.score);
                    }
                }
                break;
            case _eventEnum.levelUp:
                for (var i = 0; i < this.levelUpEvents.length; i++) {
                    if (typeof this.levelUpEvents[i] == "function") {
                        this.levelUpEvents[i].call(this, this.level);
                    }
                }
                break;
            case _eventEnum.newShape:
                for (var i = 0; i < this.newShapeEvents.length; i++) {
                    if (typeof this.newShapeEvents[i] == "function") {
                        this.newShapeEvents[i].call(this, this.nextShape);
                    }
                }
                break;
        }
    }

    BlockGame.prototype.ListenNewShapeEvents = function (fn) {
        this.newShapeEvents.push(fn);
    }

    BlockGame.prototype.ListenGetscore = function (fn) {
        this.getScoreEvents.push(fn);
    }

    BlockGame.prototype.ListenGameover = function (fn) {
        this.gameoverEvents.push(fn);
    }

    BlockGame.prototype.ListenLevelUp = function (fn) {
        this.levelUpEvents.push(fn);
    }

    BlockGame.prototype.KeydownHandler = function (e) {
        switch (e.keyCode) {
            case 37:
                this.Clear();
                this.shape.Left();
                this.shape.Draw(this.shapeCtx, this.blockLen);
                break;
            case 38:
                this.Clear();
                this.shape.Rotate();
                this.shape.Draw(this.shapeCtx, this.blockLen);
                break;
            case 39:
                this.Clear();
                this.shape.Right();
                this.shape.Draw(this.shapeCtx, this.blockLen);
                break;
            case 40:
                this.frame = 20;
                break;
        }
    }

    BlockGame.prototype.KeyupHandler = function (e) {
        switch (e.keyCode) {
            //case 37:

            //    break;
            //case 38:

            //    break;
            //case 39:

            //    break;
            case 40:
                this.frame = this.Config.levelCfg[this.level].frame;
                break;
        }
    }

    BlockGame.prototype.GetNextShape = function () {
        if (this.nextShape != null) {
            this.shape = this.nextShape;
            this.nextShape = ShapeFactory.CreateShape(this.blocksArr, this);
        } else {
            this.shape = ShapeFactory.CreateShape(this.blocksArr, this);
            this.nextShape = ShapeFactory.CreateShape(this.blocksArr, this);
        }
        if (this.shape.ShiftCollision(0, 0)) {
            this.GameOver();
        }
        this.shapeCtx.fillStyle = this.shape.fillStyle;
        this.TriggerEvent(_eventEnum.newShape);
    }

    BlockGame.prototype.Merge = function () {//merge shape blocks into block array
        for (var i = 0; i < this.shape.blocks.length; i++) {
            var x = this.shape.blocks[i].x;
            var y = this.shape.blocks[i].y;
            if (x >= 0 && y >= 0 && x < this.rows && y < this.cols)
                this.blocksArr[x][y] = 1;
        }

        var eliminateRows = 0;

        for (var i = this.rows - 1; i >= 0; i--) {
            var flag = true;
            for (var j = 0; j < this.cols - 1; j++) {
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
            var score = (10 * eliminateRows * (eliminateRows - 1) + 10) / 2;
            this.GetScore(score);
        }
    }

    BlockGame.prototype.GetScore = function (score) {
        this.score += score;
        this.TriggerEvent(_eventEnum.getScore);
        if (this.score > this.promoteScore) {
            this.LevelUp();
        }
    }

    BlockGame.prototype.LevelUp = function () {
        this.level++;
        this.frame = this.Config.levelCfg[this.level].frame;
        this.promoteScore = this.Config.levelCfg[this.level].score;
        this.TriggerEvent(_eventEnum.levelUp);
    }

    BlockGame.prototype.GameOver = function () {
        this.isOver = true;
        this.TriggerEvent(_eventEnum.gameover);
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

    BlockGame.prototype.Draw = function () {
        var _self = this;
        if (!this.isPause) {
            this.shape.Down();
        }
        if (!this.isOver) {
            this.timerID = setTimeout(function () {
                _self.Draw();
            }, this.frame);
        }
    }

    BlockGame.prototype.DrawStaticBlock = function () {
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
            var pStr = "new parentFn()";
            if (arguments.length > 1) {
                pStr = "new parentFn(";
                for (var i = 1; i < arguments.length; i++) {
                    pStr += arguments[i];
                    if (i != arguments.length - 1)
                        pStr += ",";
                }
                pStr += ")";
            }
            this.prototype = eval(pStr);
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

    var ShapeFactory = {
        CreateShape: function (blocksArr, game) {
            var random = Math.floor(Math.random() * 100);
            switch (random % 5) {
                case 0:
                    var s = new Triangle(blocksArr, game)
                    s.Init();
                    return s;
                case 1:
                    var s = new Line(blocksArr, game)
                    s.Init();
                    return s;
                case 2:
                    var s = new Square(blocksArr, game)
                    s.Init();
                    return s;
                case 3:
                    var s = new LShape(blocksArr, game)
                    s.Init();
                    return s;
                case 4:
                    var s = new PositiveL(blocksArr, game)
                    s.Init();
                    return s;
            }
        }
    }

    var Shape = function (blocksArr, game) { };

    Shape.prototype.Init = function () {
        this.blocks = [];
        var random = parseInt(Math.random() * 100);
        this.status = random % 4;
        eval("this.st" + this.status + "()");
        this.fillStyle = this.game.Config.blockColors[random % this.game.Config.blockColors.length];
    }

    Shape.prototype.ShiftCollision = function (shiftX, shiftY) {
        for (var i = 0; i < this.blocks.length; i++) {
            var x = this.blocks[i].x;
            var y = this.blocks[i].y;
            if (x >= 0 && (x + shiftX >= this.blocksArr.length || y + shiftY < 0
                || y + shiftY >= this.blocksArr[0].length || this.blocksArr[x + shiftX][y + shiftY] == 1))
                return true;
        }
        return false;
    }

    Shape.prototype.Collision = function () {
        for (var i = 0; i < this.blocks.length; i++) {
            var x = this.blocks[i].x;
            var y = this.blocks[i].y;
            if (this.blocksArr[x] == null || this.blocksArr[x][y] == null || this.blocksArr[x][y] == 1)
                return true;
        }
        return false;
    }

    Shape.prototype.Down = function () {
        if (this.ShiftCollision(1, 0)) {
            this.game.Merge();
            this.game.DrawStaticBlock();
            this.game.GetNextShape()
            return;
        }
        this.x += 1;
        for (var i = 0; i < this.blocks.length; i++) {
            this.blocks[i].x += 1;
        }
        this.game.Clear();
        this.Draw(this.game.shapeCtx, this.game.blockLen);
    }

    Shape.prototype.Left = function () {
        if (this.ShiftCollision(0, -1))
            return;
        this.y -= 1;
        for (var i = 0; i < this.blocks.length; i++) {
            this.blocks[i].y -= 1;
        }
    }

    Shape.prototype.Right = function () {
        if (this.ShiftCollision(0, 1))
            return;
        this.y += 1
        for (var i = 0; i < this.blocks.length; i++) {
            this.blocks[i].y += 1;
        }
    }

    Shape.prototype.Draw = function (ctx, l) {
        for (var i = 0; i < this.blocks.length; i++) {
            this.FillBlock(this.blocks[i], ctx, l);
        }
    }

    Shape.prototype.FillBlock = function (block, ctx, l) {
        var y = block.x * l;
        var x = block.y * l;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.rect(x, y, l, l);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    Shape.prototype.st0 = function () { };//abstract method
    Shape.prototype.st1 = function () { };
    Shape.prototype.st2 = function () { };
    Shape.prototype.st3 = function () { };
    Shape.prototype.Rotate = function () {
        switch (this.status) {
            case 0:
                this.st1();
                if (this.ShiftCollision(0, 0)) {
                    this.st0();
                } else {
                    this.status = 1;
                }
                break;
            case 1:
                this.st2();
                if (this.ShiftCollision(0, 0)) {
                    this.st1();
                } else {
                    this.status = 2;
                }
                break;
            case 2:
                this.st3();
                if (this.ShiftCollision(0, 0)) {
                    this.st2();
                } else {
                    this.status = 3;
                }
                break;
            case 3:
                this.st0();
                if (this.ShiftCollision(0, 0)) {
                    this.st3();
                } else {
                    this.status = 0;
                }
                break;
        }
    }

    var Triangle = function (blocksArr, game) {
        this.x = -1;
        this.y = Math.floor(blocksArr[0].length / 2);
        this.blocksArr = blocksArr;
        this.game = game;
    };
    Triangle.InheritFrom(Shape, null, null);

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

    var Line = function (blocksArr, game) {
        this.x = -1;
        this.y = Math.floor(blocksArr[0].length / 2);
        this.blocksArr = blocksArr;
        this.game = game;
    }
    Line.InheritFrom(Shape, null, null);

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

    var Square = function (blocksArr, game) {
        this.x = -1;
        this.y = Math.floor(blocksArr[0].length / 2);
        this.blocksArr = blocksArr;
        this.game = game;
    }
    Square.InheritFrom(Shape, null, null);

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

    var Cross = function (blocksArr, game) {
        this.x = -1;
        this.y = Math.floor(blocksArr[0].length / 2);
        this.blocksArr = blocksArr;
        this.game = game;
    }
    Cross.InheritFrom(Shape, null, null);

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

    var LShape = function (blocksArr, game) {
        this.x = -1;
        this.y = Math.floor(blocksArr[0].length / 2);
        this.blocksArr = blocksArr;
        this.game = game;
    }
    LShape.InheritFrom(Shape, null, null);
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

    var PositiveL = function (blocksArr, game) {
        this.x = -1;
        this.y = Math.floor(blocksArr[0].length / 2);
        this.blocksArr = blocksArr;
        this.game = game;
    }
    PositiveL.InheritFrom(Shape, null, null);
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
