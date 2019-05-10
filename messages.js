'use strict';

const messaging = {
    listeners: [],
    messageQueue: [],
    messageProcessingIsInProgress: false
}

function addMessageListener(params) {
    messaging.listeners.push({name:params.name, callback:params.callback})
}

function removeMessageListener(name) {
    messaging.listeners = _.reject(messaging.listeners, listener=>listener.name===name)
}

function sendMessage(targetPredicate, messageContent) {
    messaging.messageQueue.push({targetPredicate:targetPredicate, messageContent:messageContent})
    if (!messaging.messageProcessingIsInProgress) {
        messaging.messageProcessingIsInProgress = true

        while (_.size(messaging.messageQueue) > 0) {
            const currentMsg = _.first(messaging.messageQueue)
            messaging.messageQueue = _.rest(messaging.messageQueue)
            _.each(messaging.listeners, listener=>{
                if (currentMsg.targetPredicate(listener.name)) {
                    listener.callback(currentMsg.messageContent)
                }
            })
        }

        messaging.messageProcessingIsInProgress = false
    }
}
