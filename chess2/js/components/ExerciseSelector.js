'use strict';

const AVAILABLE_EXERCISES = [
    {name:"Img To Coords", component: ImgToCoordsExercise},
    {name:"Vision", component: VisionExercise},
    {name:"Vision Rev", component: VisionExerciseRev},
    {name:"Knight Path", component: KnightPath},
    {name:"Connections", component: Connections},
    {name:"ConnectionsRev", component: ConnectionsRev},
    {name:"SpaceExercise", component: SpaceExercise},
    {name:"Neighbors", component: Neighbors},
    {name:"MovementsExercise", component: MovementsExercise},
]

const ExerciseSelector = ({}) => {
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