import React from 'react';
import { Col, Row, Container } from "@kunukn/react-bootstrap-grid";
import Pin from './Pin';
import Imag from './Imag';

proj = [
    {
        name:"Regular Polygon Playground",
        lang:"Java",
        color:"orange",
        desc:"Multiplatform aplication that allows to draw regular polygons of any number of sides. Made for learning regular polygons while having fun drawing.",
        images: ["drawing.png" ,"draw.gif" ,"clear.png", "sketch.png" ] 
    },
    {
        name:"Map Visualizer 2000",
        lang:"C++",
        color:"blue",
        desc:"Windows interactive UI aplication to find the shortest path between two locations in a map.",
        images: [ "Home.png","Path.png" , "allpaths.png" ] 
    }
]

const Projects =( )=>
{
  return (
    <>
    <Col>
        {proj.map( pro => (
            <Col>
                <Row>
                    <Pin color={pro.color}  name={pro.lang} >
                    </Pin>
                </Row>
                <Carrussel images={pro.images} >
                </Carrussel>
                <H4>
                    pro.name
                </H4>
                <p>pro.desc</p>
                <div height="100px"></div>
            </Col>
            
        ))}
        
    </Col>


    </>
  );
}
 
export default Projects;