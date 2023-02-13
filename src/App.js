import './App.css';
import React from 'react';
import Home from './Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import githublogo from './media/githublogo.png';
import linkedinlogo from './media/LinkedInlogo.png';
import SocialLink from './components/SocialLink';
import { Container, Stack } from 'react-bootstrap';
import styled from 'styled-components';
import Drawings from './components/Drawings';
// import Carrussel from './components/Carrussel';


let SNavbar = styled.div`
  z-index: 100000;
  position: fixed;
  background-color: rgb(63, 164, 132); 
  top: 0px;
  width: 100%;
`
const Pill = styled(Nav.Item)`
--bs-nav-pills-link-active-bg:teal; 
`
function App() {
  return (
    <Tab.Container id="app" classname="App" defaultActiveKey="first" style={{'background-color':'rgb(113, 214, 182)'}}>
      <SNavbar>
        <Container>
          <Stack direction='horizontal' gap={3} >
          <SocialLink logo={githublogo} name='GitHub' url='https://github.com/L-Anghelo-Chinchilla' />
          <SocialLink logo={linkedinlogo} name='LinkedIn' url='https://www.linkedin.com/in/luis-anghelo-pe%C3%B1a-chinchilla-46482b264/' />
            <Nav classname="justify-content-end" style={{'margin-left':'auto', 'background-color': 'white', 'border-radius': '7px' }} variant="pills" >
              <Pill>
                <Nav.Link eventKey="first"> Programming </Nav.Link>
              </Pill>
              <Pill>
                <Nav.Link eventKey="second"> Drawings </Nav.Link>
              </Pill>
            </Nav>
          </Stack>
        </Container>
      </SNavbar>
      <Tab.Content style={{'background-color':'rgb(113, 214, 182)'}} >
  
        <Tab.Pane eventKey="first" style={{'--bs-nav-pills-link-active-bg':'teal'}}>
          <Home />
        </Tab.Pane>
        <Tab.Pane eventKey="second">
          {/* <Carrussel/>  */}
          <Drawings/>
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
}

export default App;
