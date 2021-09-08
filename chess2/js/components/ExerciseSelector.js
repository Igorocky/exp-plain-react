'use strict';

const AVAILABLE_EXERCISES = [
    {name:"Img To Coords", component: ImgToCoordsExercise},
    {name:"CellColorsExercise", component: CellColorsExercise},
    {name:"Vision", component: VisionExercise},
    {name:"Connections++", component: Connections},
    {name:"ConnectionsAudio", component: ConnectionsAudio},
    {name:"Movements2Exercise", component: Movements2Exercise},
    {name:"MorseExercise", component: MorseExercise},
    {name:"TextReader", component: TextReader},
    {name:"MorseStateViewExplorer", component: MorseStateViewExplorer},
    {name:"XrayExercise", component: XrayExercise},
    {name:"Vision Rev", component: VisionExerciseRev},
    {name:"Knight Path", component: KnightPath},
    {name:"ConnectionsRev", component: ConnectionsRev},
    {name:"SpaceExercise", component: SpaceExercise},
    {name:"Neighbors", component: Neighbors},
    {name:"MovementsExercise", component: MovementsExercise},
    {name:"DistancesExercise", component: DistancesExercise},
]

const ExerciseSelector = ({}) => {
    // const [selectedExercise, setSelectedExercise] = useState({name:"MorseStateViewExplorer", component: MorseStateViewExplorer})
    // const [selectedExercise, setSelectedExercise] = useState({name:"ConnectionsAudio", component: ConnectionsAudio})
    // const [selectedExercise, setSelectedExercise] = useState({name:"Connections", component: Connections})
    // const [selectedExercise, setSelectedExercise] = useState({name:"Vision", component: VisionExercise})
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