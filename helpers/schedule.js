exports.create_schedule_on_blockchain = (scheduleId, amount, scheduleType, reason) => {
    // console.log('First Thingy => ', scheduleId, amount, scheduleType, reason);
    (async function (req, res, next) {
        "use strict";

        try {
            const result = await req.SIT.createSchedule(scheduleId, amount, scheduleType, reason);
            console.log('Result => ', result);

        } catch (error) {
            console.log('Second Thingy => ', error);

        }
    }());
}