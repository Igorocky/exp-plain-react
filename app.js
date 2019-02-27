'use strict';

const re = React.createElement;

const ListItem = props=>re('li',{},props.text)

class ListComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state=props
        props.registerItemAdder(item=>this.addItem(item))
    }

    render() {
        return re('ul',{},_.map(this.state.items, i=>re(ListItem,{text:i})))
    }

    addItem(item) {
        this.setState((state, props) => {
            let newItems = state.items.slice()
            newItems.push(item)
            return {items:newItems}
        })
    }
}

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

let itemAdder;

ReactDOM.render(
    re('div', {},
        re('button', { onClick: ()=>itemAdder("NEW")}, 'Add'),
        re(ListComponent, {items: ["A", "B", "Z"], registerItemAdder: adder=>itemAdder=adder})
    ),
    document.getElementById('react-container')
)