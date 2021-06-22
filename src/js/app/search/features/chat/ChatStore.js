import request from 'superagent';
import EventEmitter from 'events'

import {register} from '../../../../utils/Dispatcher';
import ActionTypes from '../../../../actions/ActionTypes';
import AccountStore from '../../../../stores/AccountStore';
import SyncStore from '../../../../stores/SyncStore';
import SearchActions from '../../../../actions/SearchActions';

const CHANGE_EVENT = 'change_chat';

////

let state = {
    messageList: [],
    messageCount: 0,
    newMessagesCount: 0,
    isGreetedByBot: false
};



////

const ChatStore = Object.assign(EventEmitter.prototype, {
    emitChange() {
        this.emit(CHANGE_EVENT);
    },
    addChangeListener(callback) {
        this.on(CHANGE_EVENT, callback);
    },
    removeChangeListener(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    getChatMessageList(){
        return state.messageList;
    },

    getNewMessagesCount(){
        let messageCount = localStorage.getItem("message-count");
        if (messageCount === null) {
            localStorage.setItem("message-count", state.messageList.length);
            return state.messageList.length;
        } else {
            return Math.max(0, state.messageList.length - messageCount);
        }
    },

    setNewMessagesCount(){
        localStorage.setItem("message-count", state.messageList.length);
    },

    dispatcherIndex: register(action => {
        switch(action.type) {
            case ActionTypes.GET_CHAT_MESSAGE_LIST:
                _get_chat_message_list();
                break;
            case ActionTypes.ADD_CHAT_MESSAGE:
                _add_message_list(action.payload.message);
                break;
            case ActionTypes.NOTIFY_BOT:
                _notify_bot()
                break;
            case ActionTypes.SENT_CONFIRM_MESSAGE:
                _confirm_message(action.payload.choice);
                break;
            default:
                break;
        }
    })
});

/*
    Fetch the message list from the server.
*/
const _get_chat_message_list = () => {
    request
        .get(`${process.env.REACT_APP_SERVER_URL}/v1/session/${AccountStore.getGroupId()}/chat`)
        .end((err, res) => { // typical callback pattern 
            if (err || !res.body || res.body.error) {
                state.messageList = [];
            } else {
                state.messageList = res.body.results.messageList.map((message) => _set_author(message))

                /// 
                // Add instruction message on to the top of the message list such that each time the 
                // user is reconnected to the backend, it will display this message.
                // Note that this message wont be saved into the database
                if (!state.isGreetedByBot) {
                    state.messageList.push({
                        author: "bot",
                        data: {
                            date: new Date(),
                            text: "Hi, I'm your search assistant. Prefix your message with '@bot' to talk to me!"
                        },
                        sender: AccountStore.getSessionId,
                        type: "text"
                    })
                    state.isGreetedByBot = true;
                }
                /// 

                state.messageCount = state.messageList.length;
            }
            ChatStore.emitChange();
        });
};


const _set_author = (message) => {
    if (message.sender === AccountStore.getUserId()) {
        message.author = "me";
    } else if (message.sender === AccountStore.getSessionId()) {
        message.author = "bot";
    } else {
        message.author = "them";
    }
    return message;
}


const _add_message_list = function(message) {
    request
        .post(`${process.env.REACT_APP_SERVER_URL}/v1/session/${AccountStore.getGroupId()}/chat`)
        .send({
            message: message
        })
        .end(() => {
            _broadcast_change();
        });

    state.messageList.push(message);
    ChatStore.emitChange();
};

const _confirm_message = function(choice)  {
    let choiceStr = (choice)? 'yes' : 'no';
    let messageToBeSent = {
        author: "me",
        data: {
            date: new Date(),
            text: `@bot ${choiceStr}`
        },
        sender: AccountStore.getUserId(),
        type: "text"
    }
    request
        .post(`${process.env.REACT_APP_SERVER_URL}/v1/session/${AccountStore.getGroupId()}/chatbot`)
        .send({
            message: messageToBeSent
        })
        .end((err, res) => {
            _handle_bot_reply(err, res);
        });
        
}

const _handle_bot_reply = function(err, res) {
            if (err || !res.body || res.body.error) {
                console.log("Bot failed to response.");
                console.log(err);
            }
            else {
                let reply = res.body.results;
                console.log("bot reply:" + reply);
                if (reply !== null) {
                    console.log(reply.sender)
                    if (!reply.sender) {
                        reply.sender = AccountStore.getGroupId;
                    }
                    state.messageList.push(reply);
                    ChatStore.emitChange();
                    _broadcast_change();
                }
            }
}

const _broadcast_change = function() {
    SyncStore.emitChatUpdate(ChatStore.getChatMessageList());
};

const _notify_bot = function() {
    request
        .post(`${process.env.REACT_APP_SERVER_URL}/v1/session/${AccountStore.getGroupId()}/chatbot`)
        .send({
            message: state.messageList.slice(-1)[0]
        })
        .end((err, res) => {
            _handle_bot_reply(err, res);
        });
}


export default ChatStore;
