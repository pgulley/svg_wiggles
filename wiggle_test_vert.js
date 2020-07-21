function vertwiggle(iterations, color, draw, durations, bead){
	this.draw = draw
	this.color = color

	
	this.bead = bead	


	this.width = draw.width()
	this.height = draw.height()

	this.margin = this.width / 2

	this.theta = (Math.random() - 0.5) * (Math.PI/2)


	this.iterations = iterations

	this.d = this.height/this.iterations // distance between inflection points
	this.max_r = 2*this.d/3 //maximum radius of control points	

	this.r = this.max_r * Math.random()
	
	this.M_x = this.margin + (Math.random()-.5) * (this.max_r/3) //first point x
	this.M_y = 0 // first point y

	this.L_x = this.margin + (Math.random()-.5) * (this.max_r/3) //last point x
	this.L_y = this.height //last point y

	this.C1_x = function(){ return this.M_x + this.r*Math.cos(this.theta)} // first control point x
	this.C1_y = function(){ return this.M_y + this.r*Math.sin(this.theta)} // first control point y

	this.Cn_x = function(){ return this.L_x + this.r*Math.cos(this.theta)} // last control point x
	this.Cn_y = function(){ return this.L_y + this.r*Math.sin(this.theta)} // last control point y

	function inflection_point(Y, index, d, r){
		this.theta = ( Math.random() * Math.PI ) + (Math.PI / 2)
		this.max_r = r
		
		this.I_x = Y
		this.I_y = d*index

		this.r1 =  this.max_r * Math.random()
		this.c1_x = function(){ return this.I_x - this.r1*Math.cos(this.theta) }
		this.c1_y = function(){ return this.I_y - this.r1*Math.sin(this.theta) }

		this.r2 = this.max_r * Math.random()
		this.c2_x = function(){ return this.I_x + this.r1*Math.cos(this.theta) }
		this.c2_y = function(){ return this.I_y + this.r1*Math.sin(this.theta) }

		this.tweak = function(){
			this.r1 =  this.max_r * Math.random()
			this.theta = ( Math.random() * Math.PI ) - Math.PI
			this.I_y = this.I_y + (Math.random() - .5)*this.max_r
		}
		
		this.string = function(){
			return `  ${this.c1_x()} ${this.c1_y()} ${this.I_x} ${this.I_y} C ${this.c2_x()} ${this.c2_y()}`
		}
 	} 

 	this.points = []
 	for(i = 1; i<this.iterations; i++){
 		this.points.push(new inflection_point(this.M_x, i, this.d, this.max_r))
 	}
 	
 	this.tweak = function(){
 		this.theta = (Math.random() * Math.PI) - Math.PI
 		this.points.map(function(p){
 			p.tweak()
 		})
 	}

 	this.string = function(){
 		return `M ${this.M_x} ${this.M_y} C ${this.C1_x()} ${this.C1_y()} ${this.points.map(function(p){return p.string()}).join()} ${this.Cn_x()} ${this.Cn_y()} ${this.L_x} ${this.L_y}`
 	}

 	this.next = function(){
 		this.tweak()
 		return this.string()
 	}

 	//contain the path inside the object. would be nice to define the animation steps in here too.

 	this.path = this.draw.path(this.string())
 	this.path.fill('none')
	this.path.stroke({ color: "transparent", width: 1, linecap: 'round', linejoin: 'round' })
	this_ = $(`#${this.path.id()}`).animate({stroke:this.color}, Math.random()*10000)
	this.tl = this.path.timeline().persist(true)
	this.path.animate(random_choice(durations)).ease("<>").plot(this.next())
			.animate(random_choice(durations)).ease("<>").plot(this.next())
			.animate(random_choice(durations)).ease("<>").plot(this.next())
	this.tl.on("finished", function(){this.reverse().play()})

	if(this.bead != undefined){
		this.textpath = this.path.text(`${" ".repeat(10+Math.floor(Math.random()*200))}${bead}`)
		this.textpath.leading(".35em").font({"size":15}).fill(this.color).attr({"fill-opacity":0})
		this.textpath.animate(10000).attr({"fill-opacity":1})
		
	}

	this.clear = function(){
		$(`#${this.path.id()}`).animate({stroke:"rgba(0,0,0,0)"}, Math.random()*5000)
		this.textpath.animate(2000).attr({"fill-opacity":0})
		this.textpath.clear()
	}


}

function random_choice(items){
	return items[Math.floor(Math.random()*items.length)] 
}




function draw_nicewigs(layers, colors, durations){
	var draw = SVG().addTo('body').size(window.innerWidth/5,window.innerHeight)
	wiggles = []
	itrange = [4,5,7,10]
	for(j = 0; j<layers; j++){
 		this.wiggles.push(new vertwiggle(random_choice(itrange), random_choice(colors), draw, durations))
 	}

}

function wiggle_manager(colors,durations, iterations,beads){
	this.beads = beads
	this.draw = SVG().addTo('body').size(window.innerWidth/5, window.innerHeight)
	this.wiggles = []

	this.colors = colors
	this.durations = durations

	this.add_wiggle = function(){
		console.log("adding..")
		this.wiggles.push(new vertwiggle(random_choice(iterations), random_choice(this.colors), this.draw, this.durations, random_choice(this.beads)))
	}

	this.remove_wiggle = function(){
		wig = this.wiggles.shift()
		wig.clear()
		setTimeout(function(wig){
			return
		},5000)
	}


}

SVG.on(document, 'DOMContentLoaded', function() {
	jQuery.Color.hook( "stroke" ) //So we can animate the svg stroke color via jquery 

	var colors = ['#000000aa','#ff0000aa','#ffffffaa','#00ccffaa','#ff0066aa','#000066aa',"#aa0aa8aa", "#60700faa"]

	var durations = [3000,4000,5000,6000,3500,4050,4800]
	var long_durs = [10000,20000,15000,25000,50000,100000]
	var short_durs = [100,200,400,1000,2000,500,50]
	var wide_durs = [1000,2000,5000,3000,4000,5000,6000,10000]
	
	var iterations = [4,5,6,7,8,9,10]

	draw_nicewigs(3, colors, durations)
	draw_nicewigs(3, ["white"], durations)
	draw_nicewigs(4, ["white", "black", "red"], long_durs)

	beads = ["✾","✻","❇","✶","✵","၀","๏","၀","๏"]

	manager = new wiggle_manager(colors, wide_durs, iterations, beads)
	manager.add_wiggle()
	manager.add_wiggle()
	manager.add_wiggle()
	manager.add_wiggle()



	beads2 = ["✾","✻","❇","✶","✵","၀","๏","၀๏","๏๏","✶✶","✶✶✶✶","✶❇✶", "", "", "", ""]
	manager2 = new wiggle_manager(["black", "white", "red", "blue", "red", "green"], long_durs, iterations, beads2)
	manager2.add_wiggle()
	manager2.add_wiggle()
	manager2.add_wiggle()
	manager2.add_wiggle()
	setInterval(function(){

			manager2.remove_wiggle()
			manager2.add_wiggle()
	
	},5000)	



})