var IPsAndPorts = {"data" : []};
var allIPs = [];
var allServices = [];
for (var i=0; i<data.length; i++) {
  allIPs.push(data[i].IP);
  allServices.push(data[i].SERVICE);
}
var uniqueIPs = [...new Set(allIPs)];
for (var i=0; i<uniqueIPs.length; i++) {
  var ports = [];
  for (var j=0; j<data.length; j++) {
    if (data[j].IP == uniqueIPs[i] && data[j].PORT != "") {
      ports.push(data[j].PORT);
    }
  }
  IPsAndPorts.data.push({"IP" : uniqueIPs[i], "PORTS": ports});
}
var uniqueServices = [...new Set(allServices)];
var servicesAndIPs = {"data" : []};
for (var i=0; i<uniqueServices.length; i++) {
  var IPs = [];
  var port = 0;
  for (var j=0; j<data.length; j++) {
    if (data[j].SERVICE == uniqueServices[i] && data[j].SERVICE != "") {
      IPs.push(data[j].IP);
      port = data[j].PORT;
    }
  }
  if (uniqueServices[i] == "unknown") port = "various";
  servicesAndIPs.data.push({"SERVICE" : uniqueServices[i], "PORT" : port, "IPs" : IPs});
}

var id=0;
// create an array with nodes
var nodes = new vis.DataSet([]);
var edges = new vis.DataSet([]);
var servicesAndGroups = [];
var groupSizeCounter = [];
var counter=0;
for (var i=0; i<servicesAndIPs.data.length; i++) {
  counter=0;
  nodes.add([{id: id, label: servicesAndIPs.data[i].SERVICE.toString(), group: i }]);
  id++;
  servicesAndGroups.push({SERVICE: servicesAndIPs.data[i].SERVICE.toString()}); //index is group number
  for (var j=0; j<servicesAndIPs.data[i].IPs.length; j++) {
    nodes.add([{id: id, label: servicesAndIPs.data[i].IPs[j].toString(), group: i}]);
    edges.add([{from: id, to: id-j-1}]);
    id++;
    counter++;
  }
  groupSizeCounter.push({"SERVICE" : servicesAndIPs.data[i].SERVICE.toString(), "COUNTER" : counter, "PORT" : servicesAndIPs.data[i].PORT.toString()});
}

var options = {
  layout: {
    improvedLayout: false
  },
  physics: {
    enabled: true,
    stabilization: {
      enabled: true,
      iterations: 100,
      updateInterval: 1,
      onlyDynamicEdges: false,
      fit: true
    },
    timestep: 0.5,
    adaptiveTimestep: true,
  },
  groups: {

  }
};
// create a network
var container = document.getElementById("mynetwork");
var data = {
  nodes: nodes,
  edges: edges
};
var network = new vis.Network(container, data, options);
network.on("stabilizationProgress", function(params) {
                var maxWidth = 496;
                var minWidth = 20;
                var widthFactor = params.iterations/params.total;
                var width = Math.max(minWidth,maxWidth * widthFactor);

                document.getElementById('bar').style.width = width + 'px';
                document.getElementById('text').innerHTML = Math.round(widthFactor*100) + '%';
            });
            network.once("stabilizationIterationsDone", function() {
                document.getElementById('text').innerHTML = '100%';
                document.getElementById('bar').style.width = '496px';
                document.getElementById('loadingBar').style.opacity = 0;
                // really clean the dom element
                setTimeout(function () {document.getElementById('loadingBar').style.display = 'none';}, 500);
            });
for (var i=0; i<network.groups.defaultIndex; i++) {
  options.groups[i] = { hidden: false};
  var button = document.createElement("BUTTON");
  var description = "";
  button.innerHTML = servicesAndGroups[i].SERVICE;
  button.style.backgroundColor = network.groups.groups[i].color.background;
  button.id = i;
  button.className = "accordion";
  if (servicesAndGroups[i].SERVICE) {
    document.getElementById("buttons").appendChild(button);
    document.getElementById(i).addEventListener("click", function() { return hideGroup(this.id); });
  }
  var content = document.createElement("div");
  content.className = "accordion-content";
  content.innerHTML = groupSizeCounter[i].COUNTER.toString() + " hosts on port " + groupSizeCounter[i].PORT.toString();
  button.appendChild(content);
}

function hideGroup(i) {
  //console.log(i);
  if (options.groups[i].hidden == false) {
    options.groups[i].hidden = true;
  }
  else {
    options.groups[i].hidden = false;
  }
  network.setOptions(options);
  network.body.emitter.emit('_dataChanged');
}
