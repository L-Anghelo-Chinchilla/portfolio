import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import styled from 'styled-components';

const styl = {  
  height: 'clamp( 450px , 60%  , 800px)',
  width: 'clamp( 450px , 60% , 800px)',
  margin: 'auto'
}

const Carrussel =( { images })=>
{
  return (  
    <Carousel style={styl}>
      {images.map(  (imag) => 
      (        
        <Carousel.Item interval={2500} >
        <img
          className="d-block w-100"
          src={imag}
          alt=""
          />
        {/* <Carousel.Caption>
          <h3>First slide label</h3>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
        </Carousel.Caption> */}
      </Carousel.Item>
      
      )
      )}
    </Carousel>
  );
}

export default Carrussel;