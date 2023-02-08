import React from 'react';
import Carousel from 'react-bootstrap/Carousel';

const styl = {  
  height: 'clamp( 450px , 60%  , 800px)',
  width: 'clamp( 450px , 60% , 800px)',
  margin: 'auto',
  'z-index':'100'
}

const Carrussel =( { images })=>
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