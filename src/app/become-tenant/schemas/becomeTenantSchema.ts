import * as Yup from "yup";

export const becomeTenantSchema = Yup.object().shape({
  displayName: Yup.string()
    .min(3, "Display name must be at least 3 characters")
    .max(100, "Display name must not exceed 100 characters")
    .required("Display name is required"),
  description: Yup.string().max(
    500,
    "Description must not exceed 500 characters"
  ),
  bankName: Yup.string().max(80, "Bank name must not exceed 80 characters"),
  bankAccountNo: Yup.string().max(
    60,
    "Bank account number must not exceed 60 characters"
  ),
  bankAccountName: Yup.string().max(
    80,
    "Bank account name must not exceed 80 characters"
  ),
});

export type BecomeTenantFormData = Yup.InferType<typeof becomeTenantSchema>;
