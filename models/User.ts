// import mongoose from 'mongoose';

import mongoose, { Schema, model, models } from 'mongoose';

const roleswkfSchema = new Schema({
    idProcess:{type:Number, required:true},
    idActivity:{type:Number, required:true},
    nameActivity:{type:String, required:true},
    processName:{type:String, required:true},
    rolesProcess:{type:[String], required:true}
})
const aditionalDataSchema = new Schema({
    contacto:{type:String, required:false},
    email:{type:String, required:false},
})
const userSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    userModification: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: false
    },
    theme: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    aditionalData: {
        type: aditionalDataSchema,
        required: false
    },
    resetToken: {
        type: String,
        required: false
    },
    resetTokenExpires: {
        type: Date,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    rut: {
        type: String,
        required: false
    },
    isValid:{
        type: Boolean,
        required: true,
        default: true
    },
    valid:{
        type:String,
        required:true,
        default:'Vigente'
    },
    validDate:{
        type:Date,
        required:true,
        default:'vigente'
    },
    system: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    roleId: {
        type: Number,
        required: false
    },
    roleswkf: { 
        type: [roleswkfSchema], 
        default: []
        } 
    }, 
    {
        timestamps: true 
    }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema, 'user');