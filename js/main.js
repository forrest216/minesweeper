var images = {
   'bg': { w: 'url("images/windows.jpg")', n: 'url(images/cat.gif)' },
   'neonbgs': { w: 'url("images/trumpgret.gif")', n: 'url(images/pika.gif)' },

   'smiley': { w: 'url("images/smiley.png")', n: 'url("images/neonsmiley.jpg")' },
   'clench': { w: 'url("images/clench.png")', n: 'url("images/neonclench.jpg")' },
   'down': { w: 'url("images/smileydown.png")', n: 'url("images/neonsmileydown.gif")' },
   'dead': { w: 'url("images/dead.png")', n: 'url("images/neondead.jpg")' },
   'win': { w: 'url("images/glasses.png")', n: 'url("images/neonwin.gif")' },
   'BOOM': { w: 'url("images/BOOM.png")', n: 'url("images/neonBOOM.gif")' },
   'null': { w: 'url("images/null.svg")', n: 'url("images/neonnull.jpeg")' },
   'X': { w: 'url("images/X.png")', n: 'url("images/eye.gif")' },
   'F': { w: 'url("images/F.svg")', n: 'url("images/neonF.gif")' },
   '0': { w: 'url("images/0.svg")', n: 'url("images/neon0.png")' },
   '1': { w: 'url("images/1.svg")', n: 'url("images/neon1.png")' },
   '2': { w: 'url("images/2.svg")', n: 'url("images/neon2.png")' },
   '3': { w: 'url("images/3.svg")', n: 'url("images/neon3.png")' },
   '4': { w: 'url("images/4.svg")', n: 'url("images/neon4.png")' },
   '5': { w: 'url("images/5.svg")', n: 'url("images/neon5.png")' },
   '6': { w: 'url("images/6.svg")', n: 'url("images/neon6.png")' },
   '7': { w: 'url("images/7.svg")', n: 'url("images/neon7.png")' },
   '8': { w: 'url("images/8.svg")', n: 'url("images/neon8.png")' },
}

var state = {
   mines: [],
   play: [],
   diff: {
      beg: { r: 9, c: 9, m: 10 },
      inter: { r: 16, c: 16, m: 40 },
      exp: { r: 16, c: 30, m: 99 },
      cust: { r: 10, c: 10, m: 8 },
   },
}

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
var neon = 'w';

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
help.addEventListener('click', theme);
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

function theme(evt) {
   const styl = document.getElementById('theme');
   if (evt.target.id === 'noHelp') {
      if (styl.getAttribute('href') == 'css/style.css') {
         styl.setAttribute('href', 'css/neon.css');
         neon = 'n';
      } else if (styl.getAttribute('href') == 'css/neon.css') {
         styl.setAttribute('href', 'css/style.css');
         neon = 'w'
      }
      reset();
      render();
      helpMenu();
   };
}

function smile(evt) {
   evt.target.style.backgroundImage = images['down'][neon]
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
      evt.target.style.backgroundImage = images[0][neon];
      smiley.style.backgroundImage = images['clench'][neon]
   }
}

function tileEnter(evt) {
   var id = evt.target.id;
   var bg = evt.target.style.backgroundImage;
   if (leftMouseDown == true && bg == images['null'][neon] && state.play[id] == null) {
      evt.target.style.backgroundImage = images[0][neon];
      smiley.style.backgroundImage = images['clench'][neon]
   }
}

function tileExit(evt) {
   var id = evt.target.id;
   if (leftMouseDown == true && state.play[id] == null) {
      evt.target.style.backgroundImage = images['null'][neon];
      smiley.style.backgroundImage = images['smiley'][neon];
   }
}

function tileChoose(evt) {
   var id = evt.target.id;
   if (win) return;
   if (evt.button == 2) return;
   target = id;
   currentTile = m[id];
   var notNull = p.some((el) => {
      return el !== null;
   });
   inPlay = notNull;
   avoid();
   smiley.style.backgroundImage = images['smiley'][neon];
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
      document.getElementById(i).style.backgroundImage = images['null'][neon];
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
      document.getElementById(`${idx}`).style.backgroundImage = images[tileState][neon];
   });
   if (p.includes('X')) {
      win = true;
      inPlay = false;
      smiley.style.backgroundImage = images['dead'][neon];
      if (neon === 'n') body.style.backgroundImage = images['neonbgs']['w'];
      p.forEach((val, idx) => {
         if (val === null && neon === 'n') {
            document.getElementById(`${idx}`).style.backgroundImage = images['X'][neon];
         }
      });
      m.forEach((val, idx) => {
         if (val === 'X') {
            document.getElementById(`${idx}`).style.backgroundImage = images['BOOM'][neon];
         }
      });
   } else if (p.filter((val) => { return val === null || val === 'F' }).length === set.m) {
      smiley.style.backgroundImage = images['win'][neon];
      if (neon === 'n') {
         body.style.backgroundImage = images['neonbgs']['n'];
      }
      win = true;
      inPlay = false;
      p.forEach((val, idx) => {
         if (val === null) {
            document.getElementById(`${idx}`).style.backgroundImage = images['F'][neon];
         }
      });
   } else {
      count.innerHTML = flags.toLocaleString(undefined, { minimumIntegerDigits: 3 });
      smiley.style.backgroundImage = images['smiley'][neon];
   };
}

function reset() {
   while (board.hasChildNodes()) { board.removeChild(board.childNodes[0]) };
   m.length = 0;
   p.length = 0;
   set = state.diff[size];
   flags = state.diff[size].m;
   init();
   body.style.backgroundImage = images['bg'][neon];
   smiley.style.backgroundImage = images['smiley'][neon];
}

function winner() {
   m.forEach((val, idx) => { if (val !== 'X') { p[idx] = val } });
   render();
}
