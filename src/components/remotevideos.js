import React from 'react';

const RemoteVideos = ({clients}) => {
    return (clients.length ? 
        <div className="remote-video-container">
            <video id={ clients[0].remoteid } className="remote-active-video" autoPlay />
            <div className="remote-video-list">
                <div className="level is-hidden-mobile">
                    {
                        clients.slice(1).map(client => {
                            return (
                                <div key={ client.remoteid } className="level-item has-text-centered">
                                    <video id={ client.remoteid } className="remote-video" autoPlay />
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
        :
        <video className="remote-active-video" autoPlay />
    )
};

export default RemoteVideos;