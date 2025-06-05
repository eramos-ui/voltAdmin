import _ from 'lodash';
import { getUserVigente } from "./getUserVigente";
import { User } from "@/models/User";

export const addUserVersion = async (userData: any) => {
    const vigente = await getUserVigente(userData.email);
    const { createdAt, updatedAt, __v, _id, ...prev } = vigente?.toObject() || {};
    if (_.isEqual(prev, userData)) return vigente;
    return await User.create(userData);
  };