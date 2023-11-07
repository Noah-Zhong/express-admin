const mysql = require('mysql');
const DATA_SCOPE_ALL = "1";//全部数据权限
const DATA_SCOPE_CUSTOM = "2";//自定数据权限
const DATA_SCOPE_DEPT = "3";//部门数据权限
const DATA_SCOPE_DEPT_AND_CHILD = "4";//部门及以下数据权限
const DATA_SCOPE_SELF = "5";//仅本人数据权限
const DATA_SCOPE = "dataScope";//数据权限过滤关键字
/**
 * 
 * @param {*} user 用户
 * @param {*} deptAlias 部门别名
 * @param {*} userAlias 用户别名
 * @param {*} permission 权限字符
 */
function dataScopeFilter(user, deptAlias, userAlias, permission){
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
        /**
         * 
         * @param {Array<String>} params login_name
         * @returns 
         */
        selectUserByLoginName(params){
            return mysql.format(`${this.selectUserVo} where u.login_name = ? and u.del_flag = '0'`, params)
        },
        /**
         * 
         * @param {Array<String>} params phonenumber
         * @returns 
         */
        selectUserByPhoneNumber(params){
            return mysql.format(`${this.selectUserVo} where u.phonenumber = ? and u.del_flag = '0'`, params)
        },
        /**
         * 
         * @param {Array<String>} params email
         * @returns 
         */
        selectUserByEmail(params){
            return mysql.format(`${this.selectUserVo} where u.email = ? and u.del_flag = '0'`, params)
        },
        /**
         * 
         * @param {Array<BigInt>} params userId
         * @returns 
         */
        selectUserById(params){
            return mysql.format(`${this.selectUserVo} where u.user_id = ?`, params)
        },
        /**
         * 
         * @param {{userId?:String,loginName?:String,status?:String,phonenumber?:String,deptId?:BigInt}} params
         * @returns 
         */
        selectUserList(params){
            let selectUserListVo = `
            select u.user_id, u.dept_id, u.login_name, u.user_name, u.user_type, u.email, u.avatar, u.phonenumber, u.password, u.sex, u.salt, u.status, u.del_flag, u.login_ip, u.login_date, u.create_by, u.create_time, u.remark, d.dept_name, d.leader from sys_user u
            left join sys_dept d on u.dept_id = d.dept_id
            where u.del_flag = '0'`
            if(params.userId){
                selectUserListVo += ` AND u.user_id = ${mysql.escape(params.userId)}`
            }
            if(params.loginName){
                selectUserListVo += ` AND u.login_name like concat('%', ${mysql.escape(params.loginName)}, '%')`
            }
            if(params.status){
                selectUserListVo += ` AND u.status = ${mysql.escape(params.status)}`
            }
            if(params.phonenumber){
                selectUserListVo += ` AND u.phonenumber like concat('%', ${mysql.escape(params.phonenumber)}, '%')`
            }
            if(params.deptId){
                selectUserListVo += ` AND (u.dept_id = ${mysql.escape(params.phonenumber)} OR u.dept_id IN ( SELECT t.dept_id FROM sys_dept t WHERE FIND_IN_SET (${mysql.escape(params.phonenumber)},ancestors) ))`
            }
        }
    },
    sys_dept: {
        /**
         * 
         * @param {Array<Bigint>} params dept_id
         * @returns 
         */
        checkDeptExistUser(params){
            return mysql.format(`select count(1) from sys_user where dept_id = ? and del_flag = '0'`, params)
        },
    },
    sys_post: {
        /**
         * 
         * @param {Array<Bigint>} params userId
         * @returns 
         */
        selectPostsByUserId(params){
            return mysql.format(`SELECT p.post_id, p.post_name, p.post_code
            FROM sys_user u
                 LEFT JOIN sys_user_post up ON u.user_id = up.user_id
                 LEFT JOIN sys_post p ON up.post_id = p.post_id
            WHERE up.user_id = ?`, params)
        },
    },
    sys_role: {
        selectRoleContactVo: `
        select distinct r.role_id, r.role_name, r.role_key, r.role_sort, r.data_scope,
            r.status, r.del_flag, r.create_time, r.remark 
        from sys_role r
            left join sys_user_role ur on ur.role_id = r.role_id
            left join sys_user u on u.user_id = ur.user_id
            left join sys_dept d on u.dept_id = d.dept_id`,
        
        
        /**
         * 
         * @param {*} params 
         */
        selectRoleList(params){

        }
    }
    
}

module.exports = system