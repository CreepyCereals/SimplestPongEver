(function(){

	function Sprite(size){ // Constructor
		this.size = size;

	}

	Sprite.prototype = {
		render: function(context){ // context has been translated to the position where the object needs to be drawn, that's why fillRect() takes (0, 0, ...) as argument. 

			context.fillRect(0, 0, this.size[0], this.size[1]);
		}

	};

	window.Sprite = Sprite;
})();
