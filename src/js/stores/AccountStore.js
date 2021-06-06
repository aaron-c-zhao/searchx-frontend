import EventEmitter from 'events';
import Helpers from '../utils/Helpers'

let state = {
    userId: localStorage.getItem("user-id") || '',
    userType: localStorage.getItem("user-type") || '', // indicates whether is a user or a bot
    botId: localStorage.getItem("bot-id") || '',
    sessionId: localStorage.getItem("session-id") || '',
    groupId: localStorage.getItem("group-id") || '',
    task: {
        id: localStorage.getItem("task-id") || '',
        data: JSON.parse(localStorage.getItem("task-data") === undefined ? "{}" : localStorage.getItem("task-data")) || '',
    }
};

const AccountStore = Object.assign(EventEmitter.prototype, {
    getUserId() {
        return state.userId;
    },
    getUserType() {
        return state.userType;
    },
    getSessionId() {
        return state.sessionId;
    },
    getGroupId() {
        return state.groupId;
    },
    getTask() {
        return state.task;
    },
    getTaskId() {
        return state.task.id;
    },
    getTaskData() {
        return state.task.data;
    },

    // WARNING: using the setter methods below violates flux architecture, and will not cause components to be updated
    // If changes need to be propagated from this store, event dispatch methods need to be added, and actions with a
    // dispatcher need to be used instead of setter methods.
    setUserId(userId) {
        state.userId = userId;
        localStorage.setItem("user-id", userId);
    },

    setUserType(type) {
       state.userType = type;
       localStorage.setItem("user-type", type);
    },

    setSessionId(sessionId) {
        state.sessionId = sessionId;
        localStorage.setItem("session-id", sessionId);
    },

    setGroupId(groupId) {
        state.groupId = groupId;
        localStorage.setItem("group-id", groupId);
    },


    setTask(id, data) {
        state.task.id = id;
        state.task.data = data;
        localStorage.setItem("task-id", id);
        localStorage.setItem("task-data", JSON.stringify(data));
    },

    clearTask() {
        state.task = '';
        localStorage.removeItem("task-id");
        localStorage.removeItem("task-data");
    },

    clearUserData() {
        state.userId = '';
        state.sessionId = '';
        localStorage.clear();
    }
});

/************   Create bot account   *********
Bot account will be created when there's a new group. 
Two scenarios may cause this:
    - a new client without groupId in url
    - a client with strange groupId in url
For simplicity, for now, we consider the latter never
happens. But it's a valid scenario and should be 
handled in later phase of development.
**********************************************/
const _createBotAccount = function(groupId) {
    // since user-id and group-id relies on the persistence of localStorage
    // it make sense to just store the bot-id in the localStorage
    // usch that the bot has the same life span as the group id 
    localStorage.setItem("bot-id", groupId);
}



// set userId and groupId if specified by url parameter
const urlGroupId = Helpers.getURLParameter("groupId");
if (urlGroupId) {
    if (urlGroupId !== state.groupId) {
        AccountStore.setUserId(Helpers.generateId());
        AccountStore.setUserType("user");
    }
    AccountStore.setSessionId(urlGroupId);
    AccountStore.setGroupId(urlGroupId);
}
const urlUserId = Helpers.getURLParameter("userId");
if (urlUserId) {
    AccountStore.setUserId(urlUserId);
}

// initialize random userId, sessionId, and groupId if they are not set by localstorage or url parameter
if (!state.userId) {
    AccountStore.setUserId(Helpers.generateId());
    AccountStore.setUserType("user");
}
if (!state.sessionId) {
    const id = Helpers.generateId();
    AccountStore.setSessionId(id);
    AccountStore.setGroupId(id);
    _createBotAccount(id);
}

export default AccountStore;