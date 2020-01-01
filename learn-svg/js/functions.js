var globalIdCounter = 0

var SVG_PARENT = "svg-a"

const MIN_X = -300
const MIN_Y = -300
const MAX_X = 300
const MAX_Y = 300

function getNextId() {
    return "global-id-" + (globalIdCounter++)
}

function changeStyleKey(key) {
    return key == "strokeWidth" ? "stroke-width"
        : key
}

function appendSvgElem(name, attrs) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name)
    _.chain(attrs)
        .pairs()
        .forEach(([k,v]) => {
            if (k == "style") {
                node.setAttribute(
                    "style",
                    _.chain(v)
                        .pairs()
                        .map(([sk,sv]) => changeStyleKey(sk)+":"+sv+";")
                        .reduce((m,e) => m+e,"")
                        .value()
                )
            } else {
                node.setAttribute(k,v)
            }
        })
    const id = getNextId()
    node.setAttribute("id",id)
    document.getElementById(SVG_PARENT).appendChild(node)
    return id
}

function line(attrs) {
    appendSvgElem("line", {style:{stroke:"green"}, ...attrs})
}

function rect(attrs) {
    appendSvgElem("rect", {style:{stroke:"green", fill:"green"}, ...attrs})
}

function circle(attrs) {
    appendSvgElem("circle", {style:{stroke:"green", fill:"green"}, ...attrs})
}

function coordLines({dx,dy}) {
    dx = dx?dx:50
    dy = dy?dy:50
    line({x1:0,y1:MIN_Y,x2:0,y2:MAX_Y, style:{stroke:"grey", strokeWidth:3}})
    line({x1:MIN_X,y1:0,x2:MAX_X,y2:0, style:{stroke:"grey", strokeWidth:3}})
    for (let x = MIN_X; x <= MAX_X; x+=dx) {
        line({x1:x,y1:MIN_Y,x2:x,y2:MAX_Y, style:{stroke:"lightgrey", strokeWidth:1}})
    }
    for (let y = MIN_Y; y <= MAX_Y; y+=dy) {
        line({x1:MIN_X,y1:y,x2:MAX_X,y2:y, style:{stroke:"lightgrey", strokeWidth:1}})
    }
}