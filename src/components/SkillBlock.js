import React from 'react';
import styled from 'styled-components';


let Divider = styled.div`
  background-color:${props => props.color};
  border-radius:17px;
  height:5px;
  width:90%;
  margin:0px 10px 40px 0px;
  animation-duration: 10s;
  animation-delay:${props => props.i }ms;
  animation-timing-function: linear;
  animation-name: appear;
  animation-iteration-count:infinite;

  
  @keyframes appear {
    0% {
      width: 0%;
    }
    
    25%{
      
      width: 90%;
    }
  }
 
`
const Titl = styled.span`
  font-size: 25px;
  letter-spacing: 3px;
  font-weight: bolder;
  font-family: Georgia, 'Times New Roman', Times, serif;
  color:midnightblue;


`
const Span = styled.span`
  font-size: 15px;
  font-weight: bold;
`

const SkillBlock = ({ name, desc, color ,  ind }) => {
  return (
    <>
      <Titl> {name + ": "}</Titl>
      <Span>{desc}</Span>
      <Divider color={color} i={ind} />
    </>
  );
}

export default SkillBlock;