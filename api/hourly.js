const axios = require("axios")
const dayjs = require("dayjs")
const utc = require("dayjs/plugin/utc")
const ora = require("ora")

dayjs.extend(utc)

const darkSkyUrl = `https://api.darksky.net/forecast/4928e85ff807217991c53f15e522f0fa/`

module.exports = (req, res) => {
  const { coordinates } = req.query
  // exclude=[currently,minutely,hourly,daily,alerts,flags]
  const fullUrl = `${darkSkyUrl}${coordinates}?time=2&exclude=[currently,minutely,daily,alerts,flags]`
  const spinner = ora(`Fetching Hourly ${coordinates}`).start()
  axios
    .get(fullUrl, {
      params: {
        units: "ca"
      }
    })
    .then(({ data }) => {
      spinner.succeed()
      console.log({ data })
      const hourlyForecast = data.hourly.data
        // .filter(hour => dayjs.unix(hour.time).isSame(dayjs(), "day"))
        .slice(0, 8)
        .map(hour => ({
          temperature: hour.temperature,
          time: hour.time,
          // timeReadable: dayjs.unix(hour.time).format("h:mm A"),
          summary: hour.summary,
          icon: hour.icon
        }))
      res.status(200).send({ hourlyForecast })
    })
    .catch(error => {
      spinner.fail()
      console.error(error.toJSON())
      res.status(400).send(error.code)
    })
}
