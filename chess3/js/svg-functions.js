
function scale(point,factor) {
    return {x:point.x*factor, y:point.y*factor}
}

function move(point,dir,dist) {
    const shift = scale(dir, dist)
    return {x:point.x+shift.x,y:point.y+shift.y}
}

function degToRad(deg) {
    return deg/180*Math.PI
}

function rotate(point,deg) {
    const rad = degToRad(deg)
    return {
        x: point.x*Math.cos(rad) - point.y*Math.sin(rad),
        y: point.x*Math.sin(rad) + point.y*Math.cos(rad),
    }
}