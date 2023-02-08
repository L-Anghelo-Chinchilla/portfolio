import React from 'react';
import styled from 'styled-components';
const Rdiv = styled.div`
border-radius: 50px;
background-color: rgba( 33,33,33,0.1  );
display : inline-flex;
width: 75px;
height: 25px;
justify-content: left;
text-align: center;
`

const Pin =( { color , name   })=>
{
  return (
    <div style={{'text-align':'end'}}>
     <Rdiv>  
        <Rdiv style={{'margin':'auto 7px','height':'10px','width':'10px','background-color':color}}/>
        <p>{name}</p>
     </Rdiv>
    </div>
  );
}

export default Pin;