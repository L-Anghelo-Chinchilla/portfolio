import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import styled from 'styled-components';
import prog from './../media/Capa 3.svg';
import dib from './../media/Capa 4.svg';
const BigP = styled.span`
    font-size: 35px;
    @media only screen and (max-width: 900px)  {
        font-size: 20px;  
    }
    font-weight: bolder;
    color: ${props => props.color};
    margin:20px 10px;
    font-family: Monospace;
    letter-spacing: ${props => props.sp};
`

const Parent = styled.div`
position: relative;
top: 0;
left: 0;
width: 30vw;
@media screen and (max-width:900px){
       display :none ;
}
// 'height': '30vw'
`


const Simage = styled.img`
    position: ${props => props.pos};
    top:0;
    left:0;
    width:400px;
    display:inline-block;
    animation-duration:4s;
    animation-delay: ${props => props.i};
    animation-timing-function: linear;
    animation-name: woosh;
    animation-iteration-count:infinite;
    opacity: 0;
  
  @keyframes woosh {
    0% {
      opacity: 0.0;
    }   
    10%{ 
      opacity: 100;
    }
    40%{
        opacity: 100;
    }
    50%{
        opacity: 0;
    }
    100%{
        opacity: 0;
    }
  }
  `


const Presentation = () => {
    return (

        <Container style={{ 'display': 'flex', 'align-items': 'center', 'height': '90vh' }}>
            <Row classname="justify-content-center">
                <Col style={{ 'width': '70vw'  }}>
                    <BigP color="white" sp="4px" >Hi, I'm a</BigP>
                    <BigP color="crimson" sp="2px" >Competitive programmer,</BigP>
                    <BigP color="khaki" sp="2px">CS student and developer,</BigP>
                    <BigP color="midnightblue" sp="2px">Science and Art enthusiast.</BigP>
                    <BigP color="maroon" sp="2px">And I like to draw!✨ </BigP>
                </Col>
                <Parent >
                <Simage pos={"relative"} i={"0s"} src={prog} />
                <Simage pos={"absolute"} i={"2s"} src={dib}   />
                </Parent> 
            </Row>
        </Container>
    );
}

export default Presentation;