import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';


const Carrussel =( { images , styl })=>
{
  return (

    <Carousel style={styl}>
      {images.map(  (imag) => 
      (        

        <Carousel.Item interval={2500} >
        <img
          className="w-100"
          src={imag}
          alt=""
          />
      </Carousel.Item>
      
      )
      )}
    </Carousel>
  );
}

export default Carrussel;