'use strict';

const HContainer = props => re('table', {},
    re('tbody', {},
        re('tr', {},
            React.Children.map(props.children, (child,idx) => re('td', {key:idx}, child))
        )
    )
)

const VContainer = props => re('table', {},
    re('tbody', {},
        React.Children.map(props.children, (child,idx) => re('tr', {key:idx}, re('td', {}, child)))
    )
)