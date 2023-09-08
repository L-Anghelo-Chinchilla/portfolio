
import styled from "styled-components";
import catvg from "../media/catvg.svg";
import pawsvg from "../media/pawsvg.svg";

const Cat = styled.img`
    position: absolute;
    animation: show 9s ease-out 0s  infinite forwards;
    height: 90%;
    z-index: -100;
    margin:0px 50%; 
    @media screen and (max-width:900px){
       margin :0px ;
    }
    
    @keyframes show {
       
        0%,35%,100%{
            transform: translateY(-99%);
        }
        50%,95%{
            transform: translateY(-1%);
        }
       

    }



`
const Paws = styled.img`
    position: absolute;
    animation: blink 9s linear 0s  infinite forwards;
    visibility: hidden;
    height: 90%;
    z-index: 100;
    margin:0px 50%; 
    transform: translateY(-90%);
    @media screen and (max-width:900px){
        margin :0px ;
    }
    
    @keyframes blink {
        47% , 92%{
            visibility: hidden;

        }
        72% , 80%{
            visibility: visible;
        }


    }
`
const SillyCat = () =>
{
    return (<>
    <Paws src={pawsvg} />
    <Cat src={catvg}/>
    </>) ;
}


export default SillyCat;