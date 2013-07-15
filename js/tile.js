/**
* Tile
*/
function Tile( puzzle, type, index, loc )
{
	var _this = this;
	
	this.puzzle = puzzle;
	this.type = type;
	this.index = index;
	this.loc = loc;

	this.dragging = false;
	this.dragThreshold = 15;
	this.dragsnapTolerance = 80;
		
	this.element;
	
	// Create DOM element
	this.createElement(type);
}

Tile.prototype.createElement = function( type )
{	
	this.element = document.createElement("div");
	this.element.className = "tile type" + type;
	
	this.element.style.left = this.loc.x + "px";
	this.element.style.top = this.loc.y + "px";

	// Reference for event handlers
	var tile = this;
	
	this.element.onmouseup = function()
	{	
		tile.findLocation();
			
		tile.dragging = false;			
		document.onmousemove = null;
	}
	
	this.element.onmousedown = function()
	{
		var initialCursorX;
		var initialCursorY;
		
		// Add Drag event listener
		document.onmousemove = function(e)
		{

			// Get initial cursor position for threshold 
			initialCursorX = initialCursorX || e.clientX;
			initialCursorY = initialCursorY || e.clientY;

			// If the drag distance is over the threshold
			if( Math.abs(e.clientX - initialCursorX) >= tile.dragThreshold || Math.abs(e.clientY - initialCursorY) >= tile.dragThreshold){
				tile.drag(e,tile);
			}

		};		
	}
	
	this.element.innerText = this.type;
}

Tile.prototype.findLocation = function( callback )
{
	var newLocation = this.puzzle.findEmptyLocation( this );
	
	if( newLocation != -1 )
	{
		this.puzzle.moveInProgress = true;
				
		this.moveToLocation( newLocation.x, newLocation.y, callback);
		this.loc = newLocation;
	}
}

Tile.prototype.moveToLocation = function( x, y, finishedCallback )
{
	var tile = this;
	
	var initialX = parseInt(tile.element.style.left);
	var initialY = parseInt(tile.element.style.top);		
	
	var direction = this.findDirection( initialX, initialY, x, y);
	
	// Animate
	(function animloop(){
		
		var done = false;
		
		var currentX = currentX || parseInt(tile.element.style.left);
		var currentY = currentY || parseInt(tile.element.style.top);
		
		switch( direction )
		{
			case 'north':
				
				if( (currentY - tile.puzzle.animationSpeed) >= y )
				{
					tile.element.style.top = currentY - tile.puzzle.animationSpeed + "px";
					
					requestAnimFrame(animloop);
				}
				else
				{
					tile.element.style.top = y + "px"
					
					done = true;
				}	
				
			break;
			
			case 'south':
				
				if( (currentY + tile.puzzle.animationSpeed) <= y )
				{
					tile.element.style.top = currentY + tile.puzzle.animationSpeed + "px";
					
					requestAnimFrame(animloop);
				}
				else
				{
					tile.element.style.top = y + "px"
					
					done = true;
				}	
			
			break;
			
			case 'east':
				
				if( (currentX + tile.puzzle.animationSpeed) <= x )
				{
					tile.element.style.left = currentX + tile.puzzle.animationSpeed + "px";
					
					requestAnimFrame(animloop);
				}
				else
				{
					tile.element.style.left = x + "px"
					
					done = true;
				}	
				
			break;
			
			case 'west':
				
				if( (currentX - tile.puzzle.animationSpeed) >= x )
				{
					tile.element.style.left = currentX - tile.puzzle.animationSpeed + "px";
					
					requestAnimFrame(animloop);
				}
				else
				{
					tile.element.style.left = x + "px"
					
					done = true;
				}				
				
			break;
			
		}
		
		if(done)
		{
			// Update the empty index
			tile.puzzle.emptyIndex = tile.index;
			
			// Set the tiles new index
			tile.index = tile.puzzle.getIndexByLocation( tile.loc.xOffset, tile.loc.yOffset );
				
			// Increment move counter
			tile.puzzle.moveCounter++;
			
			// Remove the inProgress flag
			tile.puzzle.moveInProgress = false;
			
			// Check to see if puzzle is solved
			tile.puzzle.checkSolution();
			
			// Fire the callback
			if(finishedCallback)
			{
				finishedCallback();
			}
		}
	})();
	
}

Tile.prototype.findDirection = function( curX, curY, newX, newY)
{
	var direction;
	
	// Determine direction for calculation
	if( newY < curY )
	{
		direction = "north";
	}	
	else if( newY > curY)
	{
		direction = "south";
	}
	else if( newX > curX)
	{
		direction = "east";
	}
	else if( newX < curX)
	{
		direction = "west";
	}
		
	return direction;
}

Tile.prototype.drag = function( e, tile, newLocation)
{	
	var newLocation = tile.puzzle.findEmptyLocation(tile);
	
	if( newLocation != -1)
	{
		tile.dragging = true;

		var cursorX = e.clientX - 120;
		var cursorY = e.clientY - 120;
		
		var initialX = tile.loc.x;
		var initialY = tile.loc.y;
		
		switch (newLocation.direction)
		{
			case "north":
				if (cursorY <= initialY && cursorY >= newLocation.y)
				{
					tile.element.style.top = cursorY + "px";
				}				
			break;
			
			case "south":
				
				if (cursorY >= initialY && cursorY <= newLocation.y)
				{
					tile.element.style.top = cursorY + "px";
				}
			break;
			
			case "east":
				
				if (cursorX >= initialX && cursorX <= newLocation.x)				
				{
					tile.element.style.left = cursorX + "px";
				}
				
			break;
			
			case "west":
				if (cursorX <= initialX && cursorX >= newLocation.x)				
				{
					tile.element.style.left = cursorX + "px";
				}
			break;
		}
	}
}