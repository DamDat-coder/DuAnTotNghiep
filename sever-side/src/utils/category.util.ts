import mongoose from "mongoose";
import categoryModel from "../models/category.model";

export const getAllChildCategoryIds = async (parentId: string): Promise<string[]> => {
  const children = await categoryModel.find({ parentId }).select("_id");
  let ids = children.map((child) => child._id.toString());

  for (const child of children) {
    const subIds = await getAllChildCategoryIds(child._id.toString());
    ids = ids.concat(subIds);
  }

  return ids;
};
