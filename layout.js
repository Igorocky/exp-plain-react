'use strict';

const HContainer = props => re('table', {},
    re('tbody', {},
        re('tr', {style:props.trStyle},
            React.Children.map(props.children, (child,idx) => re('td', {key:idx, style:props.tdStyle}, child))
        )
    )
)

const VContainer = props => re('table', {},
    re('tbody', {},
        React.Children.map(
            props.children,
            (child,idx) => re('tr', {key:idx, style:props.trStyle}, re('td', {style:props.tdStyle}, child))
        )
    )
)
