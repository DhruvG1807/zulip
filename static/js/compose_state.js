import $ from "jquery";

import * as compose_pm_pill from "./compose_pm_pill";

let message_type = false; // 'stream', 'private', or false-y
let recipient_edited_manually = false;

export function set_recipient_edited_manually(flag) {
    recipient_edited_manually = flag;
}

export function is_recipient_edited_manually() {
    return recipient_edited_manually;
}

export function set_message_type(msg_type) {
    message_type = msg_type;
}

export function get_message_type() {
    return message_type;
}

export function recipient_has_topics() {
    return message_type !== "stream";
}

export function composing() {
    // This is very similar to get_message_type(), but it returns
    // a boolean.
    return Boolean(message_type);
}

function get_or_set(fieldname, keep_leading_whitespace, no_trim) {
    // We can't hoist the assignment of '$elem' out of this lambda,
    // because the DOM element might not exist yet when get_or_set
    // is called.
    return function (newval) {
        const $elem = $(`#${CSS.escape(fieldname)}`);
        const oldval = $elem.val();
        if (newval !== undefined) {
            $elem.val(newval);
        }
        if (no_trim) {
            return oldval;
        } else if (keep_leading_whitespace) {
            return oldval.trimEnd();
        }
        return oldval.trim();
    };
}

export function stream_name() {
    return $("#stream_message_recipient_stream").val().trim();
}

export function set_stream_name(newval) {
    if (newval !== undefined) {
        const $elem = $("#stream_message_recipient_stream");
        $elem.val(newval);
    }
}

// TODO: Break out setter and getter into their own functions.
export const topic = get_or_set("stream_message_recipient_topic");

// We can't trim leading whitespace in `compose_textarea` because
// of the indented syntax for multi-line code blocks.
export const message_content = get_or_set("compose-textarea", true);

const untrimmed_message_content = get_or_set("compose-textarea", true, true);

export function cursor_at_start_of_whitespace_in_compose() {
    const cursor_position = $("#compose-textarea").caret();
    return message_content() === "" && cursor_position === 0;
}

export function focus_in_empty_compose() {
    // A user trying to press arrow keys in an empty compose is mostly
    // likely trying to navigate messages. This helper function
    // decides whether the compose box is empty for this purpose.
    if (!composing() || untrimmed_message_content() !== "") {
        return false;
    }

    const focused_element_id = document.activeElement.id;
    if (focused_element_id === "compose-textarea") {
        // Focus will be in the compose textarea after sending a
        // message; this is the most common situation.
        return true;
    }

    // If the current focus is in one of the recipient inputs, we need
    // to check whether the input is empty, to avoid accidentally
    // overriding the browser feature where the Up/Down arrow keys jump
    // you to the start/end of a non-empty text input.
    //
    // Check whether the current input element is empty for each input type.
    switch (focused_element_id) {
        case "private_message_recipient":
            return private_message_recipient().length === 0;
        case "stream_message_recipient_topic":
        case "stream_message_recipient_stream":
            return document.activeElement.value === "";
    }

    return false;
}

export function private_message_recipient(value) {
    if (typeof value === "string") {
        compose_pm_pill.set_from_emails(value);
        return undefined;
    }
    return compose_pm_pill.get_emails();
}

export function has_message_content() {
    return message_content() !== "";
}

export function has_full_recipient() {
    if (message_type === "stream") {
        return stream_name() !== "" && topic() !== "";
    }
    return private_message_recipient() !== "";
}
