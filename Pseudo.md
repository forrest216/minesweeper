## Welcome to the Minesweeper abstract

1) Define required constants:
   1.1) Define a TILES object with keys assigned to null, X(BOOM), and numbers 0-8. These will be paired with images representing the value uncovered in the game board by the player, to be inserted into the 'play' array during render.
      1.1.1) There will be three images in addition to the nonzero value images - null is a covered(unplayed) square, 0 is an empty square representing a board tile with no surrounding mines, and X is a mine triggered square(classic red w/mine).

2) Define required variables used to track the state of the game:
   2.1) Use a 'mines' array to represent the placement of the mines and how many mines are in each surrounding square.	
   2.2) Use a 'play' array to represent the state of play, i.e. which squares have been played already and what their value is.
   2.3) Use a 'win' variable to represent three different possibilities - player won(1), BOOM(a loss), or game in play(null).
   2.4) Use a 'click' variable to count the number of moves so far.

<!--Step 3 will likely actually happen in step 4.2-->
3) Store elements on the page that will be accessed in code more than once in variables to make code more concise, readable and performant:
   3.1) HTML has empty <div> with id 'board'. See 4.2).
   
   3.2) Keep that HTML organized because this could get messy
   <!-- Is it a better idea to render the board onto the page 100% during runtime from the js file? I don't want a messy index.html but which is considered best practice in this type of situation? -->

<!--INIT FUNCTION-->
4) Upon loading the app should:
   4.1) Initialize the state variables: 
      4.1.1) Initialize the 'mines' array<!--Object?--> dynamically to 81(256)(480) 'null' values to represent potential mine locations. 
         4.1.1.1) Using randomization, assign 10(40)(99) mines to the 'mines' array. These will be entered as an 'X'.
         
      4.1.2) Initialize win to null to represent that there is no win or BOOM yet. Win will hold the value 1 if there's a win. Win will hold a BOOM if there's a loss. 
      
      4.1.3) Initialize a play array<!--Object?--> to represent the squares that have been played already. This array will have the same length as the 'mines' array. This is the array that the board will be rendered from. Each of these array elements will be mapped into dynamically created HTML elements(divs) in the next step. Index 0 will correspond to the top left square and the last index will be on the bottom right, mapping left to right, top to bottom. The initial value of every index will be null.

      4.1.4) Create a game board dynamically in the size chosen by the player: 
         4.1.4.1) Create a game board in the DOM by iterating over the 'play' array and for each index[i], adding a <div id="index"> into the <div id="board"> with "index" === play[i].
         4.1.4.2) Each <div> will have an initial innerHTML equal to the 'null' image from the TILES object, rendering it as an unplayed square.<!--I changed this to a css background image property-->

      4.1.5) Call the RENDER function:
   
   <!--RENDER FUNCTION--> Job: render the board from the 'play' array and check 'win' value for 1, BOOM, or 'null'
   4.2) Render state variables to the page(incl. win message):
      4.2.1) Render the board's play area:
         4.2.1.1) Loop over each of the elements in the 'play' array, and for each iteration:
            4.2.1.1.2) Use the index of the iteration to access the mapped value from the 'play' array.
            4.3.1.1.3) Set the image of the corresponding HTML element by using the value as a key on the TILES object.
      
      4.2.2) Render an image to a separate 'game state' tile above the board:
         4.2.2.1) If there is a mousedown event within the board area, render an image of a wincing smiley as in the original windows game.
         4.2.2.2) If win is equal to BOOM (loss), render a dead smiley image.
         4.2.2.3) Otherwise, render a congratulatory message to the player - an animation perhaps? Definitely a sunglasses emoji in the 'game state' tile, though.

      4.2.3) If 'win' === BOOM: 
         4.2.3.1) Game state button displays dead emoji.
         4.2.3.2) Game board is rendered with position of all mines including the one that was just clicked(red).
         4.2.3.3) Timer stops.
         4.2.3.4) Game is over. You are super dead. Play again?<!--LOSS-->

      4.2.5) If 'win' === 1: 
         4.2.5.1) You WON! 
         4.2.5.2) Timer value and move counter are displayed in congratulatory message.<!--Sounds? Animation? Leaderboard? Name entry?-->
         4.2.5.3) Game state button get sunglasses

      4.2.4) If 'win' === 'null': 
         4.2.4.1) The game is still in play. return/do nothing.
  
   4.3) Wait for the user to click a square

<!--CLICK HANDLER-->Job: 
5) Handle a player clicking a square:
   5.1) If win is not null, immediately return because the game is over.
   5.2) The first click should initialize the counter above the game board, which will continue until win !== null.
      5.2.1) The first click, using randomization, assigns 10(40)(99) mines to the 'mines' array. These will be entered as an 'X'.
      5.2.2) The non-'X' values in the 'mines' array will be assigned values corresponding the the number of mines in the "surrounding" squares.
   5.3) Obtain the index of the square that was clicked by "Extracting" the index from an id assigned to the element during board initialization.  
   5.4) If play[index] has a value other than null(0-8), that square has already been played. RETURN
   5.5) If the value of play[index] is null:
      5.5.1) mines[play[index]] is entered into the 'play' array at play[index]. <!--THIS COULD BE X-->
      5.5.2) 'win' = WINFUNCTION, defined below.
      5.5.3) click++;
   5.6) Render().

<!--WINFUNCTION-->Job: evaluate 'play' array and return a value "win" for the RENDER function to manage. 1, BOOM, or 'null'
6.) Check for a win condition and update the 'win' variable:
   /// Mines[index] value has just been entered into 'play' array in the click handler.
   --How to handle edges
   --
   6.1) Iterate through the 'play' array searching for 'X'. If an 'X' is found, return BOOM. Ya lost.
   Else:
   6.2) If the number of null values in the 'play' array === the number of 'X' values in the 'mines' array, return '1' <-----WIN CONDITION
   Else:
   6.3) Iterate through the 'play' array searching for 0 values that have a 'null' value in a surrounding square. This represents the beginning of propagation.
      6.1.1) The value of the 'play' array at the index of each 'null' returned is updated with the correspoding value from the 'mines' array.
      6.1.2) The iteration runs again. Any 0 values with surrounding 'null' values are updated from the 'mines' array. Repeat until no 0 values are found meeting the criteria. RETURN 'null'.

7) Handle a player clicking the replay button:
   7.1) Do steps 4.1 (initialize the state variables and board into HTML) and 4.2 (render).

	Height	Width	Mines
 Beginner	9	9	10
 Intermed	16	16	40
 Expert	  16	30	99

