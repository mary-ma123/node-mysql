const { paramsInit } = require('../lib/db/paramsInit.js');
const { pool, router, Result } = require('../lib/db/index.js');

/* GET users listing.  多查询语句带条件  不用定义任何字段  查询语句拼接*/
router.get('/', function(req,res) {
	var params = req.query || req.params; //查询参数对象
	var obj = paramsInit(params);
	const sqlList = `SELECT * FROM usermanage ${obj.sqlStr};` /*查询列表*/
	const sqlCount = `SELECT COUNT(*) as total FROM usermanage ${obj.sqlStr}` /*查询总条数   SELECT COUNT(id) as total FROM usermanage*/
	pool.getConnection((err, conn) => {
		conn.query(`${sqlList}${sqlCount}`, [...obj.sqlArr,...obj.sqlArr], (error, result) => {   //因为查询语句的条件都相同  则需把查询值 重复两遍即为[...sqlArr,...sqlArr]
			if (error) throw error
			res.json(new Result({
				data: {
					list:result[0],
					total:result[1][0].total
				}, 
				msg:'成功',
			}))
		})
		pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
	})
});

module.exports = router;


/*对于查询语句的注意事项
*SELECT COUNT(*) as total FROM usermanage
* 对于 count(1)代替count(*)
* 经测试两者（表内数据200万）相差无几。
* 使用explain可以看到，优化器对两种写法的分析结果是一致的。所以，执行结果一致也就是必然。
* 在优化器中，我们看到，它会使用主键索引。这对于提升性能有帮助。所以，在有计算count()的表内尽量创建索引，
* 尽量使用自增长字段作为主键。不仅在这种情况有帮助，对于很多情况都有好处。有兴趣的建议研究一下索引。
* */
