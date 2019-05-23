'use strict';

function calc({x,y}) {
    return x*y
}

ReactDOM.render(
    re(VContainer, {},
        re(CssBaseline,{}),
        re(HContainer, {}, "SVG Icon", "Problem to import"),
        re(HContainer, {}, "Font Icon", re(Icon, {color:"secondary", style:{fontSize:"48px"}},"accessibility_new")),
        re(HContainer, {}, "Typography ", re(Typography, {variant:"h6"},"h6 typography")),
    ),
    document.getElementById('react-container')
)