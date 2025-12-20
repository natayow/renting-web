import * as Yup from "yup";

export const createPropertySchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must not exceed 150 characters")
    .required("Title is required"),
  description: Yup.string().optional(),
  typeId: Yup.string().required("Property type is required"),
  city: Yup.string()
    .min(2, "City must be at least 2 characters")
    .max(80, "City must not exceed 80 characters")
    .required("City is required"),
  country: Yup.string()
    .min(2, "Country must be at least 2 characters")
    .max(80, "Country must not exceed 80 characters")
    .required("Country is required"),
  address: Yup.string()
    .min(3, "Address must be at least 3 characters")
    .max(255, "Address must not exceed 255 characters")
    .required("Address is required"),
  maxGuests: Yup.number()
    .min(1, "At least 1 guest required")
    .integer("Must be a whole number")
    .required("Max guests is required"),
  bedrooms: Yup.number()
    .min(0, "Cannot be negative")
    .integer("Must be a whole number")
    .required("Bedrooms is required"),
  beds: Yup.number()
    .min(0, "Cannot be negative")
    .integer("Must be a whole number")
    .required("Beds is required"),
  bathrooms: Yup.number()
    .min(0, "Cannot be negative")
    .integer("Must be a whole number")
    .required("Bathrooms is required"),
  minNights: Yup.number()
    .min(1, "Minimum nights must be at least 1")
    .integer("Must be a whole number")
    .required("Minimum nights is required"),
  maxNights: Yup.number()
    .min(1, "Maximum nights must be at least 1")
    .integer("Must be a whole number")
    .required("Maximum nights is required"),
  basePricePerNightIdr: Yup.number()
    .min(0, "Price cannot be negative")
    .integer("Must be a whole number")
    .required("Price is required"),
  status: Yup.string()
    .oneOf(["DRAFT", "ACTIVE", "INACTIVE"], "Invalid status")
    .required("Status is required"),
  facilityIds: Yup.array()
    .of(Yup.string())
    .min(3, "Please select at least 3 facilities")
    .required("Facilities are required"),
});

export interface CreatePropertyFormData {
  title: string;
  description?: string;
  typeId: string;
  city: string;
  country: string;
  address: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  minNights: number;
  maxNights: number;
  basePricePerNightIdr: number;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  facilityIds: string[];
}
