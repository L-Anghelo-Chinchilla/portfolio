import './App.css';
import React from 'react';
import Home from './Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import githublogo from './media/githublogo.png';
import linkedinlogo from './media/LinkedInlogo.png';
import SocialLink from './components/SocialLink';
import { Container, Stack } from 'react-bootstrap';
import styled from 'styled-components';
// import Carrussel from './components/Carrussel';


let SNavbar = styled.div`
   background-color: rgb(63, 164, 132);
`
let Sdiv = styled.div`
  display: inline-table;
  justify-content: end;
  text-align: end;
`

function App() {
  return (
    <Tab.Container id="app" classname="App" defaultActiveKey="first">
      <SNavbar>
        <Container>

          <Stack direction='horizontal' gap={3} >
          <SocialLink logo={githublogo} name='GitHub' url='https://github.com/L-Anghelo-Chinchilla' />
          <SocialLink logo={linkedinlogo} name='LinkedIn' url='https://www.linkedin.com/in/luis-anghelo-pe%C3%B1a-chinchilla-46482b264/' />
            {/* <div style={{'width':'50%'}}/> */}
            <Nav classname="justify-content-end" style={{'margin-left':'auto', 'background-color': 'white', 'border-radius': '7px' }} variant="pills" >
              <Nav.Item>
                <Nav.Link eventKey="first"> Programming </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="second"> Drawings </Nav.Link>
              </Nav.Item>
            </Nav>
          
          </Stack>
        </Container>
      </SNavbar>
      <Tab.Content >
        <Tab.Pane eventKey="first">
          <Home />
        </Tab.Pane>
        <Tab.Pane eventKey="second">
          {/* <Carrussel/>  */}
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
}

export default App;
