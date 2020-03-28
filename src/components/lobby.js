import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import uniqid from 'uniqid';

const Lobby = ({ signal }) => {
    const [roomName, setRoomName] = useState("");
    const history = useHistory();

    const handleClick = async () => {
        const roomid = uniqid();
        await signal.createRoom(roomid, roomName);
        history.push(`/room/${ roomid }`);
    };

    const handleEnter = (e) => {
        if (e.which === 13) {
            handleClick();
        }
    }

    return (
        <section className="hero is-fullheight is-bold">
            <div className="hero-body">
                <div className="container">
                    <div className="field has-addons is-centered" id="lobby">
                        <div className="control">
                            <input className="input" type="text" placeholder="Room Name" onKeyPress={ e => handleEnter(e) } onChange={ e => setRoomName(e.target.value) } />
                        </div>
                        <div className="control">
                            <button className="button is-primary" onClick={ () => handleClick() }>Create</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Lobby;