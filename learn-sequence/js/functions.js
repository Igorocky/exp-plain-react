'use strict';

const ENTER_KEY_CODE = 13
const ESC_KEY_CODE = 27
const UP_KEY_CODE = 38
const DOWN_KEY_CODE = 40

const KEYDOWN_LISTENER_NAME = 'keydown'

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

const PI_DIGITS = "3141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481117450284102701938521105559644622948954930381964428810975665933446128475648233786783165271201909145648566923460348610454326648213393607260249141273724587006606315588174881520920962829254091715364367892590360011330530548820466521384146951941511609433057270365759591953092186117381932611793105118548074462379962749567351885752724891227938183011949129833673362440656643"