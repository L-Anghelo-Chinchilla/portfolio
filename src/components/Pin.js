import React from 'react';
 
const Pin =( { color , name   })=>
{
  return (
    <>
     <div>  
        <div color={color}>
            
        </div>
        <p>{name}</p>
     </div>
    </>
  );
}
 
export default Pin;