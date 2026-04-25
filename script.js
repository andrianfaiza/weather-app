const apiKey = "7dfca5cd72c557441775d613bbb83126";

function formatLocalTime(utcSeconds, timezoneOffsetSeconds) {
  const localTimestamp = (utcSeconds + timezoneOffsetSeconds) * 1000;
  const localDate = new Date(localTimestamp);
  const hours = localDate.getUTCHours().toString().padStart(2, "0");
  const minutes = localDate.getUTCMinutes().toString().padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${minutes} ${ampm}`;
}

function weather() {
  const city = document.getElementById("search").value;

  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
  )
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("temp").innerHTML = `
        <div id="temp" class="temp">
            <div class="data-temp">
                <h1>${data.main.temp}°C</h1>
                <p style="text-align:left;">${data.weather[0].description}</p>
            </div>
            <div class="icon">
                <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="icon">
            </div>
        </div>
        `;

      today();

      document.querySelector(".location").innerHTML =
        `<p><i class="bi bi-geo-alt-fill"></i> ${data.name}, ${data.sys.country}</p>`;
      document.getElementById("humidity").innerHTML =
        `<span class="subject" id="humidity"><i class="bi bi-moisture"></i> ${data.main.humidity} %</span>`;
      document.getElementById("pressure").innerHTML =
        `<span class="subject" id="pressure"><i class="bi bi-speedometer"></i> ${data.main.pressure} hPa</span>`;

      const distance = data.visibility / 1000;
      document.getElementById("visibility").innerHTML =
        `<span class="subject" id="visibility"><i class="bi bi-binoculars"></i> ${distance} Km</span>`;
      document.getElementById("feel").innerHTML =
        `<span class="subject" id="feel"><i class="bi bi-thermometer-half"></i> ${data.main.feels_like} °C</span>`;

      const latitude = data.coord.lat;
      const longitude = data.coord.lon;

      fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`,
      )
        .then((res) => res.json())
        .then((aqiData) => {
          const aqi = aqiData.list[0].main.aqi;
          const components = aqiData.list[0].components;

          document.querySelector(".index").innerHTML = `
                    <i class="bi bi-wind" style="font-size: 40px;"></i>
                    <div class="quality-number">
                        <span class="sub">PM2.5</span>
                        <span class="subject">${components.pm2_5}</span>
                    </div>
                    <div class="quality-number">
                        <span class="sub">SO2</span>
                        <span class="subject">${components.so2}</span>
                    </div>
                    <div class="quality-number">
                        <span class="sub">NO2</span>
                        <span class="subject">${components.no2}</span>
                    </div>
                    <div class="quality-number">
                        <span class="sub">O3</span>
                        <span class="subject">${components.o3}</span>
                    </div>
            `;

          const timezoneOffsetSec = data.timezone;
          const sunriseTime = formatLocalTime(
            data.sys.sunrise,
            timezoneOffsetSec,
          );
          const sunsetTime = formatLocalTime(
            data.sys.sunset,
            timezoneOffsetSec,
          );

          document.getElementById("time").innerHTML = `
            <div class="sunrise">
            <i class="bi bi-sunrise" style="font-size:40px;""></i>
            <div>
            <span class="sub">Sunrise</span>
            <span class="subject">${sunriseTime}</span>
            </div>
            </div>
            <div class="sunset">
            <i class="bi bi-sunset" style="font-size: 40px;"></i>
            <div>
            <span class="sub">Sunset</span>
            <span class="subject">${sunsetTime}</span>
            </div>
            </div>
            `;
        });
    });

  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`,
  )
    .then((res) => res.json())
    .then((data) => {
      let forecastHTML = "";
      let today = new Date().getDate();
      let usedDates = new Set();

      for (let i = 0; i < data.list.length; i++) {
        const item = data.list[i];
        const date = new Date(item.dt_txt);
        const dayKey = date.toDateString();

        if (date.getDate() > today && !usedDates.has(dayKey)) {
          usedDates.add(dayKey);

          forecastHTML += `
                    <div class="day">
                        <div class="temp">
                            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="icon">  
                            <span>${item.main.temp}°C</span>
                        </div>
                        <span class="date1">${date.getDate()} ${date.toLocaleDateString("en-EN", { month: "long" })}</span>
                        <span class="weekday">${date.toLocaleDateString("en-EN", { weekday: "long" })}</span>
                    </div>
                `;
        }

        if (usedDates.size === 5) break;
      }

      document.querySelector(".forecast").innerHTML = forecastHTML;

      let hourlyHTML = "";
      let count = 0;

      data.list.forEach((item) => {
        if (count >= 8) return;
        const date1 = new Date(item.dt * 1000);
        const windDeg = item.wind.deg || 0;
        const windSpeed = Math.round(item.wind.speed * 3.6);

        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        const index = Math.round(windDeg / 45) % 8;
        const windDirection = directions[index];

        hourlyHTML += `
            <div class="time1">
                <div class="condition">
                    <p>${date1.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                    <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" style>
                    <span>${item.main.temp} °C</span>
                </div>
                <div class="wind">
                    <i class="i bi-cursor-fill"  style="transform: rotate(${windDeg}deg); margin-bottom: 10px; font-size: 20px;"></i>
                    <span>${windSpeed} km/h</span>
                </div>
            </div>
        `;
        count++;
      });

      document.querySelector(".time-group").innerHTML = hourlyHTML;
    })
    .catch((error) => {
      console.error("Error fetching forecast:", error);
      document.getElementById("weather").innerHTML = `
            <div class="data">
                <div class="now" id="now">
                    <p>Now</p>
                    <div id="temp" class="temp" style="text-align: right;">
                        <div class="data-temp">
                            <h1>--°C</h1>
                            <p style="text-align: left;">--</p>
                        </div>
                        <div class="icon">
                            <i class="bi bi-cloud-slash-fill" style="font-size: 60px;"></i>
                        </div>
                    </div>
                    <hr>
                    <div class="date">
                        <p><i class="bi bi-calendar"></i> --</p>
                    </div>
                    <div class="location" id="location">
                        <p><i class="bi bi-geo-alt-fill"></i> The City Not Found!</p>
                    </div>
                </div>
                <h4>5 Days Forecast</h4>
                <div class="forecast">
                    <div class="day">
                        <span class="temp"><i class="bi bi-cloud-slash-fill" style="font-size: 30px; margin-right: 8px;"></i> --°C</span>
                        <span class="date1">--</span>
                        <span class="weekday">--</span>
                    </div>
                    <div class="day">
                        <span class="temp"><i class="bi bi-cloud-slash-fill" style="font-size: 30px; margin-right: 8px;"></i> --°C</span>
                        <span class="date1">--</span>
                        <span class="weekday">--</span>
                    </div>
                    <div class="day">
                        <span class="temp"><i class="bi bi-cloud-slash-fill" style="font-size: 30px; margin-right: 8px;"></i> --°C</span>
                        <span class="date1">--</span>
                        <span class="weekday">--</span>
                    </div>
                    <div class="day">
                        <span class="temp"><i class="bi bi-cloud-slash-fill" style="font-size: 30px; margin-right: 8px;"></i> --°C</span>
                        <span class="date1">--</span>
                        <span class="weekday">--</span>
                    </div>
                    <div class="day">
                        <span class="temp"><i class="bi bi-cloud-slash-fill" style="font-size: 30px; margin-right: 8px;"></i> --°C</span>
                        <span class="date1">--</span>
                        <span class="weekday">--</span>
                    </div>
                </div>
            </div>
            <div class="data1">
                <div class="detail">
                    <p>Todays Highlights</p>
                    <div class="highlights">
                        <div class="air-quality">
                            <h5>Air Quality Index</h5>
                            <div class="index" id="index">
                                <i class="bi bi-wind" style="font-size: 40px;"></i>
                                <div class="quality-number">
                                    <span class="sub">PM2.5</span>
                                    <span class="subject">--</span>
                                </div>
                                <div class="quality-number">
                                    <span class="sub">SO2</span>
                                    <span class="subject">--</span>
                                </div>
                                <div class="quality-number">
                                    <span class="sub">NO2</span>
                                    <span class="subject">--</span>
                                </div>
                                <div class="quality-number">
                                    <span class="sub">O3</span>
                                    <span class="subject">--</span>
                                </div>
                            </div>
                        </div>
                        <div class="dawn-dusk">
                            <h5>Sunrise & Sunset</h5>
                            <div class="time" id="time">
                                <div class="sunrise">
                                    <i class="bi bi-sunrise" style="font-size:40px;""></i>
                                    <div>
                                        <span class="sub">Sunrise</span>
                                        <span class="subject">--:--</span>
                                    </div>
                                </div>
                                <div class="sunset">
                                    <i class="bi bi-sunset" style="font-size: 40px;"></i>
                                    <div>
                                        <span class="sub">Sunset</span>
                                        <span class="subject">--:--</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="humpre">
                            <div class="humidity">
                                <h5>Humidity</h5>
                                <span class="subject" id="humidity"> <i class="bi bi-moisture"></i> -- %</span>
                            </div>
                            <div class="pressure">
                                <h5>Pressure</h5>
                                <span class="subject" id="pressure"><i class="bi bi-speedometer"></i> ---- hPa</span>
                            </div>
                        </div>
                        <div class="visfe">
                            <div class="visibility">
                                <h5>Visibility</h5>
                                <span class="subject" id="visibility"><i class="bi bi-binoculars"></i> -- Km</span>
                            </div>
                            <div class="feel">
                                <h5>Feels Like</h5>
                                <span class="subject" id="feel"><i class="bi bi-thermometer-half"></i> -- °C</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="schedule">
                    <h5>Today at</h5>
                    <div class="time-group">
                        <div class="time1">
                            <div class="condition">
                                <p>--:--</p>
                                <i class="bi bi-cloud-slash-fill" style="font-size: 30px; margin-bottom: 10px;"></i>
                                <span>-- °C</span>
                            </div>
                            <div class="wind">
                                <p>--</p>
                                <i class="bi bi-send-exclamation-fill"  style="margin-bottom: 10px; font-size: 20px;"></i>
                                <span>-- km/h</span>
                            </div>
                        </div>
                        <div class="time1">
                            <div class="condition">
                                <p>--:--</p>
                                <i class="bi bi-cloud-slash-fill" style="font-size: 30px; margin-bottom: 10px;"></i>
                                <span>-- °C</span>
                            </div>
                            <div class="wind">
                                <p>--</p>
                                <i class="bi bi-send-exclamation-fill"  style="margin-bottom: 10px; font-size: 20px;"></i>
                                <span>-- km/h</span>
                            </div>
                        </div>
                        <div class="time1">
                            <div class="condition">
                                <p>--:--</p>
                                <i class="bi bi-cloud-slash-fill" style="font-size: 30px; margin-bottom: 10px;"></i>
                                <span>-- °C</span>
                            </div>
                            <div class="wind">
                                <p>--</p>
                                <i class="bi bi-send-exclamation-fill"  style="margin-bottom: 10px; font-size: 20px;"></i>
                                <span>-- km/h</span>
                            </div>
                        </div>
                        <div class="time1">
                            <div class="condition">
                                <p>--:--</p>
                                <i class="bi bi-cloud-slash-fill" style="font-size: 30px; margin-bottom: 10px;"></i>
                                <span>-- °C</span>
                            </div>
                            <div class="wind">
                                <p>--</p>
                                <i class="bi bi-send-exclamation-fill"  style="margin-bottom: 10px; font-size: 20px;"></i>
                                <span>-- km/h</span>
                            </div>
                        </div>
                        <div class="time1">
                            <div class="condition">
                                <p>--:--</p>
                                <i class="bi bi-cloud-slash-fill" style="font-size: 30px; margin-bottom: 10px;"></i>
                                <span>-- °C</span>
                            </div>
                            <div class="wind">
                                <p>--</p>
                                <i class="bi bi-send-exclamation-fill"  style="margin-bottom: 10px; font-size: 20px;"></i>
                                <span>-- km/h</span>
                            </div>
                        </div>
                        <div class="time1">
                            <div class="condition">
                                <p>--:--</p>
                                <i class="bi bi-cloud-slash-fill" style="font-size: 30px; margin-bottom: 10px;"></i>
                                <span>-- °C</span>
                            </div>
                            <div class="wind">
                                <p>--</p>
                                <i class="bi bi-send-exclamation-fill"  style="margin-bottom: 10px; font-size: 20px;"></i>
                                <span>-- km/h</span>
                            </div>
                        </div>
                        <div class="time1">
                            <div class="condition">
                                <p>--:--</p>
                                <i class="bi bi-cloud-slash-fill" style="font-size: 30px; margin-bottom: 10px;"></i>
                                <span>-- °C</span>
                            </div>
                            <div class="wind">
                                <p>--</p>
                                <i class="bi bi-send-exclamation-fill"  style="margin-bottom: 10px; font-size: 20px;"></i>
                                <span>-- km/h</span>
                            </div>
                        </div>
                        <div class="time1">
                            <div class="condition">
                                <p>--:--</p>
                                <i class="bi bi-cloud-slash-fill" style="font-size: 30px; margin-bottom: 10px;"></i>
                                <span>-- °C</span>
                            </div>
                            <div class="wind">
                                <p>--</p>
                                <i class="bi bi-send-exclamation-fill"  style="margin-bottom: 10px; font-size: 20px;"></i>
                                <span>-- km/h</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
    });
}

function today() {
  const today = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayName = days[today.getDay()];
  const day = today.getDate();
  const month = months[today.getMonth()];
  const year = today.getFullYear();

  const dateString = `${dayName}, ${day} ${month} ${year}`;
  document.querySelector(".date").innerHTML =
    `<p><i class="bi bi-calendar"></i> ${dateString}</p>`;
}
