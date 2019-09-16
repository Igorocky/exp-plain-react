'use strict';

function ints(start, end) {
    let i = start
    const res = [];
    while (i <= end) {
        res.push(i)
        i++
    }
    return res
}

function flatMap(list, func) {
    const res = []
    _.each(list, elem=>res.push(...func(elem)))
    return res
}

function product(...lists) {
    if (_.size(lists) == 0) return [[]]
    return flatMap(_.first(lists), elem=>_.map(product(..._.rest(lists)), rightPart=>[elem,...rightPart]))
}

function clone(obj, modifiers) {
    return {...(obj?obj:{}), ...(modifiers?modifiers:{})}
}

function apply(func, ...args) {
    if (func) {
        return func(...args)
    }
}

class RandomElemSelector {
    constructor({elems}) {
        this.origElems = elems
        this.reset()
    }

    getCurrentElem() {
        return this.state.currentElem
    }

    getIterationNumber() {
        return this.state.iterationNumber
    }

    getRemainingElements() {
        return _.size(this.state.elemsToAsk)
    }

    reset() {
        this.state = {elemsToAsk: [], iterationNumber:0}
        this.loadNextElem()
    }

    loadNextElem() {
        let elemsToAsk = this.state.elemsToAsk
        if (_.size(elemsToAsk)==0) {
            elemsToAsk = [...this.origElems]
            this.state.iterationNumber += 1
        }
        elemsToAsk = _.shuffle(elemsToAsk)
        this.state.currentElem = _.first(elemsToAsk)
        this.state.elemsToAsk = _.rest(elemsToAsk)
    }
}

const XX = ["a","b","c","d","e","f","g","h"]
const YY = ["1","2","3","4","5","6","7","8"]

function getCellName(cell) {
    return XX[cell.x] + YY[cell.y]
}

function cellToAbsNum(cell) {
    return cell.y*8 + cell.x
}

function absNumToCell(num) {
    return {x:num%8, y:Math.floor(num/8)}
}