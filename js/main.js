var state = {
   'null': 'url("images/null.svg")',
   'X': 'url("images/X.png")',
   'F': 'url("images/F.svg")',
   'BOOM': 'url("images/BOOM.png")',
   '0': 'url("images/0.svg")',
   '1': 'url("images/1.svg")',
   '2': 'url("images/2.svg")',
   '3': 'url("images/3.svg")',
   '4': 'url("images/4.svg")',
   '5': 'url("images/5.svg")',
   '6': 'url("images/6.svg")',
   '7': 'url("images/7.svg")',
   '8': 'url("images/8.svg")',
   mines: [],
   play: [],
   diff: {
      beg: { r: 9, c: 9, m: 10 },
      inter: { r: 16, c: 16, m: 40 },
      exp: { r: 16, c: 30, m: 99 },
      cust: { r: 10, c: 10, m: 8 },
   },
};

var win = null;
var size = 'inter';
var set = state.diff[size];
var seconds = 000;
var flags = state.diff[size].m;
let m = state.mines;
let p = state.play;
var leftMouseDown = false;
var rightMouseDown = false;
var target = null;
var currentTile = null;
var inPlay = false;

const body = document.getElementById('body');
const boardArea = document.getElementById('boardArea');
const gameMenu = document.getElementById('list');
const help = document.getElementById('lol');
const tictoc = document.getElementById('tic');
const count = document.getElementById('mineCount');
const smiley = document.getElementById('smiley');
const board = document.getElementById('board');

body.addEventListener('mousedown', (evt) => { if (evt.which == 1) { leftMouseDown = true }; if (evt.which == 3) { rightMouseDown = true } });
body.addEventListener('mouseup', (evt) => { if (evt.which == 1) { leftMouseDown = false }; if (evt.which == 3) { rightMouseDown = false } });
gameMenu.addEventListener('click', diffSelect);
help.addEventListener('click', reSkin);
boardArea.addEventListener('contextmenu', (evt) => { evt.preventDefault() });
smiley.addEventListener('click', reset);
smiley.addEventListener('mousedown', smile);
board.addEventListener('mouseover', tileEnter, false);
board.addEventListener('mouseout', tileExit, false);
board.addEventListener('mousedown', tilePress);
board.addEventListener('mouseup', tileChoose);
board.addEventListener('contextmenu', tileFlag);
window.oncontextmenu = () => { return false };

function diffMenu() {
   gameMenu.classList.toggle("show");
   help.classList.remove("show");
}

function helpMenu() {
   help.classList.toggle("show");
   gameMenu.classList.remove("show");
}

function diffSelect(evt) {
   if (evt.target.id === 'beg' || 'inter' || 'exp') {
      size = evt.target.id;
      reset();
      render();
      diffMenu();
   }
}

function smile(evt) {
   evt.target.style.backgroundImage = 'url(images/smileydown.png)'
}

function timer() {
   if (inPlay === true) {
      seconds += 1;
      tictoc.innerHTML =
         seconds.toLocaleString(undefined, { minimumIntegerDigits: 3 })
   } else { return }
}

function tilePress(evt) {
   var id = evt.target.id;
   if (state.play[id] == null) {
      evt.target.style.backgroundImage = state[0];
      smiley.style.backgroundImage = 'url(images/clench.png)'
   }
}

function tileEnter(evt) {
   var id = evt.target.id;
   var bg = evt.target.style.backgroundImage;
   if (leftMouseDown == true && bg == state[null] && state.play[id] == null) {
      evt.target.style.backgroundImage = state[0];
      smiley.style.backgroundImage = 'url(images/clench.png)'
   }
}

function tileExit(evt) {
   var id = evt.target.id;
   if (leftMouseDown == true && state.play[id] == null) {
      evt.target.style.backgroundImage = state[null];
      smiley.style.backgroundImage = 'url(images/smiley.png)';
   }
}

function tileChoose(evt) {
   var id = evt.target.id;
   if (leftMouseDown && rightMouseDown) console.log('both');
   if (win) return;
   if (evt.button == 2) return;
   target = id;
   currentTile = m[id];
   var notNull = p.some((el) => {
      return el !== null;
   });
   inPlay = notNull;
   avoid();
   smiley.style.backgroundImage = 'url(images/smiley.png)';
   render();
}

function tileFlag(evt) {
   var id = evt.target.id;
   if (p[id] === null) {
      p[id] = 'F';
      flags--;
   } else if (p[id] === 'F') {
      p[id] = null;
      flags++;
   }
   count.innerHTML = flags.toLocaleString(undefined, { minimumIntegerDigits: 3 });
   render();
}

init();
setInterval(timer, 1000);

