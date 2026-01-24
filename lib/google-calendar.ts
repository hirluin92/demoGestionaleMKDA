import { google } from 'googleapis'
import { prisma } from './prisma'

export async function getGoogleCalendarClient() {
  const calendarConfig = await prisma.googleCalendar.findFirst()
  
  if (!calendarConfig) {
    throw new Error('Google Calendar non configurato')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    access_token: calendarConfig.accessToken,
    refresh_token: calendarConfig.refreshToken,
    expiry_date: calendarConfig.expiresAt.getTime(),
  })

  // Refresh token se necessario
  if (calendarConfig.expiresAt < new Date()) {
    const { credentials } = await oauth2Client.refreshAccessToken()
    
    await prisma.googleCalendar.update({
      where: { id: calendarConfig.id },
      data: {
        accessToken: credentials.access_token!,
        refreshToken: credentials.refresh_token || calendarConfig.refreshToken,
        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : calendarConfig.expiresAt,
      }
    })

    oauth2Client.setCredentials(credentials)
  }

  return google.calendar({ version: 'v3', auth: oauth2Client })
}

export async function createCalendarEvent(
  summary: string,
  description: string,
  startDateTime: Date,
  endDateTime: Date
) {
  const calendar = await getGoogleCalendarClient()
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  const event = {
    summary,
    description,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Europe/Rome',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Europe/Rome',
    },
  }

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
  })

  return response.data.id
}

export async function deleteCalendarEvent(eventId: string) {
  const calendar = await getGoogleCalendarClient()
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  await calendar.events.delete({
    calendarId,
    eventId,
  })
}

export async function getAvailableSlots(date: Date) {
  const calendar = await getGoogleCalendarClient()
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const response = await calendar.events.list({
    calendarId,
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  })

  const busySlots = response.data.items || []
  
  // Genera slot disponibili (ogni 30 minuti dalle 8:00 alle 20:00)
  const allSlots: string[] = []
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    }
  }

  // Filtra slot occupati
  const occupiedSlots = busySlots
    .filter(event => event.start?.dateTime)
    .map(event => {
      const start = new Date(event.start!.dateTime!)
      return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`
    })

  return allSlots.filter(slot => !occupiedSlots.includes(slot))
}
