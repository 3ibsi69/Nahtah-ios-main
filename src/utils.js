// utils.js
export const parseTime = (timeStr) => {
  const [timePart, ampm] = timeStr.split(" "); // Split time and AM/PM
  const [hours, minutes] = timePart.split(":"); // Split hours and minutes
  let hours24 = parseInt(hours);
  if (ampm === "PM" && hours24 !== 12) {
    hours24 += 12;
  } else if (ampm === "AM" && hours24 === 12) {
    hours24 = 0;
  }
  const parsedTime = new Date();
  parsedTime.setHours(hours24, parseInt(minutes), 0, 0);
  return parsedTime;
};
