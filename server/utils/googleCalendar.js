// server/utils/googleCalendar.js
const { google } = require('googleapis');

const getClient = (accessToken, refreshToken) => {
  const client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
  return google.calendar({ version: 'v3', auth: client });
};

exports.createCalendarEvent = async ({ accessToken, refreshToken, summary, description, startDateTime, endDateTime, location }) => {
  const calendar = getClient(accessToken, refreshToken);
  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary, description, location,
      start: { dateTime: startDateTime, timeZone: 'Australia/Sydney' },
      end: { dateTime: endDateTime, timeZone: 'Australia/Sydney' },
      reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 1440 }, { method: 'popup', minutes: 60 }] },
    },
  });
  return event.data;
};

exports.deleteCalendarEvent = async ({ accessToken, refreshToken, eventId }) => {
  const calendar = getClient(accessToken, refreshToken);
  await calendar.events.delete({ calendarId: 'primary', eventId });
};
