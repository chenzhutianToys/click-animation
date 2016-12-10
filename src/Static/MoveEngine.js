export default function(data) {
    let move = {},
        uIdGen = -1,
        nodes = data,
        rToShrink = 2,
        bounds = [[0, 0], [600, 800]],
        boundary = null,
        isAABBBoundary = false,
        isBoundaryGroup = false,
        boundaryGroupKeys = [],
        worldWidth,
        worldHeight,
        timeFrame = 0.05, //s
        stepNumPerFrame = 2,
        timeScale = 10,
        isDirectionGravity = null,
        gravity = null,
        friction = null,
        canBeFinished = false,
        firstPassNodes = [],
        eventHandler = {
            'tick': function() { },
            'sed': function() { },
            'end': function() { }
        },
        raf,
        hack = {}
        ;
    function multiVec2(x1, y1, x2, y2) {
        return x1 * x2 + y1 * y2;
    }

    function subVec2(x1, y1, x2, y2) {
        return { x: x2 - x1, y: y2 - y1 };
    }

    function absVec2(x, y) {
        return x * x + y * y;
    }

    function doSomething(node, node2, preserveImpulse) {
        let x = (node2.x - node.x);
        let l = x * x;
        let r = node.r + node2.r;
        r *= r;
        if (l > r) return;

        let y = (node2.y - node.y);
        l += y * y;

        if (l <= r) {
            let d = Math.sqrt(l);
            r = node.r + node2.r;

            if (preserveImpulse) {
                var v1x = node.x - node.px;
                var v1y = node.y - node.py;
                var v2x = node2.x - node2.px;
                var v2y = node2.y - node2.py;
            }

            let penetration = d != 0 ? (d - r) : node.r; //d != 0 ? (d - r) : node.r;
            let slop = (penetration / d) - 0.01;
            slop = slop < 0 ? slop : 0;
            let penetrationFactor = slop * 0.5 * 0.2;//20 percent;
            let cx = penetrationFactor * x;
            let cy = penetrationFactor * y;

            //Need to update Collision Cells here
            node.x = node.active ? node.x + cx : node.x;
            node.y = node.active ? node.y + cy : node.y + cy;
            node2.x = node2.active ? node2.x - cx : node2.x;
            node2.y = node2.active ? node2.y - cy : node2.y - cy;

            if (preserveImpulse) {

                // Calculate relative velocity in terms of the normal direction
                let velAlongNormal = x * (v2x - v1x) + y * (v2y - v1y)

                if (velAlongNormal < 0) { //maybe greater than 0                         
                    // Calculate restitution
                    let jj = (1 + (node.restitution + node2.restitution) * 0.5) * velAlongNormal * 0.5 / l;
                    v1x += jj * x;
                    v1y += jj * y;
                    v2x -= jj * x;
                    v2y -= jj * y;

                    node.px = node.active ? node.x - v1x : node.x;
                    node.py = node.active ? node.y - v1y : node.y - v1y;
                    node2.px = node2.active ? node2.x - v2x : node2.x;
                    node2.py = node2.active ? node2.y - v2y : node2.y - v2y;
                } //whether is true collide
            }//whether is preserveImpulse

        }// whether two ball is engae
    }

    function ResolveCollide(preserveImpulse) {
        let node1, node2;
        for (let i = 0, len = nodes.length; i < len; ++i) {
            node1 = nodes[i];
            if (node1.fixed) continue;
            for (let j = i + 1; j < len; ++j) {
                node2 = nodes[j];
                if (node1 !== node2 && node2.boundary === node1.boundary) {
                    doSomething(node1, node2, preserveImpulse);
                }
            }//for-loop of node2
        }//for-loop of node1
    }

    function AABBBorder_collide(node) {
        if (node.fixed) return;
        //Detect collision of world        
        let radius = node.r,
            x = node.x,
            y = node.y,
            isFirstPass = node.firstPass
            ;

        //detect boundary
        let localBoundary = isBoundaryGroup && boundary[node.boundary].values;

        if (x < bounds[0][0] + radius) {
            node.x = bounds[0][0] + radius;
        } else if (x > bounds[1][0] - radius) {
            node.x = bounds[1][0] - radius;
        } else if (x < localBoundary[0][0] + radius) {
            node.x = localBoundary[0][0] + radius;
        } else if (x > localBoundary[1][0] - radius) {
            node.x = localBoundary[1][0] - radius;
        }

        if (y < bounds[0][1] + radius) {
            node.y = bounds[0][1] + radius;
        } else if (y > bounds[1][1] - radius) {
            node.y = bounds[1][1] - radius;
        } else if (isDirectionGravity.y >= 0) {
            if (y > localBoundary[1][1] - radius) {
                node.y = localBoundary[1][1] - radius;
            } else if (y < localBoundary[0][1] + radius && isFirstPass) {
                node.y = localBoundary[0][1] + radius;
            } else if (y > localBoundary[0][1] + radius && !isFirstPass) {
                node.firstPass = true;
            }
        } else if (isDirectionGravity.y < 0) {
            if (y < localBoundary[0][1] + radius) {
                node.y = localBoundary[0][1] + radius;
            } else if (y > localBoundary[1][1] - radius && isFirstPass) {
                node.y = localBoundary[1][1] - radius;
            } else if (y < localBoundary[1][1] - radius && !isFirstPass) {
                node.firstPass = true;
            }
        }
    }

    function AABBBorder_collide_preserve_impulse(node) {
        if (node.fixed) return;
        let radius = node.r,
            x = node.x,
            y = node.y;
        let restitution = node.restitution;
        let vx = (node.px - node.x) * restitution,
            vy = (node.py - node.y) * restitution,
            isFirstPass = node.firstPass
            ;

        //detect boundary
        let localBoundary = isBoundaryGroup && boundary[node.boundary].values;

        if (x < bounds[0][0] + radius) {
            node.x = bounds[0][0] + radius;
            node.px = node.active ? node.x - vx : node.x;
        } else if (x > bounds[1][0] - radius) {
            node.x = bounds[1][0] - radius;
            node.px = node.active ? node.x - vx : node.x;
        } else if (x < localBoundary[0][0] + radius) {
            node.x = localBoundary[0][0] + radius;
            node.px = node.active ? node.x - vx : node.x;
        } else if (x > localBoundary[1][0] - radius) {
            node.x = localBoundary[1][0] - radius;
            node.px = node.active ? node.x - vx : node.x;
        }

        if (y < bounds[0][1] + radius) {
            node.y = bounds[0][1] + radius;
            node.py = node.active ? node.y - vy : node.y;
        } else if (y > bounds[1][1] - radius) {
            node.y = bounds[1][1] - radius;
            node.py = node.active ? node.y - vy : node.y;
        } else if (isDirectionGravity.y >= 0) {
            if (y > localBoundary[1][1] - radius) {
                node.y = localBoundary[1][1] - radius;
                node.px = node.active ? node.x - vx : node.x;
            } else if (y < localBoundary[0][1] + radius && isFirstPass) {
                node.y = localBoundary[0][1] + radius;
                node.px = node.active ? node.x - vx : node.x;
            } else if (y > localBoundary[0][1] + radius && !isFirstPass) {
                node.firstPass = true;
            }
        } else if (isDirectionGravity.y < 0) {
            if (y < localBoundary[0][1] + radius) {
                node.y = localBoundary[0][1] + radius;
                node.px = node.active ? node.x - vx : node.x;
            } else if (y > localBoundary[1][1] - radius && isFirstPass) {
                node.y = localBoundary[1][1] - radius;
                node.px = node.active ? node.x - vx : node.x;
            } else if (y < localBoundary[1][1] - radius && !isFirstPass) {
                node.firstPass = true;
            }
        }
    }

    function Border_collide(node) {
        if (node.fixed) return;
        //Detect collision of world        
        let radius = node.r,
            x = node.x,
            y = node.y,
            isFirstPass = node.firstPass,
            trriglePassEvent = false;
        ;

        //detect boundary

        let boundaryKeys = isBoundaryGroup && Object.keys(boundary);
        let lastBoundaryKey = isBoundaryGroup && boundaryKeys[boundaryKeys.indexOf(node.boundary) - 1];
        let localUperBoundary = isBoundaryGroup && boundary[lastBoundaryKey] && boundary[lastBoundaryKey].values;
        let localLowerBoundary = isBoundaryGroup && boundary[node.boundary].values;
        let upperY = localUperBoundary ? localUperBoundary[Math.round(node.x)] + radius : bounds[0][1];
        let lowerY = localLowerBoundary ? localLowerBoundary[Math.round(node.x)] - radius : bounds[1][1];
        if(!isBoundaryGroup) upperY = bounds[1][1] * 0.85;

        if (x < bounds[0][0] + radius) {
            node.x = bounds[0][0] + radius;
        } else if (x > bounds[1][0] - radius) {
            node.x = bounds[1][0] - radius;
        }

        if (y < bounds[0][1] + radius) {
            node.y = bounds[0][1] + radius;
        } else if (y > bounds[1][1] - radius) {
            node.y = bounds[1][1] - radius;
        }
        else if (isDirectionGravity.y >= 0) {
            if (y > lowerY) {
                node.y = lowerY;
            } else if (y < upperY && isFirstPass) {
                node.y = upperY;
                node.py = node.y - radius;
            } else if ((y + radius) > (upperY - radius) && !isFirstPass) {
                node.firstPass = true;
                trriglePassEvent = true;
            }
        } else if (isDirectionGravity.y < 0) {
            if (y < upperY) {
                node.y = upperY;
            } else if (y > lowerY && isFirstPass) {
                node.y = lowerY;
                node.py = node.y + radius;
            } else if ((y - radius) < (lowerY + radius) && !isFirstPass) {
                node.firstPass = true;
                trriglePassEvent = true;
            }
        }

        return trriglePassEvent;
    }

    function Border_collide_preserve_impulse(node) {
        if (node.fixed) return;
        let radius = node.r,
            x = node.x,
            y = node.y;
        let restitution = node.restitution;
        let vx = (node.px - node.x) * restitution,
            vy = (node.py - node.y) * restitution,
            isFirstPass = node.firstPass,
            trriglePassEvent = false;

        //detect boundary
        let boundaryKeys = isBoundaryGroup && Object.keys(boundary);
        let lastBoundaryKey = isBoundaryGroup && boundaryKeys[boundaryKeys.indexOf(node.boundary) - 1];
        let localUperBoundary = isBoundaryGroup && boundary[lastBoundaryKey] && boundary[lastBoundaryKey].values;
        let localLowerBoundary = isBoundaryGroup && boundary[node.boundary].values;
        let upperY = localUperBoundary ? localUperBoundary[Math.round(node.x)] + radius : bounds[0][1];
        let lowerY = localLowerBoundary ? localLowerBoundary[Math.round(node.x)] - radius : bounds[1][1];
        if(!isBoundaryGroup) upperY = bounds[1][1] * 0.85;

        if (x < bounds[0][0] + radius) {
            node.x = bounds[0][0] + radius;
            node.px = node.active ? node.x - vx : node.x;
        } else if (x > bounds[1][0] - radius) {
            node.x = bounds[1][0] - radius;
            node.px = node.active ? node.x - vx : node.x;
        }

        if (y < bounds[0][1] + radius) {
            node.y = bounds[0][1] + radius;
            node.py = node.active ? node.y - vy : node.y;
        }
        else if (y > bounds[1][1] - radius) {
            node.y = bounds[1][1] - radius;
            node.py = node.active ? node.y - vy : node.y;
        } else if (isDirectionGravity.y >= 0) {
            if (y > lowerY) {
                node.y = lowerY;
                node.px = node.active ? node.x - vx : node.x;
            } else if (y < upperY && isFirstPass) {
                node.y = upperY;
                node.py = node.y - radius;
                node.px = node.active ? node.x - vx : node.x;
            } else if ((y + radius) > (upperY - radius) && !isFirstPass) {
                node.firstPass = true;
                trriglePassEvent = true;
            }
        } else if (isDirectionGravity.y < 0) {
            if (y < upperY) {
                node.y = upperY;
                node.px = node.active ? node.x - vx : node.x;
            } else if (y > lowerY && isFirstPass) {
                node.y = lowerY;
                node.py = node.y + radius;
                node.px = node.active ? node.x - vx : node.x;
            } else if ((y - radius) < (lowerY + radius) && !isFirstPass) {
                node.firstPass = true;
                trriglePassEvent = true;
            }
        }

        return trriglePassEvent;
    }

    move.start = function() {
        worldWidth = bounds[1][0] - bounds[0][0];
        worldHeight = bounds[1][1] - bounds[0][1];
        firstPassNodes = [];
        canBeFinished = false;
        //init envoriment
        if (!friction) friction = { x: 0.1, y: 0.1 };
        if (!gravity) {
            gravity = { x: 0, y: Infinity, magnitude: 9.8 };
            isDirectionGravity = {
                x: 0,
                y: 9.8
            };
        }

        let nodesNum = nodes.length,
            i = -1,
            node,
            //this is hack-code
            gDirection = isDirectionGravity.y < 0 ? 0.1 : 0.8;

        while (++i < nodesNum) {
            node = nodes[i];
            if (!node.iid) node.iid = ++uIdGen;
            if (!node.r) node.r = 10;
            if (!node.x) node.x = Math.random() * worldWidth * 0.9 + node.r;
            if (!node.y) node.y = worldHeight * gDirection + node.r;
            if (!node.px) node.px = node.x + 0.0;
            if (!node.py) node.py = node.y;
            if (!node.restitution) node.restitution = 0.1;
            if (!node.boundary) node.boundary = 0;
            if (!node.timeToShrink) node.timeToShrink = 3;//ms
            if (!node.firstPass) node.firstPass = false;

            //for sedimentation
            if (!('active' in node)) node.active = true;
            if (!('fixed' in node)) node.fixed = false;
        }


        //hack CONST letriable
        hack.timeFrameDeltaSquare = (timeFrame * timeFrame * timeScale * timeScale) / (stepNumPerFrame * stepNumPerFrame);
        //stop it if has already been started
        if (raf) clearInterval(raf);
        //start the layout
        raf = setInterval(move.tick.bind(this), timeFrame * 1000);
    };

    move.addNode = function(node) {
        worldWidth = bounds[1][0] - bounds[0][0];
        worldHeight = bounds[1][1] - bounds[0][1];
        //this is hack-code
        let gDirection = isDirectionGravity.y > 0 ? 0.1 : 0.8;

        if (!node.iid) node.iid = ++uIdGen;
        if (!node.r) node.r = 10;
        if (!node.x) node.x = Math.random() * worldWidth * 0.9 + node.r;
        if (!node.y) node.y = worldHeight * gDirection + node.r;
        if (!node.px) node.px = node.x + 0.0;
        if (!node.py) node.py = node.y;
        if (!node.restitution) node.restitution = 0.1;
        if (!node.boundary) node.boundary = 0;
        if (!node.timeToShrink) node.timeToShrink = 3;//ms
        if (!node.firstPass) node.firstPass = false;

        //for sedimentation
        if (!('active' in node)) node.active = true;
        if (!('fixed' in node)) node.fixed = false;

        //Push to nodes
        nodes.push(node);
        //stop it if has already been started
        if (raf) clearInterval(raf);
        //start the layout
        raf = setInterval(move.tick.bind(this), timeFrame * 1000);
    };

    // hack for vis
    move.addNodes = function(data, once = false) {
        worldWidth = bounds[1][0] - bounds[0][0];
        worldHeight = bounds[1][1] - bounds[0][1];
        //this is hack-code
        let gDirection = isDirectionGravity.y > 0 ? 0.1 : 0.8;

        let nodesNum = data.length,
            i = -1,
            node;
        while (++i < nodesNum) {
            node = data[i];
            if (!node.iid) node.iid = ++uIdGen;
            if (!node.r) node.r = 10;
            if (!node.x) node.x = worldWidth * 0.5;
            if (!node.y) node.y = worldHeight * gDirection + node.r;
            if (!node.px) node.px = node.x + 0.0;
            if (!node.py) node.py = node.y;
            if (!node.restitution) node.restitution = 0.1;
            if (!node.boundary) node.boundary = 0;
            if (!node.timeToShrink) node.timeToShrink = 3;//ms
            if (!node.firstPass) node.firstPass = false;

            //for sedimentation
            if (!('active' in node)) node.active = true;
            if (!('fixed' in node)) node.fixed = false;

            //Push to nodes
            nodes.push(node);
        }

        //stop it if has already been started
        if (raf) clearInterval(raf);
        if (once) {
            setTimeout(move.tick.bind(this), timeFrame * 1000);
        } else {
            //start the layout
            move.tick.call(this);
            raf = setInterval(move.tick.bind(this), timeFrame * 1000);
        }


    };

    move.pause = function() {
        if (raf) clearInterval(raf);
    };
    move.resume = function() {
        if (raf) clearInterval(raf);
        move.tick.call(this);
        raf = setInterval(move.tick.bind(this), timeFrame * 1000);
    };

    move.tick = function() {
        //let start = Date.now();
        let nodesNum = nodes.length,
            i = -1,
            a, //accelerate
            gravityAngle, gx, gy,
            node,
            tx, ty,
            timeFrameDeltaSquare = hack.timeFrameDeltaSquare
            ;

        for (let j = 0; j < stepNumPerFrame; ++j) {
            //Verlet
            i = -1;
            while (++i < nodesNum) {
                node = nodes[i];
                if (node && !node.fixed) {
                    //Accumulate Forces
                    if (isDirectionGravity) {
                        gx = isDirectionGravity.x;
                        gy = isDirectionGravity.y;
                    } else {
                        gravityAngle = Math.atan2(gravity.y - node.y, gravity.x - node.x);
                        gx = gravity.magnitude * Math.cos(gravityAngle);
                        gy = gravity.magnitude * Math.sin(gravityAngle);
                    }

                    a = { x: gx + friction.x * (node.px - node.x), y: gy + friction.y * (node.py - node.y) };

                    //accelerate
                    node.x += a.x * timeFrameDeltaSquare;
                    node.y += a.y * timeFrameDeltaSquare;
                }
            }

            //collide here
            ResolveCollide(false);

            i = -1;
            while (++i < nodesNum) {
                node = nodes[i];
                if (node && !node.fixed) {
                    //border_collide here
                    if (isAABBBoundary ? AABBBorder_collide(node) : Border_collide(node)) {
                        firstPassNodes.push(node);
                        node.r *= 0.8;
                    }

                    //inertia
                    tx = node.x * 2 - node.px;
                    node.px = node.x;
                    node.x = tx;

                    ty = node.y * 2 - node.py;
                    node.py = node.y;
                    node.y = ty;
                }
            }

            //collide here again with preserve impulse
            ResolveCollide(true);

            //SatisfyConstraints
            i = -1;
            while (++i < nodesNum) {
                node = nodes[i];
                if (node.fixed) continue;

                if (isAABBBoundary ? AABBBorder_collide_preserve_impulse(node) : Border_collide_preserve_impulse(node)) {
                    firstPassNodes.push(node);
                    node.r *= 0.8;
                }
            }
        }

        i = nodesNum;
        let isSeded = false;
        let sedLayers = {};
        let fixedCount = 0;
        let unFixedNodes = [];
        while (--i >= 0) {
            node = nodes[i];
            if (!node.fixed && node.firstPass) { //delete !node.active here
                node.timeToShrink -= timeFrame;
                if (node.timeToShrink < 0) {
                    node.timeToShrink = 1.5;//s
                    node.r *= 0.7;
                    if (node.r < rToShrink) {
                        isSeded = true;
                        if (!(node.boundary in sedLayers)) {
                            sedLayers[node.boundary] = true;
                        }
                        node.fixed = true;
                    }
                    node.active = true;
                }
            }

            if (node.fixed) {
                ++fixedCount;
            } else {
                unFixedNodes.push(node);
            }
        }

        if (isSeded) {
            eventHandler['sed'].apply(this, [{ 'type': 'sed', sedLayers: Object.keys(sedLayers), firstPassNodes: firstPassNodes }]);
            firstPassNodes = [];
        }

        if ((fixedCount / nodes.length) > 0.98) {
            move.finish(unFixedNodes);
        }

        eventHandler['tick'].apply(this, [{ 'type': 'tick', balls: nodes, bounds: bounds, gy: isDirectionGravity.y }]);
    };

    move.canBeFinished = function(t) {
        if (typeof t === "boolean") {
            canBeFinished = t;
        }
        return move;
    };
    move.finish = function(unFixedNodes) {
        if (!canBeFinished) return;
        console.log("finish");
        if (raf) clearInterval(raf);
        let i = -1,
            tick = 0;
        let timer = setInterval(() => {
            while (++i < unFixedNodes.length) {
                unFixedNodes[i].r *= 0.8;
            }
            eventHandler['tick'].apply(this, [{ 'type': 'tick', balls: unFixedNodes, bounds: bounds }]);
            if (tick > 10) {
                clearInterval(timer);
                eventHandler['tick'].apply(this, [{ 'type': 'tick', balls: [], bounds: bounds }]);
                eventHandler['end'].apply(this, [{ 'type': 'end' }]);
                firstPassNodes = [];
            }
            ++tick;
        }, 30);
    };

    move.on = function(event, callback) {
        if (!arguments.length) return eventHandler;
        if (arguments.length === 1) return eventHandler[event];
        if (arguments.length === 2) {
            eventHandler[event] = callback;
        }
        return move;
    };

    move.isAABBBoundary = function(x) {
        if (!arguments.length) return isAABBBoundary;
        isAABBBoundary = x;
        return move;
    };

    move.bounds = function(x) {
        if (!arguments.length) return bounds;
        bounds = x;
        return move;
    };

    move.friction = function(params) {
        if (!arguments.length) return friction;
        let type = typeof params;
        switch (type) {
            case 'object': {
                if (Array.isArray(params)) {
                    if (params.length === 2) {
                        friction = { x: params[0], y: params[1] };
                    } else if (params.length === 1) {
                        friction = { x: params[0], y: params[0] };
                    }
                } else {
                    friction = { x: params.x, y: params.y };
                }
                break;
            }
            case 'number': {
                friction = { x: params, y: params };
                break;
            }
        }
        return move;
    };

    move.gravity = function(params) {
        if (!arguments.length) return friction;
        let type = typeof params;
        switch (type) {
            case 'object': {
                if (Array.isArray(params)) {
                    gravity = { x: params[0], y: params[1], magnitude: params[2] };
                    if (isNaN(+params[0] * +params[1])) {
                        isDirectionGravity = {
                            x: params[0] == 0 ? 0 : params[0] > 0 ? params[2] : -params[2],
                            y: params[1] == 0 ? 0 : params[1] > 0 ? params[2] : -params[2],
                        };
                    }
                    else isDirectionGravity = null;
                } else {
                    gravity = { x: params.x, y: params.y, magnitude: params.magnitude };
                    if (isNaN(+params.x * +params.y)) {
                        isDirectionGravity = {
                            x: params.x == 0 ? 0 : params.x > 0 ? params.magnitude : -params.magnitude,
                            y: params.y == 0 ? 0 : params.y > 0 ? params.magnitude : -params.magnitude,
                        };
                    }
                    else isDirectionGravity = null;
                }
                break;
            }
            case 'number': {
                gravity = { x: 0, y: Infinity, magnitude: params };
                isDirectionGravity = {
                    x: 0,
                    y: params
                };
                break;
            }
        }
        return move;
    }

    move.boundary = function(params) {
        if (!arguments.length) return boundary;
        let type = typeof params;
        switch (type) {
            case 'object': {
                if (Array.isArray(params)) {
                    isBoundaryGroup = false;
                } else {
                    boundaryGroupKeys = Object.keys(params);
                    isBoundaryGroup = true;
                }
                boundary = params;
            }
                break;
            default:
                break;
        }
        return move;
    }

    move.remove = function() {
        if (raf) clearInterval(raf);
        move = null;
    }

    return move;
}