export function startFullDataPulse( url,
  temptPush, humPush, lightPush, occupiedPush)
  {
  return setInterval(() => {
    fetch(url)
    .then(response => response.json())
    .then(json => {
      temptPush(json.temp);
      humPush(json.humidity ? json.humidity + '%' : 'no data');
      lightPush(json.light ? json.light + 'lx' : 'no data');
      occupiedPush(json.occupied ? 'yes' : 'no');
    });
  }, 1000);
}
