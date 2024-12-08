import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

const requestCalendarPermissions = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  };

const addToCalendar = async(calendarTitle: string, calendarColor: string, eventTitle: string, eventStart: Date, eventEnd: Date, eventLocation: string, eventNotes: string) => {
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      console.error('Calendar permissions not granted');
      return;
    }

    let defaultCalendarSource;
    if (Platform.OS === 'ios') {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      defaultCalendarSource = calendars.find(cal => cal.source && cal.source.type === 'local')?.source;
    } else {
      defaultCalendarSource = { isLocalAccount: true, name: 'Expo Calendar', type: 'local' };
    }

    const calendarId = await Calendar.createCalendarAsync({
      title: calendarTitle,
      color: calendarColor,
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: Platform.OS === 'ios' ? defaultCalendarSource?.id : undefined,
      source: defaultCalendarSource,
      name: calendarTitle,
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });

    await Calendar.createEventAsync(calendarId, {
      title: eventTitle,
      startDate: eventStart,
      endDate: eventEnd,
      timeZone: 'GMT',
      location: eventLocation,
      notes: eventNotes,
    });
  }

export { addToCalendar, requestCalendarPermissions };