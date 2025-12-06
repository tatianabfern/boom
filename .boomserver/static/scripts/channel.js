function createChannelConnection() {
    channel = new BroadcastChannel("customization_popup_channel");

    channel.addEventListener('message', (event) => {
        console.log('Received message:', event.data);
        
        setTheme(event.data)
    });
}

function createChannelConnectionOnPopup() {
    channel = new BroadcastChannel("customization_popup_channel");

    channel.addEventListener('message', (event) => {
        console.log('Received message:', event.data);
    });
}

function publishToChannel(message) {
    channel.postMessage(message);
    saveTheme({type:"SAVED",id:message})
}
