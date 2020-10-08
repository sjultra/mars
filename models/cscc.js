const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const QUALYS_VM_DATA = sequelize.define('qualys_vm_data', {
    // Model attributes are defined here
    resource_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    resource_ip: {
        type: DataTypes.STRING,
    },
    tracking_method: {
        type: DataTypes.STRING,
    },
    os: {
        type: DataTypes.STRING,
    },
    dns: {
        type: DataTypes.STRING,
    },
    ec2_instance_id: {
        type: DataTypes.STRING,
    },
    qg_hostid: {
        type: DataTypes.STRING,
    },
    timestamp: {
        type: DataTypes.DATE,
    }
}, {
    // Other model options go here
});

// `sequelize.define` also returns the model
console.log(QUALYS_VM_DATA === sequelize.models.QUALYS_VM_DATA); // true





