//import { login, signup } from '../passport_config/passport'

import jwt from 'jsonwebtoken';

export default {
  Query: {
    createUser: async (parent, args, { models, req }) => {},

    getUser: async (parent, args, { models, req, anonymous, user }) => {
      // await anonymous({ req })

      console.log('SUUUUUUUUU..........', req.headers, req.user, req.sessionID)

      console.log('JWT___USER.................', user)



      return user
    },
  },

  Mutation: {
    addUser: async (parent, { email, password }, { models, req, signup }) => {
      try {
        const user = await signup({ email, password, req })

        console.log('REGISTER USER.>>>>>>>>>>......>>>>>..>>>', user)

        
        user.jwt = jwt.sign({ _id: user._id }, 'secret-code')

        console.log('USERS......JWT TOOOOKEN', user.jwt)

        return user
      } catch (error) {
        console.log(error)
        return error
      }
    },

    logIn: async (parent, { email, password }, { models, req, login }) => {
      try {
        console.log(
          'LOGGIN IN.....WITH CREDENTIALS8888888......',
          email,
          password,
        )

        try {
          const user = await login({ email, password, req })

          user.jwt = jwt.sign({ _id: user._id }, 'secret-code')

          console.log('USERS......JWT TOOOOKEN', user.jwt)

          return user
        } catch (error) {
          console.log('login err....', error)

          return error
        }
      } catch (error) {
        console.log(error)
        throw error
      }
    },

    logOut: async (parent, { id }, { models, req }) => {
      req.logOut()

      req.session.destroy()

      console.log('SESSONNSSS', req.sessionID)

      return req.user
    },
  },
}
