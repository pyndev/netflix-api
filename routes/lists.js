const router = require("express").Router();
const List = require("../models/List");
const verifyToken = require("../verifyToken");

//CREATE
router.post("/" , verifyToken, async(req, res) =>{
    if (req.user.isAdmin) {
        const newList = new List(req.body);

        try {
            const saveList = await newList.save();
            return res.status(201).json(saveList);
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
        const newList = new List(req.body);

        try {
            const updateList = await List.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            },{ new: true });
            return res.status(201).json(updateList);
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
            await List.findByIdAndDelete(req.params.id);
            return res.status(201).json("The list has been deleted.");
        } catch (error) {
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json("Permission Denied!");
    }
})

//GET
router.get("/" , verifyToken, async(req, res) =>{
    const typeQuery = req.query.type;
    const genreQuery = req.query.genre;

    let list = [];

    try {
        if (typeQuery) {
            if (genreQuery) {
                list = await List.aggregate([
                    { $sample: { size: 10 }},
                    { $match: { type: typeQuery, genre: genreQuery }}
                ]);
            } else {
                list = await List.aggregate([
                    { $sample: { size: 10 }},
                    { $match: { type: typeQuery }}
                ]);
            }
        } else {
            list = await List.aggregate([{ $sample: { size: 10 }}]);
        }

        return res.status(200).json(list);
    } catch (error) {
        return res.status(500).json(error);
    }
})

module.exports = router;