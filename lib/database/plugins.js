const config = require('../../config');
const { DataTypes } = require('sequelize');

const truetDB = config.DATABASE.define('trueCaller', {
  key: {
    type: DataTypes.STRING,
    allowNull: true
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  number: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

async function setTrueCallerkey(opt={}) {
    const truecaller = await truetDB.findOne();
    if(!truecaller) {
        await truetDB.create({
            key: opt.key,
            token: opt.token,
            number: opt.number
        })
        return 'created'
    } else {
        await truecaller.update({
            key: opt.key,
            token: opt.token,
            number: opt.number
        })
        return 'updated'
    }
}

async function getTrueCallertoken() {
    const truecaller = await truetDB.findOne();
    if(truecaller) {
        return {
            key: truecaller.dataValues.key,
            token: truecaller.dataValues.token,
            number: truecaller.dataValues.number
        }
    } else return {
        key: false,
        token: false,
        number: false
    }
}
async function TrueLogout() {
    const res =  await truetDB.findAll();
    for(const i of res) {
        i.destroy();
    }
    return true;
}
module.exports = {setTrueCallerkey, getTrueCallertoken, TrueLogout};