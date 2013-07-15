/**
* Puzzle
*/
function Puzzle()
{
	this.tiles;
	this.emptyIndex;
	this.missingTileType;
	
	this.animationSpeed = 8;
	this.moveInProgress = false;
	
	this.initialState;
	this.solution = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
	
	this.moveCounter;
	
	this.createElement();	
}

Puzzle.prototype.createElement = function()
{
	this.puzzleElement = document.getElementById("puzzle");
	this.audioElement = document.getElementById("audio");
	this.infoElement = document.getElementById("info");
	
	this.solveButton = document.getElementById("solve");
	this.solveButton.innerText = "Solve!";
	this.solveButton.onclick = function(puzzle)
	{
		return function()
		{
			puzzle.solve();
		}
	}(this)
}

Puzzle.prototype.scramble = function( tileArray )
{
	var solvable = false
	
	// Check data
	if( tileArray && tileArray.constructor == Array && tileArray.length == 15 )
	{
		// Find the empty index
		this.emptyIndex = 120 - tileArray.sum();
		
		// Store the empty as the missing tile
		this.missingTileType = this.emptyIndex;
				
		// Check to see if the puzzle is solvable
		if( this.isSolvable( tileArray, this.emptyIndex ) )
		{				
			// Reset the move counter
			this.moveCounter = 0;
		
			// Shallow copy the initial tileArray
			this.initialState = tileArray.slice(0);
			
			// Insert a -1 to represent the empty space
			tileArray.splice(this.emptyIndex,0,-1);
			
			// Remove the empty from the solution
			this.solution[this.emptyIndex] = -1;
			
			// Create the tiles
			this.createTiles( tileArray );
			
			// Show the solve button
			this.solveButton.style.display = "block";
			
			// Hide any messages the solve button
			this.infoElement.style.display = "none";
			
			solvable = true;
			
		}
		else
		{
			// Show the unable to solve error
			this.puzzleError("There is no solution for the puzzle data you've provided.");
		}
	
	}
	else
	{
		// Show the unable to solve error
		this.puzzleError("The puzzle data you've provided is not valid.");
	}
	
	return solvable;
}

Puzzle.prototype.createTiles = function( tileArray )
{
	this.tiles = new Array();
	
	var tileLength = tileArray.length;

	for (var i = 0; i < tileLength; i++ )
	{
		if( tileArray[i] != -1)
		{
			var puzzle = this;
			var type = tileArray[i];
			var index = i;
			var location = this.getLocationByIndex( i );

			this.tiles.push(
				new Tile( puzzle, type, index, location )
			);
		}
	}
	
	this.renderTiles();
}

Puzzle.prototype.renderTiles = function()
{
	this.puzzleElement.innerHTML = '';
	
	var tileLength = this.tiles.length;
	
	for (var i = 0; i < tileLength; i++ )
	{
		this.puzzleElement.appendChild( this.tiles[i].element );
	}
}

Puzzle.prototype.getTileByType = function( type )
{
	// If its a tile that exists
	if( type != this.missingTileType )
	{
		for(var i = 0; i < this.tiles.length; i++)
		{
			if(this.tiles[i].type == type)
			{
				return this.tiles[i];
			}
			
		}	
	}
	else
	{
		return this.getLocationByIndex( this.emptyIndex );
	}
}

Puzzle.prototype.getLocationByIndex = function( index )
{
	var xOffset = (index == 16) ? 3 : index % 4;
	var yOffset = (index == 16) ? 3 : Math.floor(index / 4);
	
	var x = xOffset * 162;
	var y = yOffset * 162;
	
	return { 
		xOffset : xOffset,
		yOffset : yOffset,
		x : x, 		
		y : y		
	}
}

Puzzle.prototype.getIndexByLocation = function( xOffset, yOffset )
{
	var index = yOffset * 4 + xOffset;
	
	return index;
}

