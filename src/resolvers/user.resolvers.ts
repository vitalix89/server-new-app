//import { login, signup } from '../passport_config/passport'

import jwt from 'jsonwebtoken'

export default {
  Query: {
    createUser: async (parent, args, { models, req }) => {},

    getUser: (parent, args, { models, req, anonymous, user, pubsub }) => {
      // await anonymous({ req })

      console.log(
        'SUUUUUUUUU..........laaaaaaaaaa',
        req.headers.authorization,
        user,
      )

      // console.log('JWT___USER.................', user)

      // pubsub.publish(PUBSUB_NEW_MESSAGE, {
      //   newMessage: {
      //     text: 'sukaaaaaaaaaaa',
      //     user: {
      //       id: 'sdsdsdsd',
      //       email: 'sdasdasdasdsa',
      //     },
      //     listingId: '1313kj13kj12n3k1n2-123k1nl3jn12l3',
      //   },
      // })

      return user
    },
  },

  Mutation: {
    addUser: async (parent, { email, password }, { models, req, signup }) => {
      try {
        const user = await signup({ email, password, req })

        user.jwt = jwt.sign({ _id: user._id }, 'secret-code')

        return user
      } catch (error) {
        console.log(error)
        return error
      }
    },

    logIn: async (parent, { email, password }, { models, req, login }) => {
      try {
        const user = await login({ email, password, req })

        user.jwt = await jwt.sign({ _id: user._id }, 'secret-code')

        console.log(
          'SUCCESSSSSSSS_LOGIN!!!!!...............................!!!!!',
          user.jwt,
        )

        return user
      } catch (error) {
        return error
      }
    },

    logOut: async (parent, { id }, { models, req, user }) => {
      //  req.logOut()
      console.log('logout>>>>>>>>>>>>>>>..........laaaaaaaaaa', req.headers)

      // req.session.destroy()

      return user
    },
  },
}
