//////NB: This function is borrowed from https://github.com/lmgonzalves/path-slider
// Function to get a path (string) similar to sin function. Can accept following options that you can use for customization:
// - width: Width to draw the path
// - height: Height to draw the path
// - addWidth: Additional width to overflow actual width
// - controlSep: Bigger values of this parameter will add more curvature, and vice versa
// - curves: Number of curves (iterations) to draw
function getSinPath(options) {
    var _options = options || {};
    var _width = _options.width || window.innerWidth;
    var _height = _options.height || window.innerHeight;
    var _addWidth = _options.addWidth || 100;
    var _controlSep = _options.controlSep || 50;
    var _curves = _options.curves || 2;

    var x = - _addWidth;
    var y = _height / 2;
    var amplitudeX = (_width + _addWidth * 2) / _curves;     // X distance among curve points
    var amplitudeY = _height / 3;                            // Y distance between points and control points

    var path = [];
    path.push('M', x, y);
    var alternateY = true;
    var controlY;
    for (var i = 0; i < _curves; i++) {
        controlY = alternateY ? y - amplitudeY : y + amplitudeY;
        if (i === 0) {
            path.push('C', x + (amplitudeX / 2 - _controlSep), controlY);
        } else {
            path.push('S');
        }
        path.push(x + (amplitudeX / 2 + _controlSep), controlY);
        path.push(x + amplitudeX, y);
        x += amplitudeX;
        alternateY = !alternateY;
    }

    return path.join(' ');
}

/// Everything from here forward is mine

function simple_wiggle(M_x, M_y, theta, d, n){
	this.M_x = M_x //first point x
	this.M_y = M_y // first point y

	this.theta= theta
	this.r = d/2 //radius of control points
	this.C1_x = this.M_x + this.r*Math.cos(theta)
	this.C1_y = this.M_y + this.r*Math.sin(theta)

	this.d = d // distance between inflection points
	this.n = n

	function inflection_point(Y, index, d, r, theta){
		this.theta = theta
		this.I_x = d*index
		this.I_y = Y
		this.c2_x = this.I_x + r*Math.cos(this.theta)
		this.c2_y = this.I_y + r*Math.sin(this.theta)
		this.c1_x = this.I_x - r*Math.cos(this.theta)
		this.c1_y = this.I_y - r*Math.sin(this.theta)
		this.string = function(){
			return `  ${this.c1_x} ${this.c1_y} ${this.I_x} ${this.I_y} C ${this.c2_x} ${this.c2_y}`
		}
 	} 

 	this.points = []
 	for(i = 2; i<this.n; i++){
 		this.points.push(new inflection_point(this.M_y, i, this.d, this.r, this.theta))
 	}

 	this.string = function(){
 		return `M ${this.M_x} ${this.M_y} C ${this.C1_x} ${this.C1_y} ${this.points.map(function(p){return p.string()}).join()}`
 	}
}



function rand_wiggle(M_x, M_y, d, n, color, draw){
	this.draw = draw
	this.color = color

	this.M_x = M_x //first point x
	this.M_y = M_y // first point y

	this.theta = (Math.random() * Math.PI) - Math.PI
	this.max_r = d //maximum radius of control points
	this.r = this.max_r * Math.random()
	this.C1_x = this.M_x + this.r*Math.cos(this.theta)
	this.C1_y = this.M_y + this.r*Math.sin(this.theta)

	this.d = d // distance between inflection points
	this.n = n // number of inflection points

	function inflection_point(Y, index, d, r){
		this.theta = ( Math.random() * Math.PI ) - Math.PI
		this.max_r = r
		
		this.I_x = d*index
		this.I_y = Y

		this.r1 =  this.max_r * Math.random()
		this.c1_x = function(){ return this.I_x - this.r1*Math.cos(this.theta) }
		this.c1_y = function(){ return this.I_y - this.r1*Math.sin(this.theta) }

		this.r2 = this.max_r * Math.random()
		this.c2_x = function(){ return this.I_x + this.r1*Math.cos(this.theta) }
		this.c2_y = function(){ return this.I_y + this.r1*Math.sin(this.theta) }

		this.tweak = function(){
			this.r1 =  this.max_r * Math.random()
			this.theta = ( Math.random() * Math.PI ) - Math.PI
			this.I_x = this.I_x + (Math.random() - .5)*this.max_r
		}
		
		this.string = function(){
			return `  ${this.c1_x()} ${this.c1_y()} ${this.I_x} ${this.I_y} C ${this.c2_x()} ${this.c2_y()}`
		}
 	} 

 	this.points = []
 	for(i = 1; i<this.n; i++){
 		this.points.push(new inflection_point(this.M_y, i, this.d, this.max_r))
 	}
 	
 	this.tweak = function(){
 		this.theta = (Math.random() * Math.PI) - Math.PI
 		this.points.map(function(p){
 			p.tweak()
 		})
 	}

 	this.string = function(){
 		return `M ${this.M_x} ${this.M_y} C ${this.C1_x} ${this.C1_y} ${this.points.map(function(p){return p.string()}).join()}`
 	}

 	this.next = function(){
 		this.tweak()
 		return this.string()
 	}

 	//contain the path inside the object. would be nice to define the animation steps in here too.
 	this.path = this.draw.path(this.string())
 	this.path.fill('none')
	this.path.stroke({ color: this.color, width: 2, linecap: 'round', linejoin: 'round' })
	this.tl = this.path.timeline().persist(true)
}

