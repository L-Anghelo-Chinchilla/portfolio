import './App.css';
import React from 'react';
import Home from './Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Col from 'react-bootstrap/Col';
import {Nav, Navbar} from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import githublogo from './media/githublogo.png';
import linkedinlogo from './media/LinkedInlogo.png';
import SocialLink from './components/SocialLink';
import { Container } from 'react-bootstrap';
import styled from 'styled-components';


let SNavbar = styled(Nav)`
   background-color: rgb(63, 164, 132);
`


function App() {
  return (
    <Tab.Container id="app" defaultActiveKey="first">
      <SNavbar>
        
          <SocialLink logo={githublogo} name='GitHub' url='https://github.com/L-Anghelo-Chinchilla' >
          </SocialLink >
          <SocialLink logo={linkedinlogo} name='LinkedIn' url='https://www.linkedin.com/in/luis-anghelo-pe%C3%B1a-chinchilla-46482b264/'>
          </SocialLink>
          
          {/* <Navbar className="justify-content-end"> */}
            {/* <Nav variant="pills" className="flex-column"> */}
              <Nav.Item>
                <Nav.Link eventKey="first">Tab 1</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="second">Tab 2</Nav.Link>
              </Nav.Item>
            {/* </Nav> */}

          {/* </Navbar> */}
        
      </SNavbar>

      <Tab.Content>
        <Tab.Pane eventKey="first">
          <p>uno</p>
        </Tab.Pane>
        <Tab.Pane eventKey="second">
          <p>dos</p>

        </Tab.Pane>
      </Tab.Content>

    </Tab.Container>
  );
}

export default App;
