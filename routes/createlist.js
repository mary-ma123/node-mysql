const { paramsInit, initStr } = require('../lib/db/paramsInit.js');
const { pool, router, Result } = require('../lib/db/index.js');

/* Post users listing.  多查询语句带条件  不用定义任何字段  查询语句拼接*/
router.post('/create', function(req,res) {
	var params = req.body || req.params; //查询参数对象
	let newParams = {
		id:(new Date().getTime() / 100).toFixed(0).toString(),
		userName:params.userName,
		singleStatus:params.singleStatus,
		sex:params.sex,
		phone:params.phone,
		age:params.age,
		createTime:new Date().getTime()
	}
	let attrs = initStr(Object.keys(newParams),1);
	let str = initStr(Object.values(newParams),0);
	const sqlList = `INSERT INTO usermanage (${attrs}) VALUES (${str})`; /*查询列表*/
	pool.getConnection((err, conn) => {
		conn.query(`${sqlList}`, (error, results) => {   //因为查询语句的条件都相同  则需把查询值 重复两遍即为[...sqlArr,...sqlArr]
			if (error) throw error
			res.json(new Result({
				data: results, 
				msg:'成功!',
			}))
		})
		pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
	})
});

module.exports = router;


/*注意事项
*INSERT INTO usermanage (${attrs}) VALUES (${str})
* VALUES前面的参数名称不用带引号,后面的值要带引号*/