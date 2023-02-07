import React from 'react';
import styled from 'styled-components';
const Simg = styled.img`
  height: 35px;
  text-align: center;
  margin: 15px; 
  color: palevioletred;
`;


const SocialLink =( { url , logo , name } )=>
{
  return (

    <>
        <a href={url}> 
            <Simg src={logo} alt={name} />
        </a>
    </>
  );
}
 
export default SocialLink;