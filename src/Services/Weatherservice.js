import { DateTime } from "luxon";
const API_KEY = "5126afe969ad0e20c2ac00bdfa331b9e";
const BASE_URL = "https://api.openweathermap.org/data/2.5" 

// https://api.openweathermap.org/data/2.5/onecall?lat=48.8534&lon=2.3488&exclude=current,minutely,hourly,alerts&appid=1fa9ff4126d95b8db54f3897a208e91c&units=metric

const getWeatherData =  (infoTYpe, searchParams) => {
    const url = new URL (BASE_URL + '/' + infoTYpe);
    url.search = new URLSearchParams({...searchParams, appid: API_KEY});
    
    return fetch(url)
    .then((res) => res.json());
};

const formatCurrentWeather = (data) => {
    const {
        coord: {lat, lon},
        main: {feels_like, humidity, temp, temp_max, temp_min},
        name,
        dt,
        sys: {country, sunrise, sunset},
        weather,
        wind: {speed}
      } = data;

      const { main: details, icon } = weather[0];

      return  {lat, lon, feels_like, humidity, temp, temp_max, temp_min,name, dt, country, sunrise, sunset, details, icon, speed};

};

const formatForecastWeather =(data) => {
    let { timezone, daily, hourly } = data;
    daily = daily.slice(1, 6).map((d) => {
    return {
      title: formatLocaltime(d.dt, timezone, "ccc"),
      temp: d.temp.day,
      icon: d.weather[0].icon,
    };
  });

  hourly = hourly.slice(1, 6).map((d) => {
    return {
      title: formatLocaltime(d.dt, timezone, "hh:mm a"),
      temp: d.temp,
      icon: d.weather[0].icon,
    };
  });

  return { timezone, daily, hourly };

}

const FormatData = async (searchParams) => {
    const formattedCurrent = await getWeatherData ('weather', searchParams).then(formatCurrentWeather);

    const {lat, lon} = formattedCurrent;
    
    const formattedForecast = await getWeatherData('onecall', {
        lat, lon, exclude: "current,minutely,alerts", units: searchParams.units
    }).then(formatForecastWeather);
    
    return {...formattedCurrent, ...formattedForecast};
}

const formatLocaltime = (secs, zone,
    format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a") => DateTime.fromSeconds(secs).setZone(zone).toFormat(format);

    const iconUrl = (code) => `http://openweathermap.org/img/wn/${code}@2x.png`;

    export default FormatData;

    export { formatLocaltime, iconUrl};