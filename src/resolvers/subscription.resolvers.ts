export const PUBSUB_NEW_MESSAGE = 'PUBSUB_NEW_MESSAGE'

export default {
  Subscription: {
    newMessage: {
      subscribe: (_, __, { pubsub }) => {
        return pubsub.asyncIterator(PUBSUB_NEW_MESSAGE)
      },
    },
  },
}
