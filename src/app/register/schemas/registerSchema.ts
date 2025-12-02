import * as Yup from 'yup';

export const registerSchema = Yup.object().shape({
    email: Yup.string()
    .required('Email is required')
    .email('Email format is invalid'),
    fullName: Yup.string()
    .required('Name is required')
    .min(3, 'Name must have minimum 3 characters')
    .max(250, 'Character limit is 250'),
    password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must have minimum 8 characters')
    .max(250, 'Character limit is 250'),
    phoneNumber: Yup.string()
    .required('Phone number is required')
    .min(10, 'Phone number must have minimum 10 characters'),
    
})