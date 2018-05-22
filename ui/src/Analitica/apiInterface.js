export function startFullDataPulse( url,
  temptPush, humPush, lightPush, occupiedPush)
  {
  return setInterval(() => {
    fetch(url)
    .then(response => response.json())
    .then(json => {
      temptPush(json.temp);
      humPush(json.humidity);
      lightPush(json.light + 'lm');
      occupiedPush(json.occupied ? 'yes' : 'no');
    });
  }, 1000);
}
