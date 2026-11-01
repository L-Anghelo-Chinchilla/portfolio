import React from 'react';
import hando from './../media/drawings/hando.jpg';
import aux from './../media/drawings/poster.jpg';
import buzz from './../media/drawings/buzz.jpg';
import hando_s from './../media/drawings/sketch.jpg';
import minicamp from './../media/drawings/Camp.jpg';
import moto from './../media/drawings/Motociclista.jpg';
import ayudas from './../media/drawings/ayudas.jpg';
import unicornui from './../media/drawings/unicornui.jpg';
import radio from './../media/drawings/radio.jpg';
import dart from './../media/drawings/dart.jpg';
import eye from './../media/drawings/eye.jpg';
import SpiralCarousel from './SpiralCarousel';
import styled from 'styled-components';

const draws = [
    {
        img:hando,
        comm: "false"
    },
    {
        img:aux,
        comm: "true"
    },
    {
        img:buzz,
        comm: "false"
    },  
    {
        img:hando_s,
        comm: "false"
    },
    {
        img:ayudas,
        comm: "true"
    },
    {
        img:unicornui,
        comm: "true"
    },
    {
        img:minicamp,
        comm: "true"
    },
    {
        img:dart,
        comm: "true"
    },
    {
        img:moto,
        comm: "false"
    },
    {
        img:eye,
        comm: "false"
    },
    {
        img:radio,
        comm: "false"
    },

]

// How many drawings are on the path at once, and how often they move (ms).
const SHOWN_DRAWINGS = 6;
const SWITCH_EVERY_MS = 7000;

// Text shown on the free half of each screen (screen 1: left, screen 2: right).
const PROJECTS = [
  {
    title: 'Project 1',
    text: 'Write a short description of this project here: what it is, the idea behind it and the tools you used.',
    note: 'Tools / year',
  },
  {
    title: 'Project 2',
    text: 'Write a short description of this project here: what it is, the idea behind it and the tools you used.',
    note: 'Tools / year',
  },
];

// One screen = the viewport minus the 60px navbar.
const SCREEN = 'calc(100vh - 60px)';

const Screens = styled.div`
  position: relative;
  height: calc(2 * (100vh - 60px));
`

const Panel = styled.div`
  position: absolute;
  top: ${(p) => (p.$screen === 0 ? '0px' : SCREEN)};
  left: ${(p) => (p.$side === 'left' ? '0' : '50%')};
  width: 50%;
  height: ${SCREEN};
  padding: 6vh 4vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left;
  z-index: 1;

  @media screen and (max-width:900px){
    left: 0;
    width: 100%;
    padding: 24px 16px;
    z-index: 200; /* over the drawings on narrow screens */
  }
`

const Title = styled.h2`
  font-family: 'Georgia';
  font-style: italic;
  font-weight: bolder;
  font-size: 3rem;
  margin: 0 0 24px;
  @media screen and (max-width:900px){
    font-size: 2rem;
  }
`

const Box = styled.div`
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  box-shadow: -8px 10px 14px rgba(0, 0, 0, 0.25);
  padding: 24px;
  font-size: 1.15rem;
  line-height: 1.6;
`

const Note = styled.p`
  margin: 16px 0 0 4px;
  font-weight: bold;
  opacity: 0.75;
`

const Drawings =( )=>
{
  return (
    <div style={{'background-color':'rgb(81, 183, 155)'}}>
      <div style={{'height':'60px'}}/>
      <Screens>
        {PROJECTS.slice(0, 2).map((p, i) => (
          <Panel key={p.title} $screen={i} $side={i === 0 ? 'left' : 'right'}>
            <Title>{p.title}</Title>
            <Box>{p.text}</Box>
            {p.note && <Note>{p.note}</Note>}
          </Panel>
        ))}
        <SpiralCarousel
          images={draws.map((e) => e.img)}
          count={SHOWN_DRAWINGS}
          interval={SWITCH_EVERY_MS}
        />
      </Screens>
    </div>
  );
}
export default Drawings;
