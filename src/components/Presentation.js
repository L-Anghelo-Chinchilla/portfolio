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
width: max( 30vw , 300px ) ;
height: auto ;
/* @media screen and (max-width:900px){
       display :none ;
} */
// 'height': '30vw'
`


const Simage = styled.img`
    position:absolute;
    top:0;
    left:0;
    width:100%;
    display:inline-block;
    animation-duration:5s;
    animation-delay: ${props => props.i};
    animation-timing-function: linear;
    animation-name: woosh;
    animation-iteration-count:infinite;
    opacity: 0;
  
  @keyframes woosh {
    0%,50%,100% {
      opacity: 0;
    }   
    10%,40%{ 
      opacity: 100;
    }
    
  }
  `

const InvRow = styled(Row)`
    display: flex;
    align-content: center;
    justify-content: center;
    @media only screen and (max-width: 900px) {
        flex-direction: column;
        align-items: center;
        justify-content: center;
  }

`



const Presentation = () => {
    return (

        <Container style={{ 'display': 'flex', 'justify-content': 'center', 'height': '90vh' }}>
            <InvRow className='flex'>
                <Parent >
                <Simage i={"0s"} src={prog} />
                <Simage i={"2.5s"} src={dib}   />
                </Parent> 
                <Col style={{ 'width': 'max(70vw , 600px)' , 'justify-content':'center'  , 'align-items':'center'}}>
                    <BigP color="white" sp="4px" >Hi, I'm a</BigP>
                    <BigP color="crimson" sp="2px" >Competitive programmer,</BigP>
                    <BigP color="khaki" sp="2px">CS student and developer,</BigP>
                    <BigP color="midnightblue" sp="2px">Science and Art enthusiast.</BigP>
                    <BigP color="maroon" sp="2px">And I like to draw!✨ </BigP>
                </Col>
            </InvRow>
        </Container>
    );
}

export default Presentation;