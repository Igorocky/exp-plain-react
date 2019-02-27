'use strict';

const re = React.createElement;

const ListItem = props=>re('li',{},props.text)
const ListComponent = props=>re('ul',{},_.map(props.items, i=>re(ListItem,{text:i})))

// class ListComponent extends React.Component {
//     render() {
//         return re('ul',{},_.map(this.props.items, i=>re(ListItem,{text:i})))
//     }
// }

class LikeButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = { liked: false };
    }

    render() {
        if (this.state.liked) {
            return 'You liked this.';
        }

        return re(
            'button',
            { onClick: () => this.setState({ liked: true }) },
            'Like'
        );
    }
}

ReactDOM.render(
    re('div', {},
        re('button', {}, 'Add'),
        re(ListComponent, {items: ["A", "B", "Z"]})
    ),
    document.getElementById('react-container')
)