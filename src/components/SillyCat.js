
import styled from "styled-components";
import catvg from "../media/catvg.svg";
const Cat = styled.img`
    position: absolute;
    animation: show 9s linear 0s  infinite forwards;
    height: 90%;
    z-index: -100;
    margin:0px 50%; 
    @media screen and (max-width:900px){
       margin :0px ;
    }
    
    @keyframes show {
        0%{
            transform: translateY(-99%);
        }
        25%{
            transform: translateY(-99%);
        }
        50%{
            transform: translateY(-1%);
        }
        95%{
            transform: translateY(-1%);
        }
        100%
        {
            transform: translateY(-99%);
        }
    }



`
const SillyCat = () =>
{
    return (<>
    <Cat src={catvg}/>
    </>) ;
}


export default SillyCat;