const axios = require("axios")
const dayjs = require("dayjs")
const utc = require("dayjs/plugin/utc")

dayjs.extend(utc)

const darkSkyUrl = `https://api.darksky.net/forecast/4928e85ff807217991c53f15e522f0fa/`

module.exports = (req, res) => {
  const { coordinates } = req.query
  // exclude=[currently,minutely,hourly,daily,alerts,flags]
  const fullUrl = `${darkSkyUrl}${coordinates}?exclude=[minutely,hourly,daily,alerts,flags]`
  try {
    console.log("☔️ Requesting", { coordinates })
    axios
      .get(fullUrl, {
        params: {
          units: "ca",
        }
      })
      .then(({ data }) => {
        const {
          sunriseTime,
          sunsetTime,
          temperatureHigh,
          temperatureLow
        } = data.daily.data[0]
        const hourlyForecast = data.hourly.data
          .filter(hour => dayjs.unix(hour.time).isSame(dayjs(), "day"))
          .map(hour => ({
            temperature: hour.temperature,
            time: hour.time,
            timeReadable: dayjs.unix(hour.time).format("h:mm A"),
            timeLocal: dayjs.unix(hour.time).format("h:mm A"),
            summary: hour.summary,
            icon: hour.icon
          }))
        res.status(200).send({
          ...data.currently,
          sunsetTime,
          sunriseTime,
          temperatureHigh,
          temperatureLow,
          hourlyForecast
        })
      })
  } catch (error) {
    console.error(error)
  }
}
