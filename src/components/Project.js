import React from 'react';
import { Col, Row, Container, NavLink, Tooltip , OverlayTrigger } from "react-bootstrap";
import Carrussel from './Carrussel';
import Pin from './Pin';
import drawing from '../media/drawing.png';
import draw from '../media/draw.gif';
import clear from '../media/clear.gif';
import sketch from '../media/sketch.png';
import Home from '../media/Home.png';
import Path from '../media/Path.png';
import allpaths from '../media/allpaths.png';
import styled from 'styled-components';


const tooltip = (
    <Tooltip id="tooltip">
        <strong>GitHub!</strong>
    </Tooltip>
);

const tooltip2 = (
    <Tooltip id="tooltip">
        <strong>Check the repo!</strong> 
    </Tooltip>
);


let proj = [
    {
        name: "Regular Polygon Playground",
        lang: "Java",
        color: "orange",
        desc: "Multiplatform aplication that allows to draw regular polygons of any number of sides. Made for learning regular polygons while having fun drawing.",
        url: "https://github.com/L-Anghelo-Chinchilla/Regular-Polygon-Playground",
        images: [drawing, draw, clear, sketch]
    },
    {
        name: "Map Visualizer 2000",
        lang: "C++",
        color: "blue",
        desc: "Windows interactive UI aplication to find the shortest path between two locations in a map.",
        url: "https://github.com/L-Anghelo-Chinchilla/Map-Visualizer-2000",
        images: [Home, Path, allpaths]
    }
]

const cent = {
    'align-items': 'center',
    'margin': '30px 100px',
    'font-size': '23px'
}


let Divider = styled.div`
    background-color:rgba(3 , 3 ,3 ,0.1);
    border-radius:17px;
    height:5px;
    width:100%;
    margin:0px 0px ;
`
let Link = styled(NavLink)`
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    font-weight: bold;
    font-size:25px;
    letter-spacing: 2px;
    :hover
    {
        color: teal;
    }
`

const Projects = () => {
    return (
        <Container>
            <Col>
                {proj.map((pro) => (
                    <Col className="justify-content-center">
                        
                        <OverlayTrigger placement="left" overlay={tooltip}>
                            <Link target="_blank" href={pro.url}>
                                {pro.name + " ⇱ "}
                            </Link>
                        </OverlayTrigger>
                        <Row >
                            <Pin color={pro.color} name={pro.lang} />
                            <div style={{ 'height': '10px', 'width': '200px' }} />
                        </Row>
                        
                        <OverlayTrigger placement="top" overlay={tooltip2}>
                        <a target="_blank" href={pro.url}>
                            <Carrussel style={cent} images={pro.images} />
                        </a>
                        </OverlayTrigger>
                        <p style={cent} >{pro.desc}</p>

                        <Divider />
                        {/* <div style={{'height':'20px'}}></div> */}
                    </Col>
                ))}
            </Col>
        </Container>
    );
}

export default Projects;