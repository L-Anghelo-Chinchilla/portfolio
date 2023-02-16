import React from 'react';
import hando from './../media/drawings/hando.jpg';
import aux from './../media/drawings/poster.jpg';
import buzz from './../media/drawings/buzz.jpg';
import hando_s from './../media/drawings/sketch.jpg';
import minicamp from './../media/drawings/Camp.jpg';
import moto from './../media/drawings/Motociclista.jpg';
import ayudas from './../media/drawings/ayudas.jpg';
import unicornui from './../media/drawings/unicornui.jpg';
import radio from './../media/drawings/radio.jpg';
import dart from './../media/drawings/dart.jpg';
import eye from './../media/drawings/eye.jpg';
import { Col, Container, Row } from 'react-bootstrap';
import styled from 'styled-components';

const draws = [
    {
        img:hando,
        comm: "false"
    },
    {
        img:aux,
        comm: "true"
    },
    {
        img:buzz,
        comm: "false"
    },  
    {
        img:hando_s,
        comm: "false"
    },
    {
        img:ayudas,
        comm: "true"
    },
    {
        img:unicornui,
        comm: "true"
    },
    {
        img:minicamp,
        comm: "true"
    },
    {
        img:dart,
        comm: "true"
    },
    {
        img:moto,
        comm: "false"
    },
    {
        img:eye,
        comm: "false"
    },
    {
        img:radio,
        comm: "false"
    },

]

let H2 = styled.h2`
  font-family: 'Georgia';
  font-stretch: expanded;
  font-weight: bolder;
  display: flex;
  margin:0px 20px ;
  padding: 20px;
  font-size:3rem;
    
`
const Floating = styled.img`
-webkit-box-shadow: -8px 10px 5px 0px rgba(0, 0, 0,0.39); 
  box-shadow: -8px 10px 5px 0px rgba(0, 0, 0,0.39);         
    border-color:white-space;
  :hover
  {
      transform   :scale(1.1 , 1.1 );
      transform   :translate(20% , 2    0%);
      transition  :all  300ms  ease-out;
    

      /* transition  :border-style 600ms linear ;
      transition  :border-color 600ms linear ;
      /* transition  :box-shadow 400ms ease-in-out 0ms; */
      border-style:solid;
      border-color: white;
      border-width: 2px;
      -webkit-box-shadow: -5px 15px 3px 0px rgba(0, 0, 0,0.39); 
     box-shadow: -5px 15px 15px 3px rgba(0, 0, 0,0.39);         
  }
`
 
const Drawings =( )=>
{
  return (
      <div style={{'background-color':'rgb(81, 183, 155)'}}>
     <div style={{'height':'60px'}}/>
    <H2>
        MY DRAWINGS
    </H2>
    <Container>
        {draws.map(
            e => (
                <Col style={{'height':'500px' , 'margin':'auto 20px',  'display':'inline-block'}}>
                    <Floating style={{'height':'80%' , 'display':'block'}} src={e.img} />
                </Col>
            )
            )}
    </Container>
    </div>
  );
}
export default Drawings;