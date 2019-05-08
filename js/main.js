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
/*-------Global Variables---------*/
var win = null;
var size = 'inter';
var set = state.diff[size];
var seconds = 000;
let m = state.mines;
let p = state.play;
var mouseDown = false;
var target = null; // id of most recently clicked tile
var currentTile = null; // Actual value of most recently clicked tile
var inPlay = false;
/*---------References---------*/
// const boardArea = document.getElementById('boardArea');
const board = document.getElementById('board');
const body = document.getElementById('body');
const smiley = document.getElementById('smiley');
const gameMenu = document.getElementById('list');
const help = document.getElementById('lol');
const tictoc = document.getElementById('tic');

/*---------LISTENERS---------*/
body.addEventListener('mousedown', () => { mouseDown = true }); // console.log(mousedown);
body.addEventListener('mouseup', () => { mouseDown = false }); // console.log(mouseup);
gameMenu.addEventListener('click', diffSelect);
smiley.addEventListener('click', reset);
smiley.addEventListener('mousedown', smile);
board.addEventListener('mouseover', tileEnter, false);
board.addEventListener('mouseout', tileExit, false);
board.addEventListener('mousedown', tilePress);
board.addEventListener('mouseup', tileChoose);

/*---------HANDLERS---------*/
function diffMenu() {
   gameMenu.classList.toggle("show");
   help.classList.remove("show");
}

function helpMenu() {
   help.classList.toggle("show");
   gameMenu.classList.remove("show");
}

function diffSelect(evt) {
   console.log(evt.target.id);
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
      seconds.toLocaleString(undefined,{minimumIntegerDigits: 3})
   } else { return }
}

function tilePress(evt) {// Mouse press(but not release) within a null tile shows pressed tile image
   var id = evt.target.id;
   if (state.play[id] == null) {
      evt.target.style.backgroundImage = state[0];
      smiley.style.backgroundImage = 'url(images/clench.png)'
   }
}

function tileEnter(evt) {// If mouse is down and square is null, show a '0' image while mouseDown, else leave the image how it is.
   var id = evt.target.id;
   var bg = evt.target.style.backgroundImage;
   if (mouseDown == true && bg == state[null] && state.play[id] == null) {
      evt.target.style.backgroundImage = state[0];
   }
}

function tileExit(evt) {// If mouse is down when it exits a covered square that was previously covered, the bg image is reset to 'null'
   var id = evt.target.id;
   if (mouseDown == true && state.play[id] == null) {
      evt.target.style.backgroundImage = state[null];
   }
}

function tileChoose(evt) {// If mouse button is released while on a safe square, the contents are uncovered, (board resets if first guess contains mine)
   if (win) return;
   var id = evt.target.id;
   target = id;
   currentTile = m[id];
   var notNull = p.some((el) => {
      return el !== null;
   });
   console.log(id);
   inPlay = notNull;
   avoid();
   smiley.style.backgroundImage = 'url(images/smiley.png)';
   render();
}

/*---------FUNCTIONS---------*/
init();
setInterval(timer, 1000);

function init() {// Create board arrays and divs, calls loadMines()
   board.style.gridTemplateRows = `repeat(${set.r}, 25px)`;
   board.style.gridTemplateColumns = `repeat(${set.c}, 25px)`;
   for (let i = 0; i < set.r * set.c; i++) {
      state.mines.push(null);
      state.play.push(null);
      board.innerHTML += `<div id="${i}" class="tile"></div>`;
      document.getElementById(i).style.backgroundImage = state[null];
   }
   inPlay = false; 
   win = false;
   seconds = 000;
   tictoc.innerHTML = seconds.toLocaleString(undefined,{minimumIntegerDigits: 3});
   loadMines();
}

function loadMines() {// Randomize 'X's into mines array and populate surrounding square values by calling loadNums()
   while (m.filter(function (y) { return y === 'X' }).length < set.m) {
      m[Math.floor(Math.random() * set.r * set.c)] = 'X';
   };
   m.forEach(neighbors); // Calls neighbors function on each square, loading surrounding mines count into mines array
}

