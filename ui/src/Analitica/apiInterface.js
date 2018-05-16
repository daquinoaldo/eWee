var timers = { }

export function startTemptPulse(pushData) {
  timers.temptInterval = setInterval(() => {
    fetch('http://p1.aldodaquino.com:3000/sensor/00:00:00:00:00:00')
    .then(response => response.json())
    .then(json => {
      pushData(json.temp)
    });
  }, 1000);
}

export function cleanTimers() {
  for (const value of Object.values(timers)) {
    clearInterval(value);
  }
}
