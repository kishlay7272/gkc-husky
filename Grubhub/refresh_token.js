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

    refreshToken: async function (sequelize,branch_details_grubhub) {
        // branch_details_grubhub = await this.get_branch(sequelize);
        for (let i = 0; i < branch_details_grubhub.length; i++) {
            await this.create_update_token(branch_details_grubhub[i], sequelize);
        }
    },

    create_update_token: async function create_update_token(branch_details, sequelize) {
        let timestamp = new Date().getTime();
        let auth = 0;
        let browser = await puppeteer.launch({ headless: false });
        let page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);

         page.goto('https://restaurant.grubhub.com/login');
         await page.waitForNavigation({ timeout: 100000 });

        // await page.waitForSelector(".gfr-textfield-text__input");
        await page.type(".gfr-textfield-text__input", branch_details.email);
        // await page.waitForSelector('input[type="password"]', { visible: true });
        await page.type('input[type="password"]', branch_details.password)
        await page.click('[type="submit"]')
        await page.waitForNavigation();
        await page.setRequestInterception(true);
        await page.on('response', (async response => {
            auth2 = await response.request().headers()
            if (auth2.authorization && auth2.authorization != auth) {
                auth = auth2.authorization
                let token = auth;
                browser.close();
                // let values = token;

                let branch_token = await sequelize.query('SELECT * from session  WHERE Branch_id="2220052"', { type: QueryTypes.SELECT });
                if (branch_token.length == 0) {
                    await sequelize.query('INSERT IGNORE into session (token,platform_id,Branch_id) values(?,?,?)', { replacements: [token, branch_details.platform_id, branch_details.Branch_id], type: QueryTypes.INSERT });
                    await browser.close();
                    return;
                }
                else {
                    await sequelize.query('UPDATE session SET token = ?  WHERE Branch_id="2220052"', { replacements: [token], type: QueryTypes.INSERT });
                    await browser.close();
                    return;
                }
            }
        }));
       
    },

    getToken:async function getToken(sequelize, branch_details) {
        try {
            let branch_token=[];
            for(let i=0;i<branch_details.length;i++){
            let Branch_id = branch_details[i].Branch_id;
            let session = await sequelize.query('SELECT * FROM session  WHERE Branch_id=?', { replacements: [Branch_id], type: QueryTypes.SELECT });
            let branch_token_pair={branch_id:Branch_id,token:session[0].token};
            branch_token.push(branch_token_pair);
            }
            return (branch_token);
        } catch (error) {
            console.log(error);
        }
    }
}