'use strict';

const ENTER_KEY_CODE = 13
const ESC_KEY_CODE = 27
const UP_KEY_CODE = 38
const DOWN_KEY_CODE = 40

const KEYDOWN_LISTENER_NAME = 'keydown'

function hasValue(variable) {
    return variable !== undefined && variable !== null
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

function modify(arr, idx, modifier) {
    return [...arr.slice(0,idx), modifier(arr[idx]), ...(idx >= arr.length-1 ? [] : arr.slice(idx+1,arr.length))]
}

function set(obj, attrName, newValue) {
    return {...obj, [attrName]:newValue}
}

function randomInt(min, max) {
    return min + Math.floor(Math.random()*((max-min)+1))
}

const PI_DIGITS = "141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481117450284102701938521105559644622948954930381964428810975665933446128475648233786783165271201909145648566923460348610454326648213393607260249141273724587006606315588174881520920962829254091715364367892590360011330530548820466521384146951941511609433057270365759591953092186117381932611793105118548074462379962749567351885752724891227938183011949129833673362440656643"