const mysql = require('mysql');
const DATA_SCOPE_ALL = "1"; //全部数据权限
const DATA_SCOPE_CUSTOM = "2"; //自定数据权限
const DATA_SCOPE_DEPT = "3"; //部门数据权限
const DATA_SCOPE_DEPT_AND_CHILD = "4"; //部门及以下数据权限
const DATA_SCOPE_SELF = "5"; //仅本人数据权限
const DATA_SCOPE = "dataScope"; //数据权限过滤关键字
/**
 * 
 * @param {*} user 用户
 * @param {*} deptAlias 部门别名
 * @param {*} userAlias 用户别名
 * @param {*} permission 权限字符
 */
function dataScopeFilter(sql, user, deptAlias, userAlias, permission) {
    //需要提前获取当前用户信息
    //如果是超级管理员 user_id=1  则直接return
    let sqlString = '';
    const conditions = [];

    for (const key in user) {

    }
}
const system = {
    sys_user: {
        selectUserVo: `
        select  u.user_id, u.dept_id, u.login_name, u.user_name, u.user_type, u.email, u.avatar, u.phonenumber, u.sex, u.password, u.salt, u.status, u.del_flag, u.login_ip, u.login_date, u.pwd_update_date, u.create_time, u.remark,
       		    d.dept_id, d.parent_id, d.ancestors, d.dept_name, d.order_num, d.leader, d.status as dept_status,
       		    r.role_id, r.role_name, r.role_key, r.role_sort, r.data_scope, r.status as role_status
		from sys_user u
			 left join sys_dept d on u.dept_id = d.dept_id
			 left join sys_user_role ur on u.user_id = ur.user_id
			 left join sys_role r on r.role_id = ur.role_id`,
        selectOnlineVo: `
        select sessionId, login_name, dept_name, ipaddr, login_location, browser, os, status, start_timestamp, last_access_time, expire_time 
        from sys_user_online`,
        /**
         * 
         * @param {[loginName:string]} params loginName
         * @returns 
         */
        selectUserByLoginName(params) {
            return mysql.format(`${this.selectUserVo} where u.login_name = ? and u.del_flag = '0'`, params)
        },
        /**
         * 
         * @param {[phonenumber:string]} params phonenumber
         * @returns 
         */
        selectUserByPhoneNumber(params) {
            return mysql.format(`${this.selectUserVo} where u.phonenumber = ? and u.del_flag = '0'`, params)
        },
        /**
         * 
         * @param {[email:string]} params email
         * @returns 
         */
        selectUserByEmail(params) {
            return mysql.format(`${this.selectUserVo} where u.email = ? and u.del_flag = '0'`, params)
        },
        /**
         * 
         * @param {[userId:number]} params userId
         * @returns 
         */
        selectUserById(params) {
            return mysql.format(`${this.selectUserVo} where u.user_id = ?`, params)
        },
        /**
         * 
         * @param {[loginName:string]} params loginName
         * @returns 
         */
        checkLoginNameUnique(params) {
            return mysql.format(`select user_id, login_name from sys_user where login_name=? and del_flag = '0' limit 1`, params)
        },
        /**
         * 
         * @param {[userId:string]} params email
         * @returns 
         */
        checkPhoneUnique(params) {
            return mysql.format(`select user_id, email from sys_user where email=? and del_flag = '0' limit 1`, params)
        },
        /**
         * 
         * @param {[userId:number]} params userId
         * @returns 
         */
        deleteUserById(params) {
            return mysql.format(`update sys_user set del_flag = '2' where user_id = ?`, params)
        },
        /**
         * 
         * @param {Array<number>} params userId
         * @returns 
         */
        deleteUserByIds(params) {
            return mysql.format(`update sys_user set del_flag = '2' where user_id in (?)`, [params.toString()])
        },
        /**
         * 
         * @param {{userId?:String,loginName?:String,status?:String,phonenumber?:String,deptId?:BigInt}} params
         * @returns 
         */
        selectUserList(params) {
            let selectUserListVo = `
            select u.user_id, u.dept_id, u.login_name, u.user_name, u.user_type, u.email, u.avatar, u.phonenumber, u.password, u.sex, u.salt, u.status, u.del_flag, u.login_ip, u.login_date, u.create_by, u.create_time, u.remark, d.dept_name, d.leader from sys_user u
            left join sys_dept d on u.dept_id = d.dept_id
            where u.del_flag = '0'`
            if (params.userId) {
                selectUserListVo += ` AND u.user_id = ${mysql.escape(params.userId)}`
            }
            if (params.loginName) {
                selectUserListVo += ` AND u.login_name like concat('%', ${mysql.escape(params.loginName)}, '%')`
            }
            if (params.status) {
                selectUserListVo += ` AND u.status = ${mysql.escape(params.status)}`
            }
            if (params.phonenumber) {
                selectUserListVo += ` AND u.phonenumber like concat('%', ${mysql.escape(params.phonenumber)}, '%')`
            }
            if (params.deptId) {
                selectUserListVo += ` AND (u.dept_id = ${mysql.escape(params.phonenumber)} OR u.dept_id IN ( SELECT t.dept_id FROM sys_dept t WHERE FIND_IN_SET (${mysql.escape(params.phonenumber)},ancestors) ))`
            }
            return dataScopeFilter(selectUserListVo) //数据范围过滤
        },
        /**
         * 
         * @param {{roleId:number,loginName?:string,phonenumber?:string}} params 
         * @returns
         */
        selectAllocatedList(params) {
            let selectUserListVo = `
            select distinct u.user_id, u.dept_id, u.login_name, u.user_name, u.user_type, u.email, u.avatar, u.phonenumber, u.status, u.create_time
            from sys_user u
                left join sys_dept d on u.dept_id = d.dept_id
                left join sys_user_role ur on u.user_id = ur.user_id
                left join sys_role r on r.role_id = ur.role_id
            where u.del_flag = '0' and (r.role_id != ${mysql.escape(params.roleId)} or r.role_id IS NULL)
            and u.user_id not in (select u.user_id from sys_user u inner join sys_user_role ur on u.user_id = ur.user_id and ur.role_id = ${mysql.escape(params.roleId)})`;
            if (params.loginName) {
                selectUserListVo += ` AND u.login_name like concat('%', ${mysql.escape(params.loginName)}, '%')`;
            }
            if (params.phonenumber) {
                selectUserListVo += ` AND u.phonenumber like concat('%', ${mysql.escape(params.phonenumber)}, '%')`;
            }
            return dataScopeFilter(selectUserListVo) //数据范围过滤
        },
        /**
         * 
         * @param {{userId:number,deptId?:number,loginName?:String,
         * userName?:String,userType?:String,phonenumber?:String,sex?:String,
         * avatar?:String,password?:String,salt?:String,status:number,loginIp?:String,loginDate?:String,pwdUpdateDate?:String,
         * updateBy?:String,remark?:String}} params 
         * @returns
         */
        updateUser(params) {
            let sql = 'update sys_user ';
            const paramsObj = {
                userId: 'user_id',
                deptId: 'dept_id',
                loginName: 'login_name',
                userName: 'user_name',
                userType: 'user_type',
                phonenumber: 'phonenumber',
                sex: 'sex',
                avatar: 'avatar',
                password: 'password',
                salt: 'salt',
                status: 'status',
                loginIp: 'login_ip',
                loginDate: 'login_date',
                pwdUpdateDate: 'pwd_update_date',
                updateBy: 'update_by',
                remark: 'remark'
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql += `${paramsObj[i]} = ?, `;
                    paramsList.push(params[i]);
                }
            }
            paramsList.push(params.userId)
            sql += 'update_time = sysdate() where user_id = ?';
            return mysql.format(sql, paramsList)
        },
        /**
         * 
         * @param {{userId:number,deptId?:number,loginName?:String,
         * userName?:String,userType?:String,phonenumber?:String,sex?:String,
         * avatar?:String,password?:String,salt?:String,status:number,loginIp?:String,loginDate?:String,pwdUpdateDate?:String,
         * createBy?:String,remark?:String}} params 
         * @returns
         */
        insertRole(params) {
            let sql_role = '';
            let sql_values = '';
            const paramsObj = {
                userId: 'user_id',
                deptId: 'dept_id',
                loginName: 'login_name',
                userName: 'user_name',
                userType: 'user_type',
                phonenumber: 'phonenumber',
                sex: 'sex',
                avatar: 'avatar',
                password: 'password',
                salt: 'salt',
                status: 'status',
                loginIp: 'login_ip',
                loginDate: 'login_date',
                pwdUpdateDate: 'pwd_update_date',
                createBy: 'create_by',
                remark: 'remark'
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql_role += `${paramsObj[i]}, `;
                    sql_values += `?, `
                    paramsList.push(params[i]);
                }
            }
            return mysql.format(`insert into sys_user(${sql_role}create_time)values(${sql_values}sysdate())`, paramsList);
        },
        /**
         * 
         * @param {[sessionId:string]} params sessionId
         * @returns 
         */
        selectOnlineById(params) {
            return mysql.format(`${this.selectOnlineVo} where sessionId = ?`, params);
        },
        /**
         * 
         * @param {{sessionId:string,loginName:string,deptName:string,
         * ipaddr:string,loginLocation:string,browser:string,os:string,
         * status:string,startTimestamp:string,lastAccessTime:string,expireTime:string,}} params 
         * @returns 
         */
        saveOnline(params) {
            let sql = `
            replace into sys_user_online(sessionId, login_name, dept_name, ipaddr, login_location, browser, os, status, start_timestamp, last_access_time, expire_time)
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            return mysql.format(sql, Object.values(params));
        },
        /**
         * 
         * @param {[sessionId:string]} params sessionId
         * @returns 
         */
        deleteOnlineById(params) {
            return mysql.format(`delete from sys_user_online where sessionId = ?`, params);
        },
        /**
         * 
         * @param {{ipaddr?:string,loginName?:string}} params 
         * @returns
         */
        selectUserOnlineList(params) {
            let sql = this.selectOnlineVo;
            if (params.ipaddr || params.loginName) {
                sql += ' where';
            }
            if (params.ipaddr) {
                sql += ` AND ipaddr like concat('%', ?, '%')`;
            }
            if (params.loginName) {
                sql += ` AND login_name like concat('%', ?, '%')`;
            }
            return mysql.format(sql, Object.values(params));
        },
        /**
         * 
         * @param {[lastAccessTime:string]} params lastAccessTime
         * @returns 
         */
        selectOnlineByExpired(params) {
            return mysql.format(`${this.selectOnlineVo} o WHERE o.last_access_time <![CDATA[ <= ]]> ? ORDER BY o.last_access_time ASC`, params);
        },
        /**
         * 
         * @param {[userId:number]} params userId
         * @returns 
         */
        deleteUserPostByUserId(params) {
            return mysql.format(`delete from sys_user_post where user_id=?`, params);
        },
        /**
         * 
         * @param {[postId:number]} params postId
         * @returns 
         */
        countUserPostById(params) {
            return mysql.format(`select count(1) from sys_user_post where post_id=?`, params);
        },
        /**
         * 
         * @param {Array<number>} params userId
         * @returns 
         */
        deleteUserPost(params) {
            return mysql.format(`delete from sys_user_post where user_id in (?)`, [params.toString()]);
        },
        /**
         * 
         * @param {[userId:number,postId:string]} params userId postId
         * @returns 
         */
        batchUserPost(params) {
            return mysql.format(`insert into sys_user_post(user_id, post_id) values (?,?)`, params);
        },
        /**
         * 
         * @param {[userId:number]} params userId
         * @returns 
         */
        selectUserRoleByUserId(params) {
            return mysql.format(`select user_id, role_id from sys_user_role where user_id =?`, params);
        },
        /**
         * 
         * @param {[userId:number]} params userId
         * @returns 
         */
        deleteUserRoleByUserId(params) {
            return mysql.format(`delete from sys_user_role where user_id = ?`, params);
        },
        /**
         * 
         * @param {[roleId:number]} params roleId
         * @returns 
         */
        countUserRoleByRoleId(params) {
            return mysql.format(`select count(1) from sys_user_role where role_id = ?`, params);
        },
        /**
         * 
         * @param {Array<number>} params userId
         * @returns 
         */
        deleteUserRole(params) {
            return mysql.format(`delete from sys_user_role where user_id in (?)`, [params.toString()]);
        },
        /**
         * 
         * @param {[userId:number,roleId:string]} params userId roleId
         * @returns 
         */
        batchUserRole(params) {
            return mysql.format(`insert into sys_user_role(user_id, role_id) values (?,?)`, params);
        },
        /**
         * 
         * @param {[userId:number,roleId:number]} params userId roleId
         * @returns 
         */
        deleteUserRoleInfo(params) {
            return mysql.format(`delete from sys_user_role where user_id=? and role_id=?`, params);
        },
        /**
         * 
         * @param {{roleId:number,userId:Array<number>}} params userId
         * @returns 
         */
        deleteUserRoleInfos(params) {
            return mysql.format(`delete from sys_user_role where role_id=${mysql.escape(params.roleId)} and user_id in (${params.userId.toString()})`, []);
        },
    },
    sys_dept: {
        selectDeptVo: `
        select d.dept_id, d.parent_id, d.ancestors, d.dept_name, d.order_num, d.leader, d.phone, d.email, d.status, d.del_flag, d.create_by, d.create_time 
        from sys_dept d`,
        /**
         * 
         * @param {[deptId:number]} params dept_id
         * @returns 
         */
        checkDeptExistUser(params) {
            return mysql.format(`select count(1) from sys_user where dept_id = ? and del_flag = '0'`, params)
        },
        /**
         * 
         * @param {[roleId:number]} params 
         * @returns 
         */
        selectRoleDeptTree(params) {
            return mysql.format(`select concat(d.dept_id, d.dept_name) as dept_name
            from sys_dept d
                left join sys_role_dept rd on d.dept_id = rd.dept_id
            where d.del_flag = '0' and rd.role_id = ?
            order by d.parent_id, d.order_num`, params)
        },
        /**
         * 
         * @param {{deptId?:number,parentId?:number,deptName?:string,status?:string}} params 
         * @returns 
         */
        selectDeptList(params) {
            let sql = `${this.selectDeptVo} where d.del_flag = '0'`
            if (params.deptId) {
                sql += ` AND dept_id = ${mysql.escape(params.deptId)}`;
            }
            if (params.parentId) {
                sql += ` AND parent_id = ${mysql.escape(params.parentId)}`;
            }
            if (params.deptName) {
                sql += ` AND dept_name like concat('%', ${mysql.escape(params.deptName)}, '%')`;
            }
            if (params.status) {
                sql += `AND status = ${mysql.escape(params.status)}`;
            }
            return dataScopeFilter(sql) + ' order by d.parent_id, d.order_num';
        },
        /**
         * 
         * @param {[deptId?:number,parentId?:number]} params 
         * @returns 
         */
        selectDeptCount(params) {
            let sql = `select count(1) from sys_dept
            where del_flag = '0'`;
            let paramsList = [];
            if (params.deptId) {
                sql += ` and dept_id = ?`;
                paramsList.push(params.deptId);
            }
            if (params.parentId) {
                sql += ` and parent_id = ?`;
                paramsList.push(params.parentId);
            }
            return mysql.format(sql, paramsList);
        },
        /**
         * 
         * @param {[deptName:string,parentId:number]} params 
         * @returns 
         */
        checkDeptNameUnique(params) {
            return mysql.format(`${this.selectDeptVo} where dept_name=? and parent_id = ? and del_flag = '0' limit 1`, params);
        },
        /**
         * 
         * @param {[deptId:number]} params 
         * @returns 
         */
        selectDeptById(params) {
            return mysql.format(`select d.dept_id, d.parent_id, d.ancestors, d.dept_name, d.order_num, d.leader, d.phone, d.email, d.status,
			(select dept_name from sys_dept where dept_id = d.parent_id) parent_name
		from sys_dept d
		where d.dept_id = ?`, params);
        },
        /**
         * 
         * @param {[deptId:number]} params 
         * @returns 
         */
        selectNormalChildrenDeptById(params) {
            return mysql.format(`select count(*) from sys_dept where status = 0 and del_flag = '0' and find_in_set(?, ancestors)`, params);
        },
        /**
         * 
         * @param {{deptId?:number,parentId?:number,deptName?:String,ancestors?:String,orderNum?:number,leader?:String,phone?:String,email?:String,status?:String,createBy?:String}} params 
         * @returns
         */
        insertDept(params) {
            let sql_role = '';
            let sql_values = '';
            const paramsObj = {
                deptId: 'dept_id',
                parentId: 'parent_id',
                deptName: 'dept_name',
                ancestors: 'ancestors',
                orderNum: 'order_num',
                leader: 'leader',
                phone: 'phone',
                email: 'email',
                status: 'status',
                createBy: 'create_by',
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql_role += `${paramsObj[i]}, `;
                    sql_values += `?, `
                    paramsList.push(params[i]);
                }
            }
            return mysql.format(`insert into sys_dept(${sql_role}create_time)values(${sql_values}sysdate())`, paramsList);
        },
        /**
         * 
         * @param {{deptId:number,parentId?:number,deptName?:String,ancestors?:String,orderNum?:number,leader?:String,phone?:String,email?:String,status?:String,updateBy?:String}} params 
         * @returns
         */
        updateDept(params) {
            let sql = 'update sys_dept ';
            const paramsObj = {
                deptId: 'dept_id',
                parentId: 'parent_id',
                deptName: 'dept_name',
                ancestors: 'ancestors',
                orderNum: 'order_num',
                leader: 'leader',
                phone: 'phone',
                email: 'email',
                status: 'status',
                updateBy: 'update_by',
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql += `${paramsObj[i]} = ?, `;
                    paramsList.push(params[i]);
                }
            }
            paramsList.push(params.deptId)
            sql += 'update_time = sysdate() where dept_id = ?';
            return mysql.format(sql, paramsList)
        },
        /**
         * 
         * @param {{deptId:number,ancestors:string,deptId:Array<number>}} params 
         * @returns 
         */
        updateDeptChildren(params) {
            return mysql.format(`update sys_dept set ancestors = when ${mysql.escape(params.deptId)} then ${mysql.escape(params.ancestors)} where dept_id in (${mysql.escape(params.deptId.toString())})`, [])
        },
        /**
         * 
         * @param {[deptId:number]} params deptId
         * @returns 
         */
        deleteDeptById(params) {
            return mysql.format(`update sys_dept set del_flag = '2' where dept_id = ?`, params)
        },
        /**
         * 
         * @param {Array<number>} params deptId
         * @returns 
         */
        updateDeptStatusNormal(params) {
            return mysql.format(`update sys_dept set status = '0' where dept_id in (?)`, [params.toString()])
        }
    },
    sys_post: {
        selectPostVo: `
        select post_id, post_code, post_name, post_sort, status, create_by, create_time, remark 
		from sys_post`,
        /**
         * 
         * @param {Array<Bigint>} params userId
         * @returns 
         */
        selectPostsByUserId(params) {
            return mysql.format(`SELECT p.post_id, p.post_name, p.post_code
            FROM sys_user u
                 LEFT JOIN sys_user_post up ON u.user_id = up.user_id
                 LEFT JOIN sys_post p ON up.post_id = p.post_id
            WHERE up.user_id = ?`, params)
        },
        /**
         * 
         * @param {{postCode?:String,status?:String,postName?:String}} params
         * @returns 
         */
        selectPostList(params) {
            let sql = this.selectPostVo + ' where';
            let paramsList = [];
            if (params.postCode) {
                sql += ` AND post_code like concat('%', ?, '%')`;
                paramsList.push(params.postCode);
            }
            if (params.status) {
                sql += ` AND status = ?`;
                paramsList.push(params.status);
            }
            if (params.postName) {
                sql += ` AND post_name like concat('%', ?, '%')`;
                paramsList.push(params.postName);
            }
            return mysql.format(sql, paramsList)
        },
        selectPostAll() {
            return mysql.format(this.selectPostVo, [])
        },
        /**
         * 
         * @param {[postId:number]} params postId
         * @returns 
         */
        selectPostById(params) {
            return mysql.format(`${this.selectPostVo} where post_id = ?`, params)
        },
        /**
         * 
         * @param {[postName:string]} params postName
         * @returns 
         */
        checkPostNameUnique(params) {
            return mysql.format(`${this.selectPostVo} where post_name=? limit 1`, params)
        },
        /**
         * 
         * @param {[postCode:string]} params postCode
         * @returns 
         */
        checkPostCodeUnique(params) {
            return mysql.format(`${this.selectPostVo} where post_code=? limit 1`, params)
        },
        /**
         * 
         * @param {Array<number>} params postId
         * @returns 
         */
        deletePostByIds(params) {
            return mysql.format(`delete from sys_post where post_id in (?)`, [params.toString()])
        },
        /**
         * 
         * @param {{postCode?:String,postName?:String,postSort?:String,status?:String,remark?:String,updateBy?:String,postId:number}} params 
         * @returns
         */
        updatePost(params) {
            let sql = 'update sys_post ';
            const paramsObj = {
                postCode: 'post_code',
                postName: 'post_name',
                postSort: 'post_sort',
                status: 'status',
                remark: 'remark',
                updateBy: 'update_by',
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql += `${paramsObj[i]} = ?, `;
                    paramsList.push(params[i]);
                }
            }
            paramsList.push(params.postId)
            sql += 'update_time = sysdate() where post_id = ?';
            return mysql.format(sql, paramsList)
        },
        /**
         * 
         * @param {{roleName?:String,roleKey?:String,roleSort?:String,dataScope?:String,status?:String,remark?:String,updateBy?:String,roleId?:number}} params 
         * @returns
         */
        insertRole(params) {
            let sql_role = '';
            let sql_values = '';
            const paramsObj = {
                postId: 'post_id',
                postCode: 'post_code',
                postName: 'post_name',
                postSort: 'post_sort',
                status: 'status',
                remark: 'remark',
                createBy: 'create_by',
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql_role += `${paramsObj[i]}, `;
                    sql_values += `?, `
                    paramsList.push(params[i]);
                }
            }
            return mysql.format(`insert into sys_role(${sql_role}create_time)values(${sql_values}sysdate())`, paramsList);
        }
    },
    sys_role: {
        selectRoleContactVo: `
        select distinct r.role_id, r.role_name, r.role_key, r.role_sort, r.data_scope,
            r.status, r.del_flag, r.create_time, r.remark 
        from sys_role r
            left join sys_user_role ur on ur.role_id = r.role_id
            left join sys_user u on u.user_id = ur.user_id
            left join sys_dept d on u.dept_id = d.dept_id`,
        selectRoleVo: `
        select r.role_id, r.role_name, r.role_key, r.role_sort, r.data_scope, r.status, r.del_flag, r.create_time, r.remark 
        from sys_role r
        `,
        /**
         * 
         * @param {*} params 
         */
        selectRoleList(params) {
            return mysql.format(`${this.selectRoleContactVo} where r.del_flag = '0'`, params)
        },
        /**
         * 
         * @param {[userId:number]} params userId
         * @returns 
         */
        selectRolesByUserId(params) {
            return mysql.format(`${this.selectRoleContactVo} WHERE r.del_flag = '0' and ur.user_id = ?`, params)
        },
        /**
         * 
         * @param {[roleId:number]} params roleId
         * @returns 
         */
        selectRoleById(params) {
            return mysql.format(`${this.selectRoleVo} where r.del_flag = '0' and r.role_id = ?`, params)
        },
        /**
         * 
         * @param {[roleName:string]} params roleName
         * @returns 
         */
        checkRoleNameUnique(params) {
            return mysql.format(`${this.selectRoleVo} where r.role_name=? and r.del_flag = '0' limit 1`, params)
        },
        /**
         * 
         * @param {[roleKey:string]} params roleKey
         * @returns 
         */
        checkRoleKeyUnique(params) {
            return mysql.format(`${this.selectRoleVo} where r.role_key=? and r.del_flag = '0' limit 1`, params)
        },
        /**
         * 
         * @param {[roleId:number]} params roleId
         * @returns 
         */
        deleteRoleById(params) {
            return mysql.format(`update sys_role set del_flag = '2' where role_id = ?`, params)
        },
        /**
         * 
         * @param {Array<Number>} params roleId
         * @returns
         */
        deleteRoleByIds(params) {
            return mysql.format(`update sys_role set del_flag = '2' where role_id in (?)`, [params.toString()])
        },
        /**
         * 
         * @param {{roleName?:String,roleKey?:String,roleSort?:String,dataScope?:String,status?:String,remark?:String,updateBy?:String,roleId:number}} params 
         * @returns
         */
        updateRole(params) {
            let sql = 'update sys_role ';
            const paramsObj = {
                roleName: 'role_name',
                roleKey: 'role_key',
                roleSort: 'role_sort',
                dataScope: 'data_scope',
                status: 'status',
                remark: 'remark',
                updateBy: 'update_by',
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql += `${paramsObj[i]} = ?, `;
                    paramsList.push(params[i]);
                }
            }
            paramsList.push(params.roleId)
            sql += 'update_time = sysdate() where role_id = ?';
            return mysql.format(sql, paramsList)
        },
        /**
         * 
         * @param {{roleName?:String,roleKey?:String,roleSort?:String,dataScope?:String,status?:String,remark?:String,updateBy?:String,roleId?:number}} params 
         * @returns
         */
        insertRole(params) {
            let sql_role = '';
            let sql_values = '';
            const paramsObj = {
                roleId: 'role_id',
                roleName: 'role_name',
                roleKey: 'role_key',
                roleSort: 'role_sort',
                dataScope: 'data_scope',
                status: 'status',
                remark: 'remark',
                createBy: 'create_by',
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql_role += `${paramsObj[i]}, `;
                    sql_values += `?, `
                    paramsList.push(params[i]);
                }
            }
            return mysql.format(`insert into sys_role(${sql_role}create_time)values(${sql_values}sysdate())`, paramsList);
        },
        /**
         * 
         * @param {[roleId:number]} params roleId
         * @returns
         */
        deleteRoleMenuByRoleId(params) {
            return mysql.format(`delete from sys_role_menu where role_id=?`, params);
        },
        /**
         * 
         * @param {[menuId:number]} params menuId
         * @returns
         */
        selectCountRoleMenuByMenuId(params) {
            return mysql.format(`select count(1) from sys_role_menu where menu_id=?`, params);
        },
        /**
         * 
         * @param {Array<number>} params roleId
         * @returns
         */
        deleteRoleMenu(params) {
            return mysql.format(`delete from sys_role_menu where role_id in (?)`, [params.toString()]);
        },
        /**
         * 
         * @param {[roleId:number,menuId:number]} params roleId,menuId
         * @returns
         */
        batchRoleMenu(params) {
            return mysql.format(`insert into sys_role_menu(role_id, menu_id) values (?,?)`, params);
        },
        /**
         * 
         * @param {[roleId:number]} params roleId
         * @returns
         */
        deleteRoleDeptByRoleId(params) {
            return mysql.format(`delete from sys_role_dept where role_id=?`, params);
        },
        /**
         * 
         * @param {[deptId:number]} params deptId
         * @returns
         */
        selectCountRoleDeptByDeptId(params) {
            return mysql.format(`select count(1) from sys_role_dept where dept_id=?`, params);
        },
        /**
         * 
         * @param {Array<number>} params roleId
         * @returns
         */
        deleteRoleDept(params) {
            return mysql.format(`delete from sys_role_dept where role_id in (?)`, [params.toString()]);
        },
        /**
         * 
         * @param {[roleId:number,deptId:number]} params roleId,deptId
         * @returns
         */
        batchRoleDept(params) {
            return mysql.format(`insert into sys_role_dept(role_id, dept_id) values (?,?)`, params);
        }
    },
    sys_oper: {
        selectOperLogVo: `
        select oper_id, title, business_type, method, request_method, operator_type, oper_name, dept_name, oper_url, oper_ip, oper_location, oper_param, json_result, status, error_msg, oper_time, cost_time
        from sys_oper_log`,
        /**
         * 
         * @param {{title:string,businessType:string,method:string,requestMethod:string,operatorType:string,operName:string,
         * deptName:string,operUrl:string,operIp:string,operLocation:string,operParam:string,jsonResult:string,
         * status:string,errorMsg:string,costTime:string,}} params 
         * @returns 
         */
        insertOperlog(params) {
            return mysql.format(`insert into sys_oper_log(title, business_type, method, request_method, operator_type, oper_name, dept_name, oper_url, oper_ip, oper_location, oper_param, json_result, status, error_msg, cost_time, oper_time)
            values (${mysql.escape(params.title)}, ${mysql.escape(params.businessType)}, ${mysql.escape(params.method)}, ${mysql.escape(params.requestMethod)}, ${mysql.escape(params.operatorType)}, ${mysql.escape(params.operName)}, ${mysql.escape(params.deptName)}, ${mysql.escape(params.operUrl)}, ${mysql.escape(params.operIp)}, ${mysql.escape(params.operLocation)}, ${mysql.escape(params.operParam)}, ${mysql.escape(params.jsonResult)}, ${mysql.escape(params.status)}, ${mysql.escape(params.errorMsg)}, ${mysql.escape(params.costTime)}, sysdate())`, params)
        },
        /**
         * 
         * @param {{operIp?:number,title?:string,businessType?:string,businessTypes?:Array<string>,status?:string,operName?:string,beginTime?:string,endTime?:string}} params 
         * @returns 
         */
        selectOperLogList(params) {
            let sql = this.selectOperLogVo;
            if (Object.keys(params).length > 0) {
                sql += ' where'
            }
            if (params.operIp) {
                sql += ` AND oper_ip like concat('%', ${mysql.escape(params.operIp)}, '%')`
            }
            if (params.title) {
                sql += ` AND title like concat('%', ${mysql.escape(params.title)}, '%')`
            }
            if (params.businessType) {
                sql += ` AND business_type =${mysql.escape(params.businessType)}`
            }
            if (params.businessTypes) {
                sql += ` AND business_type in (${mysql.escape(params.businessTypes.toString())})`
            }
            if (params.status) {
                sql += ` AND status = ${mysql.escape(params.status)}`
            }
            if (params.operName) {
                sql += ` AND oper_name like concat('%', ${mysql.escape(params.operName)}, '%')`
            }
            if (params.beginTime) {
                sql += ` AND oper_time &gt;= ${mysql.escape(params.beginTime)}`
            }
            if (params.endTime) {
                sql += ` AND oper_time &lt;= ${mysql.escape(params.endTime)}`
            }
            return mysql.format(sql, [])
        },
        /**
         * 
         * @param {Array<number>} params operId
         * @returns 
         */
        deleteOperLogByIds(params) {
            return mysql.format(`delete from sys_oper_log where oper_id in (?)`, [params.toString()])
        },
        /**
         * 
         * @param {[operId:number]} params operId
         * @returns 
         */
        selectOperLogById(params) {
            return mysql.format(`${this.selectOperLogVo} where oper_id = ?`, params)
        },
        cleanOperLog() {
            return mysql.format(`truncate table sys_oper_log`, [])
        }
    },
    sys_notice: {
        selectNoticeVo: `
        select notice_id, notice_title, notice_type, notice_content, status, create_by, create_time, update_by, update_time, remark 
		from sys_notice`,
        /**
         * 
         * @param {[noticeId:number]} params noticeId
         * @returns 
         */
        selectNoticeById(params) {
            return mysql.format(`${this.selectNoticeVo} where notice_id = ?`, params)
        },
        /**
         * 
         * @param {{noticeTitle?:string,noticeType?:string,createBy?:string}} params 
         * @returns 
         */
        selectNoticeList(params) {
            let sql = this.selectNoticeVo;
            if (Object.keys(params).length > 0) {
                sql += ' where'
            }
            if (params.noticeTitle) {
                sql += ` AND notice_title like concat('%', ${mysql.escape(params.noticeTitle)}, '%')`
            }
            if (params.noticeType) {
                sql += ` AND notice_type = ${mysql.escape(params.noticeType)}`
            }
            if (params.createBy) {
                sql += ` AND create_by like concat('%', ${mysql.escape(params.createBy)}, '%')`
            }
            return mysql.format(sql, [])
        },
        /**
         * 
         * @param {{noticeTitle?:String,noticeType?:String,noticeContent?:String,status?:String,remark?:String,createBy?:Stringr}} params 
         * @returns
         */
        insertNotice(params) {
            let sql_role = '';
            let sql_values = '';
            const paramsObj = {
                noticeTitle: 'notice_title',
                noticeType: 'notice_type',
                noticeContent: 'notice_content',
                status: 'status',
                remark: 'remark',
                createBy: 'create_by'
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql_role += `${paramsObj[i]}, `;
                    sql_values += `?, `
                    paramsList.push(params[i]);
                }
            }
            return mysql.format(`insert into sys_notice(${sql_role}create_time)values(${sql_values}sysdate())`, paramsList);
        },
        /**
         * 
         * @param {{noticeId:number,noticeTitle?:string,noticeType?:string,noticeContent?:string,status?:string,updateBy?:string}} params 
         * @returns 
         */
        updateNotice(params) {
            let sql = `update sys_notice set`;
            if (params.noticeTitle) {
                sql += ` notice_title = ${mysql.escape(params.noticeTitle)},`
            }
            if (params.noticeType) {
                sql += ` notice_type = ${mysql.escape(params.noticeType)},`
            }
            if (params.noticeContent) {
                sql += ` notice_content = ${mysql.escape(params.noticeContent)},`
            }
            if (params.status) {
                sql += ` status = ${mysql.escape(params.status)},`
            }
            if (params.updateBy) {
                sql += ` update_by = ${mysql.escape(params.updateBy)},`
            }
            sql += `update_time = sysdate() where notice_id = ${mysql.escape(params.noticeId)}`
            return mysql.format(sql, [])
        },
        /**
         * 
         * @param {Array<number>} params noticeId
         * @returns 
         */
        deleteNoticeByIds(params) {
            return mysql.format(`delete from sys_notice where notice_id in (?)`, [params.toString()])
        }
    },
    sys_menu: {
        selectMenuVo: `
        select menu_id, menu_name, parent_id, order_num, url, target, menu_type, visible, is_refresh, ifnull(perms,'') as perms, icon, create_by, create_time 
		from sys_menu`,
        /**
         * 
         * @param {[userId:number]} params userId
         * @returns 
         */
        selectMenusByUserId(params) {
            return mysql.format(`select distinct m.menu_id, m.parent_id, m.menu_name, m.url, m.visible, m.is_refresh, ifnull(m.perms,'') as perms, m.target, m.menu_type, m.icon, m.order_num, m.create_time
            from sys_menu m
                 left join sys_role_menu rm on m.menu_id = rm.menu_id
                 left join sys_user_role ur on rm.role_id = ur.role_id
                 LEFT JOIN sys_role ro on ur.role_id = ro.role_id
            where ur.user_id = ? and m.menu_type in ('M', 'C') and m.visible = 0  AND ro.status = 0
            order by m.parent_id, m.order_num`, params)
        },
        selectMenuNormalAll() {
            return mysql.format(`select distinct m.menu_id, m.parent_id, m.menu_name, m.url, m.visible, m.is_refresh, ifnull(m.perms,'') as perms, m.target, m.menu_type, m.icon, m.order_num, m.create_time
            from sys_menu m
            where m.menu_type in ('M', 'C') and m.visible = 0
            order by m.parent_id, m.order_num`, [])
        },
        selectMenuAll() {
            return mysql.format(`${this.selectMenuVo} order by parent_id, order_num`, [])
        },
        /**
         * 
         * @param {[userId:number]} params userId
         * @returns 
         */
        selectMenuAllByUserId(params) {
            return mysql.format(`select distinct m.menu_id, m.parent_id, m.menu_name, m.url, m.visible, m.is_refresh, ifnull(m.perms,'') as perms, m.target, m.menu_type, m.icon, m.order_num, m.create_time
            from sys_menu m
                 left join sys_role_menu rm on m.menu_id = rm.menu_id
                 left join sys_user_role ur on rm.role_id = ur.role_id
                 LEFT JOIN sys_role ro on ur.role_id = ro.role_id
            where ur.user_id = ?
            order by m.parent_id, m.order_num`, params)
        },
        /**
         * 
         * @param {[userId:number]} params userId
         * @returns 
         */
        selectPermsByUserId(params) {
            return mysql.format(`select distinct m.perms
            from sys_menu m
                 left join sys_role_menu rm on m.menu_id = rm.menu_id
                 left join sys_user_role ur on rm.role_id = ur.role_id
                 left join sys_role r on r.role_id = ur.role_id
            where m.visible = '0' and r.status = '0' and ur.user_id = ?`, params)
        },
        /**
         * 
         * @param {[roleId:number]} params roleId
         * @returns 
         */
        selectPermsByRoleId(params) {
            return mysql.format(`select distinct m.perms
            from sys_menu m
                 left join sys_role_menu rm on m.menu_id = rm.menu_id
            where m.visible = '0' and rm.role_id = ?`, params)
        },
        /**
         * 
         * @param {[roleId:number]} params roleId
         * @returns 
         */
        selectMenuTree(params) {
            return mysql.format(`select concat(m.menu_id, ifnull(m.perms,'')) as perms
            from sys_menu m
                left join sys_role_menu rm on m.menu_id = rm.menu_id
            where rm.role_id = ?
            order by m.parent_id, m.order_num`, params)
        },
        /**
         * 
         * @param {{menuName?:string,visible?:string}} params 
         * @returns 
         */
        selectMenuList(params) {
            let sql = this.selectMenuVo;
            if (Object.keys(params).length > 0) {
                sql += ` where`
            }
            if (params.menuName) {
                sql += ` AND menu_name like concat('%', ${mysql.escape(params.menuName)}, '%')`
            }
            if (params.visible) {
                sql += ` AND visible = ${mysql.escape(params.visible)}`
            }
            return mysql.format(`${sql} order by parent_id, order_num`, [])
        },
        /**
         * 
         * @param {{userId:number,menuName?:string,visible?:string}} params 
         */
        selectMenuListByUserId(params) {
            let sql = `select distinct m.menu_id, m.parent_id, m.menu_name, m.url, m.visible, m.is_refresh, ifnull(m.perms,'') as perms, m.target, m.menu_type, m.icon, m.order_num, m.create_time
                from sys_menu m
                left join sys_role_menu rm on m.menu_id = rm.menu_id
                left join sys_user_role ur on rm.role_id = ur.role_id
                LEFT JOIN sys_role ro on ur.role_id = ro.role_id
                where ur.user_id = ${mysql.escape(params.userId)}`
            if (params.menuName) {
                sql += ` AND m.menu_name like concat('%', ${mysql.escape(params.menuName)}, '%')`
            }
            if (params.visible) {
                sql += ` AND m.visible = ${mysql.escape(params.visible)}`
            }
            return mysql.format(`${sql} order by m.parent_id, m.order_num`, [])
        },
        /**
         * 
         * @param {{menuId:number}} params menuId
         * @returns 
         */
        deleteMenuById(params) {
            return mysql.format(`delete from sys_menu where menu_id =? or parent_id = ?`, [params.menuId, params.menuId])
        },
        /**
         * 
         * @param {[menuId:number]} params menuId
         * @returns 
         */
        selectMenuById(params) {
            return mysql.format(`SELECT t.menu_id, t.parent_id, t.menu_name, t.order_num, t.url, t.target, t.menu_type, t.visible, t.is_refresh, t.perms, t.icon, t.remark,
                (SELECT menu_name FROM sys_menu WHERE menu_id = t.parent_id) parent_name
            FROM sys_menu t
            where t.menu_id = ?`, params)
        },
        /**
         * 
         * @param {[menuId:number]} params menuId
         * @returns 
         */
        selectCountMenuByParentId(params) {
            return mysql.format(`select count(1) from sys_menu where parent_id=?`, params)
        },
        /**
         * 
         * @param {[menuName:string,parentId:number]} params menuName  parentId
         * @returns 
         */
        checkMenuNameUnique(params) {
            return mysql.format(`${this.selectMenuVo} where menu_name=? and parent_id = ? limit 1`, params)
        },
        /**
         * 
         * @param {{menuId:number,menuName?:String,parentId?:String,orderNum?:String,url?:String,target?:String,updateBy?:String,menuType?:number,
         * visible?:number,isRefresh?:number,perms?:number,icon?:number,remark?:number}} params 
         * @returns
         */
        updateMenu(params) {
            let sql = 'update sys_menu ';
            const paramsObj = {
                menuName: 'menu_name',
                parentId: 'parent_id',
                orderNum: 'order_num',
                url: 'url',
                target: 'target',
                menuType: 'menu_type',
                visible: 'visible',
                isRefresh: 'is_refresh',
                perms: 'perms',
                icon: 'icon',
                remark: 'remark',
                updateBy: 'update_by',
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql += `${paramsObj[i]} = ?, `;
                    paramsList.push(params[i]);
                }
            }
            paramsList.push(params.menuId)
            sql += 'update_time = sysdate() where menu_id = ?';
            return mysql.format(sql, paramsList)
        },
        /**
         * 
         * @param {{menuId:number,menuName?:String,parentId?:String,orderNum?:String,url?:String,target?:String,createBy?:String,menuType?:number,
         * visible?:number,isRefresh?:number,perms?:number,icon?:number,remark?:number}} params 
         * @returns
         */
        insertRole(params) {
            let sql_role = '';
            let sql_values = '';
            const paramsObj = {
                menuId: 'menu_id',
                menuName: 'menu_name',
                parentId: 'parent_id',
                orderNum: 'order_num',
                url: 'url',
                target: 'target',
                menuType: 'menu_type',
                visible: 'visible',
                isRefresh: 'is_refresh',
                perms: 'perms',
                icon: 'icon',
                remark: 'remark',
                createBy: 'create_by',
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql_role += `${paramsObj[i]}, `;
                    sql_values += `?, `
                    paramsList.push(params[i]);
                }
            }
            return mysql.format(`insert into sys_menu(${sql_role}create_time)values(${sql_values}sysdate())`, paramsList);
        }
    },
    sys_loginInfo: {
        /**
         * 
         * @param {{loginName:string,status:string,ipaddr:string,loginLocation:string,browser:string,os:string,msg:string}} params 
         * @returns 
         */
        insertLogininfor(params) {
            return mysql.format(`insert into sys_logininfor (login_name, status, ipaddr, login_location, browser, os, msg, login_time)
            values (${mysql.escape(params.loginName)}, ${mysql.escape(params.status)}, ${mysql.escape(params.ipaddr)}, ${mysql.escape(params.loginLocation)}, ${mysql.escape(params.browser)}, ${mysql.escape(params.os)}, ${mysql.escape(params.msg)}, sysdate())`, params)
        },
        /**
         * 
         * @param {{ipaddr?:string,status?:string,loginName?:string,beginTime?:string,endTime?:string}} params 
         * @returns 
         */
        selectLogininforList(params) {
            let sql = `select info_id,login_name,ipaddr,login_location,browser,os,status,msg,login_time from sys_logininfor`;
            if (Object.keys(params).length > 0) {
                sql += ' where'
            }
            if (params.ipaddr) {
                sql += ` AND ipaddr like concat('%', ${mysql.escape(params.ipaddr)}, '%')`
            }
            if (params.status) {
                sql += ` AND status = ${mysql.escape(params.ipaddr)}`
            }
            if (params.loginName) {
                sql += ` AND login_name like concat('%', ${mysql.escape(params.loginName)}, '%')`
            }
            if (params.beginTime) {
                sql += ` AND login_time &gt;= ${mysql.escape(params.beginTime)}`
            }
            if (params.endTime) {
                sql += ` AND login_time &gt;= ${mysql.escape(params.endTime)}`
            }
            return mysql.format(sql, [])
        },
        /**
         * 
         * @param {Array<number>} params infoId
         * @returns 
         */
        deleteLogininforByIds(params) {
            return mysql.format(`delete from sys_logininfor where info_id in (?)`, [params.toString()])
        },
        cleanLogininfor() {
            return mysql.format(`truncate table sys_logininfor`, [])
        }
    },
    sys_Dict: {
        selectDictTypeVo: `
        select dict_id, dict_name, dict_type, status, create_by, create_time, remark 
		from sys_dict_type`,
        selectDictDataVo: `
        select dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, remark 
		from sys_dict_data`,
        /**
         * 
         * @param {{dictName?:string,status?:string,dictType?:string,beginTime?:string,endTime?:string}} params 
         * @returns 
         */
        selectDictTypeList(params) {
            let sql = this.selectDictTypeVo;
            if (Object.keys(params).length > 0) {
                sql += ` where`
            }
            if (params.dictName) {
                sql += ` AND dict_name like concat('%', ${mysql.escape(params.dictName)}, '%')`
            }
            if (params.status) {
                sql += ` AND status = ${mysql.escape(params.status)}`
            }
            if (params.dictType) {
                sql += ` AND dict_type like concat('%', ${mysql.escape(params.dictType)}, '%')`
            }
            if (params.beginTime) {
                sql += ` and date_format(create_time,'%y%m%d') &gt;= date_format(${mysql.escape(params.beginTime)},'%y%m%d')`
            }
            if (params.endTime) {
                sql += ` and date_format(create_time,'%y%m%d') &lt;= date_format(${mysql.escape(params.endTime)},'%y%m%d')`
            }
            return mysql.format(sql, [])
        },
        selectDictTypeAll() {
            return mysql.format(this.selectDictTypeVo, [])
        },
        /**
         * 
         * @param {[dictId:number]} params dictId
         * @returns 
         */
        selectDictTypeById(params) {
            return mysql.format(`${this.selectDictTypeVo} where dict_id = ?`, params)
        },
        /**
         * 
         * @param {[dictType:number]} params dictType
         * @returns 
         */
        selectDictTypeByType(params) {
            return mysql.format(`${this.selectDictTypeVo} where dict_type = ?`, params)
        },
        /**
         * 
         * @param {[dictType:number]} params dictType
         * @returns 
         */
        checkDictTypeUnique(params) {
            return mysql.format(`${this.selectDictTypeVo} where dict_type = ? limit 1`, params)
        },
        /**
         * 
         * @param {[dictId:number]} params dictId
         * @returns 
         */
        deleteDictTypeById(params) {
            return mysql.format(`delete from sys_dict_type where dict_id = ?`, params)
        },
        /**
         * 
         * @param {Array<number>} params dictId
         * @returns 
         */
        deleteDictTypeByIds(params) {
            return mysql.format(`delete from sys_dict_type where dict_id in (?)`, [params.toString()])
        },
        /**
         * 
         * @param {{dictId:number,dictName?:String,dictType?:String,status?:String,remark?:String,updateBy?:String}} params 
         * @returns
         */
        updateDictType(params) {
            let sql = 'update sys_dict_type ';
            const paramsObj = {
                dictName: 'dict_name',
                dictType: 'dict_type',
                status: 'status',
                remark: 'remark',
                updateBy: 'update_by'
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql += `${paramsObj[i]} = ?, `;
                    paramsList.push(params[i]);
                }
            }
            paramsList.push(params.dictId)
            sql += 'update_time = sysdate() where dict_id = ?';
            return mysql.format(sql, paramsList)
        },
        /**
         * 
         * @param {{dictName?:String,dictType?:String,status?:String,remark?:String,createBy?:String}} params 
         * @returns
         */
        insertRole(params) {
            let sql_role = '';
            let sql_values = '';
            const paramsObj = {
                dictName: 'dict_name',
                dictType: 'dict_type',
                status: 'status',
                remark: 'remark',
                createBy: 'create_by'
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql_role += `${paramsObj[i]}, `;
                    sql_values += `?, `
                    paramsList.push(params[i]);
                }
            }
            return mysql.format(`insert into sys_dict_type(${sql_role}create_time)values(${sql_values}sysdate())`, paramsList);
        },
        /**
         * 
         * @param {{dictType?:string,dictLabel?:string,status?:string}} params 
         * @returns 
         */
        selectDictDataList(params) {
            let sql = this.selectDictDataVo;
            if (Object.keys(params).length > 0) {
                sql += ` where`
            }
            if (params.dictType) {
                sql += ` AND dict_type = ${mysql.escape(params.dictType)}`
            }
            if (params.dictLabel) {
                sql += ` AND dict_label like concat('%', ${mysql.escape(params.dictLabel)}, '%')`
            }
            if (params.status) {
                sql += ` AND status = ${mysql.escape(params.status)}`
            }
            return mysql.format(sql, [])
        },
        /**
         * 
         * @param {[dictType:string]} params dictType
         * @returns 
         */
        selectDictDataByType(params) {
            return mysql.format(`${this.selectDictDataVo} where status = '0' and dict_type = ? order by dict_sort asc`, params)
        },
        /**
         * 
         * @param {{dictValue:string}} params dictValue
         * @returns 
         */
        selectDictLabel(params) {
            return mysql.format(`select dict_label from sys_dict_data
		where dict_type = ? and dict_value =?`, [params.dictValue, params.dictValue])
        },
        /**
         * 
         * @param {[dictCode:string]} params dictCode
         * @returns 
         */
        selectDictDataByType(params) {
            return mysql.format(`${this.selectDictDataVo} where dict_code = ?`, params)
        },
        /**
         * 
         * @param {[dictType:string]} params dictType
         * @returns 
         */
        countDictDataByType(params) {
            return mysql.format(`select count(1) from sys_dict_data where dict_type=?`, params)
        },
        /**
         * 
         * @param {[dictCode:string]} params dictCode
         * @returns 
         */
        countDictDataByType(params) {
            return mysql.format(`delete from sys_dict_data where dict_code = ?`, params)
        },
        /**
         * 
         * @param {Array<string>} params dictCode
         * @returns 
         */
        deleteDictDataByIds(params) {
            return mysql.format(`delete from sys_dict_data where dict_code in (?)`, [params.toString()])
        },
        /**
         * 
         * @param {{dictCode:string,dictSort?:String,dictLabel?:String,dictValue?:String,cssClass?:String,listClass?:String,
         * isDefault?:String,status?:String,remark?:String,updateBy?:String}} params 
         * @returns
         */
        updateDictData(params) {
            let sql = 'update sys_dict_data ';
            const paramsObj = {
                dictSort: 'dict_sort',
                dictLabel: 'dict_label',
                dictValue: 'dict_value',
                dictType: 'dict_type',
                cssClass: 'css_class',
                listClass: 'list_class',
                isDefault: 'is_default',
                status: 'status',
                remark: 'remark',
                updateBy: 'update_by'
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql += `${paramsObj[i]} = ?, `;
                    paramsList.push(params[i]);
                }
            }
            paramsList.push(params.dictCode)
            sql += 'update_time = sysdate() where dict_code = ?';
            return mysql.format(sql, paramsList)
        },
        /**
         * 
         * @param {[newDictType:string,oldDictType:string]} params 
         * @returns 
         */
        updateDictDataType(params) {
            return mysql.format(`update sys_dict_data set dict_type = ? where dict_type = ?`, params)
        },
        /**
         * 
         * @param {{dictCode:number,dictSort?:String,dictLabel?:String,dictValue?:String,cssClass?:String,listClass?:String,
         * isDefault?:String,status?:String,remark?:String,updateBy?:String}} params 
         * @returns
         */
        insertDictData(params) {
            let sql_role = '';
            let sql_values = '';
            const paramsObj = {
                dictSort: 'dict_sort',
                dictLabel: 'dict_label',
                dictValue: 'dict_value',
                dictType: 'dict_type',
                cssClass: 'css_class',
                listClass: 'list_class',
                isDefault: 'is_default',
                status: 'status',
                remark: 'remark',
                createBy: 'create_by'
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql_role += `${paramsObj[i]}, `;
                    sql_values += `?, `
                    paramsList.push(params[i]);
                }
            }
            return mysql.format(`insert into sys_dict_data(${sql_role}create_time)values(${sql_values}sysdate())`, paramsList);
        }
    },
    sys_config: {
        selectConfigVo: `
        select config_id, config_name, config_key, config_value, config_type, create_by, create_time, update_by, update_time, remark 
		from sys_config`,
        /**
         * 
         * @param {{configId?:number,configKey?:string}} params 
         * @returns 
         */
        selectConfig(params) {
            let sql = this.selectConfigVo;
            if (Object.keys(params).length > 0) {
                sql += ` where`
            }
            if (params.configId) {
                sql += ` and config_id = ${mysql.escape(params.configId)}`
            }
            if (params.configKey) {
                sql += ` and config_key = ${mysql.escape(params.configKey)}`
            }
            return mysql.format(sql, [])
        },
        /**
         * 
         * @param {{configName?:string,configType?:string,configKey?:string,beginTime?:string,endTime?:string}} params 
         * @returns 
         */
        selectConfigList(params) {
            let sql = this.selectConfigVo;
            if (Object.keys(params).length > 0) {
                sql += ` where`
            }
            if (params.configName) {
                sql += ` AND config_name like concat('%', ${mysql.escape(params.configName)}, '%')`
            }
            if (params.configType) {
                sql += ` AND config_type = ${mysql.escape(params.configType)}`
            }
            if (params.configKey) {
                sql += ` AND config_key like concat('%', ${mysql.escape(params.configKey)}, '%')`
            }
            if (params.beginTime) {
                sql += ` and date_format(create_time,'%y%m%d') &gt;= date_format(${mysql.escape(params.beginTime)},'%y%m%d')`
            }
            if (params.endTime) {
                sql += ` and date_format(create_time,'%y%m%d') &lt;= date_format(${mysql.escape(params.endTime)},'%y%m%d')`
            }
            return mysql.format(sql, [])
        },
        /**
         * 
         * @param {[configId: number]} params configId
         * @returns 
         */
        selectConfigById(params) {
            return mysql.format(`${this.selectConfigVo} where config_id = ?`, params)
        },
        /**
         * 
         * @param {[configKey: string]} params configKey
         * @returns 
         */
        selectConfigById(params) {
            return mysql.format(`${this.selectConfigVo} where config_key = ? limit 1`, params)
        },
        /**
         * 
         * @param {{configName?:String,configKey?:String,configValue?:String,configType?:String,createBy?:String,
         * remark?:String}} params 
         * @returns
         */
        insertConfig(params) {
            let sql_role = '';
            let sql_values = '';
            const paramsObj = {
                configName: 'config_name',
                configKey: 'config_key',
                configValue: 'config_value',
                configType: 'config_type',
                createBy: 'create_by',
                remark: 'remark'
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql_role += `${paramsObj[i]}, `;
                    sql_values += `?, `
                    paramsList.push(params[i]);
                }
            }
            return mysql.format(`insert into sys_config(${sql_role}create_time)values(${sql_values}sysdate())`, paramsList);
        },
        /**
         * 
         * @param {{configName?:String,configKey?:String,configValue?:String,configType?:String,updateBy?:String,
         * remark?:String,configId:number}} params 
         * @returns
         */
        updateDictData(params) {
            let sql = 'update sys_config ';
            const paramsObj = {
                configName: 'config_name',
                configKey: 'config_key',
                configValue: 'config_value',
                configType: 'config_type',
                updateBy: 'update_by',
                remark: 'remark'
            }
            let paramsList = [];
            for (const i in paramsObj) {
                if (params[i]) {
                    sql += `${paramsObj[i]} = ?, `;
                    paramsList.push(params[i]);
                }
            }
            paramsList.push(params.configId)
            sql += 'update_time = sysdate() where config_id = ?';
            return mysql.format(sql, paramsList)
        },
        /**
         * 
         * @param {[configId:number]} params configId
         * @returns 
         */
        deleteConfigById(params) {
            return mysql.format(`delete from sys_config where config_id = ?`, params)
        },
        /**
         * 
         * @param {Array<number>} params configId
         * @returns 
         */
        deleteConfigByIds(params) {
            return mysql.format(`delete from sys_config where config_id in (?)`, [params.toString()])
        }
    }

}

module.exports = system