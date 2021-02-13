const express = require('express')
const {ensureAuth, ensureGuest} = require('../middlewares/auth')
const Story = require('../models/Story')

const router = express.Router()

/* 
    @desc   Login/Landing Page
    @route  GET /
*/
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: 'login'
    })
})

/* 
    @desc   Dashboard
    @route  GET /dashboard
*/
router.get('/dashboard', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({user: req.user.id}).lean()
        res.render('Dashboard', {
            name: req.user.firstName,
            stories: stories
        })
    } catch (error) {
        console.error(error)
        res.render('errors/500')
    }
})

module.exports = router