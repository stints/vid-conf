import { serverConfig } from './constants';

export default class Client {
    constructor(localid, remoteid, roomid, signal, shouldSendOffer) {
        this.localid = localid;
        this.remoteid = remoteid;
        this.roomid = roomid;
        this.offer = null;
        this.answer = null;
        this.ice = new Set();
        this.hasStreamSet = false;
        this.signal = signal;
        this.remoteVideo = null;
        this.shouldSendOffer = shouldSendOffer;

        this.pc = new RTCPeerConnection(serverConfig);
        this.pc.onicecandidate = ({candidate}) => this.onIceCandidate(candidate);
        this.pc.ontrack = ({streams}) => this.onTrack(streams);
        this.pc.onconnectionstatechange = (e) => this.onConnectionStateChange(e);
        this.pc.oniceconnectionstatechange = ev => {
            console.log('Ice State: ', this.pc.iceConnectionState);
        }
        this.channel = this.pc.createDataChannel('chat', {negotiated: true, id: 0});

        this.sender = null;

        this.unsubscribe = this.signal.db.collection('rooms_peers').where('roomid', '==', roomid).where('to', '==', localid).where('from', '==', remoteid).onSnapshot(async (query) => {
            console.log('Peer message heard.')
            for (const change of query.docChanges()) {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    console.log(`Message ${ data.type } received from ${ data.from } to ${ data.to }`);
                    await this.handleMessage(data.type, JSON.parse(data.message));
                }
            }
        });

        this.channel.onclose = (ev) => {
            this.pc.removeTrack(this.sender);
            this.pc.close();
        }
    }

    leave() {
        this.channel.close();
        this.unsubscribe();
    }

    setRemoteVideo() {
        this.remoteVideo = document.querySelector(`#${ this.remoteid }`);;
        console.log(this.remoteVideo);
    }

    setStream(stream) {
        for ( const track of stream.getTracks() ) {
          this.sender = this.pc.addTrack(track, stream);
        }
        this.hasStreamSet = true;
        this.setRemoteVideo();
    }

    onTrack(streams) {
        if (!this.remoteVideo) this.setRemoteVideo();
        if (this.remoteVideo.srcObject) return;
        this.remoteVideo.srcObject = streams[0];
    }

    onConnectionStateChange(e) {
        switch(this.pc.connectionState) {
            case "new":
            case "checking":
              console.log("Connecting...");
              break;
            case "connected":
              console.log("Online");
              break;
            case "disconnected":
              console.log("Disconnecting...");
              break;
            case "closed":
              console.log("Offline");
              break;
            case "failed":
              console.log("Error", e);
              break;
            default:
              console.log("Unknown", this.pc.connectionState);
              break;
          }
    }

    async onIceCandidate(candidate) {
        if (candidate && !this.ice.has(candidate)) {
            this.ice.add(candidate);
            await this.signal.sendIce(this.roomid, this.remoteid, this.localid, candidate)
        }
    }

    async createOffer() {
        if (this.shouldSendOffer) {
            await this.pc.setLocalDescription(await this.pc.createOffer());
            this.offer = this.pc.localDescription;
            await this.signal.sendOffer(this.roomid, this.remoteid, this.localid, this.offer);
            this.shouldSendOffer = false;
        }
    }

    async createAnswer() {
        this.pc.setLocalDescription(await this.pc.createAnswer());
        this.answer = this.pc.localDescription;
        await this.signal.sendAnswer(this.roomid, this.remoteid, this.localid, this.answer);
    }

    async handleOffer(offer) {
        this.offer = offer;
        await this.pc.setRemoteDescription(this.offer);
        await this.createAnswer();
    }

    async handleAnswer(answer) {
        this.answer = answer;
        await this.pc.setRemoteDescription(this.answer);
    }

    async handleIce(ice) {
        await this.pc.addIceCandidate(ice);
    }

    async handleMessage(type, message) {
        console.log(`Message ${ type } received.`);
        switch(type) {
            case 'offer':
                await this.handleOffer(message);
                break;
            case 'answer':
                await this.handleAnswer(message);
                break;
            case 'ice':
                await this.handleIce(message);
                break;
        }
    }
}