const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const morgan = require('morgan')
const exphbs  = require('express-handlebars');
const path = require('path')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const methodOverride = require('method-override')

// Load config
dotenv.config({path: './config/config.env'})

// Passport Config
require('./config/passport')(passport)

connectDB()

const app = express()

// Body Parsing
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Method Override
app.use(methodOverride('_method'))

// Logging
if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'))
}

// Handlebars Helpers
const {formatDate, stripTags, truncate, editIcon, select} = require('./helpers/hbs')

// Template Engine
app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {formatDate, stripTags, truncate, editIcon, select}
}));
app.set('view engine', '.hbs');

// Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))

// Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

// Global Variables
app.use((req, res, next) => {
    res.locals.user = req.user || null
    next()
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
})