
const branchDetailsGrubhub = require('./Grubhub/branch_details');
const branchDetailUber = require('./Uber_eats/branch_details');
const branchDetailPostmates = require('./Postmates/branch_details');

const DelaySecondsGrubhub = 300;
const DelaySecondsUber = 7200;
const DelaySecondspostmates = 14400;

const refreshTokenGrubhub = require('./Grubhub/refresh_token');
const refreshTokenUber = require('./Uber_eats/refresh_token');
const refreshTokenPostmates = require('./Postmates/refresh_token');


const grubhub_transformer = require('./Grubhub/transformer');
const uber_transformer1 = require('./Uber_eats/transformer');

const SyncUberOrders = require('./Uber_eats/sync_orders');
const SyncGrubhubOrders = require("./Grubhub/sync_orders");
const SyncPostmatesOrders = require("./Postmates/sync_orders");

module.exports = {
    delay: async function delay(time) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {

                resolve();
            }, time * 1000);
        })
    },

    updateGrubhubBranchToken: async function (sequelize, BranchDetailsGrubhub) {
        while (true) {
            await refreshTokenGrubhub.refreshToken(sequelize, BranchDetailsGrubhub);
            await this.delay(DelaySecondsGrubhub);
        }

    },

    getGrubhubBranchToken: async function (sequelize) {
    
        let BranchDetailsGrubhub = await branchDetailsGrubhub.get_branch(sequelize);
        branchTokenObjectGrubhub = await refreshTokenGrubhub.getToken(sequelize, BranchDetailsGrubhub);
        return branchTokenObjectGrubhub;
        

    },

    updatePostmatesBranchToken: async function (sequelize,branchDetailPostmates) {
        while (true) {
            await refreshTokenPostmates.refreshToken(sequelize, branchDetailPostmates);
            await this.delay(DelaySecondspostmates);

        }
    },

    getPostmatesbBranchToken: async function (sequelize) {
        let BranchDetailsPostmates = await branchDetailPostmates.get_branch(sequelize);
        branchTokenObjectPostmates = await refreshTokenPostmates.getToken(sequelize, BranchDetailsPostmates);
        return branchTokenObjectPostmates;
    },

    updateUberBranchCookie: async function (sequelize) {
        while (true) {
            await refreshTokenUber.refreshToken(sequelize, BranchDetailsUber);
            await this.delay(DelaySecondsUber);

        }
    },

    getUberBranchCookie: async function (sequelize) {
        let uber_branch_details = await branchDetailUber.get_branch(sequelize);
        let branchCookieObjectUber = await refreshTokenUber.getCookie(sequelize, uber_branch_details);
        return branchCookieObjectUber;
    }

}