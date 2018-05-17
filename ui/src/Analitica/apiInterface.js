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

export function startFullDataPulse(
  temptPush, humPush, lightPush, pirPush, doorPush)
  {
  timers.temptInterval = setInterval(() => {
    fetch('http://p1.aldodaquino.com:3000/sensor/00:00:00:00:00:00')
    .then(response => response.json())
    .then(json => {
      temptPush(json.temp);
      humPush(json.humidity);
      lightPush(json.light + 'lm');
      pirPush(json.pir);
      doorPush(json.door==1 ? 'open' : 'close');
    });
  }, 1000);
}

export function startHumidityPulse(pushData) {
  timers.humInterval = setInterval(() => {
    fetch('http://p1.aldodaquino.com:3000/sensor/00:00:00:00:00:00')
    .then(response => response.json())
    .then(json => {
      pushData(json.humidity)
    });
  }, 1000);
}

export function startLightPulse(pushData) {
  timers.lightInterval = setInterval(() => {
    fetch('http://p1.aldodaquino.com:3000/sensor/00:00:00:00:00:00')
    .then(response => response.json())
    .then(json => {
      pushData(json.light)
    });
  }, 1000);
}

export function cleanTimers() {
  for (const value of Object.values(timers)) {
    clearInterval(value);
  }
}
