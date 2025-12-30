// Google Calendar 服務

import { google, calendar_v3 } from "googleapis";
import { getAuthClient } from "./auth";

function getCalendar() {
  return google.calendar({ version: "v3", auth: getAuthClient() });
}

export async function listCalendars() {
  const calendar = getCalendar();
  const res = await calendar.calendarList.list();
  return res.data.items || [];
}

export async function listEvents(
  calendarId = "primary",
  options: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    q?: string;
  } = {}
) {
  const calendar = getCalendar();
  const res = await calendar.events.list({
    calendarId,
    timeMin: options.timeMin || new Date().toISOString(),
    timeMax: options.timeMax,
    maxResults: options.maxResults || 10,
    singleEvents: true,
    orderBy: "startTime",
    q: options.q,
  });
  return res.data.items || [];
}

export async function getEvent(eventId: string, calendarId = "primary") {
  const calendar = getCalendar();
  const res = await calendar.events.get({ calendarId, eventId });
  return res.data;
}

export async function createEvent(
  event: calendar_v3.Schema$Event,
  calendarId = "primary"
) {
  const calendar = getCalendar();
  const res = await calendar.events.insert({
    calendarId,
    requestBody: event,
  });
  return res.data;
}

export async function updateEvent(
  eventId: string,
  event: calendar_v3.Schema$Event,
  calendarId = "primary"
) {
  const calendar = getCalendar();
  const res = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: event,
  });
  return res.data;
}

export async function deleteEvent(eventId: string, calendarId = "primary") {
  const calendar = getCalendar();
  await calendar.events.delete({ calendarId, eventId });
}

export type { calendar_v3 };
