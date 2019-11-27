var globalIdCounter = 0

function getNextId() {
    return "global-id-" + (globalIdCounter++)
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
                        .map(([sk,sv]) => sk+":"+sv+";")
                        .reduce((m,e) => m+e,"")
                        .value()
                )
            } else {
                node.setAttribute(k,v)
            }
        })
    const id = getNextId()
    node.setAttribute("id",id)
    document.getElementById("svg-parent").appendChild(node)
    return id
}

function line(x1,y1,x2,y2,attrs) {
    appendSvgElem("line", {x1:x1, y1:y1, x2:x2, y2:y2, style:{stroke:"green"}, ...attrs})
}

function rect(x,y,width,height,attrs) {
    appendSvgElem("rect", {x:x, y:y, width:width, height:height, style:{stroke:"green", fill:"green"}, ...attrs})
}

function circle(cx,cy,r,attrs) {
    appendSvgElem("circle", {cx:cx, cy:cy, r:r, style:{stroke:"green", fill:"green"}, ...attrs})
}

