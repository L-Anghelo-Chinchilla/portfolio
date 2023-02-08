import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import SkillBlock from './SkillBlock';


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
        desc: "Queries, POSTGRESSQL.",
        color: "green"
    },
    {
        name: "DART/FLUTTER",
        desc: "Mobile, Multiplatfrom design ,responsive development.",
        color: "cyan"
    },
    {
        name: "HTML,CSS,JS",
        desc: "HTML, CSS, Vanilla JS , REACT.",
        color: "orange"
    },
    {
        name: "PYTHON",
        desc: "Task Automaton.",
        color: "yellow"
    },
]

const SkillList = () => {


    
    return (
        <>
            <Container>

                <Row>
                    <div style={{ 'background-color': 'black', 'height': '400px', 'width': '400px' }}></div>
                    <Col style={{'padding':'30px'}}>
                        {skills.map(
                            (e , i) => (
                                <SkillBlock ind={i*500} color={e.color} desc={e.desc} name={e.name} />
                            )
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default SkillList;