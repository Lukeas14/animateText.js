/*

animateText.js

jQuery plugin for animating text.

Version: 1.0
Github: https://github.com/Lukeas14/animateText.js
Author: Justin Lucas (Lukeas14@gmail.com)
Copyright (c) 2012 Justin Lucas
Licensed under MIT License (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt)

*/

;(function($, window, document, undefined){

	function AnimateText(element, textObjects, options, animations){
		var self = this;

		this.$element = $(element); //ul jQuery object
		this.textObjects = textObjects;
		this.lastTextObject; //last text object to complete its animation
		this.repeated = 0; //# of times the animation sequence has repeated

		//Default options
		this.defaults = {
			repeat: true,
			element: {
				css: {
					position: 'relative',
					overflow: 'hidden',
					margin: 0,
					padding: 0,
					width: function(){
						return $(this).parent().width();
					},
					height: function(){
						return $(this).parent().height();
					},
					'list-style': 'none'
				}
			},
			textObject: {
				css: {
					position: 'absolute',
					margin: 0,
					padding: 0
				},
				offset: 0,
				animation: 'explode'
			},
			position: {
				duration: 1000,
				easing: 'swing'
			}
		};

		//Merge default options with user options
		this.options = $.extend(true, {}, this.defaults, options);

		//Default animations
		this.animations = {
			"fadeIn": {
				positions: {
					start: {
						top: '50%',
						left: '50%',
						opacity: 0
					},
					0: {
						opacity: 1,
						duration: 1200
					},
					1: {
						duration: 1200
					},
					2: {
						opacity: 0,
						duration: 300
					}
				}
			},
			"fadeOut": {
				positions: {
					start: {
						top: '50%',
						left: '50%',
						opacity: 1
					},
					0: {
						duration: 1200
					},
					1: {
						opacity: 0
					}
				}
			},
			"rightToLeft": {
				positions: {
					start: {
						width: '100%',
						left: '100%',
						opacity: 0,
						top: '50%',
						'text-align': 'left'
					},
					0: {
						left: '25%',
						opacity: 1,
						duration: 1200
					},
					1: {
						duration: 1200
					},
					2: {
						opacity: 0,
						duration: 1200
					}
				}
			},
			"leftToRight": {
				positions: {
					start: {
						width: '100%',
						right: '100%',
						opacity: 0,
						top: '50%',
						'text-align': 'right'
					},
					0: {
						right: '25%',
						opacity: 1,
						duration: 1200
					},
					1: {
						duration: 1200
					},
					2: {
						opacity: 0,
						duration: 1200
					}
				}
			},
			"explode": {
				positions: {
					start: {
						top: '40%',
						width: '100%',
						opacity: 0,
						'font-size': '10px',
						'text-align': 'center'
					},
					0: {
						opacity: 1,
						duration: 0
					},
					1: {
						top:'-10%',
						'font-size': '150px',
						opacity: 0,
						duration: 1000
					}
				}
			},
			"implode": {
				positions: {
					start: {
						width: '100%',
						opacity: 0,
						top: '0%',
						'font-size': '150px',
						'text-align': 'center'
					},
					0: {
						top: '30%',
						'font-size': '40px',
						opacity: 1,
						duration: 1000
					},
					1: {
						duration: 1200
					},
					2: {
						opacity: 0,
						duration: 400
					}
				}
			}
		};
		//Merge default animations with user animations
		$.extend(true, this.animations, animations);

		this.init();
	}

	AnimateText.prototype = {

		init: function(){
			var self = this;

			//Hide ul element and set css
			this.$element.hide().css(this.options.element.css);

			//Start animation as soon as animations and textObjects are loaded.
			this.loadAnimations();
			this.loadTextObjects(function(){
				self.$element.show();
				self.startAnimation();
			});
		},

		loadAnimations: function(){
			var self = this;

			//Validate every position in every animation
			$.each(this.animations, function(animationId, animation){
				animation.duration = 0;

				$.each(animation.positions, function(positionId, position){
					if(positionId !== "start"){
						//Make sure position's duration is set
						if(typeof(position.duration) !== "number" || position.duration < 0){
							position.duration = self.options.position.duration;
						}

						//Make sure position's easing property is set
						if(typeof(position.easing) === "undefined"){
							position.easing = self.options.position.easing;
						}

						//Calculate the animation's total duration
						animation.duration += position.duration;
					}
				});
			});
		},

		loadTextObjects: function(callback){
			var self = this;

			//Keep track of the animation sequence's total duration
			totalDuration = 0;

			//Validate every textObject
			$.each(this.textObjects, function(textObjectId, textObject){
				var textObjectDuration = 0;

				textObject.id = textObjectId;

				//Set text object element
				textObject.$element = self.$element.children("li:eq(" + textObjectId + ")");

				//Make sure text object element exists
				if(!textObject.$element.length){
					return;
				}

				//Set textObject to its default style
				textObject.$element.css(self.options.textObject.css).attr('id', textObject.id);

				//Check for valid animation type
				if(typeof(textObject.animation) === "undefined" || (typeof(textObject.animation) === "string" && !textObject.animation in self.animations)){
					textObject.animation = self.options.textObject.animation;
				}

				//Check for valid time offset
				if(typeof(textObject.offset) !== "number" || textObject.offset < 0){
					textObject.offset = self.options.textObject.offset;
				}

				if(typeof(textObject.duration) !== "number" || textObject.duration < 0){
					textObject.duration = 0;
				}

				//Merge textObject's positions with its animation's positions
				textObject.positions = $.extend(true, {}, self.animations[textObject.animation].positions, textObject.positions);

				//Calculate textObject duration
				$.each(textObject.positions, function(positionId, position){
					if(positionId !== "start"){
						if(typeof(textObject.duration) === "number" && textObject.duration > 0){
							position.duration = (position.duration / self.animations[textObject.animation].duration) * textObject.duration;
						}
						else{
							textObjectDuration += position.duration;
						}
					}
				});

				if(textObjectDuration > 0){
					textObject.duration = textObjectDuration;
				}

				//Determine if this textObject will be last to complete its animation
				if((textObject.offset + textObject.duration) > totalDuration){
					totalDuration = (textObject.offset + textObject.duration);
					self.lastTextObject = textObject.id;
				}

				textObject.status = 'ready';
			});

			callback();
		},

		startAnimation: function(){
			var self = this;

			$.each(this.textObjects, function(textObjectId, textObject){
				//Set textObject to its start position
				textObject.$element.css(textObject.positions.start);

				//Start textObject's animation after it's offset time has passed
				setTimeout(function(){
					self.animateTextObject(textObject.id, 0);
				}, textObject.offset);
			});
		},

		stopAnimation: function(){
			this.$element.children("li").stop();
		},

		animateTextObject: function(textObjectId, animationPosition){
			var self = this,
				textObject = this.textObjects[textObjectId],
				animation = this.animations[textObject.animation],
				test = function(){
					var to = textObject;
					console.log(to);
					return 'hey';
				};

			//Finally, animate the textObject
			textObject.$element.animate(
				textObject.positions[animationPosition],
				textObject.positions[animationPosition].duration,
				textObject.positions[animationPosition].easing,
				function(){
					//Does this animation have another position? If so animate it.
					if(typeof(textObject.positions[(animationPosition + 1)]) !== "undefined"){
						self.animateTextObject(textObject.id, (animationPosition + 1));
					}
					//Is this the last text object in the group?
					else if(textObject.id === self.lastTextObject){
						self.stopAnimation();

						//Repeat animations if repeat option is set to true or we're still under the set repeat limit
						if(self.options.repeat === true || (typeof(self.options.repeat) === "number" && self.repeated < self.options.repeat)){
							self.startAnimation();
							self.repeated++;
						}
					}
				}
			);
		}
	};

	$.fn.animateText = function(textObjects, options, animations){
		return this.each(function(){
			new AnimateText(this, textObjects, options, animations);
		});
	};

})( jQuery );