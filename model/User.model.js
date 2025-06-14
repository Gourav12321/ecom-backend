    const mongoose = require('mongoose');

    const AddressSchema = new mongoose.Schema({
        email: { type: String, required: true },
        addresses: [
        {
            phoneNumber: String,
            houseNo: String,
            street: String,
            landmark: String,
            district: String,
            country: String,
            state: String,
            city: String,
            pincode: String,
        },
        ],
    });

    const Address = mongoose.model('Address', AddressSchema);

    const userSchema = new mongoose.Schema({
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
        },
        verification: {
            type: Boolean,
            default: false
        },
        verificationToken: {
            type: String
        },
    
        profile : {
            type:String,
            default :'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
        },
        role: {
            type: String,
            enum: ['General', 'Admin'],
            default: 'General'
        }
    });

    const User = mongoose.model('User', userSchema);

    module.exports = { User, Address };
