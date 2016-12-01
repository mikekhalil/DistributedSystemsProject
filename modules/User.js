'use strict';
class User {
    constructor(sock_id, user){
        this.sock_id = sock_id;
        this.user_id = user.id;
        this.group_ids = user.groups; 
    }

    getSock_id() {
    	return this.sock_id; 
    }
    getUser_id() {
    	return this.user_id; 
    }
    getGroup_ids() {
    	return this.group_ids;
    }
}


module.exports = User;