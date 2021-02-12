
const branchDetailsGrubhub = require('./Grubhub/branch_details');
const branchDetailUber = require('./Uber_eats/branch_details');
const branchDetailPostmates = require('./Postmates/branch_details');

let standardDelayTime = 500;
let syncingTime = 60;

const refreshTokenGrubhub = require('./Grubhub/refresh_token');
const refreshTokenUber = require('./Uber_eats/refresh_token');
const refreshTokenPostmates = require('./Postmates/refresh_token');

const SyncUberOrders = require('./Uber_eats/sync_orders');
const SyncGrubhubOrders = require("./Grubhub/sync_orders");
const SyncPostmatesOrders = require("./Postmates/sync_orders");

const refreshToken = require('./refreshToken');
const { updateGrubhubBranchToken } = require("./refreshToken");

let sequelize, branchTokenObjectGrubhub, branchCookieObjectUber, branchTokenObjectPostmates, BranchDetailsGrubhub, BranchDetailsPostmates

async function delay(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            resolve();
        }, time * 1000);
    })
}

async function run() {
    try {
        sequelize = await refreshTokenGrubhub.get_connection();
        //GRUBHUB
        // getting all grubhub branch_details and updating token
        BranchDetailsGrubhub = await branchDetailsGrubhub.get_branch(sequelize);
        await refreshTokenGrubhub.refreshToken(sequelize, BranchDetailsGrubhub);

        // //POSTMATES
        BranchDetailsPostmates = await branchDetailPostmates.get_branch(sequelize);
        await refreshTokenPostmates.refreshToken(sequelize, BranchDetailsPostmates);

        // //UBER
        // // getting all uber branch_details and updating cookie
        BranchDetailsUber = await branchDetailUber.get_branch(sequelize);
        await refreshTokenUber.refreshToken(sequelize, BranchDetailsUber);

        branchTokenObjectGrubhub = await refreshToken.getGrubhubBranchToken(sequelize);
        branchCookieObjectUber = await refreshToken.getUberBranchCookie(sequelize);
        branchTokenObjectPostmates = await refreshToken.getPostmatesbBranchToken(sequelize);

        sync(branchTokenObjectGrubhub, BranchDetailsPostmates, branchCookieObjectUber, branchTokenObjectPostmates);
        syncAllOrders();
    } catch (error) {
        console.log(error);
    }


}

async function sync(branchTokenObjectGrubhub, BranchDetailsPostmates, branchCookieObjectUber, branchTokenObjectPostmates) {
    syncOrders(branchTokenObjectGrubhub, SyncGrubhubOrders);
    syncOrdersPostmates(branchTokenObjectPostmates, BranchDetailsPostmates, SyncPostmatesOrders);
    syncOrders(branchCookieObjectUber, SyncUberOrders);
}

async function syncOrders(tokens, orderObject) {
    for (let token of tokens) {
        await orderObject.getorders(token, sequelize);//todo what if fetch order fails
    }
}
async function syncOrdersPostmates(tokens, BranchDetailsPostmates, orderObject) {
    for (let index in tokens) {
        let order = await orderObject.getorders(tokens[index], BranchDetailsPostmates[index], sequelize);
    }
}
async function syncAllOrders() {
    refreshToken.updateGrubhubBranchToken(sequelize, BranchDetailsGrubhub);
    refreshToken.updateUberBranchCookie(sequelize, BranchDetailsUber);
    refreshToken.updatePostmatesBranchToken(sequelize, BranchDetailsPostmates);
    while (true) {
        [branchTokenObjectGrubhub, branchCookieObjectUber, branchTokenObjectPostmates] =
            await Promise.all([refreshToken.getGrubhubBranchToken(sequelize),
            refreshToken.getUberBranchCookie(sequelize),
            refreshToken.getPostmatesbBranchToken(sequelize)]);
        sync(branchTokenObjectGrubhub, BranchDetailsPostmates, branchCookieObjectUber, branchTokenObjectPostmates);
        await delay(syncingTime);
    }
}
run();

//7-searching state,
//8-on way for pickup courier-data8.jso,3:30
//9-arrived-3:42
//10-completed