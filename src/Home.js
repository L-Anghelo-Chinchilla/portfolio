import React from 'react';
import Projects from './components/Project';
import styled from 'styled-components';
import SkillList from './components/SkillList';
import Awards from './components/Awards';
import Presentation from './components/Presentation';


let H2 = styled.h2`
  font-family: 'Georgia';
  font-stretch: expanded;
  font-weight: bolder;
  display: flex;
  margin:0px 20px ;
  padding: 20px;
  font-size:3rem;
  
`


function Home() {
  return (
    <div style={{'background-color':'rgb(113, 214, 182)'}}>
      <div style={{'height':'60px'}}/>

      

      <div style={{'background-color':'rgb(113, 214, 182)'}}>

        <Presentation/>
      </div>
      <div style={{'background-color':'rgb(113, 214, 182)'}}>
        <H2>
          HONORS AND AWARDS
        </H2>
        < Awards/>
      </div>
    <div style={{'background-color':'rgb(93, 194, 165)'}}>
        <H2>
          MY SKILLS
        </H2>
        <SkillList />
    </div>
    <div style={{'background-color':'rgb(113, 214, 182)'}} >
        <H2>
          PERSONAL PROJECTS
        </H2>
        <Projects/>
    </div>
    </div>



  );
}

export default Home;