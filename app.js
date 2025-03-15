function isTimeInRange() {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    // Convert times to minutes for easier comparison
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    const startTimeInMinutes = 9 * 60 + 15;  // 9:15 AM
    const endTimeInMinutes = 15 * 60 + 30;   // 3:30 PM

    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
}

function isDateInWeekEnd() {
    
    const today = new Date();
    const day = today.getDay();

    if (day === 0 || day === 6) {
        return false;
    } else {
        return true;
    }

}

function EmitFunction() {

    if(isTimeInRange() && isDateInWeekEnd()){
        console.log("Run");
    }

}

function DelayFunction() {

    const now = new Date();
    const hours = now.getHours(); 
    const minutes = now.getMinutes();

    if(hours == 9 && minutes == 10){
        clearInterval(DelaySetIntervalFunction);
        setInterval(EmitFunction, 5 * 60 * 1000);
    }

}

const DelaySetIntervalFunction = setInterval(DelayFunction, 60000);