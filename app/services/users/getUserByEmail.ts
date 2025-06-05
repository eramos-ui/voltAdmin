//servicio consumido por: /api/usuarios/vigenteByEmail
import { User } from "@/models/User";

export const getUserVigenteByEmail = async (email: string) => {
    //console.log('en getUserVigenteByEmail email',typeof email,email);
    const user = await User.findOne({ user: email }).sort({ createdAt: -1 });
    //console.log('en getUserVigenteByEmail user',user);
    return await User.findOne({ user: email }).sort({ createdAt: -1 });
  };