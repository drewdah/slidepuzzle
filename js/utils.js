/**
* Utilities functions
*/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
		  window.webkitRequestAnimationFrame || 
		  window.mozRequestAnimationFrame    || 
		  window.oRequestAnimationFrame      || 
		  window.msRequestAnimationFrame     || 
		  function(/* function */ callback, /* DOMElement */ element){
			window.setTimeout(callback, 1000 / 60);
		  };
})();

Array.prototype.sum = function(){
    return this.reduce(function(a,b) {return a+b} );
}

Array.prototype.inversions = function(){
    
	var inversions = 0;
	
	for( i = 0; i < this.length; i++ )
	{
		for( j = i + 1; j < this.length; j++ )
		{
			if(this[j] < this[i])
			{
				inversions++;
			}
		}
	}
	
	return inversions;
}


