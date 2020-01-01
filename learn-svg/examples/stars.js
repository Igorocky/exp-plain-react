SVG_PARENT = "svg-q"

coordLines({dx:50,dy:50})

star({dx:-200, dy:200, color:"black"})
star({dx:200, dy:200, color:"red"})
star({dx:-200, dy:-200, color:"blue"})
star({dx:200, dy:-200, color:"yellow"})
star({dx:0, dy:0, color:"green"})

function pointsToLineCoords(p1, p2) {
    return {x1:p1.x, y1:p1.y, x2:p2.x, y2:p2.y}
}

function star({dx,dy,color}) {
    const style = {stroke:!color?"blue":color, strokeWidth:3}
    const points = [{x:0+dx,y:50+dy}, {x:50+dx,y:0+dy}, {x:25+dx,y:-50+dy}, {x:-25+dx,y:-50+dy}, {x:-50+dx,y:0+dy}]
    line({...pointsToLineCoords(points[3], points[0]), style: style})
    line({...pointsToLineCoords(points[0], points[2]), style: style})
    line({...pointsToLineCoords(points[2], points[4]), style: style})
    line({...pointsToLineCoords(points[4], points[1]), style: style})
    line({...pointsToLineCoords(points[1], points[3]), style: style})
}


SVG_PARENT = "svg-a"