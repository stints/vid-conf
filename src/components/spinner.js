import React from 'react';

const Spinner = () => {
    return (
        <div className="container spinner-container">
            <div className="lds-spinner">
                <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
            </div>
        </div>
    );
}

export default Spinner;