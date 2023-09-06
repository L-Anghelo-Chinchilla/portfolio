import React from 'react';
import { Col, NavLink, Row, Stack, Container, OverlayTrigger , Tooltip } from 'react-bootstrap';
import Imag from './Imag';
import ICPClogo1 from './../media/ICPClogo1.png';
import ICPClogo2 from './../media/ICPClogo2.png';
import ICPClogo3 from './../media/ICPClogo3.png';
import logo4 from './../media/ICPClogo4.png';
import goldenMedal from './../media/goldenMedal.png';
import silverMedal from './../media/silverMedal.png';
import nomedal from './../media/nomedal.png';
import latino from './../media/latino.jpg';
import styled from 'styled-components';
import premiacion from './../media/premiacion.jpg'
import morros from './../media/morros.jpg'
import youuuu from './../media/youuuu.jpg'
import Carrussel from './Carrussel';

const tooltip = (
    <Tooltip id="tooltip" >
        <strong>Go to Scoreboard!</strong> 
    </Tooltip>
);


const contests = [
    {
        title: '1st place in competitive contest "Cocha Somos innovacion" 2nd edition, team "Pdelinpiesa2880".',
        url: "https://www.facebook.com/assuresoft/posts/pfbid0aTYy8qe3h7B66gdA4cemQVnBmCzk11BAxKxj4WkkKcUmFtpzzwZ9j8j1Xj3CyNEPl?locale=es_LA",
        medal: goldenMedal
    },
    {
        title: '3rd place in ICPC Bolivia 2021, team "Qué Pasó?".',
        url: "https://icpc.global/regionals/finder/bolivia-preliminary-2021/standings",
        medal: silverMedal
    },
    {
        title: '4th place in ICPC Bolivia 2022, team "Dlinpiesa".',
        url: "https://icpc.global/regionals/finder/bolivia-preliminary-2022/standings.",
        medal: silverMedal
    },
    {
        title: '3rd place in First programming contest Cochabamba "Somos innovación 2022". team "Dlimpiesa".',
        url: "https://www.facebook.com/gamcochabamba/posts/pfbid02Z3PGtnC91Lw9etX5e41EM5UGAKM5yD7ppudbnGUrzxvGXwtcN1xUhRPzD3oQK3Zpl",
        medal: silverMedal
    },
    {
        title: '23th place in the ICPC South America/South 2022 regional contest. team "Dlimpiesa"',
        url: "https://icpc.global/regionals/finder/SouthAmerica-South-2022/standings",
        medal: nomedal
    },
    {
        title: "Ranked in 247th place out of 6373 teams globally in the 24 hour programming competition IEEEXtreme 16.0 with the team 'Dlinpiesa'.",
        url: "https://csacademy.com/ieeextreme16/scoreboard",
        medal: nomedal
    }
]

const photos = [
    latino,
    premiacion,
    morros,
    youuuu
]
const stl = {
    'width':'max(30% ,400px)' , 
    'height':'max(30% , 400px)' , 
    'margin':'20px auto'
}



let Link = styled(NavLink)`
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    font-weight: bold;
    font-size:17px;
    letter-spacing: 1px;
    margin:20px;
    :hover
    {
        color: aliceblue;
    }
`
const SContainer = styled(Container)`
    /* border-radius: 15px;
    border-color: white;
    border-width: 5px;
    border-style: dashed; */
    margin: 15px ;

`
const Logo = styled.img`
    width : 400px;
    height: 400px;
    position: absolute;
    top: 2320px;
    right: 0;
    width: 400px;
` 
const bottom = {
    'border-bottom-color':'rgba(256,256,256 , 0.5)',
    'border-bottom-width': '1px',
    'border-bottom-style': 'solid'
}


const Animimg = styled.img`
 width: 30%;
 animation-duration: 3s;
 animation-iteration-count:infinite;
 animation-name: levitate;
 animation-timing-function: ease-in-out;
 animation-delay: ${ props => props.i}ms;
 @keyframes levitate {
    0% {
      transform: translateY(0%);
    }   
    25%{
      
      transform: translateY(-50%);
    }   
    50% {
      transform: translateY( 0%);
    }    
  }
`
const Awards = () => {
    return (
        <Container  >
            <Col>
                <Row className="justify-content-between">
                    <img src={logo4} style={{'width':'max(30%, 290px)' }}  />
                    < Stack style={{'width':'max(25%,190px)' }} direction="horizontal"  >
                        <Animimg src={ICPClogo1} i="100"  />
                        <Animimg src={ICPClogo2} i="400"  />
                        <Animimg src={ICPClogo3} i="600"   />
                    </Stack>
                </Row>
                <div style={{ 'height': '50px' }}></div>
                <Row>
                <SContainer  style={{'width':'max(  50%, 650px  )','margin':'0px 0px 50px 0px'}}>
                    {contests.map(cont => (
                        <Stack  direction='horizontal' style={bottom} >
                            <img src={cont.medal} style={{ 'width': '40px', 'height': '40px' }} />
                            <OverlayTrigger placement="top" overlay={tooltip}>
                            <Link target="_blank" href={cont.url}>
                                {cont.title + "🔗"}
                            </Link>
                            </OverlayTrigger>
                        </Stack>
                    ))}
                </SContainer>
                <Carrussel images={photos} styl={stl} />
                </Row>
            </Col>
        </Container>
    );
}
export default Awards;