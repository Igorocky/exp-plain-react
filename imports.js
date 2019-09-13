'use strict';

const re = React.createElement;
const useState = React.useState
const useEffect = React.useEffect
const Fragment = React.Fragment

const {
    Button,
    Select,
    MenuItem,
    Grid,
    colors,
    createMuiTheme,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Icon,
    MuiThemeProvider,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    withStyles,
} = window['MaterialUI'];

function reFactory(elemType) {
    return (props, ...children) => re(elemType, props, ...children)
}

const MaterialUI = window['MaterialUI']
const MuiColors = MaterialUI.colors

const DIRECTION = {row: "row", column: "column",}
const JUSTIFY = {flexStart: "flex-start", center: "center", flexEnd: "flex-end", spaceBetween: "space-between", spaceAround: "space-around",}
const ALIGN_ITEMS = {flexStart: "flex-start", center: "center", flexEnd: "flex-end", stretch: "stretch", spaceAround: "baseline",}

function gridFactory(direction, justify, alignItems) {
    return (props, childProps, ...children) => re(MaterialUI.Grid, {container:true, direction:direction,
            justify:justify, alignItems:alignItems, ...props},
        React.Children.map(children, child => {
            return re(MaterialUI.Grid, {item:true, ...childProps}, child)
        })
    )
}

const RE = {
    div: reFactory('div'),
    Button: reFactory(MaterialUI.Button),
    CircularProgress: reFactory(MaterialUI.CircularProgress),
    Fragment: reFactory(React.Fragment),
    Grid: reFactory(MaterialUI.Grid),
    Paper: reFactory(MaterialUI.Paper),
    span: reFactory('span'),
    Typography: reFactory(MaterialUI.Typography),
    table: reFactory('table'),
    tbody: reFactory('tbody'),
    tr: reFactory('tr'),
    td: reFactory('td'),
    img: reFactory('img'),
    If: (condition, ...elems) => condition?re(Fragment,{},...elems):re(Fragment,{}),
    IfNot: (condition, ...elems) => !condition?re(Fragment,{},...elems):re(Fragment,{}),
    IfTrue: (condition, ...elems) => re(Fragment,{},...elems),
    Container: {
        row: {
            left: {
                top: gridFactory(DIRECTION.row, JUSTIFY.flexStart, ALIGN_ITEMS.flexStart)
            },
            center: {
                top: gridFactory(DIRECTION.row, JUSTIFY.center, ALIGN_ITEMS.flexStart)
            },
        },
        col: {
            top: {
                left: gridFactory(DIRECTION.column, JUSTIFY.flexStart, ALIGN_ITEMS.flexStart),
                center: gridFactory(DIRECTION.column, JUSTIFY.flexStart, ALIGN_ITEMS.center),
            }
        }
    },
}