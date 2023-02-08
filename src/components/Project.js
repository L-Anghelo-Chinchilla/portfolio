import React from 'react';
import { Col, Row, Container } from "react-bootstrap";
import Carrussel from './Carrussel';
import Pin from './Pin';
import drawing from '../media/drawing.png';
import draw from '../media/draw.gif' ;
import clear from '../media/clear.gif'; 
import sketch from '../media/sketch.png';
import Home from '../media/Home.png';
import Path from '../media/Path.png'; 
import allpaths from '../media/allpaths.png'; 
import styled from 'styled-components';
let proj = [
    {
        name:"Regular Polygon Playground",
        lang:"Java",
        color:"orange",
        desc:"Multiplatform aplication that allows to draw regular polygons of any number of sides. Made for learning regular polygons while having fun drawing.",
        images: [drawing ,draw ,clear, sketch ] 
    },
    {
        name:"Map Visualizer 2000",
        lang:"C++",
        color:"blue",
        desc:"Windows interactive UI aplication to find the shortest path between two locations in a map.",
        images: [ Home,Path , allpaths ] 
    }
]

const cent ={
    'align-items':'center',
    'margin':'30px 100px',
    'font-size':'23px'
}

const end = {
    'text-align':'end'
}

let Divider  = styled.div`
    background-color:rgba(3 , 3 ,3 ,0.1);
    border-radius:17px;
    height:5px;
    width:100%;
    margin:50px 10px;
`

const Projects =()=>
{
  return (
    <Container>
    <Col    >
        {proj.map( (pro) => (
            <Col className="justify-content-center">
                <h4>
                    {pro.name}
                </h4>
                <Row >
                    <Pin color={pro.color}  name={pro.lang} />
                    <div style={{'height':'10px','width':'200px'}}/>
                </Row>
                <Carrussel style={cent} images={pro.images} />
                <p style={cent} >{pro.desc}</p>
                
                <Divider/>
            </Col> 
        ))}
    </Col>
    </Container>
  );
}
 
export default Projects;