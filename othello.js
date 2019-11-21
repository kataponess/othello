let board = [];
const piece = { "empty": 0, "black": 1, "white": 2, "changeTurn": 3 };
let thisTurn = piece.empty;
let easymodeFlag = false;

const getBoardStorage = () => board = JSON.parse(sessionStorage.getItem('board'));
const setBoardStorage = () => sessionStorage.setItem('board', JSON.stringify(board));
const getThisTurnStorage = () => thisTurn = JSON.parse(sessionStorage.getItem('thisTurn'));
const setThisTurnStorage = () => sessionStorage.setItem('thisTurn', JSON.stringify(thisTurn));

window.addEventListener('DOMContentLoaded', () => {
  makeBoard();
  displayPlayer();
});

const easymode = () => {
  easymodeFlag = !easymodeFlag;
  if (easymodeFlag) {
    document.getElementById('easymode').classList.add('red');
  } else {
    document.getElementById('easymode').classList.remove('red');
    for (let x = 1; x <= 8; x++) {
      for (let y = 1; y <= 8; y++) {
        document.getElementById(x.toString() + y.toString()).classList.remove('red');
      }
    }
  }
  existenceConfirmation();
}

const makeBoard = () => {
  let html = '';
  for (let x = 1; x <= 8; x++) {
    html += `<tr>`;
    for (let y = 1; y <= 8; y++) {
      html += `<td id="${x}${y}" class="cell" onclick="setPiece(${x},${y})">`;
      html += `</td>`;
    }
    html += `</tr>`;
  }
  document.getElementById('table').insertAdjacentHTML('beforeend', html);
  show();
}

const decidePlayFirst = () => {
  const types = countPiece()
  if (types.blackPiece + types.whitePiece < 5) {
    thisTurn = Math.floor(Math.random() * 2 + 1);
    displayPlayer();
    existenceConfirmation();
    setThisTurnStorage();
  }
}

const displayPlayer = () => {
  if (thisTurn == 1) {
    start.innerText = 'BLACK';
  } else if (thisTurn == 2) {
    start.innerText = 'WHITE';
  } else {
    start.innerText = '';
  }
}

const clearBoard = () => {
  sessionStorage.clear();
  result.innerText = '';
  for (let x = 1; x <= 8; x++) {
    for (let y = 1; y <= 8; y++) {
      document.getElementById(x.toString() + y.toString()).classList.remove('red');
    }
  }
  thisTurn = piece.empty;
  easymodeFlag = false;
  document.getElementById('easymode').classList.remove('red');
  show();
}

const countPiece = () => {
  let countBlack = 0;
  let countWhite = 0;
  for (let x = 1; x <= 8; x++) {
    for (let y = 1; y <= 8; y++) {
      if (board[x][y] == 1) {
        countBlack++;
      } else if (board[x][y] == 2) {
        countWhite++;
      } else {
        /*　0と3は数えない */
      }
    }
  }
  return { "blackPiece": countBlack, "whitePiece": countWhite };
}

const show = () => {
  displayPlayer();

  if (sessionStorage.getItem('board')) {
    getBoardStorage();
    getThisTurnStorage();
  } else {
    for (let x = 0; x <= 9; x++) { //1-8だとエラーが出るので、0-9に。
      board[x] = [];
      for (let y = 1; y <= 8; y++) {
        board[x][y] = piece.empty;
      }
    }
    board[4][4] = piece.white;
    board[4][5] = piece.black;
    board[5][4] = piece.black;
    board[5][5] = piece.white;
  }

  for (let x = 1; x <= 8; x++) {
    for (let y = 1; y <= 8; y++) {
      if (board[x][y] == piece.empty) {
        document.getElementById(x.toString() + y.toString()).innerText = '';
      } else if (board[x][y] == piece.black) {
        document.getElementById(x.toString() + y.toString()).innerText = '●';
      } else /* (board[x][y] == piece.white) */ {
        document.getElementById(x.toString() + y.toString()).innerText = '○';
      }
    }
  }
}

