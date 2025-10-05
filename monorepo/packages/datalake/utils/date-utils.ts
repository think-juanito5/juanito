export const getOfficeHourCategory = (): number => {
  const currentDateTime = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Australia/Melbourne' }),
  )
  const currentTime = currentDateTime.toTimeString().split(' ')[0] // Get the current hour in 24-hour format
  const currentDayOfWeek = currentDateTime.getDay() // Get the current day of the week (0 for Sunday, 6 for Saturday)

  console.info(
    `[isRegularOfficeHour](*) Time: ${currentTime} Current DateTime: ${currentDateTime.toISOString()}`,
  )
  console.info(`[isRegularOfficeHour](*) DayOfWeek: ${currentDayOfWeek}`)

  let ofcHourCat = 1 // by default in hours
  if ([6, 0].includes(currentDayOfWeek)) {
    // weekend
    ofcHourCat = 3
  } else {
    // weekday in office 8:00am-6:00pm
    const startOfficeHours = '08:00:00'
    const endOfficeHours = '18:00:00'
    if (currentTime >= startOfficeHours && currentTime <= endOfficeHours) {
      // office hours
      console.info({ 'Office hours': currentTime })
      ofcHourCat = 1
    } else {
      // out of office
      console.info({ 'Out of Office hours': currentTime })
      ofcHourCat = 2
    }
  }
  return ofcHourCat
}
