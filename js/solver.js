/**
* Astar solver algorithm
*/
function Solver( puzzle, initial, goal )
{
	this.puzzle = puzzle;
	
	this.initialState = initial;
	this.goalState = goal;
	
	this.open;
	this.closed;
}

Solver.prototype.findSolution = function()
{	
	this.open = new Array();
	this.visited = {};
	this.closed = {};
	
	var solved = false;
	
	// Push the initial state
	this.open.push( this.createNode( this.initialState ) );
	
	var max = 0;
	var maxIteration = 100000;
		
	while( this.open.length > 0 && max < maxIteration )
	{
		// Sorts open by F value
		this.sortOpenList();
		
		// Grabs the lowest F value node
		var current = this.open.shift();
		
		// Checks to see if the current state is the goal
		if( current.state.join() == this.goalState.join())
		{						
			var thisNode = current;
			var ret = [];
			
			while(thisNode.parent) {
				ret.push(thisNode.movedIndex);
				thisNode = thisNode.parent;
			}
			
			return ret.reverse();
			
			break;
		}
		
		// Add this to the closed		
		this.closed[current.state.join()] = 1;
		
		// Find legal moves from this node	
		var possibleMoves = this.findLegalMoves( current.state );
		
		// Search through the legal moves
		for(var i = 0; i < possibleMoves.length; i++)
		{
			var move = possibleMoves[i];
			
			// Create a node out of it
			var node = this.createNode( move.state );
			
			// If this node isnt closed
			if( this.closed[node.state.join()] ) {
				// not a valid node
				continue;
			}

			var gScore = current.g + 1;
			var nodeVisited = this.visited[node.state.join()];
			
			// If we havented already visited this node, or if we have and the g score is better
			if( !nodeVisited || gScore < nodeVisited )
			{
				// Set its values
				node.g = gScore;
				node.h = this.getNodeScore( node.state );
				node.f = node.g + node.h;
				node.parent = current;
				node.movedIndex = move.movedIndex;
				
				// Mark this node as visited, but open				
				this.visited[node.state.join()] = node.g;
				this.open.push( node );
			}
		}
	
		max++;	
	}
	
	// Sort the open list
	this.sortOpenList();
	
	console.log( "Max Reached" );
	console.log( this.open[0] );	
}

Solver.prototype.getNodeScore = function( state )
{
	var score = 0;
	
	for( var i = 0; i < state.length; i++ )
	{
		if( state[i] != -1 )
		{
			// Get a specific tile
			var cur = this.puzzle.getLocationByIndex( i );
			var goal = this.puzzle.getLocationByIndex( state[i] );
		
			score += this.findDistance( cur.xOffset, cur.yOffset, goal.xOffset, goal.yOffset );
		}
	}
	
	return score;
}

Solver.prototype.findDistance = function( x, y, destX, destY)
{
	var xDist = Math.abs (x - destX);
	var yDist = Math.abs (y - destY);
	
	return xDist + yDist;
}

Solver.prototype.findLegalMoves = function( state )
{
	var possible = new Array();
	
	var emptyIndex;
	var emtpyLocation;
	
	// Get the empty index
	for( var i = 0; i < state.length; i++ )
	{
		if( state[i] == -1 )
		{
			emptyIndex = i;
			emptyLocation = this.puzzle.getLocationByIndex( emptyIndex );
			break;
		}
	}
	
	// North
	if( emptyLocation.yOffset - 1 >= 0)
	{	
		var index = this.puzzle.getIndexByLocation( emptyLocation.xOffset, emptyLocation.yOffset - 1 );
			
		var newState = state.slice();
		
		newState[emptyIndex] = newState[index];
		newState[index] = -1;
		
		possible.push( { state: newState, movedIndex: state[index] } );
	}
	
	// South
	if( emptyLocation.yOffset + 1 <= 3)
	{
		var index = this.puzzle.getIndexByLocation( emptyLocation.xOffset, emptyLocation.yOffset + 1 );
			
		var newState = state.slice();
		
		newState[emptyIndex] = newState[index];
		newState[index] = -1;
		
		possible.push( { state: newState, movedIndex: state[index] } );
	}
	
	// West
	if( emptyLocation.xOffset - 1 >= 0)
	{		
		var index = this.puzzle.getIndexByLocation( emptyLocation.xOffset - 1, emptyLocation.yOffset );
			
		var newState = state.slice();
		
		newState[emptyIndex] = newState[index];
		newState[index] = -1;
		
		possible.push( { state: newState, movedIndex: state[index] } );
	}		
	
	// East
	if( emptyLocation.xOffset + 1 <= 3)
	{
		var index = this.puzzle.getIndexByLocation( emptyLocation.xOffset + 1, emptyLocation.yOffset);
			
		var newState = state.slice();
		
		newState[emptyIndex] = newState[index];
		newState[index] = -1;
		
		possible.push( { state: newState, movedIndex: state[index] } );
	}

	return possible;
}

Solver.prototype.createNode = function( state )
{
	return {
		state: state,
		f: 0,
		g: 0,
		h: 0,
		closed: false,
		visited: false,
		parent: null,
		movedIndex: null
	}
}

Solver.prototype.sortOpenList = function()
{
	this.open.sort(
		function(a,b)
		{
			return ( a.f - b.f );
		}
	);
}
