import { model, Schema } from 'mongoose'

const CartItem = new Schema({
  id: {
    type: String,
  },
  qty: {
    type: Number,
  },

  name: {
    type: String,
  },

  price: {
    type: Number,
  },

  image: {
    type: String,
  },
})

const CartSchema = new Schema({
  id: {
    type: String,
  },

  userId: {
    type: String,
  },

  items: {
    type: [CartItem],
  },
})

export const CartModel = model('Cart', CartSchema)
