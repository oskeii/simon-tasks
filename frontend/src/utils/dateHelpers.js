
const toLocalMidnight = (dateString) => {
    let dateTimeString = new Date(dateString + 'T00:00:00');
    // console.log(new Date(dateString).toISOString())  // UTC Midnight
    console.log(dateTimeString); // local-time Midnight
    return dateTimeString.toISOString(); // local-time Midnight as UTC
};

/**
* Convert "hh:mm:ss" format to readable duration
*/
const formatDuration = (durationString) => {
    if (!durationString) return '';

    const [hours, minutes, seconds] = durationString.split(':').map(Number);
    const parts = [];

    if (hours > 0) {parts.push(`${hours}hr`)}
    if (minutes > 0) {parts.push(`${minutes}min`)}

    if (parts.length === 0 && seconds > 0) {parts.push(`${seconds}sec`)}

    return parts.join(' ') || '0min';
};

export { toLocalMidnight, formatDuration };
