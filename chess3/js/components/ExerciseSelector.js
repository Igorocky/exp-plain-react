'use strict';

const AVAILABLE_EXERCISES = [
    {name:"MovementsExercise", component: MovementsExercise},
]

const ExerciseSelector = ({}) => {
    const [selectedExercise, setSelectedExercise] = useState({name:"MovementsExercise", component: MovementsExercise})
    // const [selectedExercise, setSelectedExercise] = useState(null)

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