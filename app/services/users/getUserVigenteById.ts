import { User } from "@/models/User";

export const getUserVigenteById = async (id: string) => {
    // console.log('en getUserVigenteById id',id);
    const user=await User.findOne({ _id: id }).sort({ createdAt: -1 });
    // console.log('en getUserVigenteByid user',user)
    return user;
  };