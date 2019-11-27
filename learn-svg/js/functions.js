const SVG_PARENT_ID = "svg-parent"

var globalIdCounter = 0

function getNextId() {
    return "global-id-" + (globalIdCounter++)
}

function appendHtmlElem(parentId, htmlElemObj) {
    const node = document.createElement(htmlElemObj[0])
    _.chain(htmlElemObj[1])
        .pairs()
        .forEach(([k,v]) => node.setAttribute(k,v))
    document.getElementById(parentId).appendChild(node)
}

function line() {
    appendHtmlElem("svg-elem", ["line", {x1:0,y1:0,x2:100,y2:100, style:"stroke:#006600;"}])
}