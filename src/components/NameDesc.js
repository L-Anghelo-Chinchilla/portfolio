import React from 'react';
 
const NameDesc =( { name , desc})=>
{
  return (
    <>
    <p>{name}</p>
    <p>  ,  </p>
    <p>{desc}</p>
    </>
  );
}
 
export default NameDesc;