import { FileModel } from '@dbc-tech/johnny5-mongodb'

const file = await FileModel.findOne({
  tenant: 'BTR',
  actionStepMatterId: 239987,
})

console.log(file?.id)
