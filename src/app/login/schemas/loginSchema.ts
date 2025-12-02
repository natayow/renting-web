import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
    email: Yup.string()
    .required('Email is required')
    .email('Email format is invalid'),
    password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must have minimum 8 characters')
    .max(250, 'Character limit is 250')
})