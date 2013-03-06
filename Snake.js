(function (window) {
    var _enum = {
        left: 1,
        right: 2,
        up: 3,
        down: 4
    }

    var Stage = function (canvas, rows, cols) {
        this.stageArr = [];
        this.rows = rows;
        this.cols = cols;
        this.can = document.getElementById(canvas);
        this.ctx = this.can.getContext("2d");
        this.bg = document.getElementById(canvas + "Bg");
        this.bgCtx = this.bg.getContext("2d");
        this.snake = new Snake(this);
        this.frame = 100;
        this.l = 10;
        this.can.width = this.cols * this.l;
        this.can.height = this.rows * this.l;
        this.bg.width = this.cols * this.l;
        this.bg.height = this.rows * this.l;
        this.blink = null;
        this.isPause = false;
        this.isOver = false;
        this.timerID = -1;
        this.Init();
    }

    Stage.prototype.Config = {
        SegColor: "#79BF5E",
        bgColor: "#D5DEDD"
    }

    Stage.prototype.Init = function () {
        var _self = this;

        this.ctx.fillStyle = this.Config.SegColor;
        this.bgCtx.fillStyle = this.Config.bgColor;
        document.body.addEventListener("keydown", function (e) {
            switch (e.keyCode) {
                case 37://left
                    if (_self.snake.direction != _enum.right)
                        _self.snake.ChangeDir(_enum.left);
                    break;
                case 38:
                    if (_self.snake.direction != _enum.down)
                        _self.snake.ChangeDir(_enum.up);
                    break;
                case 39:
                    if (_self.snake.direction != _enum.left)
                        _self.snake.ChangeDir(_enum.right);
                    break;
                case 40:
                    if (_self.snake.direction != _enum.up)
                        _self.snake.ChangeDir(_enum.down);
                    break;
            }
        }, false);

        for (var i = 0; i < this.rows; i++) {
            this.stageArr[i] = [];
            for (var j = 0; j < this.cols; j++) {
                this.stageArr[i][j] = 0;
            }
        }
    }

    Stage.prototype.InitLevel = function () {
        for (var i = 0; i < this.rows; i++) {
            this.stageArr[i] = [];
            for (var j = 0; j < this.cols; j++) {
                this.stageArr[i][j] = 0;
            }
        }

        var random = parseInt(Math.random() * 100);//create a random level
        switch (random % 4) {
            case 0:
                this.Level0();
                break;
            case 1:
                this.Level1();
                break;
            case 2:
                this.Level2();
                break;
            case 3:
                this.Level3();
                break;
        }
    }

    Stage.prototype.Level0 = function () {
        for (var i = 10; i < 35; i++) {
            this.stageArr[i][10] = 1;
            this.stageArr[i][40] = 1;
        }
    }

    Stage.prototype.Level1 = function () {
        for (var i = 10; i < 20; i++) {
            this.stageArr[10][i] = 1;
            this.stageArr[40][i] = 1;

            this.stageArr[10][i + 25] = 1;
            this.stageArr[40][i + 25] = 1;
        }
    }

    Stage.prototype.Level2 = function () {
        for (var i = 10; i < 35; i++) {
            this.stageArr[10][i] = 1;
            this.stageArr[40][i] = 1;
        }
    }

    Stage.prototype.Level3 = function () {
        for (var i = 10; i < 20; i++) {
            this.stageArr[i][10] = 1;
            this.stageArr[i][40] = 1;

            this.stageArr[i + 25][10] = 1;
            this.stageArr[i + 25][40] = 1;
        }
    }

    Stage.prototype.Start = function () {
        this.isOver = false;
        this.isPause = false;
        this.snake = new Snake(this);
        this.InitLevel();
        clearTimeout(this.timerID);
        this.NewBlink();
        this.Update();
    }

    Stage.prototype.Pause = function () {
        this.isPause = true;
    };

    Stage.prototype.Resume = function () {
        this.isPause = false;
    };

    Stage.prototype.Update = function () {
        var _self = this;
        if (!this.isPause) {
            this.Clear();
            this.BgClear();
            this.DrawBlink();
            this.snake.Update();
            this.DrawBg();
            this.snake.Draw();
        }
        if (!this.isOver) {
            this.timerID = setTimeout(function () {
                _self.Update();
            }, this.frame);
        } else {
            this.GameOver();
        }
    }

    Stage.prototype.Clear = function () {
        this.ctx.clearRect(0, 0, this.cols * this.l, this.rows * this.l);
    }

    Stage.prototype.BgClear = function () {
        this.bgCtx.clearRect(0, 0, this.cols * this.l, this.rows * this.l);
    }

    Stage.prototype.NewBlink = function () {
        var randomX = parseInt(Math.random() * this.rows);
        var randomY = parseInt(Math.random() * this.cols);
        while (this.stageArr[randomX][randomY] == 1) {
            randomX = parseInt(Math.random() * this.rows);
            randomY = parseInt(Math.random() * this.cols);
        }
        this.blink = new Segment(this.snake, randomX, randomY);
    }

    Stage.prototype.DrawBlink = function () {
        this.blink.Draw();
    }

    Stage.prototype.DrawBg = function () {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                if (this.stageArr[i][j] == 1) {
                    var x = j * this.l;
                    var y = i * this.l;
                    this.bgCtx.beginPath();
                    this.bgCtx.moveTo(x, y);
                    this.bgCtx.rect(x, y, this.l, this.l);
                    this.bgCtx.closePath();
                    this.bgCtx.fill();
                    this.bgCtx.stroke();
                }
            }
        }
    }

    Stage.prototype.GameOver = function () {
        alert("game over!");
    }

    var Snake = function (stage) {
        this.stage = stage;
        this.segments = [];
        this.direction = _enum.right;
        this.segments[0] = new Segment(this, 0, 0);
        this.segments[1] = new Segment(this, 0, 1);
        this.segments[2] = new Segment(this, 0, 2);
        this.segments[3] = new Segment(this, 0, 3);
        this.segments[4] = new Segment(this, 0, 4);
    }

    Snake.prototype.Draw = function () {
        for (var i = 0; i < this.segments.length; i++) {
            this.segments[i].Draw();
        }
    }

    Snake.prototype.ChangeDir = function (direction) {
        this.direction = direction;
    }

    Snake.prototype.Update = function () {
        var length = this.segments.length;
        var nextX = 0, nextY = 0;
        this.segments[length - 1].direction = this.direction;

        switch (this.segments[length - 1].direction) {
            case _enum.left:
                nextX = this.segments[length - 1].x;
                nextY = (this.segments[length - 1].y - 1 + this.stage.cols) % this.stage.cols;
                break;
            case _enum.right:
                nextX = this.segments[length - 1].x;
                nextY = (this.segments[length - 1].y + 1) % this.stage.cols;
                break;
            case _enum.up:
                nextX = (this.segments[length - 1].x - 1 + this.stage.rows) % this.stage.rows;
                nextY = this.segments[length - 1].y;
                break;
            case _enum.down:
                nextX = (this.segments[length - 1].x + 1) % this.stage.rows;
                nextY = this.segments[length - 1].y;
                break;
        }
        if (this.IsCollision(nextX, nextY)) {
            this.stage.isOver = true;
        } else if (this.CanEat(nextX, nextY)) {
            this.Eat();
        } else {
            for (var i = 0; i < length - 1; i++) {
                this.segments[i].x = this.segments[i + 1].x;
                this.segments[i].y = this.segments[i + 1].y;
                this.segments[i].direction = this.segments[i + 1].direction;
            }
            this.segments[length - 1].direction = this.direction;

            this.segments[length - 1].y = nextY;

            this.segments[length - 1].x = nextX;
        }
    }


    Snake.prototype.Eat = function () {
        this.stage.blink.direction = this.direction;
        this.segments.push(this.stage.blink);
        this.stage.NewBlink();
    }

    Snake.prototype.CanEat = function (x, y) {
        return x == this.stage.blink.x && y == this.stage.blink.y;
    }

    Snake.prototype.IsCollision = function (nextX, nextY) {
        if (this.stage.stageArr[nextX][nextY] == 1) {
            return true;
        }
        for (var i = 0; i < this.segments.length; i++) {
            if (this.segments[i].x == nextX && this.segments[i].y == nextY)
                return true;
        }
        return false;
    }

    var Segment = function (snake, x, y) {
        this.snake = snake;
        this.x = x;
        this.y = y;
        this.direction = _enum.right;
    }

    Segment.prototype.Draw = function () {
        var ctx = this.snake.stage.ctx;
        var l = this.snake.stage.l;
        var x = this.y * l;
        var y = this.x * l;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.rect(x, y, l, l);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    window.Snake = Stage;
})(window)
