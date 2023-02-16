import React from 'react';
import Projects from './components/Project';
import styled from 'styled-components';
import SkillList from './components/SkillList';
import Awards from './components/Awards';
import Presentation from './components/Presentation';
import githublogo from './media/githublogo.png';
import linkedinlogo from './media/LinkedInlogo.png';
import gmaillogo from './media/gmail.png';
import SocialLink from './components/SocialLink';
import { Row, Stack } from 'react-bootstrap';


let H2 = styled.h2`
  font-family: 'Georgia';
  font-stretch: expanded;
  font-weight: bolder;
  display: flex;
  margin:0px 0px 0px 20px ;
  padding:55px 0px 20px 20px ;
  font-size:3rem;
  @media screen and (max-width:900px){
    font-size:2rem;
  }
  
`


function Home() {
  return (
    <div style={{ 'background-color': 'rgb(93, 194, 165)' ,'width':'100vw'}}>
      <div style={{ 'height': '60px' }} />
      <div style={{ 'background-color': 'rgb(93, 194, 165)' }}>
        <Presentation />
      </div>
      <div id="awards" style={{ 'width': '100vw', 'background-color': 'rgb(113, 214, 182)' }}>
        <H2  >
          HONORS AND AWARDS
        </H2>
        < Awards />
      </div>
      <div id="skills" style={{ 'width': '100vw', 'background-color': 'rgb(93, 194, 165)' }}>
        <H2 >
          MY SKILLS
        </H2>
        <SkillList />
      </div>
      <div id="work" style={{ 'width': '100vw', 'background-color': 'rgb(113, 214, 182)' }} >
        <H2 >
          PERSONAL PROJECTS
        </H2>
        <Projects />
      </div>
      <footer className="d-flex justify-content-center" style={{ 'background-color': 'lightteal' }}>
        <div style={{ 'margin': '20px 0px', 'display': 'inline-block' }} >
          <div>
            <SocialLink logo={githublogo} name='GitHub' url='https://github.com/L-Anghelo-Chinchilla' />
            <SocialLink logo={linkedinlogo} name='LinkedIn' url='https://www.linkedin.com/in/luis-anghelo-pe%C3%B1a-chinchilla-46482b264/' />
            <SocialLink logo={gmaillogo} name='LinkedIn' url='mailto:luisanghelopena@gmail.com' />
          </div>
          <div className="d-flex justify-content-center">
            <p style={{ 'display': 'inline-block', 'margin': '  auto', 'font-weight': 'bold', 'justify-content': 'center' }}>Let's get in touch!</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;