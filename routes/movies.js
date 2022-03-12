const router = require("express").Router();
const Movie = require("../models/Movie");
const verifyToken = require("../verifyToken");

//CREATE
router.post("/" , verifyToken, async(req, res) =>{
    if (req.user.isAdmin) {
        const newMovie = new Movie(req.body);

        try {
            const saveMovie = await newMovie.save();
            return res.status(201).json(saveMovie);
        } catch (error) {
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json("Permission Denied!");
    }
})

//UPDATE
router.post("/:id" , verifyToken, async(req, res) =>{
    if (req.user.isAdmin) {
        const newMovie = new Movie(req.body);

        try {
            const updateMovie = await Movie.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            },{ new: true });
            return res.status(201).json(updateMovie);
        } catch (error) {
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json("Permission Denied!");
    }
})

//DELETE
router.delete("/:id" , verifyToken, async(req, res) =>{
    if (req.user.isAdmin) {
        try {
            await Movie.findByIdAndDelete(req.params.id);
            return res.status(201).json("Movie has been deleted.");
        } catch (error) {
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json("Permission Denied!");
    }
})

//GET
router.get("/find/:id" , verifyToken, async(req, res) =>{

        try {
            const movie = await Movie.findById(req.params.id);
            return res.status(201).json(movie);
        } catch (error) {
            return res.status(500).json(error);
        }
})

//GET RANDOM
router.get("/random" , verifyToken, async(req, res) =>{
    const type = req.query.type;
    let movie;
    try {
        if (type === "series") {
            movie = await Movie.aggregate([
                {
                    $match: {
                        isSeries: true
                    }
                },
                {
                    $sample: {
                        size: 1
                    }
                }
            ]);
        }else{
            movie = await Movie.aggregate([
                {
                    $match: {
                        isSeries: false
                    }
                },
                {
                    $sample: {
                        size: 1
                    }
                }
            ]);
        }
        return res.status(200).json(movie);
    } catch (error) {
        return res.status(500).json(error);
    }
})

//GET ALL
router.get("/" , verifyToken, async(req, res) =>{
    if (req.user.isAdmin) {
        try {
            const movies = await Movie.find();
            return res.status(200).json(movies.reverse());
        } catch (error) {
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json("Permission Denied!");
    }
})


module.exports = router;