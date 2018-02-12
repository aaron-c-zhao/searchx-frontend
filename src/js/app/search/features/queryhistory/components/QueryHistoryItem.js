import React from "react";
import AccountStore from "../../../../../stores/AccountStore";

import {LoggerEventTypes} from "../../../../../utils/LoggerEventTypes";
import {log} from "../../../../../utils/Logger";

const QueryHistoryItem = function({data, clickHandler}) {
    const metaInfo = {
        url: data.query,
        userId: data.userId
    };

    const clickUrlLog = () => log(LoggerEventTypes.QUERYHISTORY_CLICK_URL, metaInfo);
    const contextUrlLog = () => log(LoggerEventTypes.QUERYHISTORY_CONTEXT_URL, metaInfo);
    const hoverEnter = () => log(LoggerEventTypes.QUERYHISTORY_HOVERENTER, metaInfo);
    const hoverLeave = () => log(LoggerEventTypes.QUERYHISTORY_HOVERLEAVE, metaInfo);

    ////

    const color = AccountStore.getMemberColor(data.userId);

    return (
        <div className="item" style={{borderColor: color}} onMouseEnter={hoverEnter} onMouseLeave={hoverLeave}>
            <span className="text">
                <span style={{color: 'gray'}}>{new Date(data.created).toLocaleTimeString()}</span>
                <a style={{color: color, cursor: 'pointer'}} onContextMenu={contextUrlLog} onClick={() => {clickHandler(data.query);clickUrlLog();}}>
                    {data.query}
                </a>
            </span>
        </div>
    );
};

export default QueryHistoryItem;