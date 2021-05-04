"use strict";

const TypeExercise = () => {

    const s = {
        PHASE: 'PHASE',
        TEXT: 'TEXT',
        CURR_IDX: 'CURR_IDX',
    }

    const p = {
        INIT: 'TypeExercise',
        EXEC: 'EXEC',
    }

    const [state, setState] = useState(() => createState({}))

    function createState({prevState, params}) {
        const getParam = createParamsGetter({prevState, params})

        return createObj({
            [s.PHASE]: p.INIT,
            [s.TEXT]: '',
            [s.CURR_IDX]: 0,
        })
    }

    useEffect(() => {
        document.addEventListener('keypress', processUserInput)
        return () => document.removeEventListener('keypress', processUserInput)
    }, [state])

    function renderContentForInit() {
        return RE.Container.col.top.left({},{style:{marginBottom:'20px'}},
            RE.TextField(
                {
                    multiline: true,
                    rowsMax: 10,
                    variant: 'outlined', label: 'Note content',
                    style: {width: 600},
                    onChange: e => {
                        const newText = e.nativeEvent.target.value;
                        setState(prev => prev.set(s.TEXT, newText))
                    },
                    value: state[s.TEXT]
                }
            ),
            RE.Button(
                {
                    variant:"contained",
                    color:'primary',
                    onClick: () => {
                        setState(prev =>
                            prev
                                .set(s.PHASE, p.EXEC)
                                .set(s.CURR_IDX, 0)
                        )
                    }
                },
                'start'
            ),
        )
    }

    function processUserInput(event) {
        if (state[s.PHASE] == p.EXEC) {
            const expected = state[s.TEXT].charAt(state[s.CURR_IDX])
            const actual = event.key
            if (actual === expected) {
                if (state[s.CURR_IDX] == state[s.TEXT].length-1) {
                    setState(state.set(s.PHASE,p.INIT))
                } else {
                    setState(state.set(s.CURR_IDX,state[s.CURR_IDX]+1))
                }
            } else {
                playAudio(ERROR_SOUND)
                console.log(`Error: expected ${expected}, actual ${actual}`)
            }
        }
    }

    function renderContentForExec() {
        return RE.Container.col.top.left({},{style:{marginBottom:'20px'}},
            RE.div({style:{fontSize:'30px'}}, state[s.TEXT].split('').map((c,i) => RE.span(
                {key:i, style: {backgroundColor:i == state[s.CURR_IDX]?'yellow':undefined}},
                c
            ))),
            RE.Button(
                {
                    variant:"contained",
                    color:'primary',
                    onClick: () => {
                        setState(prev =>
                            prev
                                .set(s.PHASE, p.INIT)
                        )
                    }
                },
                'stop'
            )
        )
    }

    return state[s.PHASE] == p.INIT ? renderContentForInit() : renderContentForExec()
}