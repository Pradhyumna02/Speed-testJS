/*
 * *
 *  Copyright 2014 Comcast Cable Communications Management, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * /
 */

(function () {
    'use strict';
    /**
     * extend webSocket
     * @param string method post or get request
     * @param stirng url address for request
     * @param integer timeout timeout for request
     * @param function callback for onloaded function
     * @param function callback for onerror function
     */
    function webSocketData(url, callbackOnOpen, callbackOnMessage, callbackOnError) {
        this.url = url;
        this.callbackOnOpen = callbackOnOpen;
        this.callbackOnMessage = callbackOnMessage;
        this.callbackOnError = callbackOnError;
        this._request = null;

    }

    /**
     * Initiate the request
     */
    webSocketData.prototype._initiateRequest = function () {
        if (this._request === null ||
            typeof this._request === 'undefined') {
            this._request = new WebSocket(this.url);
            this._request.onopen = this._handleOnOpen.bind(this);
            this._request.onmessage = this._handleOnMessage.bind(this);
            this._request.onclose = this._handleOnClose.bind(this);
            this._request.onerror = this._handleOnError.bind(this);
        }
    };
    /**
     * start the request
     */
    webSocketData.prototype.start = function (id) {
        this.id = id;
        this._initiateRequest();
    };

    /**
     * webSocket onOpen Event
     */
    webSocketData.prototype._handleOnOpen = function () {
        this.callbackOnOpen(this.id);

    };

    /**
     * send message for current webSocket
     */
    webSocketData.prototype.sendMessage = function (obj) {
        this.startTime = Date.now();
        this._request.send(obj);
    };

    /**
     * webSocket onMessage received Event
     */
    webSocketData.prototype._handleOnMessage = function (event) {
        var result = {};
        result.id = this.id;
        result.event = event;
        result.startTime = this.startTime;
        this.callbackOnMessage(result);
    };

    /**
     * webSocket onMessage error Event
     */
    webSocketData.prototype._handleOnError = function (event) {
        this.callbackOnError(event);
    };

    /**
     * webSocket close Event
     */
    webSocketData.prototype._handleOnClose = function (event) {
        if ((event !== null) && (event.code === 1006)) {
            this.callbackOnError('connection error');
        }
    };

    /**
     * close webSocket
     */
    webSocketData.prototype.close = function () {
        this._request.close();
    };


    window.webSocketData = webSocketData;

})();
