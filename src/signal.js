import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { firebaseConfig } from './constants';

import Client from './client';

export default class Signal {
    constructor() {
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.firestore();

        this.unsubscribe = null;
    }

    async createRoom(roomid, name) {
        await this.db.collection('rooms').doc(roomid).set({
            name: name
        });
    }

    async joinRoom(roomid, userid, setClients, handleClientLeave) {
        await this.db.collection('rooms_occupents').add({
            roomid: roomid,
            userid: userid,
        });

        let init = true;
        this.unsubscribe = this.db.collection('rooms_occupents').where('roomid', '==', roomid).onSnapshot(query => {
            const clients = [];
            for (const change of query.docChanges()) {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    if (data.userid !== userid) {
                        console.log('New client found - ', data.userid, init);
                        const client = new Client(userid, data.userid, roomid, this, init, handleClientLeave);

                        clients.push(client);
                    }
                }
            }
            setClients(oldClients => [...oldClients, ...clients]);
            init = false;
        });
    }

    async leaveRoom(roomid, userid) {
        const queryOccupents = await this.db.collection('rooms_occupents').where('roomid', '==', roomid).where('userid', '==', userid).get();
        for (const doc of queryOccupents.docs) {
            await doc.ref.delete();
        }

        let queryPeers = await this.db.collection('rooms_peers').where('roomid', '==', roomid).where('from', '==', userid).get();
        for (const doc of queryPeers.docs) {
            await doc.ref.delete();
        }

        this.unsubscribe();
    }

    async doesRoomExist(roomid) {
        const doc = await this.db.collection('rooms').doc(roomid).get();
        return doc.exists;
    }

    async sendOffer(roomid, to, from, offer) {
        await this._sendPeer(roomid, to, from, JSON.stringify(offer), 'offer');
    }

    async sendAnswer(roomid, to, from, answer) {
        await this._sendPeer(roomid, to, from, JSON.stringify(answer), 'answer');
    }

    async sendIce(roomid, to, from, ice) {
        await this._sendPeer(roomid, to, from, JSON.stringify(ice), 'ice');
    }

    async _sendPeer(roomid, to, from, message, type) {
        console.log(`Sending ${ type } to ${ to } from ${ from }`)
        await this.db.collection('rooms_peers').add({
            roomid: roomid,
            to: to,
            from: from,
            message: message,
            type: type,
        });
    }
}