import React from 'react';
import Projects from './components/Project';


let skills = [ 
  { 
    name:"C++" ,
    desc:"Competitive programming, Algorithms , data structures",
    color:""
  },
  {
    name:"JAVA",
    desc:"POO, TDD , SPRING.",
    color:""
  },  
  {
    name:"SQL",
    desc:"POSTGRESSQL",
    color:""
  },  
  {
    name:"DART/FLUTTER",
    desc:"MOBILE, responsive development",
    color:""
  },  
  {
    name:"HTML, CSS, JS",
    desc:"Vanilla JS,  CSS , REACT",
    color:""
  },  
  {
    name:"PYTHON",
    desc:"Task Automaton",
    color:""
  },  
]




function Home() {
  return (
    <div >
        <h2>
          PERSONAL PROJECTS
        </h2>
        <Projects/>
    </div>
  );
}

export default Home;