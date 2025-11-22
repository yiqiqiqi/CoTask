'use strict';
exports.main = async (event) => {
  const db = uniCloud.database()
  const processCol = db.collection('process-records')
  
  const totalRes = await processCol.count()
  const qualifiedRes = await processCol.where({
    inspectResult: '合格'
  }).count()

  return {
    total: totalRes.total,
    qualified: qualifiedRes.total
  }
} 