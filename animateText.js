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

		this.$element = $(element);
		this.textObjects = textObjects;
		this.lastTextObject;
		this.repeated = 0;

		//Default options
		this.defaults = {
			repeat: true,
			element: {
				css: {
					position: 'relative',
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
				easing: 'linear'
			}
		};

		//Merge default options with user options
		this.options = $.extend(true, {}, this.defaults, options);

		//Default animations
		this.animations = {
			"fadeIn": {
				positions: {
					start: {
						opacity:0
					},
					0: {
						opacity:1
					}
				}
			},
			"fadeOut": {
				positions: {
					start: {
						opacity:1
					},
					0: {
						opacity:0
					}
				}
			},
			"right_to_left": {
				positions: {
					start: {
						right: 0,
						opacity: 0,
						top: '50%'
					},
					0: {
						right: '75%',
						opacity: 1,
						duration:600
					},
					1: {
						duration:600
					},
					2: {
						opacity: 0,
						duration:600
					}
				}
			},
			"left_to_right": {
				positions: {
					start: {
						right: '100%',
						opacity: 0,
						'text-align': 'right',
						top: '50%',
					},
					0: {
						right: '25%',
						opacity: 1,
						duration: 600
					},
					1: {
						duration: 600
					},
					2: {
						opacity: 0,
						duration: 600
					}
				}
			},
			"explode": {
				positions: {
					start: {
						top: '30%',
						width: '100%',
						opacity: 0,
						'font-size': '10px',
						'text-align': 'center'
					},
					0: {
						opacity:1,
						duration:0
					},
					1: {
						top: '0%',
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
						opacity:0,
						top: '0%',
						'font-size': '150px',
						'text-align': 'center'
					},
					0: {
						top: '30%',
						'font-size': '40px',
						opacity: 1,
						duration: 1000
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

			this.loadAnimations();
			this.loadTextObjects(function(){
				self.$element.show();
				self.startAnimation();
			});
		},

		loadAnimations: function(){
			var self = this;

			$.each(this.animations, function(animationId, animation){
				animation.duration = 0;

				$.each(animation.positions, function(positionId, position){
					if(positionId !== "start"){
						if(typeof(position.duration) !== "number" || position.duration < 0){
							position.duration = self.options.position.duration;
						}

						if(typeof(position.easing) === "undefined"){
							position.easing = self.options.position.easing;
						}

						animation.duration += position.duration;
					}
				});
			});
		},

		loadTextObjects: function(callback){
			var self = this;

			totalDuration = 0;

			$.each(this.textObjects, function(textObjectId, textObject){
				var textObjectDuration = 0;

				textObject.id = textObjectId;

				//Set text object element
				textObject.$element = self.$element.children("li:eq(" + textObjectId + ")");

				//Make sure text object element exists
				if(!textObject.$element.length){
					return;
				}

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

				textObject.positions = $.extend(true, {}, self.animations[textObject.animation].positions, textObject.positions);

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

				//Calculate text object duration
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
				animation = this.animations[textObject.animation];

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
							self.stopAnimation();
							self.startAnimation();
							self.repeated++;
						}
						else{
							self.stopAnimation();
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