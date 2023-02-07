import React from 'react';
// competencia , puesto y eso 
const Comp =( { title ,  puesto  , desc })=>
{
  return (
    <>
      <h3>
        {title}
      </h3>
      <p>
        {puesto}
      </p>
      <p>
        {desc}
      </p>
    </>
  );
}

export default Comp;