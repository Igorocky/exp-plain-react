'use strict';

class HContainer extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return re('table', {},
            re('tbody', {},
                re('tr', {},
                    _.map(_.filter(this.props.children,elem=>elem), (child,idx) => re('td', {key:idx}, child))
                )
            )
        )
    }
}

class VContainer extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return re('table', {},
            re('tbody', {},
                _.map(_.filter(this.props.children,elem=>elem), (child,idx) => re('tr', {key:idx}, re('td', {}, child)))
            )
        )
    }
}
