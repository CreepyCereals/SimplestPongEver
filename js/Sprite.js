(function(){

	function Sprite(size){
		this.size = size;

	}

	Sprite.prototype = {
		render: function(context){ // The context passed has been translated to the position where the object needs to be drawn, that's why fillRect() takes (0, 0, ...) as argument. 

			context.fillRect(0, 0, this.size[0], this.size[1]);
		}

	};

	window.Sprite = Sprite;
})();