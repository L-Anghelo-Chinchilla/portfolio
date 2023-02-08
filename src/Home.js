import React from 'react';
import Projects from './components/Project';
import styled from 'styled-components';
import SkillList from './components/SkillList';


let H2 = styled.h2`
  font-family: 'Georgia';
  font-stretch: expanded;
  font-weight: bolder;
  display: flex;
  margin:0px 20px ;
  font-size:3rem;

`

function Home() {
  return (
    <div >
      <div style={{'height':'80px'}}/>
        <H2>
          PERSONAL PROJECTS
        </H2>
        <Projects/>
    <div>
        <H2>
          MY SKILLS
        </H2>
        <SkillList />
    </div>
    </div>



  );
}

export default Home;