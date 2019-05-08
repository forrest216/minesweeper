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
var flags = state.diff[size].m;
let m = state.mines;
let p = state.play;
var leftMouseDown = false;
var rightMouseDown = false;
var target = null; // id of most recently clicked tile
var currentTile = null; // Hidden value of most recently clicked tile
var inPlay = false;
/*---------References---------*/
const boardArea = document.getElementById('boardArea');
const board = document.getElementById('board');
const body = document.getElementById('body');
const smiley = document.getElementById('smiley');
const gameMenu = document.getElementById('list');
const help = document.getElementById('lol');
const tictoc = document.getElementById('tic');
const count = document.getElementById('mineCount');

/*---------LISTENERS---------*/
body.addEventListener('mousedown', (evt) => { if (evt.which == 1) { leftMouseDown = true }; if (evt.which == 3) { rightMouseDown = true } });
body.addEventListener('mouseup', (evt) => { if (evt.which == 1) { leftMouseDown = false }; if (evt.which == 3) { rightMouseDown = false } });
gameMenu.addEventListener('click', diffSelect);
boardArea.addEventListener('contextmenu', (evt) => { evt.preventDefault() });
smiley.addEventListener('click', reset);
smiley.addEventListener('mousedown', smile);
board.addEventListener('mouseover', tileEnter, false);
board.addEventListener('mouseout', tileExit, false);
board.addEventListener('mousedown', tilePress);
board.addEventListener('mouseup', tileChoose);
board.addEventListener('contextmenu', tileFlag);
window.oncontextmenu = () => { return false };



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

function tilePress(evt) {// Mouse press(but not release) within a null tile shows pressed tile image
   var id = evt.target.id;
   if (state.play[id] == null) {
      evt.target.style.backgroundImage = state[0];
      smiley.style.backgroundImage = 'url(images/clench.png)'
   }
}

function tileEnter(evt) {// If mouse is down and square is null, show a '0' image while leftMouseDown, else leave the image how it is.
   var id = evt.target.id;
   var bg = evt.target.style.backgroundImage;
   if (leftMouseDown == true && bg == state[null] && state.play[id] == null) {
      evt.target.style.backgroundImage = state[0];
   }
}

function tileExit(evt) {// If mouse is down when it exits a covered square that was previously covered, the bg image is reset to 'null'
   var id = evt.target.id;
   if (leftMouseDown == true && state.play[id] == null) {
      evt.target.style.backgroundImage = state[null];
   }
}

function tileChoose(evt) {// If mouse button is released while on a safe square, the contents are uncovered, (board resets if first guess contains mine)
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
   tictoc.innerHTML = seconds.toLocaleString(undefined, { minimumIntegerDigits: 3 });
   count.innerHTML = flags.toLocaleString(undefined, { minimumIntegerDigits: 3 });
   loadMines();
}

function loadMines() {// Randomize 'X's into mines array and populate surrounding square values by calling loadNums()
   while (m.filter(function (y) { return y === 'X' }).length < set.m) {
      m[Math.floor(Math.random() * set.r * set.c)] = 'X';
   };
   m.forEach(neighbors); // Calls neighbors function on each square, loading surrounding mines count into mines array
}

function avoid() {
   if (m[target] === 'X' && inPlay === false) { // If mouseup target within board has m[target] === 'X', board is reshuffled, else tile is exposed
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
   if (tileVal != 'X') { m[idx] = acc; };// Loads #s into mines array if there is no 'X' there
   radius.forEach((obj) => {
      if (tileVal === 0 && p[obj.id] === null) {
         p[obj.id] = obj.val;
         return neighbors(obj.val, obj.id); // RECURSION BREH
      }
   });
   return radius; // Array of 8 objects [{ val: , id: },...] (surrounding squares)
}

function footPrint(val, idx) {
   var radObjects = neighbors(val, idx);
   console.log('neighbors output:', radObjects);
   if (typeof p[idx] == 'number' && leftMouseDown && rightMouseDown) {
      let f = 0; // Current footprint flag counter
      let xs = 0; // Current footprint mine counter
      let fArray = [];
      radObjects.forEach((obj) => {
         if (p[obj.id] == 'F')++f;
         if (obj.val == 'X')++xs;
         fArray.push(p[obj.id]);
         console.log(fArray);
      });

      console.log(f, xs);
      radObjects.forEach((obj) => {
         if (f == xs && p[obj.id] !== 'F' && fArray.includes('F')) {
            p[obj.id] = obj.val;
         };
         if (obj.val === 0 && fArray.includes('F')) {neighbors(obj.val, obj.id)}
      })
   };
}

function render() { // ----> to be used during prop() and for WIN or LOSS condition (reveal all mines, smiley does ___)(get win function?)
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
   } else if (p.filter((val) => { return val === null || val === 'F'}).length === set.m) {
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