import React from 'react';
import NavBar from './components/NavBar';

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
    <div className="App">
      <NavBar/>
      

      <div>
        <h2>
          PERSONAL PROJECTS
        </h2>
          


      </div>
    </div>
  );
}

export default Home;
