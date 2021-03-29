import request from 'superagent';
import EventEmitter from 'events'

import {register} from '../../../../utils/Dispatcher';
import ActionTypes from '../../../../actions/ActionTypes';
import AccountStore from '../../../../stores/AccountStore';
import SyncStore from '../../../../stores/SyncStore';

const CHANGE_EVENT = 'change_chat';

////

let state = {
    messageList: [],
    messageCount: 0,
    newMessagesCount: 0
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
            case ActionTypes.UPDATE_CHAT_MESSAGE_LIST:
                _update_chat_message_list(action.payload.messageList);
                break;
            case ActionTypes.ADD_CHAT_MESSAGE:
                _add_message_list(action.payload.message);
                break;
            default:
                break;
        }
    })
});

const _get_chat_message_list = () => {
    request
        .get(`${process.env.REACT_APP_SERVER_URL}/v1/session/${AccountStore.getGroupId()}/chat`)
        .end((err, res) => {
            if (err || !res.body || res.body.error) {
            } else {
                state.messageList = res.body.results.messageList.map((message) => _set_author(message))
                state.messageCount = state.messageList.length;
            }
            ChatStore.emitChange();
        });
};

const _update_chat_message_list = (messageList) => {
    state.messageList = messageList.map((message) => _set_author(message));
    state.messageCount = state.messageList.length;
    ChatStore.emitChange();
};

const _set_author = (message) => {

    if (message.sender === AccountStore.getUserId()) {
        message.author = "me";
    } else {
        message.author = "them";
    }
    return message;
}


const _add_message_list = function(message) {
    state.messageList.push(message);
    SyncStore.emitChatUpdate(message);
    ChatStore.emitChange();
};

export default ChatStore;
