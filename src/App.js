import './App.css';
import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
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
import SillyCat from './components/SillyCat';
import Dice3D from './components/dice/LazyDice';
import useScreenFlip from './components/flip/useScreenFlip';
import { primeMusic, setMusicRoom, startMusic } from './components/music/bgMusic';
import MusicToggle from './components/music/MusicToggle';



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
   /* display:flex; */
   --bs-nav-link-hover-color: midnightblue;
   --bs-nav-pills-link-active-bg:teal; 
   --bs-link-color:#3FA484;
   --bs-link-hover-color:lightgray;
   --bs-nav-link-color:white;
   
   @media screen and (max-width:900px){
     width:100%;
     text-align:center;
   }
   `

const navi= {
  'margin':'5px 5px 5px auto',
  'background-color': 'rgb(103,204,172)', 
  'border-radius': '7px' ,
  'color':'white' , 
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
const Icon = styled.a`
  margin:0px;
  width : 25px;
  height: 25px;
  @media screen and (min-width:899px){
    display: none;
  }
  `

const Iconimg = styled.img`
margin:0px;
width : 25px;
height: 25px;
@media screen and (min-width:899px){
  display: none;
}
`

const Stepper = styled.div`
  display: none;
  opacity: 0 ;
  width: 100% ;
  height: 90px ;
  @media screen and (max-width:900px){
       display :block ;
  }
`



function App() {
  const [ show , setShow ] = useState(true);
  const [ activeKey , setActiveKey ] = useState('first');
  const stageRef = useRef(null);
  const contentRef = useRef(null);
  const flip = useScreenFlip(stageRef, contentRef);

  // Switching tabs makes the whole screen jump and turn around to the other tab.
  const handleSelect = (key) => {
    if (!key || key === activeKey) return;
    const toDrawings = key === 'second';
    // The music starts the first time Drawings is opened; prime it inside this click.
    if (toDrawings) primeMusic();
    flip(
      () => {
        flushSync(() => setActiveKey(key));
        // On Programming the music sounds like it's playing in the room next door.
        setMusicRoom(toDrawings ? 'open' : 'wall');
      },
      () => { if (toDrawings) startMusic(); }, // no-op once it's playing
    );
  };

  return (
    <Tab.Container id="app" activeKey={activeKey} onSelect={handleSelect} transition={false}>
      <Dice3D hidden={activeKey !== 'first'} />
      <MusicToggle />
      <div ref={stageRef}>
      <SNavbar>
        <Container>
          <Stack direction='horizontal' gap={3} >
              <An  href="#awards"> Awards</An>
              <Icon  href="#awards" >
                <Iconimg src={ awardsicon } />
              </Icon>
              <div style={{'width':'1px' , 'height':'20px' , 'background-color':'white' }}/>
              <Icon  href="#skills" >
                <Iconimg src={ skillsicon} />
              </Icon>
              <An  href="#skills"> Skills</An>
              <div style={{'width':'1px' , 'height':'20px' , 'background-color':'white' }}/>
              <An  href="#work" > My Work</An>
              <Icon   href="#work">
               <Iconimg src={ projectsicon } />
              </Icon>
            <Nav classname="justify-content-end" style={navi} variant="pills" >
              <Pill>
                <Nav.Link eventKey="first"> Programming </Nav.Link>
              </Pill >
              <Pill style={{'position':'relative'}} onClick={()=> setShow(false) }>
                <Nav.Link eventKey="second"> Drawings </Nav.Link>
               { show && <SillyCat/>}
              </Pill>
            </Nav>
          </Stack>
      </Container>
      </SNavbar>
      <div ref={contentRef}>
      <Stepper/>
      <Tab.Content style={{'background-color':'rgb(113, 214, 182)' ,'width':'100vw'}} >
        <Tab.Pane eventKey="first" style={{'--bs-nav-pills-link-active-bg':'teal'}}>
          <Home />
        </Tab.Pane>
        <Tab.Pane eventKey="second">
          <Drawings/>
        </Tab.Pane>
      </Tab.Content>
      </div>
      </div>
    </Tab.Container>
  );
}

export default App;