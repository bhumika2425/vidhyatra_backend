// const { EventCalendar } = require('../models/eventCalendar');

// // Utility to format event date (can be extended as needed)
// const formatEventDate = (date) => {
//   return new Date(date).toLocaleDateString(); // Format date to a human-readable format
// };

// // Get All Event Calendar Events
// const getAllEventCalendar = async () => {
//   try {
//     const events = await EventCalendar.findAll();
//     return events.map(event => ({
//       ...event.toJSON(),
//       formatted_event_date: formatEventDate(event.event_date),
//     }));
//   } catch (error) {
//     throw new Error('Failed to fetch event calendar events: ' + error.message);
//   }
// };

// // Create a New Event Calendar Event
// const createEventCalendar = async (data) => {
//   try {
//     const newEvent = await EventCalendar.create(data);
//     return {
//       ...newEvent.toJSON(),
//       formatted_event_date: formatEventDate(newEvent.event_date),
//     };
//   } catch (error) {
//     throw new Error('Failed to create event calendar event: ' + error.message);
//   }
// };

// module.exports = {
//   getAllEventCalendar,
//   createEventCalendar,
// };
