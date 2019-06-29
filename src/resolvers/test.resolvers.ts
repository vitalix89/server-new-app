export default {
  Query: {
    open: (parent, args, { models, req }) => {
      console.log('NU SUKAAAAA PAGADI', req.user)
      return req.user
    },
    secured: () => `Personal diary - this is for my eyes only!`,
    me: () => ({}),
  },
  Me: {
    name: () => 'Ben',
    surname: () => 'Cool',
    age: () => 18,
  },
}