function random_choice(items){
	return items[Math.floor(Math.random()*items.length)] 
}

///Do the rendering


function draw_FirstWiggle(){
	var draw = SVG().addTo('body').size(window.innerWidth,300)
	var path = draw.path("M 100 100 Q 150 50 200 150 C 227 268 363 300 200 200 ")
	path.fill('none')
	path.stroke({ color: 'white', width: 4, linecap: 'round', linejoin: 'round' })
  	path.animate(2000).plot("M 100 100 Q 150 50 200 300 C 227 158 263 100 200 200 ").loop(true, true)
}

function draw_SinWiggle(){
	var draw = SVG().addTo('body').size(window.innerWidth,100)
	var path = draw.path(getSinPath({curves:20, height:50, controlSep:50}))
	path.fill('none')
	path.stroke({ color: 'white', width: 4, linecap: 'round', linejoin: 'round' })
  	path.animate(2000).plot(getSinPath({curves:20, height:80, controlSep:30})).loop(true, true)
}

function draw_simpleWiggle(fraction, its, distance){
	//first test of this object-based animation system. Can we just draw a generative wave
	var draw = SVG().addTo('body').size(window.innerWidth,100)
	var starting_theta = Math.PI * fraction
	var wig = new simple_wiggle(0,50, starting_theta, distance,its)

	var path = draw.path(wig.string())

	path.fill('none')
	path.stroke({ color: 'white', width: 2, linecap: 'round', linejoin: 'round' })
  
}

function draw_randWiggle(its, distance){
	//now, we have a version of the object with some randomization that can iterate... how's that look?
	var draw = SVG().addTo('body').size(window.innerWidth,200)

	var wig = new rand_wiggle(0,100, distance,its, "white", draw)
	wig.tweak()
	wig.path.animate(2000).plot(wig.string()).loop(true, true)
}

function draw_overlay_randWiggles(its, distance, layers){
	//does it look nice when we overlay several of them on top of each other (as anticipated?)
	var draw = SVG().addTo('body').size(window.innerWidth,200)

	var colors = ['#000000aa','#ff0000aa','#ffffffaa','#00ccffaa','#ff0066aa','#000066aa']
	var durations = [3000,4000,5000,6000,3500,4050,4800]
	

	wiggles = []
	for(j = 0; j<layers; j++){
 		this.wiggles.push(new rand_wiggle(0,100, distance,its, random_choice(colors), draw))
 	}
 	wiggles.map(function(wig){
		wig.path.animate(random_choice(durations)).plot(wig.next()).loop(true, true)
 	})
	
}

function draw_randWiggles_multiframe(its, distance, layers, colors, durations){
	var draw = SVG().addTo('body').size(window.innerWidth,200)
	wiggles = []
	for(j = 0; j<layers; j++){
 		this.wiggles.push(new rand_wiggle(0,100, distance,its, random_choice(colors), draw))
 	}

 	wiggles.map(function(wig){
		wig.path.animate(random_choice(durations)).ease("-").plot(wig.next())
				.animate(random_choice(durations)).ease("-").plot(wig.next())
				.animate(random_choice(durations)).ease("-").plot(wig.next())
		wig.tl.on("finished", function(){this.reverse().play()})

 	})

}



SVG.on(document, 'DOMContentLoaded', function() {
	var colors = ['#000000aa','#ff0000aa','#ffffffaa','#00ccffaa','#ff0066aa','#000066aa',"#aa0aa8aa", "#60700faa"]
	var durations = [3000,4000,5000,6000,3500,4050,4800]
	var long_durs = [10000,20000,15000,25000,50000,100000]

	draw_FirstWiggle()
	draw_SinWiggle()
	draw_simpleWiggle(1/3, 10, 50)
	draw_simpleWiggle(2/3, 20, 80)
	draw_simpleWiggle(1/4, 10, 100)
	draw_simpleWiggle(1/8, 20, 60)
	draw_simpleWiggle(1/2, 30, 150)
	draw_randWiggle(30,100)
	draw_randWiggle(30,100)
	draw_randWiggle(30,100)
	draw_overlay_randWiggles(30,100, 3)
	draw_overlay_randWiggles(20,80, 4)
	draw_overlay_randWiggles(10,200, 7)
	draw_randWiggles_multiframe(8,200,2, colors, durations)
	draw_randWiggles_multiframe(8,250,4, colors, durations)

	draw_randWiggles_multiframe(8,250,3, colors, long_durs)
	draw_randWiggles_multiframe(8,250,10, colors, long_durs)

})



//So the effect I'm after is each path is a thread dangling in the wind
// this means-- each point will be a Cubic- the leading and trailing control points of each successive cubic will need to be colinear
// the points themselves- the inflection points should not all be colinear- probably distributed along a sine (and these points should animate)
// the troughs and vallys shuould also animate. 

//OK COOL
// so the next step is gonna be polish, basically
// we want the randomness constrained a little, so as to avoid overly kinky lines
// we also want to make the motion a bit more continuous? so not wholly random probably- but random deltas
//    so each parameter should have a 'cycle' 
// also some constrained vertical motion on the inflection points, probably

//LOVE the effect of switching to longer duration cycles. 
