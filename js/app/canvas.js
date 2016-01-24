define(function(){
	
	(function() {
	    var lastTime = 0;
	    var vendors = ['ms', 'moz', 'webkit', 'o'];
	    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
	                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
	    }
	
	    if (!window.requestAnimationFrame)
	        window.requestAnimationFrame = function(callback, element) {
	            var currTime = new Date().getTime();
	            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
	              timeToCall);
	            lastTime = currTime + timeToCall;
	            return id;
	        };
	
	    if (!window.cancelAnimationFrame)
	        window.cancelAnimationFrame = function(id) {
	            clearTimeout(id);
	        };
	}());
	
	function unit() {
		canvas = document.getElementById('field');
		var body = document.getElementsByTagName('body')[0];		
		var width = 1900;
		if (document.documentElement.clientWidth > width) {
			width = document.documentElement.clientWidth;
			body.style.width = width + 'px';
		}
		body.style.width = width + 'px';
		canvas.width = width;      
	    ctx = canvas.getContext("2d");	    
	    var scaleFactor = 0.6;
		var panX = 0;
		var panY = 0;
	    ctx.scale(scaleFactor,scaleFactor);
	    var cW = ctx.canvas.width;
	    var cH = ctx.canvas.height;
	    cW = Math.floor(cW + cW / scaleFactor - cW);
	    cH = Math.floor(cH + cH / scaleFactor - cH);   				    		    	    	    
		
		function Player(x,y,r) {			
			this.x = x;
			this.y = y;
			this.r = r;
			this.step = 3;
			this.jumpHeight = 3;
			this.targetMove = 0;
			this.walk = false;
			this.trackingX;
			this.trackingY;
			this.moveLegs = 0;
			this.stepLegs = 0;
			this.startLegs = performance.now();
			this.startGravity = performance.now();	
			this.__moveTo = function(x,y) {
				this.x = x;
				this.y = y;
				this.coords = [
					{"id":"body","x":this.x - 70,"y":this.y + 50,"w":135,"h":120},
					{"id":"head","x":this.x - this.r,"y":this.y - 40,"w":this.r * 2,"h":this.r * 2},
					{"id":"legs","x":this.x - 60,"y":this.y + 165,"w":96,"h":145}
				];
				this.hairPoints = [
					{"x":this.x -40, "y":this.y},
					{"x":this.x - 40, "y":this.y - 40, "x2":this.x, "y2":this.y - 40, "r":40},
					{"x":this.x + 40, "y":this.y - 40, "x2":this.x + 40, "y2":this.y + 40, "r":40},
					{"x":this.x + 55, "y":this.y - 65, "xa":this.x + 30, "y2":this.y - 105},
					{"x":this.x + 30, "y":this.y - 95},
					{"xa":this.x + 25, "y":this.y - 105},
					{"xa":this.x + 25, "y":this.y - 87, "x2":this.x + 17, "y2":this.y - 74},
					{"xa":this.x + 17, "y":this.y - 90},
					{"xa":this.x + 3, "y":this.y - 65, "x2":this.x - 20, "y2":this.y - 60},
					{"x":this.x - 50, "y":this.y - 55, "x2":this.x - 40, "y2":this.y},
				];
			};								
			this.coords = [
				{"id":"body","x":this.x - 70,"y":this.y - 30,"w":135,"h":120},
				{"id":"head","x":this.x - this.r,"y":this.y - 115,"w":this.r * 2,"h":this.r * 2},
				{"id":"legs","x":this.x - 60,"y":this.y + 90,"w":96,"h":145}
			];
			this.hairPoints = [
				{"x":this.x -40, "y":this.y},
				{"x":this.x - 40, "y":this.y - 40, "x2":this.x, "y2":this.y - 40, "r":40},
				{"x":this.x + 40, "y":this.y - 40, "x2":this.x + 40, "y2":this.y + 40, "r":40},
				{"x":this.x + 55, "y":this.y - 65, "xa":this.x + 30, "y2":this.y - 105},
				{"x":this.x + 30, "y":this.y - 95},
				{"xa":this.x + 25, "y":this.y - 105},
				{"xa":this.x + 25, "y":this.y - 87, "x2":this.x + 17, "y2":this.y - 74},
				{"xa":this.x + 17, "y":this.y - 90},
				{"xa":this.x + 3, "y":this.y - 65, "x2":this.x - 20, "y2":this.y - 60},
				{"x":this.x - 50, "y":this.y - 55, "x2":this.x - 40, "y2":this.y},
			];
			this.__animHair = {
				that: this,
				points: this.hairPoints,
				start: 3,//point number
				status: false,
				finish: this.hairPoints.length - 1,			
				animate: function() {																							
					if (this.start <= this.finish && !this.status) {
						if (this.that.hairPoints[this.start].xa) {
							this.that.hairPoints[this.start].xa += 2;															
						} 
						this.start++;
					} else {
						this.status = true;
					}
						
					if (this.start != 2 && this.status) {
						this.start--;						
						if (this.that.hairPoints[this.start].xa) {					
							this.that.hairPoints[this.start].xa -= 2;
						}																
					} else {
						this.status = false;
					}				
	
				}
			};														
						
			this.hairRender = function(x,y) {		
				ctx.beginPath();		
				ctx.fillStyle = "#43464b";		
				ctx.strokeStyle = "#43464b";	
				ctx.moveTo(this.hairPoints[0].x + x, this.hairPoints[0].y + y);		
				ctx.arcTo(this.hairPoints[1].x + x , this.hairPoints[1].y + y, this.hairPoints[1].x2 + x, this.hairPoints[1].y2 + y, this.hairPoints[1].r);
				ctx.arcTo(this.hairPoints[2].x + x, this.hairPoints[2].y + y, this.hairPoints[2].x2 + x, this.hairPoints[2].y2 + y, this.hairPoints[2].r);
				ctx.quadraticCurveTo(this.hairPoints[3].x + x,this.hairPoints[3].y + y,this.hairPoints[3].xa + x, this.hairPoints[3].y2 + y);//for Animate
				ctx.lineTo(this.hairPoints[4].x + x, this.hairPoints[4].y + y);//for Animate
				ctx.lineTo(this.hairPoints[5].xa + x, this.hairPoints[5].y + y);//for Animate
				ctx.quadraticCurveTo(this.hairPoints[6].xa + x,this.hairPoints[6].y + y,this.hairPoints[6].x2 + x, this.hairPoints[6].y2 + y);//for Animate
				ctx.lineTo(this.hairPoints[7].xa + x, this.hairPoints[7].y + y);//for Animate
				ctx.quadraticCurveTo(this.hairPoints[8].xa + x,this.hairPoints[8].y + y,this.hairPoints[8].x2 + x, this.hairPoints[8].y2 + y);//for Animate
				ctx.quadraticCurveTo(this.hairPoints[9].x + x, this.hairPoints[9].y + y, this.hairPoints[9].x2 + x, this.hairPoints[9].y2 + y);//for Animate		
				ctx.stroke();	
				ctx.fill();		
				ctx.closePath();	
			};
					
			this.bodyRender = function(x,y) {					
				ctx.beginPath();		
				ctx.fillStyle = "#5362a3";		
				ctx.strokeStyle = "#43464b";	
				ctx.moveTo(this.x,this.y + 50);
				ctx.lineTo(this.x - 10, this.y + 50);
				ctx.quadraticCurveTo(this.x + x - 60, this.y + y + 55, this.x + x - 70, this.y + y + 108);
				ctx.lineTo(this.x - 63, this.y + 108);//sleeve point1
				ctx.lineTo(this.x - 53, this.y + 109);//sleeve point2
				ctx.lineTo(this.x - 45, this.y + 110);
				ctx.lineTo(this.x - 42, this.y + 100);
				ctx.lineTo(this.x - 45, this.y + 170);
				ctx.lineTo(this.x - 45, this.y + 170);		
				ctx.moveTo(this.x, this.y + 50);
				ctx.lineTo(this.x + 10, this.y + 50);
				ctx.quadraticCurveTo(this.x + 55, this.y + 55, this.x + 65, this.y + 108);
				ctx.lineTo(this.x + 58, this.y + 108);//sleeve point3
				ctx.lineTo(this.x + 48, this.y + 109);//sleeve point4
				ctx.lineTo(this.x + 40, this.y + 110);
				ctx.lineTo(this.x + 37, this.y + 100);
				ctx.lineTo(this.x + 40, this.y + 170);
				ctx.lineTo(this.x + 40, this.y + 175);
				ctx.lineTo(this.x - 45, this.y + 170);	
				ctx.fill();
				ctx.closePath();										
			};
									
			this.legsRender = function(x,y) {			
				ctx.beginPath();		
				ctx.fillStyle = "#3b4148";		
				ctx.strokeStyle = "#43464b";	
				ctx.moveTo(this.x, this.y + 170);
				ctx.lineTo(this.x - 45, this.y + 165);
				ctx.quadraticCurveTo(this.x - 45, this.y + 205, this.x + x - 50, this.y +310);
				ctx.lineTo(this.x + x - 5, this.y + 310);
				ctx.lineTo(this.x - 10, this.y + 210);
				ctx.quadraticCurveTo(this.x - 10, this.y + 202, this.x - 3, this.y + 200);
				ctx.moveTo(this.x, this.y + 170);
				ctx.lineTo(this.x + 40, this.y + 165);	
				ctx.quadraticCurveTo(this.x + 40, this.y + 205, this.x + x + 45, this.y + 310);
				ctx.lineTo(this.x + x, this.y + 310);
				ctx.lineTo(this.x + 5, this.y + 210);
				ctx.quadraticCurveTo(this.x + 5, this.y + 202, this.x - 2, this.y + 200);
				ctx.lineTo(this.x - 3, this.y + 200);
				ctx.fill();		
				ctx.closePath();
				this.footsRender(x,y);
			};
			this.footsRender = function(x,y) {
				ctx.beginPath();
				ctx.strokeStyle = "red";
				ctx.fillStyle = "#e1e1e0";
				ctx.moveTo(this.x + x - 25, this.y + y + 300);
				ctx.quadraticCurveTo(this.x + x - 40, this.y + y + 300, this.x + x - 52, this.y + y + 310);
				ctx.lineTo(this.x + x - 2, this.y + y + 310);
				ctx.quadraticCurveTo(this.x + x - 15, this.y + y + 300, this.x + x - 25, this.y + y + 300);
				ctx.fill();	
				ctx.closePath();
				
				ctx.beginPath();
				ctx.strokeStyle = "red";
				ctx.fillStyle = "#e1e1e0";
				ctx.moveTo(this.x + x + 25, this.y + y + 300);
				ctx.quadraticCurveTo(this.x + x + 12, this.y + y + 300, this.x + x - 2, this.y + y + 310);
				ctx.lineTo(this.x + x + 47, this.y + y + 310);
				ctx.quadraticCurveTo(this.x + x + 35, this.y + y + 300, this.x + x + 25, this.y + y + 300);
				ctx.fill();	
				ctx.closePath();
			};									
		};
		
		Player.prototype.eyesRender = function(x,y){
			ctx.beginPath();								
            ctx.fillStyle = "#fff";
			ctx.moveTo(this.x - 25, this.y);		
			ctx.quadraticCurveTo(this.x - 20, this.y + 15 - y, this.x - 6, this.y + 5);
			ctx.quadraticCurveTo(this.x + 5, this.y - 10 + y, this.x - 6, this.y - 15 + y);
			ctx.quadraticCurveTo(this.x - 21, this.y - 20 + y, this.x - 25, this.y);
			ctx.fill();
			ctx.closePath();
				
			ctx.beginPath();
			ctx.fillStyle = "#fff";
			ctx.moveTo(this.x + 25, this.y);		
			ctx.quadraticCurveTo(this.x + 20, this.y + 15, this.x + 6, this.y + 5);
			ctx.quadraticCurveTo(this.x - 5, this.y - 10, this.x + 6, this.y - 15);
			ctx.quadraticCurveTo(this.x + 21, this.y - 20, this.x + 25, this.y);
			ctx.fill();
			ctx.closePath();
		};
		
		Player.prototype.eyeballsRender = function(x,y) {
			ctx.beginPath();
			ctx.fillStyle = "#43464b";		
			ctx.arc(this.x + x - 10, this.y + y - 5, this.r / 19, 0, Math.PI*2, false);
			ctx.stroke();
			ctx.fill();
			ctx.closePath();
			
			ctx.beginPath();
			ctx.fillStyle = "#43464b";		
			ctx.arc(this.x + x + 10, this.y + y - 5, this.r / 19, 0, Math.PI*2, false);
			ctx.stroke();
			ctx.fill();
			ctx.closePath();
		};
		
		Player.prototype.mouthRender = function(x,y) {
			var mouth = new Image();
			mouth.src = "img/mouth.png";
			ctx.drawImage(mouth,100,0,50,30,this.x - 27,this.y + 7,50,30);
		};
		
		Player.prototype.headRender = function(x,y) {
			ctx.beginPath();				
			ctx.fillStyle = "#fce1c7";					
			ctx.arc(this.x + x, this.y + y, this.r, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.fill();				
			this.neckRender(x,y);
			this.hairRender(x,y);
		};
		
		Player.prototype.neckRender = function(x,y) {
			ctx.beginPath();		
			ctx.fillStyle = "#fdd4a6";			
			ctx.strokeStyle = "#43464b";	
			ctx.moveTo(this.x + x, this.y + y + this.r);
			ctx.quadraticCurveTo(this.x + x - 5, this.y + y + this.r, this.x + x - 8, this.y + y + this.r);
			ctx.quadraticCurveTo(this.x + x - 8, this.y + y + this.r + 5, this.x + x - 10, this.y + y + 50);
			ctx.lineTo(this.x + x + 10, this.y + y + 50);
			ctx.quadraticCurveTo(this.x + x + 7, this.y + y + this.r, this.x + x + 8, this.y + y + this.r);
			ctx.fill();		
			ctx.closePath();
		};
		
		Player.prototype.armlRender = function(x,y) {
			ctx.beginPath();		
			ctx.fillStyle = "#fce1c7";		
			ctx.strokeStyle = "#43464b";	
			ctx.moveTo(this.x - 63, this.y + 108);
			ctx.lineTo(this.x - 65, this.y + 118);
			ctx.lineTo(this.x + x - 67, this.y + y + 165);
			ctx.lineTo(this.x + x - 57, this.y + y + 165);
			ctx.lineTo(this.x - 54, this.y + 119);
			ctx.lineTo(this.x - 53, this.y + 109);
			ctx.fill();		
			ctx.closePath();
			this.handlRender(this.x + x - 57, this.y + y + 160);
		};
		
		Player.prototype.handlRender = function(x,y) {
			ctx.beginPath();		
			ctx.fillStyle = "#fce1c7";		
			ctx.strokeStyle = "#43464b";			
			ctx.arc(x - 5, y + 3, 10, 0, Math.PI*2, false);
			ctx.fill();	
			ctx.closePath();
		};
		
		Player.prototype.armrRender = function(x,y) {
			ctx.beginPath();		
			ctx.fillStyle = "#fce1c7";		
			ctx.strokeStyle = "#43464b";	
			ctx.moveTo(this.x + 58, this.y + 108);
			ctx.lineTo(this.x + 60, this.y + 118);
			ctx.lineTo(this.x + x + 62, this.y + y + 160);			
			ctx.lineTo(this.x + x + 52, this.y + y + 160);
			ctx.lineTo(this.x + 50, this.y + 118);
			ctx.lineTo(this.x + 48, this.y + 109);
			ctx.fill();	
			ctx.closePath();
			this.handrRender(this.x + x + 62 - 4,this.y + y + 160);
		};
		
		Player.prototype.handrRender = function(x,y) {
			ctx.beginPath();		
			ctx.fillStyle = "#fce1c7";		
			ctx.strokeStyle = "#43464b";			
			ctx.arc(x - 2, y, 10, 0, Math.PI*2, false);
			ctx.fill();			
			ctx.closePath();
		};														
		
		ctx.canvas.addEventListener('mousedown', function(e) {
			for (var j=0; j<playersMass.length; j++) {
				var mX = (e.clientX - ctx.canvas.offsetLeft - panX + window.scrollX) / scaleFactor;
				var mY = (e.clientY - ctx.canvas.offsetTop - panY) / scaleFactor;			
				for (var i=0; i<playersMass[j].coords.length; i++) {
					var part = playersMass[j].coords[i];				
					if (mX >= part.x && mX <= part.x + part.w && mY >= part.y && mY <= part.y + part.h) {
						console.log(part.id + ' touched');
					}
				}
				playersMass[j].targetMove = mX;
			}
		});
				
		canvas.addEventListener('mousemove', function(e) {
			for (var j=0; j<playersMass.length; j++) {
				
				var mX = (e.clientX - ctx.canvas.offsetLeft - panX + window.scrollX) / scaleFactor;
				var mY = (e.clientY - ctx.canvas.offsetTop - panY) / scaleFactor;
							
				playersMass[j].trackingX = function(coord) {
					var maxMove = 5;
					var move = (mX - this.x) / 100;
					if (move >= maxMove) {
						return maxMove;
					} else if (move <= -maxMove) {
						return -maxMove;
					} else {
						return move;
					} 
	
				};
				
				playersMass[j].trackingY = function(coord) {
					var maxMove = 5;
					var move = (mY - this.y) / 100;
					if (move >= maxMove) {
						return maxMove;
					} else if (move <= -maxMove) {
						return -maxMove;
					} else {
						return move;
					} 
	
				};
			
			}
		});																					
		
		var walk = function(obj,coords) {									
			
			var _coords = coords;		
			if (_coords) {
				var step = obj.step;
				var jumpHeight = obj.jumpHeight;
				var length = coords - obj.x;
				var move = obj.x;
				for (var i=0; i<=step; i++) {
					if (length <= step + i && length > 0) {
						length = 0;
					}
				}				
				if (length < 0) {
					step = step * -1;
				}
				if (length == 0) {
					obj.walk = false;
					step = 0;
								
				}
				if (step) {
					obj.walk = true;
					obj.__moveTo(move = obj.x + step,obj.y = obj.y - jumpHeight);
				}
			}			
									
		};	

		var legsPos = (function() {
			var range = 10;
			return function(obj) {
				step = obj.step;			
				var length = obj.targetMove - obj.x;
				
				if (length < 0 && obj.walk) {
					if (length + step > 0) {
						obj.__moveTo(obj.x = obj.x + obj.targetMove - obj.x,obj.y);
					}
					if (obj.moveLegs <= range) {
						
						if (obj.moveLegs > range - 2 && obj.moveLegs < range) {
							obj.moveLegs = obj.moveLegs - 2;
						}						
												
						var timePassed = performance.now() - obj.startLegs;
						var delta = timePassed / 400;
						if (delta >= 1) {
							obj.startLegs = performance.now();
						}
						obj.moveLegs = obj.moveLegs + (Math.pow(delta,2) * ((7 + 2) * delta - 7));						
					}
					return obj.moveLegs;
				} else if (length > 0 && obj.walk){
					if (obj.moveLegs < range) {
						if (obj.moveLegs > range - 2 && obj.moveLegs < range) {
							obj.moveLegs = obj.moveLegs - 2;
						}
						var timePassed = performance.now() - obj.startLegs;
						var delta = timePassed / 400;
						if (delta >= 1) {
							obj.startLegs = performance.now();
						}
						obj.moveLegs = obj.moveLegs + (Math.pow(delta,2) * ((7 + 2) * delta - 7));
					}					
					return obj.moveLegs;
				} else {
					obj.moveLegs = 0;
					obj.startLegs = performance.now();
					return 0;
				}
			};
		})();	
		
		var lArmPos = function(obj){																						
			move = (Math.pow(supertimer(2000),2) * ((2.5 + 1) * supertimer(2000) - (7 - supertimer(2000))));												 
			return move;
		};
		
		var rArmPos = function(obj){																	
			move = (Math.pow(supertimer2(3000),2) * ((1.0 + 1) * supertimer2(3000) - (8 - supertimer2(3000))));												 
			return move;			
		};
		
		var supertimer = (function () {
			var start = Date.now();
			var timeSave = 0;
			var timePassed = 0;
			return function(interval) {				
				if (timePassed < interval) {
					timePassed = Date.now() - start;
					timeSave = timePassed;
				} else if (timeSave >= 0) {
					timeSave = timePassed - (Date.now() - start - timePassed);					 
				} else {
					timePassed = 0;
					timeSave = 0;
					start = Date.now();
				}	
				return timeSave / 1000;		
			};
		})();	
		
		var supertimer2 = (function () {
			var start = Date.now();
			var timeSave = 0;
			var timePassed = 0;
			return function(interval) {				
				if (timePassed < interval) {
					timePassed = Date.now() - start;
					timeSave = timePassed;
				} else if (timeSave >= 0) {
					timeSave = timePassed - (Date.now() - start - timePassed);					 
				} else {
					timePassed = 0;
					timeSave = 0;
					start = Date.now();
				}	
				return timeSave / 1000;		
			};
		})();												
		
		function gravity(obj) {			
			for (var i=0; i<obj.coords.length; i++) {
				var part = obj.coords[i];
				if (part.id == "legs") {
					var bottomCoords = Math.ceil(part.y + part.h);					
				}
			};
			if (bottomCoords == cH) {
				obj.startGravity = performance.now();
				return;
			} 
			if (bottomCoords >= cH) {
				obj.__moveTo(obj.x,obj.y = Math.floor(obj.y - bottomCoords + cH));				
				obj.startGravity = performance.now();
				return;
			} else {				
				var timePassed = performance.now() - obj.startGravity;
				var delta = timePassed / 60;
				obj.__moveTo(obj.x,obj.y = obj.y + delta);
			}															
		};				
							
		
		var playersMass = [];
		var player = new Player(950,550,40);		
		playersMass.push(player);								
		
		function animate() {
			ctx.save();					
			ctx.clearRect(0, 0, cW, cH);
			for (var i=0; i<playersMass.length; i++) {						
				playersMass[i].bodyRender(0,0);
				playersMass[i].legsRender(legsPos(playersMass[i]),0);
				playersMass[i].headRender(0,0);
				playersMass[i].eyesRender(0,0);
				playersMass[i].eyeballsRender(playersMass[i].trackingX ? playersMass[i].trackingX(0) : 0, playersMass[i].trackingY ? playersMass[i].trackingY(0) : 0);
				playersMass[i].mouthRender(0,0);
				playersMass[i].armlRender(lArmPos(playersMass[i]),0);
				playersMass[i].armrRender(rArmPos(playersMass[i]),0);																
				gravity(playersMass[i]);			
				walk(playersMass[i], playersMass[i].targetMove);			
				playersMass[i].__animHair.animate();
			}
			ctx.restore();			
			
			requestId = requestAnimationFrame(animate);		
		}			
		var requestId = window.requestAnimationFrame(animate);
		
		window.addEventListener('resize',function(){
			window.cancelAnimationFrame(requestId);
			var width = 1900;
			if (document.documentElement.clientWidth > width) {
				width = document.documentElement.clientWidth;
				body.style.width = width + 'px';
			}
			body.style.width = width + 'px';
			canvas.width = width;
			ctx.scale(scaleFactor,scaleFactor);
			cW = ctx.canvas.width;
		    cH = ctx.canvas.height;
		    cW = Math.floor(cW + cW / scaleFactor - cW);
		    cH = Math.floor(cH + cH / scaleFactor - cH);
			requestId = requestAnimationFrame(animate);							
		});	 
	};
		
	
	return {
		unit: unit
	};
	
});
