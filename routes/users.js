const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const verifyToken = require("../verifyToken");

//UPDATE
router.post("/:id" , verifyToken, async(req, res) =>{
    if (req.user.id === req.params.id || req.user.isAdmin) {
        if (req.body.password) {
            req.body,password = CryptoJS.AES.encrypt(
                req.body.password,
                process.env.SECRET_KEY
              ).toString();
        }

        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            },{
                new: true
            })
            return res.status(200).json(updatedUser)
        } catch (error) {
            return res.status(500).json(error)
        }
    }else{
        return res.status(403).json("You can update only your account!")
    }
})

//DELETE
router.delete("/:id" , verifyToken, async(req, res) =>{
    if (req.user.id === req.params.id || req.user.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id)
            return res.status(200).json("User has been deleted!")
        } catch (error) {
            return res.status(500).json(error)
        }
    }else{
        return res.status(403).json("You can delete only your account!")
    }
})

//GET
router.get("/find/:id" , verifyToken, async(req, res) =>{
        try {
            const user = await User.findById(req.params.id)
            const { password, ...info } = user._doc; //to remove password from json
            return res.status(200).json(info)
        } catch (error) {
            return res.status(500).json(error)
        }
})

//GET ALL
router.get("/" , verifyToken, async(req, res) =>{
    const query = req.query.new;
    if (req.user.isAdmin) {
        try {
            const users = query ?  await User.find().sort({_id: -1}).limit(2) : await User.find();
            return res.status(200).json(users)
        } catch (error) {
            return res.status(500).json(error)
        }
    }else{
        return res.status(403).json("You are not allowed to see all users!")
    }
})

//GET USER STATS
router.get("/stats" , verifyToken, async(req, res) =>{
    const today = new Date();
    const lastYear = today.setFullYear(today.setFullYear() - 1);

    const monthArray = [
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

    try {
        const data = await User.aggregate([
            {
                $project:{
                    month: {
                        $month: "$createdAt"
                        // $year: "$createdAt"
                    }
                }
            },{
                $group:{
                    _id: "$month",
                    total: {
                        $sum:1
                    }
                }
            }
        ]);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json(error)
    }
})


module.exports = router;