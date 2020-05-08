function formatMessage(username,text,time){           // get username , text and time from user and convert to object
    return {
        username,
        text,
        time,
    }
}

module.exports = formatMessage