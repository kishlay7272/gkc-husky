const puppeteer = require('puppeteer');
const axios = require('axios');
const fetch = require("node-fetch");

const { Sequelize, QueryTypes } = require('sequelize');
module.exports = {

    get_connection: async function () {
        let sequelize = new Sequelize('mysql://root:p64266426@localhost:3306/mydb');
        try {
            await sequelize.authenticate();
            console.log('Connection has been established successfully.');
            return sequelize;
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }

    },

    refreshToken: async function (sequelize, branch_details_postmates) {
        // branch_details_grubhub = await this.get_branch(sequelize);
        for (let i = 0; i < branch_details_postmates.length; i++) {
            await this.create_update_cookie(branch_details_postmates[i], sequelize);
        }
    },

    create_update_cookie: async function create_update_token(branch_details, sequelize) {
        try {
            let email = branch_details.email + ":" + branch_details.password;
            let bufferObj = await Buffer.from(email, "utf8");
            let base64String = await bufferObj.toString("base64");
            let auth_header = "Basic" + " " + base64String;
            let token_response = await fetch("https://merchant.postmates.com/v1/login_merchant", {
                method: "post",
                headers: {
                    'authorization': auth_header,
                    'host': 'merchant.postmates.com',
                    'user-agent': 'MerchantAndroid 6.2.8 rv:60208 (device_model:SM-T510; system_os:Android; system_version:10; en_GB)'
                }
            })
            let data = await token_response.json();
            let api_key = data.api_key;
           let token= await this.get_token(api_key, branch_details);
            await this.store_token(token, branch_details,sequelize);
        }
        catch (e) {
            console.log(e);
        }
    },
    get_token:async function get_token(api_key, postmates) {
        let token_data = postmates.email + ":" + api_key;
        let bufferObj1 = await Buffer.from(token_data, "utf8");
        let base64String1 = await bufferObj1.toString("base64");
        let token = "Basic" + " " + base64String1;
        return token;
        // await authenticate();
        
        await get_orders(token, postmates);
    },
    store_token:async function store_token(token, branch_details,sequelize) {
        try {
            let branch_token = await sequelize.query('SELECT * from session  WHERE Branch_id="1"', { type: QueryTypes.SELECT });
                    if (branch_token.length == 0) {
                        await sequelize.query('INSERT IGNORE into session (token,platform_id,Branch_id) values(?,?,?)', { replacements: [token, branch_details.platform_id, branch_details.Branch_id], type: QueryTypes.INSERT });
                        return;
                    }
                    else {
                        await sequelize.query('UPDATE session SET token = ?  WHERE Branch_id="1"', { replacements: [token], type: QueryTypes.INSERT });
                        return;
                    }
        }
        catch (e) {
            console.log(e);
        }
    },
    getToken: async function getToken(sequelize, branch_details) {
        try {
            let branch_token = [];
            for (let i = 0; i < branch_details.length; i++) {
                let Branch_id = branch_details[i].Branch_id;
                let session = await sequelize.query('SELECT * FROM session  WHERE Branch_id=?', { replacements: [Branch_id], type: QueryTypes.SELECT });
                let branch_token_pair = { branch_id: Branch_id, token: session[0].token };
                branch_token.push(branch_token_pair);
            }
            return (branch_token);
        } catch (error) {
            console.log(error);
        }
    }
    

}







// async function authenticate() {

//     let todo = "email=vfactoryclintonst%40gkcfood.com&merchant_api_key=b97ebcdc-b1ac-43ad-a746-67f8ebd3946d&place_uuid=0fe69d0a-4e86-4d7d-bc71-e0ad71a0cfa5"

//     let authorize = await fetch("https://auth.postmates.com/authenticate", {
//         method: "post",
//         body: todo,
//         headers: {
//             'content-type': 'application/x-www-form-urlencoded',
//             'host': 'auth.postmates.com',
//             'user-agent': 'MerchantAndroid 6.2.8 rv:60208 (device_model:SM-T510; system_os:Android; system_version:10; en_GB)'
//         }
//     })
// }
// async function get_orders(token, postmates) {
//     try {
//         let url = "https://merchant.postmates.com/v1/merchant_places/" + postmates.place_uuid + "/jobs";
//         let order_details = await Order.find({ email: { $eq: postmates.username } });
//         let token = order_details[0]._doc.token;
//         let order_data = await fetch(url, {
//             method: "get",
//             headers: {
//                 'authorization': token,
//                 'host': 'merchant.postmates.com',
//                 'user-agent': 'MerchantAndroid 6.2.8 rv:60208 (device_model:SM-T510; system_os:Android; system_version:10; en_GB)'
//             }
//         })
//         let data = await order_data.json();
//         console.log(data);
//         let active_order_data = await data.jobs;
//         console.log(active_order_data.length);
//         await store_orders(active_order_data, token);
//     }
//     catch (e) {
//         console.log(e);
//     }

// }


// async function store_orders(active_order_data, token) {
//     try {
//         if (active_order_data.length > 0) {
//             for (let i = 0; i < active_order_data.length; i++) {
//                 await Order.updateOne(
//                     { token: token },
//                     active_order_data[i],
//                     { upsert: true })
//             }
//         }

//     }
//     catch (e) {
//         console.log(e);
//     }





// getToken: async function getToken(sequelize, branch_details) {
//     try {
//         let branch_token = [];
//         for (let i = 0; i < branch_details.length; i++) {
//             let Branch_id = branch_details[i].Branch_id;
//             let session = await sequelize.query('SELECT * FROM session  WHERE Branch_id=?', { replacements: [Branch_id], type: QueryTypes.SELECT });
//             let branch_token_pair = { branch_id: Branch_id, token: session[0].token };
//             branch_token.push(branch_token_pair);
//         }
//         console.log(branch_token);
//         return (branch_token);
//     } catch (error) {
//         console.log(error);
//     }
// }
// }