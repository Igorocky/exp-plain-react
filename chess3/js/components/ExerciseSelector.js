'use strict';

const AVAILABLE_EXERCISES = [
    {name:"MovementsExercise", component: MovementsExercise},
    {name:"FrameToImgExercise", component: FrameToImgExercise},
    {name:"ConnectionsExercise", component: ConnectionsExercise},
    {name:"X4Exercise", component: X4Exercise},
    {name:"MorseExercise", component: X4Exercise},
    {name:"AllCellsExercise", component: AllCellsExercise},
    {name:"TypeExercise", component: TypeExercise},
]

const ExerciseSelector = ({}) => {
    // const [selectedExercise, setSelectedExercise] = useState({component: MorseExercise})
    // const [selectedExercise, setSelectedExercise] = useState({component: X4Exercise})
    // const [selectedExercise, setSelectedExercise] = useState({component: AllCellsExercise})
    // const [selectedExercise, setSelectedExercise] = useState({component: TypeExercise})
    const [selectedExercise, setSelectedExercise] = useState(null)

    if (!selectedExercise) {
        return RE.List({component:"nav"},
            AVAILABLE_EXERCISES.map(ex => RE.ListItem({key:ex.name, button:true,
                    onClick: () => setSelectedExercise(ex)},
                RE.ListItemText({}, ex.name)
            ))
        )
    } else {
        return re(selectedExercise.component,{configName:"config1"})
    }
}