const setPiece = (x, y) => {
  if (thisTurn != piece.empty) {
    result.innerText = '';
    if (board[x][y] == piece.empty && sandwich(x, y)) {
      board[x][y] = thisTurn;
      thisTurn = piece.changeTurn - thisTurn;
      setThisTurnStorage();
      setBoardStorage();
    }
    show();
    if (!existenceConfirmation()) {
      thisTurn = piece.changeTurn - thisTurn;
      let whoseTurn = '';
      if (thisTurn == 1) {
        whoseTurn = 'BLACK';
      } else /* (thisTurn == 2) */ {
        whoseTurn = 'WHITE';
      }
      result.innerText = `置くところがない／(^o^)＼パスして${whoseTurn}さんの番ダヨ`;
      start.innerText = whoseTurn;
    }
    let total = countPiece();
    if (total.blackPiece == 0) {
      result.innerText = "WHITEさんの勝ち！BLACKさん全滅＼(^o^)／ｵﾜﾀ"
    } else if (total.whitePiece == 0) {
      result.innerText = "BLACKさんの勝ち！WHITEさん全滅＼(^o^)／ｵﾜﾀ"
    }
    finalResult();
  }
}

const existenceConfirmation = () => {
  let sandwichFlag = false;
  let count = 0;
  for (let x = 1; x <= 8; x++) {
    for (let y = 1; y <= 8; y++) {
      if (easymodeFlag)
        document.getElementById(x.toString() + y.toString()).classList.remove('red');
      if (board[x][y] == piece.empty) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i == 0 && j == 0) continue;
            let currentX = x + i;
            let currentY = y + j;
            if (board[currentX][currentY] == undefined) continue;

            // 相手の駒があった方向に対して、相手の駒が存在するまで位置を動かして取得していく
            while (board[currentX][currentY] == piece.changeTurn - thisTurn) {
              currentX += i;
              currentY += j;
              count++;
            }

            // 相手の駒の先に自分の駒が存在したら
            if (count > 0 && board[currentX][currentY] == thisTurn) {
              sandwichFlag = true;
              if (easymodeFlag)
                document.getElementById(x.toString() + y.toString()).classList.add('red');
            }
            count = 0;
          }
        }
      }
    }
  }
  return sandwichFlag;
}


const finalResult = () => {
  const total = countPiece();
  if (total.blackPiece + total.whitePiece == 64) {
    if (total.blackPiece > total.whitePiece) {
      result.innerText =
        `黒の勝ち('Д')　黒：${total.blackPiece}/白：${total.whitePiece}`;
    } else if (total.blackPiece < total.whitePiece) {
      result.innerText =
        `白の勝ち('Д')　黒：${total.blackPiece}/白：${total.whitePiece}`;
    } else /* (total.blackPiece == total.whitePiece) */ {
      result.innerText =
        `引き分け('Д')　黒：${total.blackPiece}/白：${total.whitePiece}`;
    }
  }
}

const sandwich = (x, y) => {
  let sandwichFlag = false;
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i == 0 && j == 0) continue;

      let currentX = x + i;
      let currentY = y + j;
      if (board[currentX][currentY] == undefined) continue;

      // 相手の駒があった方向に対して、相手の駒が存在するまで位置を動かして取得していく
      while (board[currentX][currentY] == piece.changeTurn - thisTurn) {
        currentX += i;
        currentY += j;
        count++;
      }

      // 相手の駒の先に自分の駒が存在したら
      if (count > 0 && board[currentX][currentY] == thisTurn) {
        let changeX = x;
        let changeY = y;
        for (let k = 0; k < count; k++) {
          changeX += i;
          changeY += j;
          board[changeX][changeY] = thisTurn;
        }
        sandwichFlag = true;
      }
      count = 0;
    }
  }
  return sandwichFlag;
}
