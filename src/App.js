import './App.css';
import React from 'react';
import Home from './Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import { Container, Stack } from 'react-bootstrap';
import styled from 'styled-components';
import Drawings from './components/Drawings';
import awardsicon from './media/awards.png';
import skillsicon from './media/skills.png';
import projectsicon from './media/projects.png';



let SNavbar = styled.div`
  z-index: 100000;
  position: fixed;
  background-color: rgb(63, 164, 132); 
  top: 0px;
  width: 100%;
  @media screen and (max-width:900px){
    gap:0px;
  }
`

const Pill = styled(Nav.Item)`
   display:flex;
   --bs-nav-link-hover-color: midnightblue;
   --bs-nav-pills-link-active-bg:teal; 
   --bs-link-color:#3FA484;
   --bs-link-hover-color:lightgray;
   --bs-nav-link-color:white;
   `

const navi= {
  'margin-left':'auto', 
  'background-color': 'rgb(103,204,172)', 
  'border-radius': '7px' ,
  'color':'white' ,
  margin:'5px'
}


const An = styled.a`
  color:white;
  font-size:20px;
  font-weight:bold;
  font-family:Monaco;
  margin:15px;
  text-decoration:None;
  :hover{
    color: midnightblue;
    transition: color 100ms ;
  }

  @media screen and (max-width:900px){
    display:none;
  }
`
const Icon = styled.img`
  margin:0px;
  width : 25px;
  height: 25px;
  @media screen and (min-width:899px){
    display: none;
  }
`




function App() {
  return (
    <Tab.Container id="app" classname="App" defaultActiveKey="first" style={{'background-color':'rgb(113, 214, 182)'}}>
      <SNavbar>
        <Container>
          <Stack direction='horizontal' gap={3} >
              <An  href="#awards"> Awards</An>
              <Icon src={ awardsicon } />
              <div style={{'width':'1px' , 'height':'20px' , 'background-color':'white' }}/>
              <Icon src={ skillsicon} />
              <An  href="#skills"> Skills</An>
              <div style={{'width':'1px' , 'height':'20px' , 'background-color':'white' }}/>
              <An  href="#work" > My Work</An>
              <Icon src={ projectsicon } />
            <Nav classname="justify-content-end" style={navi} variant="pills" >
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
      <Tab.Content style={{'background-color':'rgb(113, 214, 182)' ,'width':'100vw'}} >
        <Tab.Pane eventKey="first" style={{'--bs-nav-pills-link-active-bg':'teal'}}>
          <Home />
        </Tab.Pane>
        <Tab.Pane eventKey="second">
          <Drawings/>
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
}

export default App;