"use strict";

const FenExtractorUi = () => {

    //state attributes
    const s = {
        PHASE: 'PHASE',
        NEXT_OUTPUT: 'NEXT_OUTPUT',
        POSITION_DESCRIPTION: 'POSITION_DESCRIPTION',
    }

    //phases
    const p = {
        EDIT_NEXT_OUTPUT: 'EDIT_NEXT_OUTPUT',
        SHOW_POSITION_DESCRIPTION: 'SHOW_POSITION_DESCRIPTION',
    }

    const [state, setState] = useState(() => createState())

    function createState() {
        return createObj({
            [s.NEXT_OUTPUT]: '',
            [s.PHASE]: p.EDIT_NEXT_OUTPUT,
        })
    }

    function showPositionDescription() {
        setState(
            state
                .set(s.PHASE, p.SHOW_POSITION_DESCRIPTION)
                .set(s.POSITION_DESCRIPTION, describePuzzle(JSON.parse(state[s.NEXT_OUTPUT])))
        )
    }

    function renderButtons() {
        if (state[s.PHASE] === p.EDIT_NEXT_OUTPUT) {
            return RE.Button({
                onClick: showPositionDescription,
                color:"primary"
            },"Show position")
        } else {
            return RE.Button({
                onClick: () => {
                    setState(
                        state
                            .set(s.PHASE, p.EDIT_NEXT_OUTPUT)
                    )
                },
                color:"primary"
            },"Edit")
        }
    }

    function renderContent() {
        if (state[s.PHASE] === p.EDIT_NEXT_OUTPUT) {
            return RE.TextField(
                {
                    multiline: true,
                    rowsMax: 50,
                    variant: 'outlined',
                    label: '',
                    style: {width: 600},
                    onChange: ({nativeEvent:event}) => setState(prev => prev.set(s.NEXT_OUTPUT, event.target.value)),
                    onKeyUp: ({nativeEvent:event}) => {
                        if (event.ctrlKey && event.keyCode === 13) {
                            showPositionDescription()
                        }
                    },
                    value: state[s.NEXT_OUTPUT],
                    autoFocus:true,
                }
            )
        } else {
            return RE.table({style:{fontSize:'30px', fontFamily:'courier', fontWeight:'bold'}},
                RE.tbody({},
                    state[s.POSITION_DESCRIPTION].map((line,idx) => RE.tr({key:idx},
                        RE.td({},line)
                    ))
                )
            )
        }
    }

    return RE.Container.col.top.center({style:{marginTop:'100px'}},{},
        renderButtons(),
        renderContent()
    )
}