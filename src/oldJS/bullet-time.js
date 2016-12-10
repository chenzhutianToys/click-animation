/* global d3 */
var width = Math.max(960, innerWidth),
    height = Math.max(500, innerHeight);

var ballIdGen = 0;
var preBallNum = 100;
var radius = 20;
var nodes = d3.range(preBallNum)
            .map(function () {
                return { 
                    id: "id_" + ballIdGen++, 
                    hit: (function () {
                        return function () {
                            switch (globalState) {
                                case 0: return 0;
                                case 1: return -15;
                                case 2:  return 0;
                                default: return 0;
                            }
                        };
                    })(),
                    radius: Math.random() * radius + 1 }; 
                }),
    root = nodes[0],
    color = d3.scale.category10();

root.radius = 0;
root.hit = function () { return 0; };
root.fixed = true;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
//.call(tip);

var circles = svg.selectAll("g.circle")
    .data(nodes.slice(1), function (d) { return d.id; });
circles.enter().append("g")
    .attr("class", "circle")
    .attr('id', function (d) { return d.id; })
    .append("circle")
    .attr("r", function (d) { return d.radius; })
    .style("fill", function (d, i) { return color(i % 3); })
;


// var canvas = d3.select("body").append("canvas")
//     .attr("width", width)
//     .attr("height", height);

// var context = canvas.node().getContext("2d");

function AddPoint() {
    var isBigBall = Math.random() > 0.0;
    var r = Math.random() * radius + 4;
    nodes.push({
        id: "id_" + ballIdGen++,
        radius: r,
        hit: (function () {
            var isOver = isBigBall ? false : true;
            return function () {
                switch (globalState) {
                    case 0: return 0;
                    case 1: return isOver === true ? 0 : isBigBall ? r * -800 : 0;
                    case 2: isOver = true; return 0;
                    default: return 0;
                }
                return 0;
            };
        })()
    });
    return isBigBall;
};

function showFancyLabel(circleGroup, d) {
    if (d === null) {
        circleGroup.selectAll(".mylabel")
            .transition().duration(300)
            .style("opacity", 1e-6)
            .remove();
    }
    else {
        var tipData = [{ radius: d.radius }, { radius: d.radius }, { radius: d.radius }];
        circleGroup.selectAll("text.mylabel")
            .data(tipData)
            .enter().insert("text", "circle")
            .attr("class", "mylabel")
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .attr("x", function (d, i) {
                var a = (i * Math.PI * 0.35) - (1 * Math.PI / 2);
                d.cx = Math.cos(a) * 0;
                return d.x = Math.cos(a) * 70;
            })
            .attr("y", function (d, i) {
                var a = (i * Math.PI * 0.35) - (1 * Math.PI / 2);
                d.cy = Math.sin(a) * 0;
                return d.y = Math.sin(a) * 70;
            })
            .text(function (d) { return d.radius.toFixed(2); })
            .each(function (d) {
                var bbox = this.getBBox();
                d.sx = d.x - bbox.width / 2 - 2;
                d.ox = d.x + bbox.width / 2 + 2;
                d.sy = d.oy = d.y + 5;
            })
            .style("opacity", 1e-6)
            .transition().duration(800)
            .style("opacity", 1)
        ;

        circleGroup.selectAll("path.mylabel")
            .data(tipData)
            .enter().insert("path", "circle")
            .attr("class", "mylabel")
            .style("fill", "none")
            .style("stroke", "black")
            .attr("d", function (d) {
                if (d.cx > d.ox) {
                    return "M" + d.sx + "," + d.sy + "L" + d.sx + "," + d.sy;
                } else {
                    return "M" + d.ox + "," + d.oy + "L" + d.ox + "," + d.oy;
                }
            })
            .style("opacity", 1e-6)
            .transition().duration(800)
            .style("opacity", 1)
            .attr("d", function (d) {
                if (d.cx > d.ox) {
                    return "M" + d.sx + "," + d.sy + "L" + d.ox + "," + d.oy + " " + d.cx + "," + d.cy;
                } else {
                    return "M" + d.ox + "," + d.oy + "L" + d.sx + "," + d.sy + " " + d.cx + "," + d.cy;
                }
            });
    }

}



var globalState = 0;
var threshold = 0.03;
var force = d3.layout.force()
    .gravity(0.15)
    .charge(function (d) { return d.hit(); })
    .nodes(nodes)
    .friction(0.7)
    .size([width, height])
    .on("tick", function (e) {
        var q = d3.geom.quadtree(nodes),
            i = 0;
        if(n>500) {
            nodes.shift();
        }
        var n = nodes.length;
        while (++i < n) q.visit(collide(nodes[i]));

        circles = svg.selectAll("g.circle")
            .data(nodes.slice(1), function (d) { return d.id; });
        circles.exit().remove();
        circles.enter().append('g')
            .attr("class", "circle")
            .attr('id', function (d) { return d.id; })
            .append("circle")
            .attr("r", function (d) { return d.radius; })
            .style("fill", function (d, i) { return color(i % 3); })
        ;
        circles
            .attr('transform', function (d) { return "translate(" + [d.x, d.y] + ")"; });

        switch (globalState) {
            case 0: {
                if (e.alpha < threshold) {
                    var isBigBall = AddPoint();
                    force.start();
                    if (isBigBall) {
                        ++globalState;
                    }
                }
                break;
            }
            case 1: {
                if (isCollide) {

                    preBallNum = n;
                    force
                        .gravity(0.05)
                        .friction(0.6)
                        .start();
                    threshold = 0.03;
                    showFancyLabel(svg.select("#" + nodes[n - 1].id), nodes[n - 1]);
                    ++globalState;
                }
                break;
            }
            case 2: {
                if (e.alpha < threshold) {
                    force
                        .gravity(0.15)
                        .friction(0.8)
                        .start();
                    globalState = 0;
                    showFancyLabel(svg.select("#" + nodes[n - 1].id), null);
                }
                break;
            }
        }
    });
force.start();

var isCollide = false;
function collide(node) {
    var r = node.radius + 16,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    isCollide = false;
    return function (quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = node.radius + quad.point.radius;
            if (l < r) {
                l = (l - r) / l * .5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
                isCollide = true;
            }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
}