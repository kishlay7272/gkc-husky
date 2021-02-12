const puppeteer = require('puppeteer');
const axios = require('axios');
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

    refreshToken: async function (sequelize,branch_details_uber) {
        // branch_details_grubhub = await this.get_branch(sequelize);
        for (let i = 0; i < branch_details_uber.length; i++) {
            await this.create_update_cookie(branch_details_uber[i], sequelize);
        }
    },

    create_update_cookie: async function create_update_token(branch_details, sequelize) {
        let browser = await puppeteer.launch({ headless: true });
        let page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);

        let Branch_id = await branch_details.Branch_id;
        await page.goto('https://restaurant-dashboard.uber.com/');
        await page.waitForSelector("#useridInput")
        await page.type("#useridInput", branch_details.email);
        await page.click('.btn.btn--arrow.btn--full')
        await page.waitForNavigation({ timeout: 100000 });
        await page.waitForSelector("#password");
        await page.type("#password", branch_details.password);
        await page.click(".btn.btn--arrow.btn--full.push--top");
        await page.waitForNavigation({ timeout: 100000 });
        let cookies= await page.cookies();
        let cookie = cookies.map(item => `${item.name}=${item.value}`).join('; ');
        await browser.close();
        let branch_token = await sequelize.query('SELECT * from session  WHERE Branch_id="2220052"', { type: QueryTypes.SELECT });
        if (branch_token.length == 0) {
            await sequelize.query('INSERT IGNORE into session (cookie,platform_id,Branch_id) values(?,?,?)', { replacements: [cookie, branch_details.platform_id, branch_details.Branch_id], type: QueryTypes.INSERT });
           await browser.close();
            return;
        }
        else {
            await sequelize.query('UPDATE session SET cookie = ?  WHERE Branch_id=?', { replacements: [cookie,branch_details.Branch_id], type: QueryTypes.INSERT });
            await browser.close();
            return;
        }
        
    },

    getCookie:async function getToken(sequelize, branch_details) {
        try {
            let branch_cookie=[];
            for(let i=0;i<branch_details.length-1;i++){
            let Branch_id = branch_details[i].Branch_id;
            let session = await sequelize.query('SELECT * FROM session  WHERE Branch_id=?', { replacements: [Branch_id], type: QueryTypes.SELECT });
            let branch_token_pair={branch_id:Branch_id,cookies:session[0].cookie};
            branch_cookie.push(branch_token_pair);
            }
            console.log(branch_cookie);
            return (branch_cookie);
        } catch (error) {
            console.log(error);
        }
    }
}