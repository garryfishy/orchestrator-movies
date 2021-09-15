const { ApolloServer, gql } = require("apollo-server");
const tvSeriesApi = require("./utils/tvSeriesApi");
const moviesAPI = require("./utils/moviesAPI");
const Redis = require("ioredis");
const redis = new Redis({
  host: "redis-15212.c252.ap-southeast-1-1.ec2.cloud.redislabs.com",
  port: 15212,
  password: "grpTMfuMMTvGdNmjlo3DnHtBYUL2YjWg",
});

const typeDefs = gql`
  type Movies {
    _id: ID
    title: String
    overview: String
    poster_path: String
    popularity: Float
    tags: [String]
  }

  type TVSeries {
    _id: ID
    title: String
    overview: String
    poster_path: String
    popularity: Float
    tags: [String]
  }

  type all {
    movies: [Movies]
    series: [TVSeries]
  }

  input MovieInput {
    title: String
    overview: String
    poster_path: String
    popularity: Float
    tags: [String]
  }

  input SeriesInput {
    title: String
    overview: String
    poster_path: String
    popularity: Float
    tags: [String]
  }

  type Mutation {
    addMovie(payload: MovieInput!): Movies
    addSeries(payload: SeriesInput!): TVSeries
    deleteMovie(id: ID!): Movies
    deleteSeries(id: ID!): TVSeries
    updateMovie(id: ID!, payload: MovieInput!): Movies
    updateSeries(id: ID!, payload: SeriesInput!): TVSeries
  }

  type Query {
    movies: [Movies]
    series: [TVSeries]
    all: all
  }
`;

const resolvers = {
  Query: {
    async movies() {
      try {
        let moviesCache = await redis.get("Movies");
        if (moviesCache) {
          return JSON.parse(moviesCache);
        } else {
          let { data } = await moviesAPI.get("/");
          redis.set("Movies", JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.log(err);
      }
    },

    async series() {
      try {
        let seriesCache = await redis.get("Series");
        if (seriesCache) {
          return JSON.parse(seriesCache);
        } else {
          let { data } = await tvSeriesApi.get("/");
          redis.set("Series", JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.log(err);
      }
    },

    async all() {
      try {
        let allCache = await redis.get("All");
        if (allCache) {
          return JSON.parse(allCache);
        } else {
          let { data: movies } = await moviesAPI.get("/");
          let { data: series } = await tvSeriesApi.get("/");
          const allData = { movies, series };
          redis.set("All", JSON.stringify(allData));
          return allData;
        }
      } catch (error) {
        return error;
      }
    },
  },
  Mutation: {
    async addMovie(parent, args) {
      try {
        // console.log(args.payload);
        if (!args.payload) {
          console.log("Required field cannot be empty");
        } else {
          let { data } = await moviesAPI.post("/", args.payload);
          console.log(data);
          redis.del("Movies");
          redis.del("All");
          return data;
        }
      } catch (err) {
        console.log(err);
      }
    },
    async addSeries(parent, args) {
      try {
        // console.log(args.payload);
        if (!args.payload) {
          console.log("Required field cannot be empty");
        } else {
          let { data } = await tvSeriesApi.post("/", args.payload);
          console.log(data);
          redis.del("Series");
          redis.del("All");
          return data;
        }
      } catch (err) {
        console.log(err);
      }
    },
    async deleteMovie(parent, args) {
      try {
        console.log(args);
        if (!args.id) {
          console.log("Id cannot be empty");
        } else {
          let { data } = await moviesAPI.delete(`/${args.id}`);
          redis.del("Movies");
          redis.del("All");
          return data;
        }
      } catch (err) {
        console.log(err);
      }
    },
    async deleteSeries(parent, args) {
      try {
        console.log(args);
        if (!args.id) {
          console.log("Id cannot be empty");
        } else {
          let { data } = await tvSeriesApi.delete(`/${args.id}`);
          redis.del("Series");
          redis.del("All");
          return data;
        }
      } catch (err) {
        console.log(err);
      }
    },
    async updateMovie(parent, args) {
      try {
        let { data } = await moviesAPI.put(`${args.id}`, args.payload);
        redis.del("Movies");
        redis.del("All");
        return data;
      } catch (err) {
        console.log(err);
      }
    },
    async updateSeries(parent, args) {
      try {
        let { data } = await tvSeriesApi.put(`${args.id}`, args.payload);
        redis.del("Series");
        redis.del("All");
        return data;
      } catch (err) {
        console.log(err);
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server is running on ${url}`);
});
