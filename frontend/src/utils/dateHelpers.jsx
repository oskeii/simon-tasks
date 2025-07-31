import React from 'react';

const toLocalMidnight = (dateString) => {
    let dateTimeString = new Date(dateString + 'T00:00:00');
    // console.log(new Date(dateString).toISOString())  // UTC Midnight
    console.log(dateTimeString); // local-time Midnight
    return dateTimeString.toISOString(); // local-time Midnight as UTC
};

export { toLocalMidnight };
