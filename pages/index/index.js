Page({
    data: {
        score: 0,
        maxscore: 0,
        board: [],
        hasConflicted: [],
        start: [],
        end: [],
        isShow: 'none'
    },

    onLoad () {
        this.newGame();
    },
    
    //开始游戏
    newGame () {
        this.setData({isShow: 'none'});
        this.setData({score: 0});

        let maxscore = wx.getStorageSync('maxscore') || 0;
        this.setData({maxscore});

        this.init();
        this.resetConflicted();
        this.generateOneNumber();
        this.generateOneNumber();
    },

    //初始化
    init () {
        for (let i=0; i<4; i++) {
            this.data.board[i] = [];
            for (let j=0; j<4; j++) {
                this.data.board[i][j] = 0;
            }
        }
    },

    //重置hasConflicted
    resetConflicted () {
        for (let i=0; i<4; i++) {
            this.data.hasConflicted[i] = [];
            for (let j=0; j<4; j++) {
                this.data.hasConflicted[i][j] = false;
            }
        }
    },

    //生成随机数
    generateOneNumber () {
        let arr = this.data.board;
        //生成随机数
        let num = Math.random() < 0.8 ? 2: 4;

        //生成随机数位置
        let zeros = [];
        for (let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                if (arr[i][j] === 0) zeros.push([i, j]);
            }
        }
        let position = zeros[Math.floor(Math.random() * zeros.length)];
        arr[position[0]][position[1]] = num;
        this.setData({board: arr});
    },

    onTouchStart (event) {
        this.setData({start: [event.touches[0].pageX, event.touches[0].pageY]});
    },

    onTouchMove (event) {
        this.setData({end: [event.touches[0].pageX, event.touches[0].pageY]});
    },

    onTouchEnd (event) {
        let moveX = this.data.end[0] - this.data.start[0];
        let moveY = this.data.end[1] - this.data.start[1];
        if (Math.abs(moveX) < 5 && Math.abs(moveY) < 5) return;
        let direction = this.getDirection(moveX, moveY);
        if (this.moveAll(direction)) {
            if (this.data.score > this.data.maxscore) {
                this.setData({maxscore: this.data.score});
                wx.setStorageSync('maxscore', this.data.score);
            }
            this.resetConflicted();
            this.generateOneNumber();
            this.isGameOver();
        }
    },

    getDirection (moveX, moveY) {
        if (Math.abs(moveX) > Math.abs(moveY)) return moveX > 0 ? 'right': 'left';
        return moveY > 0 ? 'down' : 'up';
    },

    moveAll (direction) {
        switch (direction) {
            case 'left':
                return this.moveLeft();
                break;
            case 'right':
                return this.moveRight();
                break;
            case 'up':
                return this.moveUp();
                break;
            case 'down':
                return this.moveDown();
                break;
        }
    },

    moveLeft () {
        let arr = this.data.board;
        let hasConflicted = this.data.hasConflicted;
        let change = false;
        for (let i=0; i<4; i++) {
            for (let j=1; j<4; j++) {
                if (arr[i][j] === 0) continue;
                for (let k=0; k<j; k++) {
                    if (arr[i][k] === 0 && this.noBlokCol(i, k, j, arr)) {
                        arr[i][k] = arr[i][j];
                        arr[i][j] = 0;
                        change = true;
                    } else if (arr[i][k] === arr[i][j] && this.noBlokCol(i, k, j, arr) && !hasConflicted[i][k]) {
                        arr[i][k] += arr[i][j];
                        arr[i][j] = 0;
                        this.setData({score: this.data.score + arr[i][k]});
                        change = true;
                        hasConflicted[i][k] = true;
                    }
                }
            }
        }
        this.setData({board: arr});
        return change;
    },

    moveRight () {
        let arr = this.data.board;
        let hasConflicted = this.data.hasConflicted;
        let change = false;
        for (let i=0; i<4; i++) {
            for (let j=2; j>=0; j--) {
                if (arr[i][j] === 0) continue;
                for (let k=3; k>j; k--) {
                    if (arr[i][k] === 0 && this.noBlokCol(i, j, k, arr)) {
                        arr[i][k] = arr[i][j];
                        arr[i][j] = 0;
                        change = true;
                    } else if (arr[i][k] === arr[i][j] && this.noBlokCol(i, j, k, arr) && !hasConflicted[i][k]) {
                        arr[i][k] += arr[i][j];
                        arr[i][j] = 0;
                        this.setData({score: this.data.score + arr[i][k]});
                        change = true;
                        hasConflicted[i][k] = true;
                    }
                }
            }
        }
        this.setData({board: arr});
        return change;
    },

    moveUp () {
        let arr = this.data.board;
        let hasConflicted = this.data.hasConflicted;
        let change = false;
        for (let j=0; j<4; j++) {
            for (let i=1; i<4; i++) {
                if (arr[i][j] === 0) continue;
                for (let k=0; k<i; k++) {
                    if (arr[k][j] === 0 && this.noBlokRow(j, k, i, arr)) {
                        arr[k][j] = arr[i][j];
                        arr[i][j] = 0;
                        change = true;
                    } else if (arr[k][j] === arr[i][j] && this.noBlokRow(j, k, i, arr) && !hasConflicted[k][j]) {
                        arr[k][j] += arr[i][j];
                        arr[i][j] = 0;
                        this.setData({score: this.data.score + arr[k][j]});
                        change = true;
                        hasConflicted[k][j] = true;
                    }
                }
            }
        }
        this.setData({board: arr});
        return change;
    },

    moveDown () {
        let arr = this.data.board;
        let hasConflicted = this.data.hasConflicted;
        let change = false;
        for (let j=0; j<4; j++) {
            for (let i=2; i>=0; i--) {
                if (arr[i][j] === 0) continue;
                for (let k=3; k>i; k--) {
                    if (arr[k][j] === 0 && this.noBlokRow(j, i, k, arr)) {
                        arr[k][j] = arr[i][j];
                        arr[i][j] = 0;
                        change = true;
                    } else if (arr[k][j] === arr[i][j] && this.noBlokRow(j, i, k, arr) && !hasConflicted[k][j]) {
                        arr[k][j] += arr[i][j];
                        arr[i][j] = 0;
                        this.setData({score: this.data.score + arr[k][j]});
                        change = true;
                        hasConflicted[k][j] = true;
                    }
                }
            }
        }
        this.setData({board: arr});
        return change;
    },

    noBlokCol (row, col1, col2, arr) {
        for (var i=col1+1; i<col2; i++) {
            if (arr[row][i] !== 0) return false;
        }
        return true;
    },

    noBlokRow (col, row1, row2, arr) {
        for (var i=row1+1; i<row2; i++) {
            if (arr[i][col] !== 0) return false;
        }
        return true;
    },

    isGameOver () {
        let arr = this.data.board;
        for (let i=0; i<4; i++) {
            for (let j=0; j<4; j++) {
                if (arr[i][j] === 0) return;
                if (i<3 && arr[i][j] === arr[i+1][j]) return;
                if (j<3 && arr[i][j] === arr[i][j+1]) return;
            }
        }
        this.setData({isShow: 'block'});
    }
});