import './Search.pcss';
import React from 'react';

import {log} from '../../utils/Logger';
import {LoggerEventTypes} from '../../utils/LoggerEventTypes';

import SearchHeaderContainer from './header/SearchHeaderContainer';
import SearchResultsContainer from "./results/SearchResultsContainer";
import QueryHistoryContainer from "./features/queryhistory/QueryHistoryContainer";
import BookmarkContainer from "./features/bookmark/BookmarkContainer";
import Chat from "./features/chat/Chat";
import config from "../../config";

class Search extends React.Component {
    componentDidMount(){
        sessionStorage.clear();

        if (config.interface.chat && this.props.collaborative) {
            Chat();
        }
    }

    componentWillUnmount() {
        if (config.interface.chat && this.props.collaborative) {
            const messages = document.querySelector(".chat-content").innerHTML;
            log(LoggerEventTypes.CHAT_ARCHIVE, {
                messages: messages
            });

            const element = document.querySelector("#conversejs");
            element.parentElement.removeChild(element);
        }
    }

    render() {
        return (
            <div className="Search">
                <SearchHeaderContainer timer={this.props.timer}/>

                <div className="Content" id="intro-collab-color">
                    <div className="Main">
                        <SearchResultsContainer/>
                    </div>

                    <div className="Side">
                        <QueryHistoryContainer collaborative={this.props.collaborative}/>
                        <BookmarkContainer collaborative={this.props.collaborative}/>
                    </div>

                    {this.props.taskDescription}
                </div>

      
            </div>
        )
    }
}

Search.defaultProps = {
    collaborative: true
};

export default Search;