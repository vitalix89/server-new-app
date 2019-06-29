import uuid from 'uuid'

export default {
  Query: {
    createCart: async (parent, args, { models, req }) => {
      const clientSessionId = req.cookies.session
      console.log('client id.....', clientSessionId)

      const cartId = uuid.v4()
      const newCart = new models.CartModel({ id: clientSessionId, items: [] })

      try {
        await newCart.save()
      } catch (e) {
        console.log('errrrrrr', e)
        throw new Error('Cannot Save Cart!!!')
      }

      return newCart
    },

    getCart: async (parent, args, { models, req }) => {
      // const testId = 's:3euqweqweqwe'

      const clientSessionId = req.cookies.session

      const sessionID = req.sessionID

      console.log('CLIENT__ID____GET_CART.......', sessionID)

      console.log('USER???....req-__user??', req.user)

      const Cart = await models.CartModel.findOne({ id: sessionID })

      if (Cart) {
        return Cart
      } else {
        return { id: '', items: [] }
      }
    },
  },

  Mutation: {
    addToCart: async (parent, { qty, name, price, image }, { models, req }) => {
      // console.log('addToCart called', qty, name, price, image)

      const clientSessionId = req.cookies.session

      const sessionID = req.sessionID

      console.log('CLIENT__ID.......', req.sessionID)

      // const testId = 's:3euqweqweqwe'

      const Cart = await models.CartModel.findOneAndUpdate(
        { id: sessionID },
        {
          $push: { items: { qty, name, price, image } },
          // $set: { userId: 'UUUUUUUUUUUU' },
        },
        { new: true, upsert: true },
      ).exec()

      // console.log('wtf...........', Cart)

      return Cart
    },

    removeItem: async (parent, { id }, { models, req }) => {
      const clientSessionId = req.cookies.session

      const testId =
        's:P9S-svUm142Ij1TzPIR1KytQTTsWCvX2.Wv4a7nS8PLGO9Bk1fVNcnRMGuWYOJAYRy9Sz/282hKw'

      const sessionID = req.sessionID

      // const testId = 's:3euqweqweqwe'

      const Cart = await models.CartModel.findOneAndUpdate(
        { id: sessionID },
        { $pull: { items: { _id: id } } },
      ).exec()

      console.log('REMOVE ITEM???......', id, Cart)

      // console.log('wtf...........', Cart)

      return Cart
    },

    updateItem: async (parent, { id, qty, type }, { models, req }) => {
      const clientSessionId = req.cookies.session
      const updateQty = type === 'increment' ? qty + 1 : qty - 1

      const sessionID = req.sessionID

      if (updateQty !== 0) {
        const update = { $set: { 'items.$.qty': updateQty } }

        const Cart = await models.CartModel.findOneAndUpdate(
          { id: sessionID, 'items._id': id },
          update,
        ).exec()

        console.log('REMOVE ITEM???......', id, Cart)

        // console.log('wtf...........', Cart)

        return Cart
      } else {
        const Cart = await models.CartModel.findOneAndUpdate(
          { id: sessionID },
          { $pull: { items: { _id: id } } },
        ).exec()

        console.log('REMOVE ITEM???......', id, Cart)

        // console.log('wtf...........', Cart)

        return Cart
      }
    },
  },
}
