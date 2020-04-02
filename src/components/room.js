import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Spinner from './spinner';
import LocalVideo from './localvideo';
import RemoteVideos from './remotevideos';
import { mediaConstraints } from '../constants';

import uniqid from 'uniqid';

const Room = ({ signal }) => {
    const { roomid } = useParams();
    const history = useHistory();

    const [validRoom, setValidRoom] = useState(false);
    const [userid, setUserid] = useState(0);
    const [clients, setClients] = useState([]);
    const [localStream, setLocalStream] = useState(null);

    window.addEventListener("beforeunload", e => {
        if (validRoom) {
            leaveRoom();
        }
    });

    useEffect(() => {
        async function validateRoom() {
            const isValid = await signal.doesRoomExist(roomid);
            setValidRoom(isValid);
            if (!isValid) {
                setTimeout(() => {
                    history.push('/');
                }, 2500);
            }
        }

        validateRoom();
    }, []);

    useEffect(() => {
        if (validRoom) {
            async function setupLocalUser() {
                const uid = uniqid();
                setUserid(uid);
                await signal.joinRoom(roomid, uid, setClients, handleClientLeave);

                const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
                setLocalStream(stream);
            }
            setupLocalUser();
        }
    }, [validRoom,]);

    useEffect(() => {
        if (clients.length > 0 && localStream) {
            async function setupPeerStreams() {
                for (const client of clients) {
                    if (!client.hasStreamSet) {
                        client.setStream(localStream);
                        client.createOffer();
                    }
                }
            }

            setupPeerStreams();
        }
    }, [clients, localStream,]);

    const leaveRoom = async () => {
        console.log('Leaving...');
        for (const track of localStream.getTracks()) {
            track.stop();
        }
        for (const client of clients) {
            client.leave();
        }

        setValidRoom(false);
        setClients([]);
        setLocalStream(null);
        await signal.leaveRoom(roomid, userid);
        history.push('/');
    };

    const handleClientLeave = (oldClient) => {
        console.log(`Client ${ oldClient.remoteid } has left.`);
        const newClients = clients.filter(client => {
            return client.remoteid !== oldClient.remoteid;
        });
        setClients(newClients);
    }

    return (validRoom && localStream !== null?
        <div className="room">
            <div className="leave">
                <button className="button" onClick={ () => leaveRoom() }>Leave</button>
            </div>
            <RemoteVideos clients={ clients } />
            <LocalVideo stream={ localStream } />
        </div> :
        <Spinner />
    );
}

export default Room;