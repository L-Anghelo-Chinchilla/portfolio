import React from 'react';
 
const SkillBlock =( { name , desc , color} )=>
{
  return (
    <>
        <h3> {name}</h3>
        <p>{desc}</p>

        <div color={  color}> </div>
    </>
  );
}
 
export default SkillBlock;