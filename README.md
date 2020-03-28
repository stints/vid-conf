# Vid-conf

This is an incredibly simple video conferencing app that I made for fun.  My aim was to build this so that my family could make a video chat room that was dead simple.  No account is needed.  Simply create a room via the lobby and send the URL that is generated to anyone you wish to connect with.  The unique room id is the only source of "security" to prevent random people from joining.  

This application utilizes the firebase firestore realtime database as a signaling server, it connects multiple peers together using the RTCPeerConnection object.  Please note that each occupent in the room is individually connected to one another.  This means if five people are in the room, each person is connected to the other four.  This potentially means heavy bandwidth usage if you connect with many people.

Currently, no turn server is being used.  I'm using only free stun servers provided by google, mozilla, and stunprotocol.

The current features:
* No account required to use.
* Anyone can create a room.  Rooms will persist even if everyone disconnects.
* Multi peer connections.
* Hide your local stream.

Features that need to be added:
* Better mobile support.
* Voice detection.  This would allow the person talking to take the "active" video position.
* Handling browser close events.  Currently, the system will not handle the person leaving if they do not click the leave button.
* Cleaner layout of the room.

### Running your own vid-conf app
There is a file that you will need to add yourself.
```
\src\constants.js
```

Here is an example constants.js file.

```js
const mediaConstraints = {
  video: true,
  audio: true,
};

const firebaseConfig = {
apiKey: "API_KEY",
authDomain: "AUTH_DOMAIN",
databaseURL: "DATABASE_URL",
projectId: "PROJECT_ID",
storageBucket: "STORAGE_BUCKET",
messagingSenderId: "SENDER_ID",
appId: "APP_ID",
measurementId: "MEASURE_ID"
};

const serverConfig = {
iceServers: [
  {
    urls: 'stun:stun.l.google.com:19302',
  },
  {
    urls: 'stun:stun.services.mozilla.com:3478',
  },
  {
    urls: 'stun:stun.stunprotocol.org:3478',
  },
],
};

export { mediaConstraints, firebaseConfig, serverConfig };
```

Please read [this](https://webrtc.org/getting-started/media-capture-and-constraints) to understand the 'mediaConstraints' object.

The firebaseConfig is generated for you when you create a firebase app.  I am utilizing the firestore database as a signaling server.

The serverConfig lists only STUN servers as a TURN server is too costly to use for such a simple project.  Please go [here](https://gist.github.com/mondain/b0ec1cf5f60ae726202e) to find any other public STUN servers.
