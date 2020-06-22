'use strict';

const BookmarksView = () => {
    const ICON_SIZE_PX = 20
    const ICON_SIZE_STR = ICON_SIZE_PX + "px"

    return RE.Container.col.top.left({},{},
        ALL_BOOKMARKS.map(({icon, groups, label, title, url}) => RE.Container.row.left.center(
            {className:"bookmark-elem", style:{padding:"5px", borderRadius: "5px"}},
            {style:{marginRight:"5px"}},
            icon ? RE.img({src:"img/"+icon, style:{borderRadius: "5px", width:"100%", height:ICON_SIZE_STR}}) : null,
            title
        ))
    )
}