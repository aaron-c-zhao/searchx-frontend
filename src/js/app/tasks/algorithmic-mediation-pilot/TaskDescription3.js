import React from "react";

import {log} from "../../../utils/Logger";
import {LoggerEventTypes} from "../../../utils/LoggerEventTypes";

import AccountStore from "../../../stores/AccountStore";
import SyncStore from "../../../stores/SyncStore";
import IntroStore from "../../../stores/IntroStore";
import constants from "./constants";
import Helpers from "../../../utils/Helpers";

import './Pilot.pcss';
import Timer from "../components/Timer";
import {Link} from 'react-router-dom';
import ReactAudioPlayer from 'react-audio-player';

const metaInfo = {
};


class TaskDescription1 extends React.Component {

    constructor(props) {
        super(props);
        this.onFinish = this.onFinish.bind(this);
    }



    componentDidMount(){
        const groupId = AccountStore.getGroupId();
        const task = AccountStore.getTaskData();
        AccountStore.setSessionId(groupId+"-"+ task.topics[2].id);
        log(LoggerEventTypes.TASK_DESCRIPTION_LOAD,metaInfo);
    }


    onFinish(e) {
        log(LoggerEventTypes.TASK_DESCRIPTION_CONTINUE,metaInfo);
        localStorage.setItem("timer-start", Date.now());
        this.props.history.push({
            pathname: '/pilot/session3',
            state: { waited: true }
        });
    }

    render() {
        const task = AccountStore.getTaskData();
    
        return <div className="Wait waitBox"> 
                <ReactAudioPlayer
                    src="../sound/notification.mp3"
                    autoPlay
                />

            <h3> Please read your next task description:  </h3>
            
            <p>Imagine you are a reporter for a newspaper. Your editor has just told you to write a story about <font color="#33BEFF"> <strong>{task.topics[2].title}</strong> </font>.</p>
                <p>There's a meeting in an hour, so your editor asks you and your colleagues to spend 10 minutes together and search
                    for <strong>as many useful documents (news articles) as possible</strong>.</p>

                <p>Collect documents according to the following criteria:</p>
                <strong> <font color="#33BEFF">
                <p>{task.topics[2].description}</p>
                </font> </strong>

                <br/>


                <p> SearchX is a specialized search engine for news articles, use it to find relevant articles for the topic. Do not use any other Web search engine. </p>

            <p> You will be redirected once the time is up!</p>
        <Timer start={new Date()} duration={constants.taskDescriptionWait} onFinish={this.onFinish} style={{fontSize: '2em'}} showRemaining={true}/>

        
        </div>
    
    }
}

export default TaskDescription1;