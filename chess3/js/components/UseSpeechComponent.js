"use strict";

const useSpeechComponent = () => {
    const [voiceUri, setVoiceUri] = useStateFromLocalStorageString({key:'chess3.voiceUri',defaultValue:''})

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
        renderVoiceSelector: () => RE.Select({
                value:voiceUri,
                onChange: event => setVoiceUri(event.target.value),
            },
            window.speechSynthesis.getVoices().map(voice => RE.MenuItem(
                {key: voice.voiceURI, value:voice.voiceURI, },
                voice.name
            ))
        )
    }
}