import './Survey.css'
import React from 'react';
import Alert from 'react-s-alert';

import Search from "../Search/Search";
import Video from "../Video/Video";
import Task from "./Task/Task";

import {log} from '../../utils/Logger';
import {LoggerEventTypes} from '../../constants/LoggerEventTypes';
import $ from 'jquery';

import AccountStore from "../../stores/AccountStore";
import SearchActions from '../Search/SearchActions';
import SearchStore from '../../stores/SearchStore';
import SyncStore from '../../stores/SyncStore';

////

const stepsTask = [
    {
        element: '#intro-description',
        intro: 'Please take a minute to read your task description.',
        position: 'left'
    }
];

const stepsVideo = [
    {
        element: '#intro-video',
        intro: 'We want you to watch a course video on the given topic.',
        position: 'bottom-middle-aligned'
    }
];

const stepsSearch = [
    {
        element: '#intro-system',
        intro: 'We want you to use our custom web search system SearchX.',
        position: 'bottom-middle-aligned'
    },
    {
        element: '#intro-search-bar',
        intro: 'Use SearchX to search for webpages, publications, and other online sources about the topic.'
    },
    {
        element: '#intro-search-results',
        intro: 'To bookmark a resource that is useful for your term paper, star it.',
        position: 'right'
    },
    {
        element: '#intro-bookmark-bar',
        intro: 'The starred documents will appear here. You can revisit them before completing the final test.',
        position: 'left'
    }
];

const stepsSubmit = [
    {
        element: '#intro-counter',
        intro: 'You will need to search and learn for 20 minutes. Afterwards, you can press the button to complete the final test. Good luck and have fun!',
        position: 'left'
    }
];

////

const initializeChat = function() {
    converse.initialize({
        authentication: 'anonymous',
        auto_login: true,
        auto_reconnect: true,

        allow_logout: false,
        allow_muc_invitations: false,
        allow_contact_requests: false,
        allow_bookmarks: false,
        allow_registration: false,
        allow_muc: false,

        auto_join_rooms: [
            'searchx@conference.nomnom.im',
        ],
        notify_all_room_messages: [
            'searchx@conference.nomnom.im',
        ],
        bosh_service_url: 'https://conversejs.org/http-bind/',
        jid: 'nomnom.im',

        visible_toolbar_buttons: {
            call: false,
            clear: false,
            toggle_occupants: false,
            emoji: true
        },

        keepalive: true,
        hide_muc_server: true,
        play_sounds: true,
        synchronize_availability: false,
        show_controlbox_by_default: false,
        strict_plugin_dependencies: false,
    });
};

////

class Learning extends React.Component {

    constructor() {
        super();

        const task = {
            topicId: AccountStore.getTopicId(),
            type: AccountStore.getTaskType(),
            duration: AccountStore.getTaskDuration()
        };

        ////

        let steps = stepsTask.concat(stepsSearch, stepsSubmit);
        let medium = <Search/>;

        if (task.type === 'video') {
            steps = stepsTask.concat(stepsVideo, stepsSubmit);
            medium = <Video/>;
        }

        if (task.type === 'both') {
            steps = stepsTask.concat(stepsVideo, stepsSearch, stepsSubmit);
            medium = (
                <div>
                    <Video/>
                    <hr/>
                    <Search/>
                </div>
            );
        }

        ////

        this.intro = introJs().setOptions({
            doneLabel:  "Ok!",
            showStepNumbers: false,
            showBullets: false,
            exitOnOverlayClick: false
        });

        $('.introjs-skipbutton').hide();
        this.intro.onafterchange(function(){
            if (this._introItems.length - 1 === this._currentStep || this._introItems.length === 1) {
                $('.introjs-skipbutton').show();
            }
        });

        this.handleOnComplete = this.handleOnComplete.bind(this);
        this.onBackButtonEvent = this.onBackButtonEvent.bind(this);
        this.intro.oncomplete(this.handleOnComplete);

        ////

        this.state = {
            task: task,
            medium: medium,
            steps: steps
        }
    }

    handleOnComplete () {
        const start = localStorage.getItem("counter-start") || Date.now();
        const metaInfo = {
            start: start
        };
        log(LoggerEventTypes.SURVEY_LEARNING_START, metaInfo);

        localStorage.setItem("intro-done", true);
        localStorage.setItem("counter-start",start);

        this.props.history.push("/learning");
        this.props.history.go();
        this.setState(this.state);
    }

    onBackButtonEvent (e) {
       e.preventDefault();
       this.props.history.go();
    }

    ////

    componentDidMount() {
        if (this.state.task.topicId) {
            if (!localStorage.getItem("intro-done")) {
                document.addEventListener('visibilitychange', function(){
                });

                this.intro.setOption('steps', this.state.steps);
                this.intro.start();
                Alert.closeAll();
            }

            initializeChat();
        }

        window.onpopstate = this.onBackButtonEvent;
    }

    render() {
        const switchTabsPreTest = localStorage.getItem("switch-tabs-posttest");
        const switchTabsPostTest = localStorage.getItem("switch-tabs-posttest");

        if (AccountStore.getTopicId() === '' || switchTabsPreTest >= 3 || switchTabsPostTest >= 3) {
            return (
                <div/>
            );
        }

        return(
            <div className="Learning row">
                <div className="Learning-medium col-md-9">
                    {this.state.medium}
                </div>

                <div className="Learning-task col-md-3">
                    <Task task={this.state.task}/>
                </div>
            </div>
        );
    }
}

export default Learning;
