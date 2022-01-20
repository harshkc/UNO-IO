import React from "react";

const CenterInfo = ({msg}) => {
  return (
    <div style={{position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}>
      <h1 className='topInfoText'>{msg}</h1>
      <br />
      <a href='/'>
        <button className='game-button red'>QUIT</button>
      </a>
    </div>
  );
};

export default CenterInfo;
