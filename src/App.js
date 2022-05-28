import React, {useState, useEffect} from 'react';

//CSS
import './App.css';

//Components
import UpperBlock from './components/game_components/UpperBlock'
import BottomBlock from './components/game_components/BottomBlock'
import Game from './components/game_components/Game'
import Bird from './components/game_components/Bird'
import GameOverScreen from './components/game_components/GameOverScreen';
import Score from './components/game_components/Score';
import GameContainer from './components/game_components/GameContainer';

//Redux
import {useSelector} from 'react-redux'
import {useDispatch} from 'react-redux'
import {initialBirdPosition, gravityEffect, jump} from './components/stores/birdPosition';
import { initialBlockConfig, blockAtEndOfWorld, updateBlockPosition } from './components/stores/blockConfig';
import {initialPoints, addPoints} from './components/stores/points';
import { changeGameState, playerHasLost } from './components/stores/gameState';
//Constants
import { GAME_HEIGHT, BLOCK_WIDTH, HOLE} from './constants/constants'

function App() {
  //Game
  // const [gameStarted, setGameStart] = useState(false)
  // const [points, setPoints] = useState(0)
  // const [gameOver, setGameOver] = useState(false)

  //redux
  //GameState
  const {gameStarted, gameOver} =  useSelector(state => state.game.value)
  //Points
  const points =  useSelector(state => state.points.value);
  //Bird
  const birdPosition = useSelector((state)=> state.bird.value);
  //Block
  const  {blockHeight, blockPosition} = useSelector((state)=> state.block.value);
  const dispatch = useDispatch();

  //Block movement
  useEffect(()=>{
    let blockPositionId
    if(gameStarted && !gameOver){
      blockPositionId = setInterval(()=>{
        if(blockPosition < -45){
          dispatch(blockAtEndOfWorld())
          dispatch(addPoints())
        }else{
          dispatch(updateBlockPosition())
        }
      }, 24)
    }
    return () => {
      clearInterval(blockPositionId)
    }
  }, [gameStarted, gameOver, blockPosition])

  //Bird movement
  useEffect(()=>{
    let birdPositionId
    if(gameStarted && !gameOver){
      birdPositionId = setInterval(()=>{
        dispatch(gravityEffect())
      }, 24)
    }
    return () => {
      clearInterval(birdPositionId)
    }
  }, [birdPosition, gameStarted, gameOver])

  //Collision
  useEffect(()=>{
    const hasColliedWithTopObstacle =  birdPosition >= 0 && birdPosition < blockHeight;
    const hasColliedWithBottomObstacle =  birdPosition <= GAME_HEIGHT && birdPosition >= blockHeight + HOLE ;
    const birdHasCrashed = birdPosition > GAME_HEIGHT;
    
    if(blockPosition >=0 &&
      blockPosition <= BLOCK_WIDTH &&
      (hasColliedWithTopObstacle || hasColliedWithBottomObstacle)
      ){
        // setGameStart(()=>false)
        // setGameOver(()=>true)

        dispatch(changeGameState(false))
        dispatch(playerHasLost(true))
      }else if (birdHasCrashed){
        // setGameStart(()=>false)
        // setGameOver(()=>true)

        dispatch(changeGameState(false))
        dispatch(playerHasLost(true))
      }
  }, [birdPosition])

  const startGame = () => {
    if(!gameStarted){

      dispatch(changeGameState(true))
      dispatch(playerHasLost(false))
      
      // setGameStart(prev=> !prev)
      // setGameOver(()=>false)

      dispatch(initialPoints())
      dispatch(initialBlockConfig())
      dispatch(initialBirdPosition())
    }
  }

  const birdJump = () => {
    // setBirdPosition(prev => prev - 50)
    if(gameStarted && !gameOver){
      dispatch(jump())
    }
    
  }

  const gameOverScreen = () => {
    if(gameStarted === false){
      return (
        <GameOverScreen>
            <h1 className="title">{!gameOver?'Welcome' : 'You lost!'}</h1>
            <h3 className="score">{!gameOver? null : `Score ${points}`}</h3>
            <button onClick={startGame}>{!gameOver? 'Start Playing' : 'Play Again'}</button>
            <div className="backdrop"></div>
        </GameOverScreen>
      )
    }else{
      return <Score> {points} </Score>
    }
  }
  
  return (
    <GameContainer>
      <Game onClick = {birdJump}>
        <UpperBlock height={blockHeight} position={blockPosition}/>
        <Bird position={birdPosition}/>
        <BottomBlock height={blockHeight} position={blockPosition}/>
        {gameOverScreen()}
      </Game>
    </GameContainer>
  );
}

export default App;
