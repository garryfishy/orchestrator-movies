const router = require("express").Router();
const Controller = require("../controllers/controller");

router.get("/all", Controller.getAll);
router.post("/movies", Controller.postNewMovie);

module.exports = router;
