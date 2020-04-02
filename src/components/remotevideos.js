import React from 'react';

const RemoteVideos = ({clients}) => {
    return (clients.length ? 
        <div className="remote-video-container">
            <div className="remote-video-list">
                <div className="columns is-gapless">
                    {
                        clients.map(client => {
                            return (
                                <div key={ client.remoteid } className="column is-flex">
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