'use strict';

const ENTER_KEY_CODE = 13
const ESC_KEY_CODE = 27
const UP_KEY_CODE = 38
const DOWN_KEY_CODE = 40

function hasValue(variable) {
    return typeof variable !== 'undefined' && variable != null
}

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
