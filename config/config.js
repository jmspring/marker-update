var config = {
    marathon_url: (process.env.MARATHON_URL ? process.env.MARATHON_URL : "http://localhost:80/marathon/v2")
}

module.exports = config;
