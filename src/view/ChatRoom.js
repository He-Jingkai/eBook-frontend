import React from 'react';
import Chat, { Bubble, Card, CardText, Button, Popup} from '@chatui/core';
import '@chatui/core/es/styles/index.less';
import '@chatui/core/dist/index.css';
import { List, Typography, Divider } from 'antd';

var websocket;

export class ChatRoom extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            messages:[],
            username:"xxx",
            userList:[],
            open:false
        }
    }

    send =  (message, callback)=> {
        this.waitForConnection(function () {
            websocket.send(message);
            if (typeof callback !== 'undefined') {
                callback();
            }
        }, 1000);
    };

    waitForConnection=(callback, interval)=>{
        if (websocket.readyState === 1) {
            callback();
        } else {
            let that = this;
            setTimeout(function () {
                that.waitForConnection(callback, interval);
            }, interval);
        }
    };


    componentWillMount() {
        fetch("http://localhost:8080/user?userid="+localStorage.getItem("id"))
            .then(response => response.json())
            .then(data => {
                // alert("data:" + data);
                this.setState({
                    username:data.username
                });
                websocket=new WebSocket("ws://localhost:8080/chatRoom")
                websocket.onmessage = this.onMessage;


                let joinMsg = {
                    type:"join",
                    username:data.username,
                };
                this.send(JSON.stringify(joinMsg));
            }).catch(function (ex) {
            console.log('parsing failed', ex)
        })
    }

    onMessage=(evt)=> {
        var msg = JSON.parse(evt.data);
        let messageNow;
        if(msg.type==='text')
            messageNow={
                type: 'text',
                content: msg.content,
                username: msg.username,
            }
        else if(msg.type==='join')
            messageNow={
                type: 'join',
                username: msg.username,
            }
        else if(msg.type==='leave')
            messageNow={
                type: 'leave',
                username: msg.username,
            }
        else
            messageNow={
                type: 'users',
                userList: msg.userList,
            }
        let messagePrevious=this.state.messages
        messagePrevious.push(messageNow)
        this.setState({messages:messagePrevious})
    }


    handleSend=(type, val)=> {
        if (type === 'text' && val.trim()) {
            let messagePrevious=this.state.messages
            let messageNew={
                type: 'text',
                content: val,
                username:this.state.username,
                position: 'right',
            }
            let messageSend={
                type: 'text',
                content: val,
                username:this.state.username,
            }

            messagePrevious.push(messageNew)
            this.setState({messages:messagePrevious})

            websocket.send(JSON.stringify(messageSend));
        }
    }

    handleOpen=()=> {
        this.setState({open:true})
    }

    handleClose=()=> {
        this.setState({open:false})
    }

    renderMessageContent=(msg)=> {
        switch (msg.type) {
            case 'text':
                return <Bubble color={"#178FFE"} type={'text'}>
                    <div style={{
                        textAlign:"left",
                    }}>
                        <p>
                            {msg.content}
                        </p>
                        <div
                            style={{
                                color:"#888",
                                fontSize:"9px"
                            }}
                        >{msg.username}</div>
                    </div>
                </Bubble>;
            case 'join':
                return (
                    <Card size="xl">
                        <CardText>{msg.username+"加入了聊天室"}</CardText>
                    </Card>
                );
            case 'leave':
                return (
                    <Card size="xl">
                        <CardText>{msg.username+"离开了聊天室"}</CardText>
                    </Card>
                );
            case 'users':
                return (
                    <div>
                            <div>
                                <List
                                    header={<div>当前在线人员</div>}
                                    bordered
                                    dataSource={msg.userList}
                                    renderItem={item => (
                                        <List.Item>
                                            {item}
                                        </List.Item>
                                    )}
                                />
                            </div>
                    </div>
                );
            default:
                return null;
        }
    }
    render() {
        return (
            <Chat
                navbar={{ title: '聊天室' }}
                messages={this.state.messages}
                renderMessageContent={this.renderMessageContent}
                onSend={this.handleSend}
            />
        );
    }
}
