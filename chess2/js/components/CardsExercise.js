'use strict';

const CardsExercise = ({rndElemSelector, renderQuestion, renderAnswer, onIterationComplete, flipPhaseRef}) => {
    const [phaseQuestion, setPhaseQuestion] = useState(true)

    function flipPhase() {
        if (!phaseQuestion) {
            if (rndElemSelector.getRemainingElements() == 0 && onIterationComplete) {
                onIterationComplete()
            }
            rndElemSelector.loadNextElem()
        }
        setPhaseQuestion(!phaseQuestion)
    }
    if (flipPhaseRef) {
        flipPhaseRef.current = flipPhase
    }

    function renderContent() {
        const card = rndElemSelector.getCurrentElem()
        if (phaseQuestion) {
            return renderQuestion(card)
        } else {
            return renderAnswer(card)
        }
    }

    return RE.Container.col.top.center({},{},
        RE.div({}, "Iteration: " + rndElemSelector.getIterationNumber()),
        RE.div({}, "Remaining elements: " + rndElemSelector.getRemainingElements()),
        renderContent()
    )
}