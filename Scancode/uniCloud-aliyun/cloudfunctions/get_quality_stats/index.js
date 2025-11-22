exports.main = async () => {
  const db = uniCloud.database()
  const col = db.collection('process-records')
  
  const stats = await col.aggregate()
    .group({
      _id: '$inspectResult',
      count: $.sum(1)
    })
    .end()

  return stats.data.map(item => ({
    name: item._id,
    value: item.count
  }))
} 