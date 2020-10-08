const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const GCP_VM_DATA = sequelize.define('gcp_vm_data', {
    // Model attributes are defined here
    instance_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    creation_tls: {
        type: DataTypes.DATE,
    },
    first_seen: {
        type: DataTypes.DATE,
    },
    last_seen: {
        type: DataTypes.DATE,
    },
    vm_name: {
        type: DataTypes.STRING,
    },
    current_status: {
        type: DataTypes.STRING,
    },
    daily_runtime: {
        type: DataTypes.INTEGER,
    },
    mt_family: {
        type: DataTypes.STRING,
    },
    machine_type: {
        type: DataTypes.STRING,
    },
    cpu_type: {
        type: DataTypes.STRING,
    },
    cpu_num: {
        type: DataTypes.INTEGER,
    },
    gb_mem: {
        type: DataTypes.FLOAT,
    },
    pd_std_total: {
        type: DataTypes.INTEGER,
    },
    ps_ssd_total: {
        type: DataTypes.INTEGER,
    },
    local_ssd_total: {
        type: DataTypes.INTEGER,
    },
    vm_owner: {
        type: DataTypes.STRING,
    },
    region: {
        type: DataTypes.STRING,
    },
    zone: {
        type: DataTypes.STRING,
    },
    project_id: {
        type: DataTypes.STRING,
    }
}, {
    // Other model options go here
});

// `sequelize.define` also returns the model
console.log(GCP_VM_DATA === sequelize.models.GCP_VM_DATA); // true


const GCP_IP_DATA = sequelize.define('gcp_ip_data', {
    // Model attributes are defined here
    instance_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ip_address: {
        type: DataTypes.STRING,
    },
    ip_type: {
        type: DataTypes.STRING,
    },
    first_seen: {
        type: DataTypes.DATE,
    },
    last_seen: {
        type: DataTypes.DATE,
    }
}, {
    // Other model options go here
});

// `sequelize.define` also returns the model
console.log(GCP_IP_DATA === sequelize.models.GCP_IP_DATA); // true

const GCP_LICENSE_DATA = sequelize.define('gcp_license_data', {
    // Model attributes are defined here
    instance_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    license: {
        type: DataTypes.STRING,
    },
    first_seen: {
        type: DataTypes.DATE,
    },
    last_seen: {
        type: DataTypes.DATE,
    }
}, {
    // Other model options go here
});

// `sequelize.define` also returns the model
console.log(GCP_LICENSE_DATA === sequelize.models.GCP_LICENSE_DATA); // true

const GCP_PROJECT_DATA = sequelize.define('gcp_project_data', {
    // Model attributes are defined here
    project_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    project_name: {
        type: DataTypes.STRING,
    },
    project_owner: {
        type: DataTypes.STRING,
    },
    product: {
        type: DataTypes.STRING,
    },
    expensetype: {
        type: DataTypes.STRING,
    },
    organization: {
        type: DataTypes.STRING,
    },
    first_seen: {
        type: DataTypes.DATE,
    },
    last_seen: {
        type: DataTypes.DATE,
    }
}, {
    // Other model options go here
});

// `sequelize.define` also returns the model
console.log(GCP_PROJECT_DATA === sequelize.models.GCP_PROJECT_DATA); // true