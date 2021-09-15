

class Controller {
  static async getAll(req, res, next) {
    try {
      const data = await redis.get("allData");
      if (!data) {
        let { data: movies } = await moviesAPI.get("/");
        let { data: tvseries } = await tvSeriesApi.get("/");
        const allData = { movies, tvseries };
        await redis.set("allData", JSON.stringify(allData));
        return res.status(200).json(allData);
      } else {
        return res.status(200).json(JSON.parse(data));
      }
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  }

  static async postNewMovie(req, res, next) {
    const { title, overview, poster_path, popularity, tags } = req.body;
    try {
      const { data } = await moviesAPI.post("/");
      await redis.del("allData");
      return res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
}

module.exports = Controller;
