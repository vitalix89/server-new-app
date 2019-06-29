import { connect, Mongoose } from 'mongoose'
import { CartModel } from './cart'
import { UserModel } from './user'
// 20 years old boilerplate? no
// SET UP Mongoose Promises.
// wtf this shit?
new Mongoose().Promise = global.Promise // this line was relevant in 2013,  mow 2019 mm

export const startDB = () =>
  connect(
    'mongodb://localhost/labnonstop2',
    { useNewUrlParser: true },
  )

export const models = {
  CartModel,
  UserModel,
}
