import bcrypt from 'bcryptjs'
import passport from 'passport'
import { IStrategyOptions, Strategy } from 'passport-local'
//import { db, startDB, User } from "../db";
import { User, UserModel } from '../db/user'

//startDB();

const strategyOptions: IStrategyOptions = {
  usernameField: 'email',
  passwordField: 'password',
}

passport.serializeUser<User, string>((user, done) => {
  console.log('serializing...', user)

  if (user.email) {
    done(undefined, user.email)
  } else {
    done(undefined, user.uuid)
  }
})

passport.deserializeUser<User, string>(async (email, done) => {
  console.log('deserializing...', email)
  //const user = db.get(email);

  const user: any = await UserModel.findOne({ email })

  if (user === undefined) {
    return done(new Error('user not found'))
  }

  done(undefined, user)
})

export const strategy = new Strategy(
  strategyOptions,
  async (email: string, password: string, done) => {
    console.log('strategy callback...', email, password) //here

    // const user = db.get(email);

    const user: any = await UserModel.findOne({ email })

    console.log('USErrrrrr????', user)

    if (!user) {
      return done(undefined, false, { message: 'Email doesnt exists' })
    }

    const isValid = bcrypt.compareSync(password, user.password)

    if (isValid === false) {
      return done(undefined, false, { message: 'Password incorect' })
    }

    return done(undefined, user)
  },
)

interface SignupOptions {
  email: string
  password: string
  req: Express.Request
}

export async function signup({ email, password, req }: SignupOptions) {
  if (!email || !password) {
    throw new Error('You must provide an email and password.')
  }

  // const emailInUse = 'db.get(email)'

  const emailInUse: any = await UserModel.findOne({ email })

  console.log('found email?.........', emailInUse)

  if (emailInUse !== null) {
    // throw new Error('Email in use')
    return 'Email in use...'
  }

  // const user = { email, password }
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password, salt)

  const newUser = new UserModel({ id: email, email: email, password: hash })

  try {
    const savedUser: any = await newUser.save()

    // return new Promise((resolve, reject) => {
    //   // this login, calls to strategy
    //   req.logIn(savedUser, err => {
    //     if (err) {
    //       reject(err)
    //     } else {
    //       resolve(savedUser)
    //     }
    //   })
    // })

    return savedUser

    // return savedUser
  } catch (e) {
    console.log('errrrrrr', e)
    // throw new Error('Cannot Save User!!!')

    return e
  }

  //db.set(email, { email, password: hash });
  //console.log('DB.............DB', db)
}

export function login({ email, password, req }: SignupOptions) {
  //console.log('DB.............DB', db)
  return new Promise((resolve, reject) => {
    passport.authenticate('local', (err, user) => {
      if (!user) {
        reject('Invalid credentials.')
      }

      req.login(user, () => {
        resolve(user)
      })
    })({ body: { email, password } })
  })
}

export function anonymous({ req }) {
  //console.log('DB.............DB', db)
  return new Promise((resolve, reject) => {
    passport.authenticate('anonymId', { session: false }, (err, user) => {
      if (!user) {
        reject('Invalid credentials.')
      }

      console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', user)

      // req.login(user, () => {
      //   resolve(user)
      // })
      resolve(user)
    })({ body: {} })
  })
}

// fucking pizdets...... %)
