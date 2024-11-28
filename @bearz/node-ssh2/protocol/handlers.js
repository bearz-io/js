"use strict";
import * as kex from "./kex.js";
import handlers from "./handlers.misc.js";

kex.HANDLERS;

const MESSAGE_HANDLERS = new Array(256);
[
    kex.HANDLERS,
    handlers,
].forEach((handlers) => {
    // eslint-disable-next-line prefer-const
    for (let [type, handler] of Object.entries(handlers)) {
        type = +type;
        if (isFinite(type) && type >= 0 && type < MESSAGE_HANDLERS.length) {
            MESSAGE_HANDLERS[type] = handler;
        }
    }
});

export default MESSAGE_HANDLERS;
