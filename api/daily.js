const axios = require("axios")
const dayjs = require("dayjs")
const utc = require("dayjs/plugin/utc")
const ora = require("ora")

dayjs.extend(utc)

const darkSkyUrl = `https://api.darksky.net/forecast/4928e85ff807217991c53f15e522f0fa/`

module.exports = (req, res) => {
  const { coordinates, range } = req.query
  // exclude=[currently,minutely,hourly,daily,alerts,flags]
  const fullUrl = `${darkSkyUrl}${coordinates}?time=2&exclude=[currently,minutely,hourly,alerts,flags]`
  try {
    const spinner = ora(`Requesting daily forecast ${coordinates}`).start()
    axios
      .get(fullUrl, {
        params: {
          units: "ca"
        }
      })
      .then(({ data }) => {
        spinner.succeed()
        console.log({ data })
        const dailyForecast = data.daily.data
          // .filter(hour => dayjs.unix(hour.time).isSame(dayjs(), "day"))
          .slice(0, range === "fortnight" ? 14 : 7)
          .map(day => ({
            temperatureMax: day.temperatureMax,
            temperatureMin: day.temperatureMin,
            time: day.time,
            // timeReadable: dayjs.unix(hour.time).format("h:mm A"),
            summary: day.summary,
            icon: day.icon
          }))
        res.status(200).send({ dailyForecast })
      })
  } catch (error) {
    spinner.fail()
    console.error(error)
    res.status(400).send({ error })
  }
}
