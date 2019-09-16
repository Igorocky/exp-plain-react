'use strict';

const CardsExercise = ({rndElemSelector, renderQuestion, renderAnswer, onIterationComplete}) => {
    const [phaseQuestion, setPhaseQuestion] = useState(true)

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [phaseQuestion])

    function flipPhase() {
        if (!phaseQuestion) {
            if (rndElemSelector.getRemainingElements() == 0 && onIterationComplete) {
                onIterationComplete()
            }
            rndElemSelector.loadNextElem()
        }
        setPhaseQuestion(!phaseQuestion)
    }

    function renderContent() {
        const card = rndElemSelector.getCurrentElem()
        if (phaseQuestion) {
            return renderQuestion(card)
        } else {
            return renderAnswer(card)
        }
    }

    function handleKeyDown(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            flipPhase()
        }
    }


    return RE.Container.col.top.center({},{},
        RE.div({}, "Iteration: " + rndElemSelector.getIterationNumber()),
        RE.div({}, "Remaining elements: " + rndElemSelector.getRemainingElements()),
        renderContent()
    )
}