function init() {
   board.style.gridTemplateRows = `repeat(${set.r}, 22px)`;
   board.style.gridTemplateColumns = `repeat(${set.c}, 22px)`;
   for (let i = 0; i < set.r * set.c; i++) {
      state.mines.push(null);
      state.play.push(null);
      board.innerHTML += `<div id="${i}" class="tile"></div>`;
      document.getElementById(i).style.backgroundImage = state[null];
   }
   inPlay = false;
   win = false;
   seconds = 000;
   tictoc.innerHTML = seconds.toLocaleString(undefined, { minimumIntegerDigits: 3 });
   count.innerHTML = flags.toLocaleString(undefined, { minimumIntegerDigits: 3 });
   loadMines();
}

function loadMines() {
   while (m.filter(function (y) { return y === 'X' }).length < set.m) {
      m[Math.floor(Math.random() * set.r * set.c)] = 'X';
   };
   m.forEach(neighbors);
}

function avoid() {
   if (m[target] === 'X' && inPlay === false) {
      while (m[target] === 'X' && inPlay === false) {
         while (board.hasChildNodes()) { board.removeChild(board.childNodes[0]) };
         m.length = 0;
         p.length = 0;
         init();
      }
   } else if (p[target] === 'F') {
      return;
   } else {
      p[target] = m[target];
      inPlay = true;
      neighbors(currentTile, target);
      footPrint(currentTile, target);
   }
}

function neighbors(tileVal, idx) {
   let top = idx < set.c ? true : false;
   let right = (idx % set.c + 1) % set.c === 0 ? true : false;
   let bottom = idx > m.length - set.c - 1 ? true : false;
   let left = idx % set.c === 0 ? true : false;
   let radius = [
      (top || left) ? { val: null } : { val: m[parseInt(idx) - set.c - 1], id: parseInt(idx) - set.c - 1 },
      top ? { val: null } : { val: m[parseInt(idx) - set.c], id: parseInt(idx) - set.c },
      (top || right) ? { val: null } : { val: m[parseInt(idx) - set.c + 1], id: parseInt(idx) - set.c + 1 },
      left ? { val: null } : { val: m[parseInt(idx) - 1], id: parseInt(idx) - 1 },
      right ? { val: null } : { val: m[parseInt(idx) + 1], id: parseInt(idx) + 1 },
      (bottom || left) ? { val: null } : { val: m[parseInt(idx) + set.c - 1], id: parseInt(idx) + set.c - 1 },
      bottom ? { val: null } : { val: m[parseInt(idx) + set.c], id: parseInt(idx) + set.c },
      (bottom || right) ? { val: null } : { val: m[parseInt(idx) + set.c + 1], id: parseInt(idx) + set.c + 1 },
   ];
   let acc = radius.reduce((a, val) => { if (val.val == 'X') a++; return a }, 0);
   if (tileVal != 'X') { m[idx] = acc; };
   radius.forEach((obj) => {
      if (tileVal === 0 && p[obj.id] === null) {
         p[obj.id] = obj.val;
         return neighbors(obj.val, obj.id);
      }
   });
   return radius;
}

function footPrint(val, idx) {
   var radObjects = neighbors(val, idx);
   if (typeof p[idx] == 'number' && leftMouseDown && rightMouseDown) {
      let f = 0;
      let xs = 0;
      let fArray = [];
      radObjects.forEach((obj) => {
         if (p[obj.id] == 'F')++f;
         if (obj.val == 'X')++xs;
         fArray.push(p[obj.id]);
      });
      radObjects.forEach((obj) => {
         if (f == xs && p[obj.id] !== 'F' && fArray.includes('F')) {
            p[obj.id] = obj.val;
         };
         if (obj.val === 0 && fArray.includes('F')) { neighbors(obj.val, obj.id) }
      })
   };
}

function render() {
   p.forEach((tileState, idx) => {
      document.getElementById(`${idx}`).style.backgroundImage = state[tileState];
   });
   if (p.includes('X')) {
      win = true;
      inPlay = false;
      smiley.style.backgroundImage = 'url(images/dead.png)';
      m.forEach((val, idx) => {
         if (val === 'X') {
            document.getElementById(`${idx}`).style.backgroundImage = state['BOOM']
         }
      });
   } else if (p.filter((val) => { return val === null || val === 'F' }).length === set.m) {
      smiley.style.backgroundImage = 'url(images/glasses.png)';
      win = true;
      inPlay = false;
      p.forEach((val, idx) => {
         if (val === null) {
            document.getElementById(`${idx}`).style.backgroundImage = state['F']
         }
      });
   } else {
      count.innerHTML = flags.toLocaleString(undefined, { minimumIntegerDigits: 3 });
      smiley.style.backgroundImage = 'url(images/smiley.png)';
   };
}

function reset() {
   while (board.hasChildNodes()) { board.removeChild(board.childNodes[0]) };
   m.length = 0;
   p.length = 0;
   set = state.diff[size];
   flags = state.diff[size].m;
   init();
   smiley.style.backgroundImage = 'url(images/smiley.png)';
}

function winner() {
   m.forEach((val, idx) => { if (val !== 'X') { p[idx] = val } });
   render();
}

/*ICEBOX:
SPRITES
First tile, if mine, still reveals after re-randomization
*/