
import categoryModel from "../models/categoryModel";

export const generateSlug = async (name: string): Promise<string> => {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  let uniqueSlug = slug;
  let counter = 1;
  while (await categoryModel.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
};