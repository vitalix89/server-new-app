import { model, Schema } from 'mongoose'
import uuid = require('uuid')

export interface User {
  email: string
  password: string
  uuid: string
}

const UserSchema = new Schema({
  id: {
    type: String,
  },

  email: {
    type: String,
  },

  password: {
    type: String,
  },
})

export const UserModel = model('User', UserSchema)
