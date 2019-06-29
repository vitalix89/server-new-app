import BodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import session from 'express-session'
import { GraphQLServer } from 'graphql-yoga'
import jwt from 'jsonwebtoken'
import ms from 'ms'
import passport from 'passport'
import { Strategy } from 'passport-anonym-uuid'
// import anonymous from 'passport-anonymous'
import paypal from 'paypal-rest-sdk'
import SessionFileStore from 'session-file-store'
import {
  anonymous,
  login,
  signup,
  strategy,
} from '../src/passport_config/passport'
import { models, startDB } from './db/index'
//import { strategy } from './passport_config/passport';
import resolvers from './resolvers'
import typeDefs from './typeDefs'

const db = startDB()
// console.log(paypal)

const whitelist = [
  'http://localhost:8000',
  'http://localhost:3000',
  'http://localhost:4000',
  'http://localhost:19002',
  'http://192.168.1.24:19000',
  'http://localhost:19006',
  'http://192.168.95.2:19006',
]
const corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}

passport.use(new Strategy())
passport.use(strategy)

const FileStore = SessionFileStore(session)

const isLoggedIn = async (resolve, parent, args, ctx, info) => {
  // Include your agent code as Authorization: <token> header.
  // const permit = ctx.request.get('Authorization')

  const permit = ctx.req.headers

  console.log('headerszzzzzzzzzzzzzzzzzzzzz', permit)

  // if (!permit) {
  //   throw new Error(`Not authorised!`)
  // }

  return resolve()
}

const getUser = async (authorization, secret, models) => {
  const bearerLength = 'Bearer '.length

  if (authorization && authorization.length > bearerLength) {
    const token = authorization.slice(bearerLength)

    console.log('BBBBBBBBBBBBBBBBBBBB////////////////', token)

    const { ok, result } = await new Promise(resolve =>
      jwt.verify(token, secret, (err, result) => {
        if (err) {
          resolve({ ok: false, result: err })
        } else {
          resolve({ ok: true, result })
        }
      }),
    )

    console.log('CCCCCCCCCCCCCCCCCCCCC////////////////', result)

    if (ok) {
      const user = await models.UserModel.findOne({ _id: result })
      return user
    } else {
      return null
    }
  }

  return null
}

const Server = new GraphQLServer({
  typeDefs,
  resolvers,
  // middlewares: [isLoggedIn],
  context: async ({ request, response }) => {
    // console.log('CONTEXT>>>>>>>>REQUEST............', request.user)

    const user = await getUser(
      request.headers['authorization'],
      'secret-code',
      models,
    )

    console.log('AAAAAAAAAAAAAAAAAAAAAAAAAA.................', user)

    return {
      models,
      db,
      signup,
      login,
      user,
      anonymous,
      req: request,
      res: response,
    }
  },
  middlewares: [isLoggedIn],
})

Server.express.use(BodyParser.urlencoded({ extended: false }))
Server.express.use(BodyParser.json())

Server.express.use(
  session({
    name: 'the_session',
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    // store: new FileStore(),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: ms('1d'),
    },
  }),
)

Server.express.use(passport.initialize())
Server.express.use(passport.session())

Server.express.use(cookieParser())

Server.express.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:3000',
      'http://localhost:8000',
      'http://localhost:19002',
      'http://192.168.1.24:19000',
      'http://localhost:19006',
      'http://192.168.95.2:19006',
    ],
  }),
)

const opts = {
  port: 4000,
  cors: {
    credentials: true,
    origin: [
      'http://localhost:3000',
      'http://localhost:8000',
      'http://localhost:19002',
      'http://192.168.1.24:19000',
      'http://localhost:19006',
      'http://192.168.95.2:19006',
    ], // your frontend url.
  },
}

paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id:
    'AXWTENRjLquLfUJrhvu-AKA1KqI_aUI-xCSnh9JKAght02emJlx6XYaq_eXsMN7lZZDYH4Z064aiZxPC',
  client_secret:
    'EPA4pfcwuiH78Tzw0oHvLwYkBSudC3M6pqBMaxXQ2oQ92A0-vb0ENjbTyWdx8Ezr6amEBDoOhHRRNQUb',
})

Server.express.get('/hi', (req, res) => {
  res.send(`<div><h1>hello</h1><form action="/pay" method="post">
  <input type="submit" value="buy" />
</form></div>`)
})
// it should be in next.js

Server.express.get('/me', (req, res) => {
  console.log('REQ>>>>>>>USER___MEEE', req.user, req.session)
  res.send('me')
})

Server.express.get(
  '/test',
  // Authenticate using HTTP Basic credentials, with session support disabled,
  // and allow anonymous requests.
  passport.authenticate('anonymId', { session: false }),
  (req, res) => {
    console.log('ssssssssssss', req.user, req.session)
    if (req.user) {
      res.send(' username: req.user.username, email: req.user.email')
    } else {
      res.send({ anonymId: 'req.user.uuid ' })
    }
  },
)

Server.express.post('/my_login', async (req: any, res: any) => {
  console.log('DB.........', db)
  try {
    const { email, password } = req.body
    const user = await login({ email, password, req })
    res.json({ success: true, user })
  } catch (error) {
    console.log(error)
    res.json({ error: 'Email or password is incorrect.' })
  }
})

Server.express.post('/log-out', async (req, res) => {
  req.logout()

  res.send('suka logout......')
})

Server.express.post('/suka', cors(corsOptions), (req, res) => {
  console.log('req.....body', req.body)

  res.send('blat')
})

Server.express.post('/pay', cors(corsOptions), async (req, res) => {
  console.log('REQ___BODY', req.body)

  console.log('REQ___SESSION /PAY.......', req.cookies.session)

  // const cartId = req.cookies.session

  const cartId = req.sessionID

  const cart: any = await models.CartModel.findOne({ id: cartId })

  console.log('FOUND____CART................', cart)

  const newCart = cart.items.reduce((obj, item, i) => {
    obj[i] = {
      name: item.name,
      price: `${item.price}.00`,
      currency: 'USD',
      quantity: `${item.qty}`,
    }
    return obj
  }, [])

  //const total =
  const total = cart.items.reduce(
    (sum, item) => (sum += item.price * item.qty),
    0,
  )

  console.log('NEW_____CART__Converted.........', newCart)

  const create_payment_json: any = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://localhost:4000/success',
      cancel_url: 'http://localhost:4000/cancel',
    },
    transactions: [
      {
        item_list: {
          items: newCart,
        },
        amount: {
          currency: 'USD',
          total: `${total}.00`,
        },
        description: 'This is the payment description.',
      },
    ],
  }

  //payment.create()

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      //  console.log('ERRRRR......', error.response.details)
      throw error
    } else {
      console.log('Create Payment Response')
      // console.log(payment)

      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href)
          // res.send('ok')
        }
      }
    }
  })
})

Server.express.get('/success', async (req, res) => {
  const payerId = req.query.PayerID

  console.log('REQ___SESSION /SUCCESS.......', req.cookies.session)

  const paymentId = req.query.paymentId

  // const cartId = req.cookies.session

  const cartId = req.sessionID

  const cart: any = await models.CartModel.findOne({ id: cartId })

  const total = cart.items.reduce(
    (sum, item) => (sum += item.price * item.qty),
    0,
  )

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: 'USD',
          total: `${total}.00`,
        },
      },
    ],
  }

  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
    if (error) {
      throw error
    } else {
      console.log('Got Paynment Response')
      console.log(JSON.stringify(payment))
      // res.send('success')
      res.redirect('http://localhost:3000/cart')
    }
  })
})

Server.start(opts, () => {
  console.log(`Server is running on http://localhost:${opts.port}`)
})
