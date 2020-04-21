import React from "react";

import {log} from "../../../utils/Logger";
import {LoggerEventTypes} from "../../../utils/LoggerEventTypes";

import AccountStore from "../../../stores/AccountStore";
import SearchStore from "../../search/SearchStore";
import constants from "./constants";

import './RoleBased.pcss';
import Timer from "../components/Timer";
import ReactAudioPlayer from 'react-audio-player';

const metaInfo = {
    currentTopic : parseInt(localStorage.getItem("current-topic")) || 0
};

class TaskDescription extends React.Component {

    constructor(props) {
        super(props);
        this.onFinish = this.onFinish.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    }

    handleBeforeUnload(e) {
        const dialogText = 'Leaving this page will quit the task. Are you sure?';
        e.returnValue = dialogText;
        return dialogText;
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        window.addEventListener('popstate', this.handleBeforeUnload);
        log(LoggerEventTypes.TASK_DESCRIPTION_LOAD,metaInfo);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        window.removeEventListener('popstate', this.handleBeforeUnload);
    }

    onFinish(e) {
        log(LoggerEventTypes.TASK_DESCRIPTION_CONTINUE,metaInfo);
        localStorage.setItem("timer-start", Date.now());
        this.props.history.replace({
            pathname: '/role-based/session',
            state: { waited: true }
        });
    }


    render() {
        
        const task = AccountStore.getTaskData();

        let t  = parseInt(localStorage.getItem("current-topic")) || 0;
        localStorage.setItem("current-topic", t || 0);
        const groupId = AccountStore.getGroupId();
        AccountStore.setSessionId(groupId+"-"+ task.topics[t].id + "-" + SearchStore.getVariant() );
        return ( <div className="Wait waitBox">
            <ReactAudioPlayer
                    src="../sound/notification.mp3"
                    play
            />

            <h3> Please read your task description:</h3>
            
            <p>Your job will be the same as before. However, you need to find documents about <font color="#33BEFF"> <strong>{task.topics[t].title}</strong></font>.</p>
            <p><span style={{"background-color" : "#FFFF00"}}>Documents should be collected that comply with the following criteria: </span></p>

            <strong> <font color="#33BEFF">
                <p>{task.topics[t].description}</p>
                </font> </strong>
            <img className="topicVisual" src={'/img/' + task.topics[t].id + ".png"} alt="Topic Image Description"/>
            <br/>
            <p> SearchX is a specialized search engine for news articles, use it to find relevant articles for the topic. Do not use any other Web search engine. </p>

            <p> You will be redirected once the time is up!</p>
            <Timer start={new Date()} duration={constants.taskDescriptionWait} onFinish={this.onFinish} style={{fontSize: '2em'}} showRemaining={true}/>
        </div>
        )
    }
}

export default TaskDescription;