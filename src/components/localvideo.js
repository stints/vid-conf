import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

const LocalVideo = ({ stream }) => {
    const video = React.createRef();
    const [streamSet, setStreamSet] = useState(false);
    const [isHidden, setIsHidden] = useState(false);



    useEffect(() => {
        if (!streamSet) {
            if (stream !== null && stream.active) {
                video.current.srcObject = stream;
                setStreamSet(true);
            }
        }
    }, [stream,])

    return (
        <div className="local-video-container is-hidden-mobile">
            <a className="hide-local-video" onClick={ () => setIsHidden(!isHidden) }>{isHidden ? (<FontAwesomeIcon icon={ faEye } />) : (<FontAwesomeIcon icon={ faEyeSlash } />)}</a>
            <video className={isHidden ? "local-video is-hidden" : "local-video"} autoPlay muted ref={ video } />
        </div>
    )
};

export default LocalVideo;