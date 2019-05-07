var state = {
   'null': 'url("images/null.svg")',
   'X': 'url("images/X.png")',
   F: 'url("images/F.svg")',
   BOOM: 'url("images/BOOM.png")',
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
      cust: { r: 10, c: 10, m: 30 },
   },
};
/*-------Global Variables---------*/
var win = null;
var sz = 'inter';
var set = state.diff[sz];
let m = state.mines;
let p = state.play;
var mouseDown = false;
var target = null;
var currentTile = m[target];
var inPlay = false;
/*---------References---------*/
// const boardArea = document.getElementById('boardArea');
const board = document.getElementById('board');
const tile = document.getElementsByClassName('tile');
const body = document.getElementById('body');
const smiley = document.getElementById('smiley');

/*---------LISTENERS---------*/
body.addEventListener('mousedown', () => { mouseDown = true }); // console.log(mousedown);
body.addEventListener('mouseup', () => { mouseDown = false }); // console.log(mouseup);
smiley.addEventListener('click', reset);
smiley.addEventListener('mousedown', smile);
board.addEventListener('mouseover', tileEnter, false);
board.addEventListener('mouseout', tileExit, false);
board.addEventListener('mousedown', tilePress);
board.addEventListener('mouseup', tileChoose);

/*---------HANDLERS---------*/
function reset(evt) {
   while (board.hasChildNodes()) { board.removeChild(board.childNodes[0]) };
   m.length = 0;
   p.length = 0;
   init();
   loadMines();
   evt.target.style.backgroundImage = 'url(images/smiley.png)';
}

function smile(evt) {
   evt.target.style.backgroundImage = 'url(images/smileydown.png)'
}

function tilePress(evt) {// Mouse press(but not release) within a null tile shows pressed tile image
   var id = evt.target.id;
   var bg = evt.target.style.backgroundImage;
   if (/*bg == state[null] && */state.play[id] == null) {
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
   var id = evt.target.id;
   target = id;
   currentTile = m[id];
   var notNull = p.some((el) => {
      return el !== null;
   });
   inPlay = notNull;
   avoid();
   evt.target.style.backgroundImage = state[p[id]];
   smiley.style.backgroundImage = 'url(images/smiley.png)';
   // console.log(id - set.c - 1, id);
   // console.log(parseInt(id) + set.c + 1, parseInt(id));
}

/*---------Functions---------*/
init();

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
   loadMines();
}

function avoid() {
   if (m[target] === 'X' && inPlay === false) { // If mouseup target within board has m[target] === 'X', board is reshuffled, else tile is exposed
      while (m[target] === 'X' && inPlay === false) {
         while (board.hasChildNodes()) { board.removeChild(board.childNodes[0]) };
         m.length = 0;
         p.length = 0;
         init();
         loadMines();
      }
   } else {
      p[target] = m[target];
      inPlay = true;
      prop();
   }
}

function loadMines() {// Randomize 'X's into mines array and populate surrounding square values by calling loadNums()
   while (m.filter(function (y) { return y === 'X' }).length < set.m) {
      m[Math.floor(Math.random() * set.r * set.c)] = 'X';
   };
   m.forEach(neighbors); // Calls neighbors function on each square, loading surrounding mines count into mines array
}

function neighbors(tile, idx) {
   let acc = 0;
   let top = idx < set.c ? true : false;
   let right = (idx % set.c + 1) % set.c === 0 ? true : false; // These TRBL check for borders so they can be excluded from results
   let bottom = idx > m.length - set.c - 1 ? true : false;
   let left = idx % set.c === 0 ? true : false;
   let radius = [ // An array of objects representing neighboring squares. {val: value contained at id: index of neighboring square}
      (top || left) ? null : m[idx - set.c - 1],
      top ? null : m[idx - set.c],
      (top || right) ? null : m[idx - set.c + 1],
      left ? null : m[idx - 1],
      right ? null : m[parseInt(idx) + 1],
      (bottom || left) ? null : m[parseInt(idx) + set.c - 1],
      bottom ? null : m[parseInt(idx) + set.c],
      (bottom || right) ? null : m[parseInt(idx) + set.c + 1],
   ];


   for (let i = 0; i < 9; i++) {// Adds all 'X's from neighboring squares
      if (radius[i] == 'X') { acc++ }
   }
   if (tile != 'X') { m[idx] = acc; }// Loads #s into mines array if there is no 'X' there


   return radius;
}

function test(tile, idx) {
   // let acc = 0;
   let top = idx < set.c ? true : false;
   let right = (idx % set.c + 1) % set.c === 0 ? true : false; // These TRBL check for borders so they can be excluded from results
   let bottom = idx > m.length - set.c - 1 ? true : false;
   let left = idx % set.c === 0 ? true : false;
   let radius = [ // An array of objects representing neighboring squares. {val: value contained at id: index of neighboring square}
      (top || left) ? { val: null } : { val: m[parseInt(idx) - set.c - 1], id: parseInt(idx) - set.c - 1 },
      top ? { val: null } : { val: m[parseInt(idx) - set.c], id: parseInt(idx) - set.c },
      (top || right) ? { val: null } : { val: m[parseInt(idx) - set.c + 1], id: parseInt(idx) - set.c + 1 },
      left ? { val: null } : { val: m[parseInt(idx) - 1], id: parseInt(idx) - 1 },
      right ? { val: null } : { val: m[parseInt(idx) + 1], id: parseInt(idx) + 1 },
      (bottom || left) ? { val: null } : { val: m[parseInt(idx) + set.c - 1], id: parseInt(idx) + set.c - 1 },
      bottom ? { val: null } : { val: m[parseInt(idx) + set.c], id: parseInt(idx) + set.c },
      (bottom || right) ? { val: null } : { val: m[parseInt(idx) + set.c + 1], id: parseInt(idx) + set.c + 1 },
   ];
   // for (let i = 0; i < 9; i++) {// Adds all 'X's from neighboring squares
   //    if (radius[i][val] == 'X') { acc++ }
   // }
   // if (tile != 'X') { m[idx] = acc; }// Loads #s into mines array if there is no 'X' there
   return radius;
}

function prop() {
   var radObj = test(currentTile, target);
   console.log(
      
      radObj[1].val);
   // if (currentTile === 0) {

   //    // const thisRadius = neighbors(currentTile, target);
   //    // console.log(neighbors(currentTile, target));
   //    // render();
   // }
}

function render() { // ----> to be used during prop() and for WIN or LOSS condition (reveal all mines, smiley does ___)(get win function?)
   p.forEach((tileState, idx) => {
      document.getElementById(`${idx}`).style.backgroundImage = state[tileState];
   });
};

/*-----Maybe------*/



/*------CRYPT-----*/

// if (m[id] == 'X' && notNull == false) { //avoid(); // If mouseup target within board has m[target] === 'X', board is reshuffled, else tile is exposed
// while (m[id] === 'X' && notNull === false) {
//    while (board.hasChildNodes()) { board.removeChild(board.childNodes[0]) };
//    m.length = 0;
//    p.length = 0;
//    init();
//    loadMines();
// }
// } else {
// p[id] = m[id];
// inPlay = true;
// console.log(inPlay);
// }

// console.log(idx,
//    'above:',idx-set.c+1, idx-set.c, idx-set.c-1,
//    'next to:',idx - 1,idx + 1,
//    'below:',idx + set.c - 1,idx + set.c,idx + set.c + 1
// );
// console.log('top:',top, 'left:',left, 'right:',right)


// console.log(state.mines);
// console.log(state.play);




/*ICEBOX:

SPRITES
FLAGS
First tile, if mine, still reveals after re-randomization
*/





