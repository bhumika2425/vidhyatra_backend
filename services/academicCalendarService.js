// const { AcademicCalendar } = require('../models/academicCalendar');

// // Utility to format date (if needed, you can extend this with custom date formatting)
// const formatEventDate = (date) => {
//   return new Date(date).toLocaleDateString(); // Formats date to a human-readable format
// };

// // Get All Academic Events
// const getAllAcademicEvents = async () => {
//   try {
//     const events = await AcademicCalendar.findAll();
//     return events.map(event => ({
//       ...event.toJSON(),
//       formatted_start_date: formatEventDate(event.start_date),
//       formatted_end_date: event.end_date ? formatEventDate(event.end_date) : null,
//     }));
//   } catch (error) {
//     throw new Error('Failed to fetch academic calendar events: ' + error.message);
//   }
// };

// // Create a New Academic Event
// const createAcademicEvent = async (data) => {
//   try {
//     const newEvent = await AcademicCalendar.create(data);
//     return {
//       ...newEvent.toJSON(),
//       formatted_start_date: formatEventDate(newEvent.start_date),
//       formatted_end_date: newEvent.end_date ? formatEventDate(newEvent.end_date) : null,
//     };
//   } catch (error) {
//     throw new Error('Failed to create academic event: ' + error.message);
//   }
// };

// module.exports = {
//   getAllAcademicEvents,
//   createAcademicEvent,
// };
