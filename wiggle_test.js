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

function draw_randWiggles_multiframe(its, distance, layers, colors, durations){
	var draw = SVG().addTo('body').size(window.innerWidth,300)
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
	draw_randWiggles_multiframe(8,250,60, colors, long_durs)

})