function reset() {
   while (board.hasChildNodes()) { board.removeChild(board.childNodes[0]) };
   m.length = 0;
   p.length = 0;
   set = state.diff[size];
   init();
   smiley.style.backgroundImage = 'url(images/smiley.png)';
}

function avoid() {
   if (m[target] === 'X' && inPlay === false) { // If mouseup target within board has m[target] === 'X', board is reshuffled, else tile is exposed
      while (m[target] === 'X' && inPlay === false) {
         while (board.hasChildNodes()) { board.removeChild(board.childNodes[0]) };
         m.length = 0;
         p.length = 0;
         init();
      }
   } else {
      p[target] = m[target];
      inPlay = true;
      neighbors(currentTile, target);
   }
}

function neighbors(tileVal, idx) {
   let top = idx < set.c ? true : false;
   let right = (idx % set.c + 1) % set.c === 0 ? true : false; // These TRBL check for borders so they can be excluded from results
   let bottom = idx > m.length - set.c - 1 ? true : false;
   let left = idx % set.c === 0 ? true : false;
   let radius = [ // An array of objects representing neighboring squares. {val: value contained at id: index of neighboring square}
      (top || left) ? { val: null } : { val: m[parseInt(idx) - set.c - 1], id: parseInt(idx) - set.c - 1 }, // Above L
      top ? { val: null } : { val: m[parseInt(idx) - set.c], id: parseInt(idx) - set.c }, // Above
      (top || right) ? { val: null } : { val: m[parseInt(idx) - set.c + 1], id: parseInt(idx) - set.c + 1 }, // Above R
      left ? { val: null } : { val: m[parseInt(idx) - 1], id: parseInt(idx) - 1 }, // L
      right ? { val: null } : { val: m[parseInt(idx) + 1], id: parseInt(idx) + 1 }, // R      Stupid type coercion
      (bottom || left) ? { val: null } : { val: m[parseInt(idx) + set.c - 1], id: parseInt(idx) + set.c - 1 }, // Below L
      bottom ? { val: null } : { val: m[parseInt(idx) + set.c], id: parseInt(idx) + set.c }, // Below
      (bottom || right) ? { val: null } : { val: m[parseInt(idx) + set.c + 1], id: parseInt(idx) + set.c + 1 }, // Below R
   ];
   let acc = radius.reduce((a, val) => { if (val.val == 'X') a++; return a }, 0); // Adds up 'X's in neighboring squares -- this is the # entered into each non-mine square
   if (tileVal != 'X') { m[idx] = acc; }// Loads #s into mines array if there is no 'X' there
   if (inPlay === true) {
      render();
      radius.forEach((obj) => {
         if (tileVal === 0 && obj.val !== 'X' && p[obj.id] === null) {
            console.log('blank');
            p[obj.id] = obj.val;
            return neighbors(obj.val, obj.id);
         }
      });
   }
   return radius; // Array of 8 objects [{ val: , id: },...] (surrounding squares)
}

function render() { // ----> to be used during prop() and for WIN or LOSS condition (reveal all mines, smiley does ___)(get win function?)
   p.forEach((tileState, idx) => {
      document.getElementById(`${idx}`).style.backgroundImage = state[tileState];
   });
   if (p.includes('X')) {
      win = true; inPlay = false;
      smiley.style.backgroundImage = 'url(images/dead.png)';
      m.forEach((val, idx) => { if (val === 'X') { document.getElementById(`${idx}`).style.backgroundImage = state['X'] } });
      document.getElementById(`${target}`).style.backgroundImage = state['BOOM'];
   }
   if (p.filter((val) => { return val === null }).length === set.m) {
      smiley.style.backgroundImage = 'url(images/glasses.png)';
      win = true; inPlay = false;
      p.forEach((val, idx) => {
         if (val === null) { document.getElementById(`${idx}`).style.backgroundImage = state['F'] }
      });
   }
};

/*ICEBOX:

SPRITES
FLAGS
First tile, if mine, still reveals after re-randomization
*/





