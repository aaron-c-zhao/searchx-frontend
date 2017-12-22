import './Task.css';
import React from 'react';

import TimedSubmit from './TimedSubmit';
import TaskStore from '../../../stores/TaskStore';

class Task extends React.Component {    

    constructor(props) {
        super(props);
        this.state = {
            userId: this.props.userId,
            task: this.props.task
        };
    }

    render () {
        let start = localStorage.getItem("counter-start") || 0;

        return(
            <div className="Task row" id={this.state.task.topicId} >
                <div className="Task-title">
                    Task Description
                </div>

              

                <div className="Task-info no-padding" id="intro-description">
                    <div className="Task-instruction-specific">
                         <b> {TaskStore.getTopicDescription(this.state.task.topicId)} </b>
                    </div>
                
                    <hr/>

                    <div className="Task-instruction-general">
                        The professor requires all students to demonstrate what they learn about a particular topic by conducting searches online and presenting their views on the topic. To prepare your term paper, you need to collect and save all the webpages, publications, and other online sources that are helpful for you to write a paper. 
                    <hr/>
                    <div className="Task-instruction-general">
                        Please, use only this tool. You may not get payment if you use another search engine or do not conduct searches about the given topic. 
                    </div>
                    <hr/>
                    After you have completed the search phase, you will be asked to complete 13 exercises; those exercises include questions about your term paper topic and the writing of an outline for your term paper.
                    </div>
                    <div className="Task-instruction-general">
                    </div>
                <hr/>

                </div>


                <div className="Task-submit no-padding">
                    <TimedSubmit start={start} duration={this.state.task.duration}/>
                </div>
            </div>
        )
    }
}

export default Task;