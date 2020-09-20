"use strict";

const MorseExercise = () => {

    const {renderMorseInputDiv} = UseMorseInput({
        onSymbol: (sym,timings) => console.log(`You've entered: ${sym}   [${timingsToStr(timings)}]`),
        onUnrecognizedCode: (code,timings) => console.log(`Unrecognized code: ${code}   [${timingsToStr(timings)}]`),
    })

    function timingsToStr(timings) {

        function appendTiming(a,t) {
            if (typeof t === 'string') {
                return {...a, str:a.str+t}
            } else if (a.lastTime) {
                return {...a, str:a.str+(t - a.lastTime), lastTime: t}
            } else {
                return {...a, lastTime: t}
            }
        }

        return timings.reduce(appendTiming,{str:'',lastTime:null}).str
    }

    return renderMorseInputDiv()
}