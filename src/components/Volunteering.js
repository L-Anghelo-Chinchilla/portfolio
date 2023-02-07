import React from 'react';
import { Col, Row } from 'react-bootstrap';
import Imag from './Imag';

contests = [
    {
        title:"International Collegiate Programming Contest 2021 participation – ICPC Foundation 25th place in the South America/South 2021 regional contest.",
        link:"https://icpc.global/regionals/finder/SouthAmerica-South-2021/standings" 
    },
    {
        title:"ICPC Bolivia 2021-2022 participation – ICPC Bolivia 3th place in 2021 4rd place in 2022",
        link:"https://icpc.global/regionals/finder/bolivia-preliminary-2021/standings"
    },
    {
        title:"ICPC Bolivia 2021-2022 participation – ICPC 4rd place in 2022",
        link:"https://icpc.global/regionals/finder/bolivia-preliminary-2022/standings"
    },
    {
        title:"IEEEXtreme 2022 16.0 Edition participation – Institute of Electrical and Electronics Engineers Ranked in 247th place out of 6373 teams globally in the 24 hour programming competition IEEEXtreme with the team 'Dlinpiesa'.",
        link:"https://csacademy.com/ieeextreme16/scoreboard"
    }   
    ,
    {
        title:"First programming contest Cochabamba 'Somos innovación 2022' – Cochabamba mayor's office 3rd place with team 'Dlimpiesa' in the First programming contest promoted by Cochabamba mayor's office",
        link:""
    }
    
]

const Volunteering =( )=>
{
  return (
    <>
        <Col>
            <Row>
                <Imag imgsrc={"../../media/ICPClogo.png"}>
                </Imag>
                <Imag imgsrc={"../../media/ICPClogo.png"}>
                </Imag>
                <Imag imgsrc={"../../media/ICPClogo.png"}>
                </Imag>
            </Row>

        {contests.map( cont => (
            <Col>
                <a href={link}>
                    {cont.title}
                </a>
            </Col>
        ))}
        
        </Col>
    </>
  );
}

export default Volunteering;