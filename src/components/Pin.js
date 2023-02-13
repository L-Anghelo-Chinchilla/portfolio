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

const Led= styled.div`
  margin: auto 7px;
  border-radius: 50px;
  border-color: white;
  border-width: 1px;
  height:13px;
  width:13px;
  background-color:${props => props.color};
  -webkit-box-shadow: inset  0px 0px 1px 2px ${props => "dark"+props.color}; 
box-shadow: inset 0px 0px 1px 2px ${props => "dark"+props.color};
`

const Pin =( { color , name   })=>
{
  return (
    <div style={{'text-align':'end'}}>
     <Rdiv>  
        <Led color = {color}/>
        <p>{name}</p>
     </Rdiv>
    </div>
  );
}

export default Pin;