Puzzle.prototype.findEmptyLocation = function( tile )
{
	var emptyLocation = this.getLocationByIndex( this.emptyIndex );
	
	var canMove = false;
	
	// North
	if( tile.loc.yOffset - 1 == emptyLocation.yOffset && tile.loc.xOffset == emptyLocation.xOffset)
	{
		emptyLocation.direction = "north";
		canMove = true;
	}
	
	// South
	if( tile.loc.yOffset + 1 == emptyLocation.yOffset && tile.loc.xOffset == emptyLocation.xOffset)
	{
		emptyLocation.direction = "south";
		canMove = true;
	}
	
	// West
	if( tile.loc.xOffset - 1 == emptyLocation.xOffset && tile.loc.yOffset == emptyLocation.yOffset)
	{		
		emptyLocation.direction = "west";
		canMove = true;
	}		
	
	// East
	if( tile.loc.xOffset + 1 == emptyLocation.xOffset && tile.loc.yOffset == emptyLocation.yOffset)
	{
		emptyLocation.direction = "east";
		canMove = true;
	}
	
	// If it can move
	if( canMove && !this.moveInProgress)
	{				
		return emptyLocation;
	}
	else
	{
		return -1;
	}

}

Puzzle.prototype.checkSolution = function()
{
	var currentState = new Array();
	
	var tileLength = this.tiles.length;
	
	// Add the empty
	currentState[this.emptyIndex] = -1;
	
	// Build the current board state
	for(var i = 0; i < tileLength; i++)
	{
		var tile = this.tiles[i];

		currentState[tile.index] = tile.type;
	}
	
	// Check the state array for a match
	if( currentState.join() == this.solution.join() )
	{
		// If the current state is the solution
		this.puzzleSolved();
	}	
}

Puzzle.prototype.puzzleSolved = function()
{
	var message = document.createElement("h1");
	message.innerHTML = "Congratulations, you win!<br>" + this.moveCounter + " moves to solution";

	var restartButton = document.createElement("div");
	restartButton.className = "restart";
	restartButton.innerText = "Start Over";
	restartButton.onclick = function(puzzle)
	{
		return function()
		{
			// Reset to initial state
			puzzle.scramble( puzzle.initialState );
			
			// Hide Message
			puzzle.infoElement.style.display = "none";
			
			// Stop and reset the fanfare
			puzzle.audioElement.pause();
			puzzle.audioElement.currentTime = 0;
		}
		
	}(this);
		
	var docFragment = document.createDocumentFragment();
	docFragment.appendChild(message);
	docFragment.appendChild(restartButton);
	
	var source = document.createElement("source");
	source.src = "assets/fanfare.mp3";
	source.type = "audio/mpeg";
	
	// Play the fanfare
	this.audioElement.appendChild(source);
	this.audioElement.play();
	
	this.showMessage( docFragment );
}

Puzzle.prototype.puzzleError = function( errorMessage )
{
	var message = document.createElement("h1");
	message.innerHTML = errorMessage;
		
	var docFragment = document.createDocumentFragment();
	docFragment.appendChild(message);
	
	this.showMessage( docFragment );
}

Puzzle.prototype.showMessage = function( content )
{
	this.infoElement.innerHTML = ""; 
	
	this.infoElement.appendChild(content);
	
	// Show the info element
	this.infoElement.style.display = "block";
}

Puzzle.prototype.isSolvable = function( tileArray, emptyIndex )
{
	var inversions = tileArray.inversions();
	var emptyLocation = this.getLocationByIndex( emptyIndex );
	
	// If num inversions + blank row number is even, its solvable
	if( (inversions + emptyLocation.yOffset) % 2 == 0 )
	{
		return true;
	}
	else
	{
		return false;
	}
}

Puzzle.prototype.solve = function()
{
	var currentState = new Array();
	
	var tileLength = this.tiles.length;
	
	// Add the empty
	currentState[this.emptyIndex] = -1;
	
	// Build the current board state
	for(var i = 0; i < tileLength; i++)
	{
		var tile = this.tiles[i];

		currentState[tile.index] = tile.type;
	}
	
	// Check the current state
	if( currentState.join() == this.solution.join() )
	{
		this.puzzleSolved();
			
		return this.moveCounter;
	}
	else
	{
	
		// Find a solution to the current board
		var solver = new Solver( this, currentState, this.solution );
		var solution = solver.findSolution();
		
		if(solution.length > 0)
		{
			//this.hideMessage();
			
			function showSolution( puzzle, solution )
			{		
				var tileIndex = solution.shift();

				var tile = puzzle.getTileByType(tileIndex);
				
				tile.findLocation(
					function(puzzle, solution)
					{
						return function()
						{
							if( solution.length > 0 )
							{
								showSolution( puzzle, solution );
							}							
						}
						
					}(puzzle, solution)	
				)
			}
			
			showSolution( this, solution );
		}
		else
		{
			this.puzzleError("Unable to find a solution to the puzzle you provided");
		}
		
		// Number of moves to solution
		return solution.length+1;
	}
}