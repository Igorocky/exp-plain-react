"use strict";

const useSpeechComponent = ({voiceUri}) => {

    function speak(message,callback) {
        const msg = new SpeechSynthesisUtterance()
        msg.lang = 'en'
        msg.pitch = 1
        msg.rate = 1
        msg.text = message
        msg.voice = window.speechSynthesis.getVoices().find(v => v.voiceURI == voiceUri)
        msg.volume = 1
        msg.onend = callback
        speechSynthesis.speak(msg)
    }

    return {
        speak,
        availableVoiceUris: window.speechSynthesis.getVoices().map(v => [v.voiceURI, v.name]),
    }
}