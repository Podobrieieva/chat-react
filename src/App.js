import React, { Component } from 'react';

import './App.css';

import { connect, Provider} from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';

import thunk from 'redux-thunk';

import {Router, Route, Link} from 'react-router-dom';
import createHistory from "history/createBrowserHistory";

 function jsonPost(url, data)
    {
        return new Promise((resolve, reject) => {
            var x = new XMLHttpRequest();   
            x.onerror = () => reject(new Error('jsonPost failed'))
            //x.setRequestHeader('Content-Type', 'application/json');
            x.open("POST", url, true);
            x.send(JSON.stringify(data))

            x.onreadystatechange = () => {
                if (x.readyState == XMLHttpRequest.DONE && x.status == 200){
                    resolve(JSON.parse(x.responseText))
                }
                else if (x.status != 200){
                    reject(new Error('status is not 200'))
                }
            }
        })
    }

class Input extends Component{
  render(){
    console.log(this.props.status)
    if (this.props.status == 'SENT'){
            this.inpMes.value = ''
        }
    if (this.props.status == "FAILED"){
        this.inpMes.style.color = "red"
    }
    return(
      <div>
        <div className="name">
                <label for="name">Name </label>
                <input type="text" name="name" placeholder='Input your name' ref={name=> this.inpName = name}/>
              </div>
              <div className="message">
            <label for ="message"> Message </label>
            <input type ="text" name="message" ref={text=> this.inpMes = text} placeholder ='Input your messsage' size="300px"/>
            </div>
             <div className="button">
            <button onClick ={()=> this.props.actionSend(this.inpName.value, this.inpMes.value)} ref={sub=> this.butChat = sub}> Submit </button>
            </div>
      </div>  
      );
  }
}

class ChatMessage extends Component{
  render(){
    return (
          <div>
          <span>{this.props.message.nick + ''}</span>: 
          <span>{this.props.message.message +""}</span>
          </div>
      )
  };
}

class Chat extends Component{
  render(){

    return (
          <div className ="history">
             <p>View message history </p> 
             <div className="field" >
                  {this.props.message.map((message, i)=> <ChatMessage message={message } key = {i}/>) }
             </div>
          </div>
    );
  }
}

let chatReducer = (state, action) => {
  if (state === undefined){
    return {message: [ {message: "one", nick: "K" } ]};
  }
  if (action.type === 'LOADED'){
    console.log(action.message)
    return {message: action.message
    }
            
    
  }
  return state;
}

let newMessageReducer = (state, action) => {
  if (state === undefined){
    return {status: 'UNSENT'};
  }
  if (action.type === 'SET_STATUS'){
    return {status: action.status};
  }
  return state;
}

const reducers = combineReducers({
  ch: chatReducer,
  nw: newMessageReducer
})


const actionSending = () => ({ type: 'SET_STATUS', status: 'SENDING' })
const actionSent    = () => ({ type: 'SET_STATUS', status: 'SENT' })
const actionFailed  = () => ({ type: 'SET_STATUS', status: 'FAILED' })


let mapStateToProps = state => ({message: state.ch.message, status:state.nw.status})
Chat = connect(mapStateToProps, {actionGet})(Chat) 
Input = connect(mapStateToProps, {actionSend})(Input)
setInterval(actionGet(), 2000)

const store = createStore(reducers, applyMiddleware(thunk))

function actionSend(inpName, inpMes){
    console.log(arguments);
    return async function (dispatch){
        try {
            let data = await jsonPost("http://students.a-level.com.ua:10012", {func: 'addMessage', nick: inpName, message: inpMes})

            dispatch(actionSent())
        }
        catch (e) {
            dispatch(actionFailed())
            console.log("Err")
        }    
    }
}

function actionGet(){
    
    return async function (dispatch){
        try {
            let data = await jsonPost ("http://students.a-level.com.ua:10012", {func: "getMessages", messageId: 0})
            
            store.dispatch(mesLoaded(data.data.reverse()))
           
        }
        catch (e) {
            console.log("Err")
        }    
    }
}

function mesLoaded(data){
  return {
   type: "LOADED",
   message: data 
      }
 
}


class App extends Component {
      render() {
    return (
      <Provider store= {store}>
      <div className="App">
        <Input />
        <Chat/>
      </div>
      </Provider>
    );
  }
}


export default App;
