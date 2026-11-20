import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import styled from 'styled-components';
import SkillBlock from './SkillBlock';
import stats from './../media/stats.png';

let skills = [
    {
        name: "C++",
        desc: "Competitive programming, Algorithms , data structures.",
        color: "blue"
    },
    {
        name: "JAVA",
        desc: "POO, TDD , SPRING.",
        color: "red"
    },
    {
        name: "SQL",
        desc: "Database Design, DataBase Queries, POSTGRESSQL.",
        color: "green"
    },
    {
        name: "DART/FLUTTER",
        desc: "Mobile, Multiplatfrom design ,responsive development.",
        color: "cyan"
    },
    {
        name: "HTML,CSS,JS",
        desc: "HTML, CSS, Vanilla JS , REACT.JS, NODE.JS , NEXT.JS ",
        color: "orange"
    },
    {
        name: "PYTHON",
        desc: "Task Automaton.",
        color: "yellow"
    },
]

const SkillsCol = styled(Col)`
    padding: 30px;
    margin: 50px;
    @media only screen and (max-width: 900px) {
        /* a 50px margin on a full-width column pushes it off-screen on phones */
        margin: 30px 0;
        padding: 10px;
    }
`

const SkillList = () => {
    return (
        <>
            <Container>

                <Row>

                    <img src={stats} style={{'width':'min(50vw ,  400px)' , 'height':'min(50vw, 400px)' ,'margin':'auto' }}/>
                    <SkillsCol>
                        {skills.map(
                            (e , i) => (
                                <SkillBlock ind={i*500} color={e.color} desc={e.desc} name={e.name} />
                            )
                        )}
                    </SkillsCol>
                </Row>
            </Container>
        </>
    );
}

export default SkillList;