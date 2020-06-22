'use strict';

const ENTER_KEY_CODE = 13
const ESC_KEY_CODE = 27
const UP_KEY_CODE = 38
const DOWN_KEY_CODE = 40
const SPACE_KEY_CODE = 32

const KEYDOWN_LISTENER_NAME = 'keydown'
const MOUSEDOWN_LISTENER_NAME = 'mousedown'
const MOUSEUP_LISTENER_NAME = 'mouseup'

const ALL_BOOKMARKS = []

function addBookmark({icon, groups, label, title, url}) {
    ALL_BOOKMARKS.push({icon, groups, label, title, url})
}

const ICON_PAWN = "pawn.png"
const ICON_2 = "icon2"

const GRP_GROUP1 = "GRP_GROUP1"
const GRP_GROUP2 = "GRP_GROUP2"

function disableScrollOnMouseDown(event) {
    if(event.button==1){
        event.preventDefault()
    }
}