function vertwiggle(iterations, color, draw, durations, bead){
	this.draw = draw
	this.color = color

	
	//this.bead = random_beads(5)	


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
		this.textpath = this.path.text(`${random_whitespace(50)} ${this.bead}`)
		this.textpath.leading(".35em").font({"size":15}).fill(this.color).attr({"fill-opacity":0})
		this.textpath.animate(10000).attr({"fill-opacity":1})
		
	}

	this.clear = function(){
		var clear_duration =  Math.random()*5000
		$(`#${this.path.id()}`).animate({stroke:"rgba(0,0,0,0)"}, clear_duration)
		this.textpath.animate(clear_duration).attr({"fill-opacity":0})
	}


}

function random_choice(items){
	return items[Math.floor(Math.random()*items.length)] 
}

function random_whitespace(ceiling){
	return " ".repeat(10+Math.floor(Math.random()*ceiling))
}

function random_beads(length_ceiling){
	var beads = ["✾","✻","❇","✶","✵","၀","๏","๏๏","✶✶","✶✶✶✶","✶❇✶","","","",""]
	var length_ = Math.floor(Math.random()*length_ceiling)
	return Array.apply(null, {length:length_}).map(function(i){
		choice = random_choice(beads)
		if(choice == ""){
			choice = random_whitespace(10)
		}
		return choice
	}).join("")

}


function wiggle_manager(colors,durations, iterations){
	this.draw = SVG().addTo('body').size(window.innerWidth/8, window.innerHeight)
	this.wiggles = []

	this.colors = colors
	this.durations = durations

	this.add_wiggle = function(){
		console.log("adding..")
		this.wiggles.push(new vertwiggle(random_choice(iterations), random_choice(this.colors), this.draw, this.durations))
	}

	this.remove_wiggle = function(){
		wig = this.wiggles.shift()
		wig.clear()
		setTimeout(function(wig){
			return
		},5000)
	}
}

var manager = null

SVG.on(document, 'DOMContentLoaded', function() {

	$("#add").click(function(){
		console.log("clicked add")
		manager.add_wiggle()
	})

	$("#remove").click(function(){
		manager.remove_wiggle()
	})

	jQuery.Color.hook( "stroke" ) //So we can animate the svg stroke color via jquery 

	var colors = ['#000000aa','#ff0000aa','#ffffffaa','#00ccffaa','#ff0066aa','#000066aa',"#aa0aa8aa", "#60700faa"]

	var durations = [3000,4000,5000,6000,3500,4050,4800,10000,20000,15000,25000,50000,100000]
	
	var iterations = [4,5,6,7,8,9,10]
	
	manager = new wiggle_manager(colors, durations, iterations)
	manager.add_wiggle()
	manager.add_wiggle()
	manager.add_wiggle()
	manager.add_wiggle()
	manager.add_wiggle()
	setInterval(function(){

			manager.remove_wiggle()
			manager.add_wiggle()
	
	},10000)	

})

