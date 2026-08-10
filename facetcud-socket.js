/*  webcud-socket.js
    This is all code that is particular to the LCLS Web CUD (Websocket Edition), and not useful for general applications
*/

//Get emittance data.  This is specialized code so that the opacity and color of the emittance number can be changed to reflect the age and quality of the emittance.
var emittanceColorScale = d3.scaleQuantile() //for emittance
							.domain([0, 15]) //change from [0,3] to [0,15]
							.range(["#00CC22", "#FFFF00", "#FF4000"]);

var ageOpacityScale = d3.scaleLinear()
						.domain([0, 16*60*60*1000]) //Make the values fade to 30% after 16 hours.
						.range([1, 0.3])
						.clamp(true);
            
d3.selectAll(".emittanceValue").datum(function() { return getDataAttributes(this); }).each(function(d) {
  var elem = this;
  bindElementToPV(this,d.pv,d.precision,3000, null, function(elem_to_style){
    console.log("Styling emittance values.");
    elem_to_style.style("opacity", function(d, i) {
      return ageOpacityScale(Number(new Date()) - d.timestamp);
    })
    .style("color", function(d, i) {
      return emittanceColorScale(d.value);
    });
  });
});

var matchingColorScale = d3.scaleQuantile() //for bmag
							.domain([1, 3]) //changed from [1,1.5] to [1,3]
							.range(["#00CC22", "#FFFF00", "#FF4000"]);

d3.selectAll(".matchingValue").datum(function() { return getDataAttributes(this); }).each(function(d) {
  var elem = this;
  bindElementToPV(this,d.pv,d.precision,3000, null, function(elem_to_style){
    console.log("Styling matching values.");
    elem_to_style.style("opacity", function(d, i) {
      return ageOpacityScale(Number(new Date()) - d.timestamp);
    })
    .style("color", function(d, i) {
      return matchingColorScale(d.value);
    });
  });
});

//Get the l2 compression mode of the machine.  This has a custom data processor so that it can translate '1.0' into 'Overcompressed' and '0.0' into 'Undercompressed'.
bindElementToPV("#L2CompresisonMode","PHYS:SYS1:1:F2LFB_BC14BL_OVRCMP",0,3000,function(val){
	if (val == "1.0") {
		return "Overcompressed";
	} else if(val == "0.0") {
		return "Undercompressed";
	}
});


/*
//Get the BYKIK abort state, and show a message explaining it.
setInterval(function(){
	d3.json(PV_URL + "IOC:BSY0:MP01:REQBYKIKBRST", function(error, json){
		if (error) return console.log("There was an error loading " + PV_URL + "IOC:BSY0:MP01:REQBYKIKBRST");
		if (json.value == "Yes") { 
			d3.select("h2#burstMessage").transition().style("visibility","visible");
		} else {
			d3.select("h2#burstMessage").transition().style("visibility","hidden");
		}
	}, 3000);
	
	d3.json(PV_URL + "IOC:IN20:EV01:BYKIK_ABTACT", function(error, json){
		if (error) return console.log("There was an error loading " + PV_URL + "IOC:IN20:EV01:BYKIK_ABTACT");
		if (json.value == "Enable") {
			d3.json(PV_URL + "IOC:IN20:EV01:BYKIK_ABTPRD", function(json){
				if (typeof json.value === 'number' && json.value < 2800) {
					d3.select("h2#abortMessage").transition().style("visibility","visible");
				} else {
					d3.select("h2#abortMessage").transition().style("visibility","hidden");
				}
			});
		} else {
			d3.select("h2#abortMessage").transition().style("visibility","hidden");
		}
	}, 3000);
});
*/

//Get the vernier.  It gets a special data processor that adds a + or - sign to the text.
var vernierElement = d3.select("#L3Vernier").datum(function() { return getDataAttributes(this); }).each(function(d) {
	bindElementToPV(this,d.pv,d.precision,2000,function(val){
		if (val == 0) {
			return "";
		} else {
			var sign = val > 0 ? "+" : "-";
			val = val.toFixed(d.precision);
			return " " + sign + " " + Math.abs(val) + " MeV";
		}
	});
});

d3.select("#BC2PeakCurrent").datum(function() { return getDataAttributes(this); }).each(function(d) {
	bindElementToPV(this,d.pv,d.precision,2000,function(val){
		if (val > 100000) {
			return 0;
		}
		return val;
	});
});

startConnection();