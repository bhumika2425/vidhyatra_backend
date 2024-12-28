// // controllers/academicCalendarController.js
// const academicCalendarService = require('../services/academicCalendarService');

// // Get All Academic Events (GET request)
// const getAcademicCalendar = async (req, res) => {
//   try {
//     const events = await academicCalendarService.getAllAcademicEvents();
//     return res.status(200).json({ events });
//   } catch (error) {
//     return res.status(500).json({ message: 'Failed to fetch academic calendar events', error: error.message });
//   }
// };

// // Create a New Academic Event (POST request)
// const createAcademicCalendar = async (req, res) => {
//   try {
//     const { event_type, title, start_date, end_date, description } = req.body;

//     if (!event_type || !title || !start_date) {
//       return res.status(400).json({ message: 'Event type, title, and start date are required!' });
//     }

//     const newEventData = {
//       event_type,
//       title,
//       start_date,
//       end_date,
//       description,
//     };

//     const newEvent = await academicCalendarService.createAcademicEvent(newEventData);
//     return res.status(201).json({ message: 'Academic event created successfully', newEvent });
//   } catch (error) {
//     return res.status(500).json({ message: 'Failed to create academic event', error: error.message });
//   }
// };

// module.exports = {
//   getAcademicCalendar,
//   createAcademicCalendar,
// };
