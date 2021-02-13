const express = require('express')
const {ensureAuth} = require('../middlewares/auth')
const Story = require('../models/Story')

const router = express.Router()

/* 
    @desc   Show Add Page
    @route  GET /stories/add
*/
router.get('/add', ensureAuth, (req, res) => {
    res.render('stories/add')
})

/* 
    @desc   Process Add Form
    @route  POST /stories
*/
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        res.render('errors/500')
    }
})

/* 
    @desc   Show Add Page
    @route  GET /stories/add
*/
router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({status: 'public'})
                                    .populate('user')
                                    .sort({createdAt: 'desc'})
                                    .lean()
        res.render('stories/index', {
            stories: stories
        })
    } catch (error) {
        console.error(error)
        res.render('errors/500')
    }
})

/* 
    @desc   Show Single Story
    @route  GET /stories/:id
*/
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).populate('user').lean()

        if (!story) {
            return res.render('errors/404')
        }

        res.render('stories/show', {
            story: story
        })
    } catch (error) {
        console.error(error)
        res.render('errors/404')
    }  
})

/* 
    @desc   Show Edit Page
    @route  GET /stories/edit/:id
*/
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id).lean()
        if (! story) {
            return res.render('errors/404')
        }
        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            res.render('stories/edit', {
                story: story
            })
        }
    } catch (error) {
        console.error(error)
        res.render('errors/500')
    }
    
})

/* 
    @desc   Update Story
    @route  PUT /stories/:id
*/
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean()

        if (! story) {
            return res.render('errors/404')
        }
        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            story = await Story.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            })

            res.redirect('/dashboard')
        }
    } catch (error) {
        console.error(error)
        res.render('errors/500')
    }
})

/* 
    @desc   Delete Story
    @route  DELETE /stories/:id
*/
router.delete('/:id', ensureAuth, async (req, res) => {
    console.log('here');
    try {
        await Story.findByIdAndDelete(req.params.id)
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        res.render('errors/500')
    }
})

/* 
    @desc   User Stories
    @route  GET /stories/user/:userId
*/
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.userId,
            status: 'public'
        })
        .populate('user')
        .lean()

        res.render('stories/index', {
            stories: stories
        })
    } catch (error) {
        console.error(error)
        res.render('errors/500')
    }
})

module.exports = router